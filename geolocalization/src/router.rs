use axum::Router;

use crate::routes;
use crate::state::AppState;

pub fn build(state: AppState) -> Router {
    Router::new()
        .merge(routes::health::router())
        .with_state(state)
}
