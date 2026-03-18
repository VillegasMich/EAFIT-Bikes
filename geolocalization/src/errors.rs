use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;

#[allow(dead_code)]
pub enum AppError {
    DatabaseUnavailable,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::DatabaseUnavailable => {
                (StatusCode::SERVICE_UNAVAILABLE, "database unavailable")
            }
        };
        tracing::error!(status = %status, error = message, "Request error");
        let body = axum::Json(json!({ "error": message }));
        (status, body).into_response()
    }
}
