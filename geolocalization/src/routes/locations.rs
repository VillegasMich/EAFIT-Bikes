use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::{get, post},
};
use chrono::{DateTime, Utc};
use sqlx::Row;
use uuid::Uuid;

use crate::errors::{AppError, validate_coordinates};
use crate::models::{
    CreateLocationBatchRequest, CreateLocationRequest, LocationQuery, LocationResponse,
};
use crate::state::AppState;

fn row_to_location(row: &sqlx::postgres::PgRow) -> LocationResponse {
    LocationResponse {
        id: row.get("id"),
        bicycle_id: row.get("bicycle_id"),
        latitude: row.get("latitude"),
        longitude: row.get("longitude"),
        updated_at: row.get::<DateTime<Utc>, _>("updated_at"),
    }
}

/// GET /locations — returns all locations, or only the latest per bicycle when `?latest=true`.
async fn get_all_locations(
    State(state): State<AppState>,
    Query(query): Query<LocationQuery>,
) -> Result<Json<Vec<LocationResponse>>, AppError> {
    let pool = state.pool.as_ref().ok_or(AppError::DatabaseUnavailable)?;

    let sql = if query.latest {
        r#"SELECT DISTINCT ON (bicycle_id)
            id, bicycle_id,
            ST_Y(location::geometry) as latitude,
            ST_X(location::geometry) as longitude,
            updated_at
        FROM bicycles_location
        ORDER BY bicycle_id, updated_at DESC"#
    } else {
        r#"SELECT
            id, bicycle_id,
            ST_Y(location::geometry) as latitude,
            ST_X(location::geometry) as longitude,
            updated_at
        FROM bicycles_location
        ORDER BY updated_at DESC"#
    };

    let rows = sqlx::query(sql).fetch_all(pool).await.map_err(|e| {
        tracing::error!(error = %e, "Failed to query locations");
        AppError::DatabaseUnavailable
    })?;

    let locations: Vec<LocationResponse> = rows.iter().map(row_to_location).collect();
    tracing::debug!(count = locations.len(), "GET /locations");
    Ok(Json(locations))
}

/// GET /locations/bicycle/:bicycle_id — returns locations for a specific bicycle.
async fn get_locations_by_bicycle(
    State(state): State<AppState>,
    Path(bicycle_id): Path<Uuid>,
    Query(query): Query<LocationQuery>,
) -> Result<Json<Vec<LocationResponse>>, AppError> {
    let pool = state.pool.as_ref().ok_or(AppError::DatabaseUnavailable)?;

    let sql = if query.latest {
        r#"SELECT
            id, bicycle_id,
            ST_Y(location::geometry) as latitude,
            ST_X(location::geometry) as longitude,
            updated_at
        FROM bicycles_location
        WHERE bicycle_id = $1
        ORDER BY updated_at DESC
        LIMIT 1"#
    } else {
        r#"SELECT
            id, bicycle_id,
            ST_Y(location::geometry) as latitude,
            ST_X(location::geometry) as longitude,
            updated_at
        FROM bicycles_location
        WHERE bicycle_id = $1
        ORDER BY updated_at DESC"#
    };

    let rows = sqlx::query(sql)
        .bind(bicycle_id)
        .fetch_all(pool)
        .await
        .map_err(|e| {
            tracing::error!(error = %e, "Failed to query locations by bicycle");
            AppError::DatabaseUnavailable
        })?;

    let locations: Vec<LocationResponse> = rows.iter().map(row_to_location).collect();
    tracing::debug!(count = locations.len(), %bicycle_id, "GET /locations/bicycle/:id");
    Ok(Json(locations))
}

/// POST /locations — inserts a single location and publishes it to the SSE broadcast channel.
async fn create_location(
    State(state): State<AppState>,
    Json(req): Json<CreateLocationRequest>,
) -> Result<(StatusCode, Json<LocationResponse>), AppError> {
    let pool = state.pool.as_ref().ok_or(AppError::DatabaseUnavailable)?;
    validate_coordinates(req.latitude, req.longitude)?;

    let row = sqlx::query(
        r#"INSERT INTO bicycles_location (bicycle_id, location)
        VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326))
        RETURNING
            id, bicycle_id,
            ST_Y(location::geometry) as latitude,
            ST_X(location::geometry) as longitude,
            updated_at"#,
    )
    .bind(req.bicycle_id)
    .bind(req.longitude)
    .bind(req.latitude)
    .fetch_one(pool)
    .await
    .map_err(|e| {
        tracing::error!(error = %e, "Failed to insert location");
        AppError::DatabaseUnavailable
    })?;

    let location = row_to_location(&row);
    let _ = state.location_tx.send(location.clone());
    tracing::debug!(?location, "POST /locations");
    Ok((StatusCode::CREATED, Json(location)))
}

/// POST /locations/batch — inserts multiple locations in a single query.
async fn create_locations_batch(
    State(state): State<AppState>,
    Json(req): Json<CreateLocationBatchRequest>,
) -> Result<(StatusCode, Json<Vec<LocationResponse>>), AppError> {
    let pool = state.pool.as_ref().ok_or(AppError::DatabaseUnavailable)?;

    if req.locations.is_empty() {
        return Err(AppError::ValidationError(
            "batch must not be empty".to_string(),
        ));
    }

    for (i, loc) in req.locations.iter().enumerate() {
        validate_coordinates(loc.latitude, loc.longitude).map_err(|_| {
            AppError::ValidationError(format!(
                "entry {i}: latitude {} or longitude {} out of range",
                loc.latitude, loc.longitude
            ))
        })?;
    }

    let bicycle_ids: Vec<Uuid> = req.locations.iter().map(|l| l.bicycle_id).collect();
    let longitudes: Vec<f64> = req.locations.iter().map(|l| l.longitude).collect();
    let latitudes: Vec<f64> = req.locations.iter().map(|l| l.latitude).collect();

    let rows = sqlx::query(
        r#"INSERT INTO bicycles_location (bicycle_id, location)
        SELECT unnest($1::uuid[]), ST_SetSRID(ST_MakePoint(unnest($2::float8[]), unnest($3::float8[])), 4326)
        RETURNING
            id, bicycle_id,
            ST_Y(location::geometry) as latitude,
            ST_X(location::geometry) as longitude,
            updated_at"#,
    )
    .bind(&bicycle_ids)
    .bind(&longitudes)
    .bind(&latitudes)
    .fetch_all(pool)
    .await
    .map_err(|e| {
        tracing::error!(error = %e, "Failed to batch insert locations");
        AppError::DatabaseUnavailable
    })?;

    let locations: Vec<LocationResponse> = rows.iter().map(row_to_location).collect();
    for loc in &locations {
        let _ = state.location_tx.send(loc.clone());
    }
    tracing::debug!(count = locations.len(), "POST /locations/batch");
    Ok((StatusCode::CREATED, Json(locations)))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/locations", get(get_all_locations).post(create_location))
        .route(
            "/locations/bicycle/{bicycle_id}",
            get(get_locations_by_bicycle),
        )
        .route("/locations/batch", post(create_locations_batch))
}
