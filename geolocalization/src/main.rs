mod errors;
mod router;
mod routes;
mod state;

use sqlx::postgres::PgPoolOptions;
use state::AppState;
use tokio::net::TcpListener;
use tracing::{error, info, warn};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("error")),
        )
        .init();

    let port = std::env::var("APP_PORT").unwrap_or_else(|_| "8080".to_string());

    let pool = match std::env::var("DATABASE_URL") {
        Ok(url) => match PgPoolOptions::new().max_connections(5).connect(&url).await {
            Ok(p) => {
                info!("Connected to database");
                Some(p)
            }
            Err(e) => {
                warn!("Could not connect to database: {e}");
                None
            }
        },
        Err(_) => {
            warn!("DATABASE_URL not set, starting without database");
            None
        }
    };

    let pool = if let Some(p) = pool {
        match sqlx::migrate!().run(&p).await {
            Ok(_) => {
                info!("Migrations applied successfully");
                Some(p)
            }
            Err(e) => {
                error!("Migration failed: {e}");
                None
            }
        }
    } else {
        warn!("Skipping migrations (no database connection)");
        None
    };

    let state = AppState { pool };
    let app = router::build(state);

    let addr = format!("0.0.0.0:{port}");
    info!("Listening on {addr}");
    let listener = TcpListener::bind(&addr)
        .await
        .expect("failed to bind address");
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("server error");
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install SIGINT handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install SIGTERM handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => info!("Received SIGINT, shutting down..."),
        _ = terminate => info!("Received SIGTERM, shutting down..."),
    }
}
