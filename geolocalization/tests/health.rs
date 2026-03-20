use axum::body::Body;
use axum::http::{Request, StatusCode};
use geolocalization::router;
use geolocalization::routes::health::HealthResponse;
use geolocalization::state::AppState;
use tower::ServiceExt;

#[tokio::test]
async fn health_returns_200_without_db() {
    let (location_tx, _) = tokio::sync::broadcast::channel(256);
    let state = AppState {
        pool: None,
        location_tx,
    };
    let app = router::build(state);

    let response = app
        .oneshot(
            Request::builder()
                .uri("/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let health: HealthResponse = serde_json::from_slice(&body).unwrap();
    assert_eq!(
        health,
        HealthResponse {
            status: "ok".to_string(),
            db: "unavailable".to_string(),
        }
    );
}
