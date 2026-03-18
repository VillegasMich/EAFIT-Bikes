use axum::{Json, Router, extract::State, routing::get};
use serde::{Deserialize, Serialize};

use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub struct HealthResponse {
    pub status: String,
    pub db: String,
}

async fn health_check(State(state): State<AppState>) -> Json<HealthResponse> {
    let db = if state.pool.is_some() {
        "connected"
    } else {
        "unavailable"
    }
    .to_string();

    Json(HealthResponse {
        status: "ok".to_string(),
        db,
    })
}

pub fn router() -> Router<AppState> {
    Router::new().route("/health", get(health_check))
}
