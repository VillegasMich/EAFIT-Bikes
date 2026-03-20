use axum::{
    Router,
    extract::{Path, State},
    response::{
        IntoResponse,
        sse::{Event, KeepAlive, Sse},
    },
    routing::get,
};
use futures::stream::StreamExt;
use tokio_stream::wrappers::BroadcastStream;
use uuid::Uuid;

use crate::state::AppState;

/// GET /locations/stream — SSE stream of all new location events.
async fn stream_all_locations(State(state): State<AppState>) -> impl IntoResponse {
    let rx = state.location_tx.subscribe();
    let stream = BroadcastStream::new(rx).filter_map(|result| async {
        match result {
            Ok(location) => {
                let json = serde_json::to_string(&location).ok()?;
                Some(Ok::<_, std::convert::Infallible>(
                    Event::default().event("location").data(json),
                ))
            }
            Err(e) => {
                tracing::warn!(error = %e, "SSE client lagged behind");
                None
            }
        }
    });

    Sse::new(stream).keep_alive(KeepAlive::default())
}

/// GET /locations/stream/bicycle/:bicycle_id — SSE stream filtered to a specific bicycle.
async fn stream_locations_by_bicycle(
    State(state): State<AppState>,
    Path(bicycle_id): Path<Uuid>,
) -> impl IntoResponse {
    let rx = state.location_tx.subscribe();
    let stream = BroadcastStream::new(rx).filter_map(move |result| async move {
        match result {
            Ok(location) if location.bicycle_id == bicycle_id => {
                let json = serde_json::to_string(&location).ok()?;
                Some(Ok::<_, std::convert::Infallible>(
                    Event::default().event("location").data(json),
                ))
            }
            Ok(_) => None,
            Err(e) => {
                tracing::warn!(error = %e, %bicycle_id, "SSE client lagged behind");
                None
            }
        }
    });

    Sse::new(stream).keep_alive(KeepAlive::default())
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/locations/stream", get(stream_all_locations))
        .route(
            "/locations/stream/bicycle/{bicycle_id}",
            get(stream_locations_by_bicycle),
        )
}
