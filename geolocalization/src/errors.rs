use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;

#[allow(dead_code)]
pub enum AppError {
    DatabaseUnavailable,
    ValidationError(String),
    NotFound(String),
    BadRequest(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::DatabaseUnavailable => (
                StatusCode::SERVICE_UNAVAILABLE,
                "database unavailable".to_string(),
            ),
            AppError::ValidationError(msg) => (StatusCode::UNPROCESSABLE_ENTITY, msg),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
        };
        tracing::error!(status = %status, error = %message, "Request error");
        let body = axum::Json(json!({ "error": message }));
        (status, body).into_response()
    }
}

/// Validates that latitude is in [-90, 90] and longitude is in [-180, 180].
pub fn validate_coordinates(lat: f64, lon: f64) -> Result<(), AppError> {
    if !(-90.0..=90.0).contains(&lat) {
        return Err(AppError::ValidationError(format!(
            "latitude {lat} is out of range [-90, 90]"
        )));
    }
    if !(-180.0..=180.0).contains(&lon) {
        return Err(AppError::ValidationError(format!(
            "longitude {lon} is out of range [-180, 180]"
        )));
    }
    Ok(())
}
