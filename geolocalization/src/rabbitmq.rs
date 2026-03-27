use futures_lite::StreamExt;
use lapin::{
    Connection, ConnectionProperties,
    options::{BasicAckOptions, BasicConsumeOptions, BasicNackOptions, QueueDeclareOptions},
    types::FieldTable,
};
use serde::Deserialize;
use sqlx::PgPool;
use tracing::{debug, error, info, warn};

const QUEUE_NAME: &str = "bike_events";

/// Default location: EAFIT University, Medellin, Colombia.
const DEFAULT_LAT: f64 = 6.2006;
const DEFAULT_LON: f64 = -75.5783;

#[derive(Debug, Deserialize)]
struct BikeEvent {
    event: String,
    bike_id: i32,
}

async fn handle_bike_created(pool: &PgPool, bike_id: i32) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO bicycles_location (bicycle_id, location) \
         VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326))",
    )
    .bind(bike_id)
    .bind(DEFAULT_LON)
    .bind(DEFAULT_LAT)
    .execute(pool)
    .await?;
    Ok(())
}

async fn handle_bike_deleted(pool: &PgPool, bike_id: i32) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM bicycles_location WHERE bicycle_id = $1")
        .bind(bike_id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn start_consumer(pool: PgPool) {
    let rabbitmq_url = match std::env::var("RABBITMQ_URL") {
        Ok(url) => url,
        Err(_) => {
            warn!("RABBITMQ_URL not set, starting without RabbitMQ consumer");
            return;
        }
    };

    let conn = match Connection::connect(&rabbitmq_url, ConnectionProperties::default()).await {
        Ok(conn) => conn,
        Err(e) => {
            warn!("Could not connect to RabbitMQ: {e}");
            return;
        }
    };

    let channel = match conn.create_channel().await {
        Ok(ch) => ch,
        Err(e) => {
            warn!("Could not create RabbitMQ channel: {e}");
            return;
        }
    };

    if let Err(e) = channel
        .queue_declare(
            QUEUE_NAME,
            QueueDeclareOptions {
                durable: true,
                ..Default::default()
            },
            FieldTable::default(),
        )
        .await
    {
        warn!("Could not declare queue {QUEUE_NAME}: {e}");
        return;
    }

    let mut consumer = match channel
        .basic_consume(
            QUEUE_NAME,
            "geolocalization-consumer",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await
    {
        Ok(c) => c,
        Err(e) => {
            warn!("Could not start consuming from {QUEUE_NAME}: {e}");
            return;
        }
    };

    info!("RabbitMQ consumer started on queue {QUEUE_NAME}");

    while let Some(delivery_result) = consumer.next().await {
        let delivery = match delivery_result {
            Ok(d) => d,
            Err(e) => {
                error!("Error receiving message: {e}");
                continue;
            }
        };

        let payload = &delivery.data;

        let event: BikeEvent = match serde_json::from_slice(payload) {
            Ok(e) => e,
            Err(e) => {
                error!(
                    error = %e,
                    payload = %String::from_utf8_lossy(payload),
                    "Failed to deserialize message"
                );
                delivery.ack(BasicAckOptions::default()).await.ok();
                continue;
            }
        };

        info!(event = %event.event, bike_id = event.bike_id, "Received message from bike_events queue");

        match event.event.as_str() {
            "bike_created" => match handle_bike_created(&pool, event.bike_id).await {
                Ok(_) => {
                    info!(bike_id = event.bike_id, "Created default location for new bicycle");
                    delivery.ack(BasicAckOptions::default()).await.ok();
                }
                Err(e) => {
                    error!(error = %e, bike_id = event.bike_id, "Failed to handle bike_created");
                    delivery
                        .nack(BasicNackOptions {
                            requeue: true,
                            ..Default::default()
                        })
                        .await
                        .ok();
                }
            },
            "bike_deleted" => match handle_bike_deleted(&pool, event.bike_id).await {
                Ok(_) => {
                    info!(bike_id = event.bike_id, "Deleted all locations for bicycle");
                    delivery.ack(BasicAckOptions::default()).await.ok();
                }
                Err(e) => {
                    error!(error = %e, bike_id = event.bike_id, "Failed to handle bike_deleted");
                    delivery
                        .nack(BasicNackOptions {
                            requeue: true,
                            ..Default::default()
                        })
                        .await
                        .ok();
                }
            },
            unknown => {
                warn!(
                    event_type = unknown,
                    bike_id = event.bike_id,
                    "Unknown event type"
                );
                delivery.ack(BasicAckOptions::default()).await.ok();
            }
        }
    }

    warn!("RabbitMQ consumer stream ended");
}
