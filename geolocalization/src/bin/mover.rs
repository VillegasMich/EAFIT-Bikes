use std::time::Instant;

use chrono::Utc;
use rand::Rng;
use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;
use tracing::{debug, error, info};
use tracing_subscriber::EnvFilter;

// Mover binary for the geolocalization microservice.
//
// Continuously moves all existing bicycles in the database to nearby
// random positions every second, simulating real-time movement.
// Dynamically discovers new bicycles each tick.

// Random offset range in degrees (~11–55 meters).
const MIN_OFFSET: f64 = 0.0001;
const MAX_OFFSET: f64 = 0.0005;

/// Fetch the latest position for each distinct bicycle_id.
async fn fetch_latest_positions(pool: &PgPool) -> Vec<(i32, f64, f64)> {
    // Returns (bicycle_id, longitude, latitude) — PostGIS stores (lon, lat)
    sqlx::query_as::<_, (i32, f64, f64)>(
        "SELECT DISTINCT ON (bicycle_id) \
             bicycle_id, \
             ST_X(location::geometry) AS lon, \
             ST_Y(location::geometry) AS lat \
         FROM bicycles_location \
         ORDER BY bicycle_id, updated_at DESC",
    )
    .fetch_all(pool)
    .await
    .unwrap_or_else(|e| {
        error!("Failed to fetch latest positions: {e}");
        Vec::new()
    })
}

/// Apply a small random offset to a coordinate pair and clamp to valid ranges.
fn nudge(lat: f64, lon: f64) -> (f64, f64) {
    let mut rng = rand::thread_rng();

    let lat_delta = rng
        .gen_range(-MAX_OFFSET..=MAX_OFFSET)
        .copysign(if rng.gen_bool(0.5) { 1.0 } else { -1.0 });
    let lon_delta = rng
        .gen_range(-MAX_OFFSET..=MAX_OFFSET)
        .copysign(if rng.gen_bool(0.5) { 1.0 } else { -1.0 });

    // Ensure minimum offset magnitude
    let lat_delta = if lat_delta.abs() < MIN_OFFSET {
        MIN_OFFSET.copysign(lat_delta)
    } else {
        lat_delta
    };
    let lon_delta = if lon_delta.abs() < MIN_OFFSET {
        MIN_OFFSET.copysign(lon_delta)
    } else {
        lon_delta
    };

    let new_lat = (lat + lat_delta).clamp(-90.0, 90.0);
    let new_lon = (lon + lon_delta).clamp(-180.0, 180.0);

    (new_lat, new_lon)
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let database_url = match std::env::var("DATABASE_URL") {
        Ok(url) => url,
        Err(_) => {
            error!("DATABASE_URL is not set. Please set it in your environment or .env file.");
            std::process::exit(1);
        }
    };

    let pool = match PgPoolOptions::new()
        .max_connections(2)
        .connect(&database_url)
        .await
    {
        Ok(pool) => {
            info!("Connected to database");
            pool
        }
        Err(e) => {
            error!("Failed to connect to database: {e}");
            error!("Make sure PostgreSQL is running (docker compose up -d db)");
            std::process::exit(1);
        }
    };

    match sqlx::migrate!().run(&pool).await {
        Ok(_) => info!("Migrations applied successfully"),
        Err(e) => {
            error!("Migration failed: {e}");
            std::process::exit(1);
        }
    }

    info!("Mover started: moving all bicycles every 1 second");

    let mut tick: u64 = 0;
    let mut total_positions: u64 = 0;
    let start = Instant::now();

    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(1));

    loop {
        tokio::select! {
            _ = interval.tick() => {
                tick += 1;
                let now = Utc::now();
                let positions = fetch_latest_positions(&pool).await;

                if positions.is_empty() {
                    debug!("Tick {tick}: no bicycles found in database");
                    continue;
                }

                for (bicycle_id, lon, lat) in &positions {
                    let (new_lat, new_lon) = nudge(*lat, *lon);

                    debug!(
                        "Bicycle {bicycle_id}: ({lat:.6}, {lon:.6}) -> ({new_lat:.6}, {new_lon:.6})"
                    );

                    sqlx::query(
                        "INSERT INTO bicycles_location (bicycle_id, location, updated_at) \
                         VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4)",
                    )
                    .bind(bicycle_id)
                    .bind(new_lon)
                    .bind(new_lat)
                    .bind(now)
                    .execute(&pool)
                    .await
                    .unwrap_or_else(|e| {
                        error!("Failed to insert position for bicycle {bicycle_id}: {e}");
                        std::process::exit(1);
                    });
                }

                let moved = positions.len() as u64;
                total_positions += moved;
                info!("Tick {tick}: moved {moved} bicycles ({total_positions} total positions inserted)");
            }
            _ = tokio::signal::ctrl_c() => {
                let elapsed = start.elapsed();
                info!(
                    "Shutting down mover: {total_positions} positions inserted over {:.1}s ({tick} ticks)",
                    elapsed.as_secs_f64()
                );
                break;
            }
        }
    }
}
