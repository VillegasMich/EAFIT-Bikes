use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[allow(dead_code)]
#[derive(Debug, sqlx::FromRow)]
pub struct BicycleLocation {
    pub id: Uuid,
    pub bicycle_id: Uuid,
    pub latitude: f64,
    pub longitude: f64,
    pub updated_at: DateTime<Utc>,
}

/// Response representation of a bicycle location record.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocationResponse {
    pub id: Uuid,
    pub bicycle_id: Uuid,
    pub latitude: f64,
    pub longitude: f64,
    pub updated_at: DateTime<Utc>,
}

/// Request body for creating a single bicycle location.
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateLocationRequest {
    pub bicycle_id: Uuid,
    pub latitude: f64,
    pub longitude: f64,
}

/// Request body for creating multiple bicycle locations in a single batch.
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateLocationBatchRequest {
    pub locations: Vec<CreateLocationRequest>,
}

/// Query parameters for location list endpoints.
#[derive(Debug, Deserialize)]
pub struct LocationQuery {
    #[serde(default)]
    pub latest: bool,
}
