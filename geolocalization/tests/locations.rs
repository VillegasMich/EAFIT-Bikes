use axum::body::Body;
use axum::http::{Request, StatusCode};
use geolocalization::models::{
    CreateLocationBatchRequest, CreateLocationRequest, LocationResponse,
};
use geolocalization::router;
use geolocalization::state::AppState;
use sqlx::PgPool;
use tower::ServiceExt;

async fn setup_app() -> (axum::Router, Option<PgPool>) {
    dotenvy::dotenv().ok();
    let pool = match std::env::var("DATABASE_URL") {
        Ok(url) => match PgPool::connect(&url).await {
            Ok(p) => {
                sqlx::migrate!().run(&p).await.ok();
                Some(p)
            }
            Err(_) => None,
        },
        Err(_) => None,
    };

    let state = AppState { pool: pool.clone() };
    (router::build(state), pool)
}

fn requires_db(pool: &Option<PgPool>) -> bool {
    if pool.is_none() {
        eprintln!("Skipping test: no database connection");
        return false;
    }
    true
}

async fn clear_table(pool: &PgPool) {
    sqlx::query("DELETE FROM bicycles_location")
        .execute(pool)
        .await
        .unwrap();
}

async fn insert_location(pool: &PgPool, bicycle_id: i32, lat: f64, lon: f64) {
    sqlx::query(
        "INSERT INTO bicycles_location (bicycle_id, location) VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326))",
    )
    .bind(bicycle_id)
    .bind(lon)
    .bind(lat)
    .execute(pool)
    .await
    .unwrap();
}

// --- 8.1 GET /locations ---

#[tokio::test]
async fn get_locations_empty_db() {
    let (app, pool) = setup_app().await;
    if !requires_db(&pool) {
        return;
    }
    clear_table(pool.as_ref().unwrap()).await;

    let resp = app
        .oneshot(
            Request::builder()
                .uri("/locations")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), StatusCode::OK);
    let body = axum::body::to_bytes(resp.into_body(), usize::MAX)
        .await
        .unwrap();
    let locations: Vec<LocationResponse> = serde_json::from_slice(&body).unwrap();
    assert!(locations.is_empty());
}

#[tokio::test]
async fn get_locations_returns_all_records() {
    let (app, pool) = setup_app().await;
    if !requires_db(&pool) {
        return;
    }
    let pool = pool.as_ref().unwrap();
    clear_table(pool).await;

    insert_location(pool, 1, 6.20, -75.57).await;
    insert_location(pool, 1, 6.21, -75.58).await;
    insert_location(pool, 2, 6.22, -75.59).await;

    let resp = app
        .oneshot(
            Request::builder()
                .uri("/locations")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), StatusCode::OK);
    let body = axum::body::to_bytes(resp.into_body(), usize::MAX)
        .await
        .unwrap();
    let locations: Vec<LocationResponse> = serde_json::from_slice(&body).unwrap();
    assert_eq!(locations.len(), 3);
}

#[tokio::test]
async fn get_locations_latest_returns_one_per_bicycle() {
    let (app, pool) = setup_app().await;
    if !requires_db(&pool) {
        return;
    }
    let pool = pool.as_ref().unwrap();
    clear_table(pool).await;

    insert_location(pool, 1, 6.20, -75.57).await;
    insert_location(pool, 1, 6.21, -75.58).await;
    insert_location(pool, 2, 6.22, -75.59).await;

    let resp = app
        .oneshot(
            Request::builder()
                .uri("/locations?latest=true")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), StatusCode::OK);
    let body = axum::body::to_bytes(resp.into_body(), usize::MAX)
        .await
        .unwrap();
    let locations: Vec<LocationResponse> = serde_json::from_slice(&body).unwrap();
    assert_eq!(locations.len(), 2);
}

// --- 8.2 GET /locations/bicycle/:bicycle_id ---

#[tokio::test]
async fn get_locations_by_bicycle_returns_matching() {
    let (app, pool) = setup_app().await;
    if !requires_db(&pool) {
        return;
    }
    let pool = pool.as_ref().unwrap();
    clear_table(pool).await;

    insert_location(pool, 1, 6.20, -75.57).await;
    insert_location(pool, 1, 6.21, -75.58).await;
    insert_location(pool, 2, 6.22, -75.59).await;

    let resp = app
        .oneshot(
            Request::builder()
                .uri("/locations/bicycle/1")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), StatusCode::OK);
    let body = axum::body::to_bytes(resp.into_body(), usize::MAX)
        .await
        .unwrap();
    let locations: Vec<LocationResponse> = serde_json::from_slice(&body).unwrap();
    assert_eq!(locations.len(), 2);
    assert!(locations.iter().all(|l| l.bicycle_id == 1));
}

#[tokio::test]
async fn get_locations_by_bicycle_no_records() {
    let (app, pool) = setup_app().await;
    if !requires_db(&pool) {
        return;
    }
    let pool = pool.as_ref().unwrap();
    clear_table(pool).await;

    let resp = app
        .oneshot(
            Request::builder()
                .uri("/locations/bicycle/999")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), StatusCode::OK);
    let body = axum::body::to_bytes(resp.into_body(), usize::MAX)
        .await
        .unwrap();
    let locations: Vec<LocationResponse> = serde_json::from_slice(&body).unwrap();
    assert!(locations.is_empty());
}

#[tokio::test]
async fn get_locations_by_bicycle_invalid_id() {
    let (app, _pool) = setup_app().await;

    let resp = app
        .oneshot(
            Request::builder()
                .uri("/locations/bicycle/not-an-integer")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn get_locations_by_bicycle_latest() {
    let (app, pool) = setup_app().await;
    if !requires_db(&pool) {
        return;
    }
    let pool = pool.as_ref().unwrap();
    clear_table(pool).await;

    insert_location(pool, 1, 6.20, -75.57).await;
    // Small delay to ensure different timestamps
    tokio::time::sleep(std::time::Duration::from_millis(10)).await;
    insert_location(pool, 1, 6.21, -75.58).await;

    let resp = app
        .oneshot(
            Request::builder()
                .uri("/locations/bicycle/1?latest=true")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), StatusCode::OK);
    let body = axum::body::to_bytes(resp.into_body(), usize::MAX)
        .await
        .unwrap();
    let locations: Vec<LocationResponse> = serde_json::from_slice(&body).unwrap();
    assert_eq!(locations.len(), 1);
    assert!((locations[0].latitude - 6.21).abs() < 0.001);
}

// --- 8.3 POST /locations ---

#[tokio::test]
async fn post_location_valid() {
    let (app, pool) = setup_app().await;
    if !requires_db(&pool) {
        return;
    }
    clear_table(pool.as_ref().unwrap()).await;

    let req_body = CreateLocationRequest {
        bicycle_id: 1,
        latitude: 6.20,
        longitude: -75.57,
    };

    let resp = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/locations")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&req_body).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), StatusCode::CREATED);
    let body = axum::body::to_bytes(resp.into_body(), usize::MAX)
        .await
        .unwrap();
    let location: LocationResponse = serde_json::from_slice(&body).unwrap();
    assert_eq!(location.bicycle_id, req_body.bicycle_id);
    assert!((location.latitude - 6.20).abs() < 0.001);
    assert!((location.longitude - (-75.57)).abs() < 0.001);
}

#[tokio::test]
async fn post_location_invalid_coordinates() {
    let (app, pool) = setup_app().await;
    if !requires_db(&pool) {
        return;
    }

    let req_body = serde_json::json!({
        "bicycle_id": 1,
        "latitude": 91.0,
        "longitude": -75.57,
    });

    let resp = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/locations")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&req_body).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
}

// --- 8.4 POST /locations/batch ---

#[tokio::test]
async fn post_locations_batch_valid() {
    let (app, pool) = setup_app().await;
    if !requires_db(&pool) {
        return;
    }
    clear_table(pool.as_ref().unwrap()).await;

    let req_body = CreateLocationBatchRequest {
        locations: vec![
            CreateLocationRequest {
                bicycle_id: 1,
                latitude: 6.20,
                longitude: -75.57,
            },
            CreateLocationRequest {
                bicycle_id: 2,
                latitude: 6.21,
                longitude: -75.58,
            },
        ],
    };

    let resp = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/locations/batch")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&req_body).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), StatusCode::CREATED);
    let body = axum::body::to_bytes(resp.into_body(), usize::MAX)
        .await
        .unwrap();
    let locations: Vec<LocationResponse> = serde_json::from_slice(&body).unwrap();
    assert_eq!(locations.len(), 2);
}

#[tokio::test]
async fn post_locations_batch_invalid_entry() {
    let (app, pool) = setup_app().await;
    if !requires_db(&pool) {
        return;
    }

    let req_body = serde_json::json!({
        "locations": [
            {"bicycle_id": 1, "latitude": 6.20, "longitude": -75.57},
            {"bicycle_id": 2, "latitude": 91.0, "longitude": -75.58},
        ]
    });

    let resp = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/locations/batch")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&req_body).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn post_locations_batch_empty_array() {
    let (app, pool) = setup_app().await;
    if !requires_db(&pool) {
        return;
    }

    let req_body = serde_json::json!({ "locations": [] });

    let resp = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/locations/batch")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&req_body).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
}
