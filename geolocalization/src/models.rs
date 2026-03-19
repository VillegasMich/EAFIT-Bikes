use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, sqlx::FromRow)]
pub struct BicycleLocation {
    pub id: Uuid,
    pub bicycle_id: Uuid,
    pub latitude: f64,
    pub longitude: f64,
    pub updated_at: DateTime<Utc>,
}
