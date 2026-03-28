use axum::Router;
use tower_http::trace::TraceLayer;

use crate::routes;
use crate::state::AppState;

pub fn build(state: AppState) -> Router {
    Router::new()
        .merge(routes::health::router())
        .merge(routes::locations::router())
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
