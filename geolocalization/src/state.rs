use sqlx::PgPool;
use tokio::sync::broadcast;

use crate::models::LocationResponse;

#[derive(Clone)]
pub struct AppState {
    pub pool: Option<PgPool>,
    pub location_tx: broadcast::Sender<LocationResponse>,
}
