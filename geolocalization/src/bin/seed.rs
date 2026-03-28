use std::time::Instant;

use chrono::{Duration, Utc};
use clap::Parser;
use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;
use tracing::{error, info};
use tracing_subscriber::EnvFilter;

/// Seed binary for the geolocalization microservice.
///
/// By default, performs a one-shot seed of static bicycle location data.
/// With `--live`, enters a continuous ingestor mode that inserts new positions
/// every second to simulate real-time bicycle movement.
#[derive(Parser)]
#[command(name = "seed")]
struct Cli {
    /// Run in live ingestor mode: continuously insert positions every second
    #[arg(long)]
    live: bool,
}

/// Fixed seed bicycle IDs.
const SEED_IDS: [i32; 4] = [1, 2, 3, 4];

/// Waypoint routes near the EAFIT campus in Medellín (lat ~6.20, lon ~-75.57).
/// Each route is a sequence of (latitude, longitude) waypoints.
fn routes() -> Vec<Vec<(f64, f64)>> {
    vec![
        // Bicycle 1: Loop around EAFIT campus
        vec![
            (6.2006, -75.5785),
            (6.2020, -75.5770),
            (6.2035, -75.5760),
            (6.2025, -75.5745),
            (6.2010, -75.5750),
            (6.1995, -75.5765),
            (6.2006, -75.5785),
        ],
        // Bicycle 2: Along Avenida El Poblado heading south
        vec![
            (6.2100, -75.5700),
            (6.2080, -75.5710),
            (6.2060, -75.5720),
            (6.2040, -75.5730),
            (6.2020, -75.5740),
            (6.2000, -75.5750),
        ],
        // Bicycle 3: Through Parque Lleras area
        vec![
            (6.2085, -75.5680),
            (6.2075, -75.5695),
            (6.2060, -75.5705),
            (6.2045, -75.5700),
            (6.2035, -75.5715),
            (6.2050, -75.5730),
        ],
        // Bicycle 4: Along Transversal Inferior
        vec![
            (6.1980, -75.5790),
            (6.1995, -75.5775),
            (6.2010, -75.5760),
            (6.2025, -75.5745),
            (6.2040, -75.5735),
            (6.2055, -75.5720),
            (6.2070, -75.5710),
        ],
    ]
}

/// Interpolate between waypoints to produce at least `min_points` positions.
fn interpolate_route(waypoints: &[(f64, f64)], min_points: usize) -> Vec<(f64, f64)> {
    if waypoints.len() >= min_points {
        return waypoints.to_vec();
    }

    let segments = waypoints.len() - 1;
    let points_per_segment = min_points.div_ceil(segments);
    let mut positions = Vec::with_capacity(min_points);

    for i in 0..segments {
        let (lat1, lon1) = waypoints[i];
        let (lat2, lon2) = waypoints[i + 1];

        let steps = if i == segments - 1 {
            // Last segment: include the endpoint
            points_per_segment
        } else {
            points_per_segment
        };

        for s in 0..steps {
            let t = s as f64 / steps as f64;
            let lat = lat1 + t * (lat2 - lat1);
            let lon = lon1 + t * (lon2 - lon1);
            positions.push((lat, lon));
        }
    }

    // Always include the final waypoint
    if let Some(&last) = waypoints.last()
        && positions.last() != Some(&last)
    {
        positions.push(last);
    }

    // Trim to exactly min_points if we generated more
    positions.truncate(min_points);
    positions
}

/// One-shot seed: insert static location data for all bicycles.
async fn run_seed(pool: &PgPool) {
    let all_routes = routes();
    let base_time = Utc::now();
    let mut total_positions: usize = 0;

    for (i, (id, waypoints)) in SEED_IDS.iter().zip(all_routes.iter()).enumerate() {
        let positions = interpolate_route(waypoints, 15);
        let bike_num = i + 1;

        info!(
            "Seeding bicycle {bike_num}/{} (id: {id}) with {} positions",
            SEED_IDS.len(),
            positions.len()
        );

        // Delete existing rows for idempotency
        sqlx::query("DELETE FROM bicycles_location WHERE bicycle_id = $1")
            .bind(id)
            .execute(pool)
            .await
            .unwrap_or_else(|e| {
                error!("Failed to delete existing rows for {id}: {e}");
                std::process::exit(1);
            });

        // Insert positions
        for (j, (lat, lon)) in positions.iter().enumerate() {
            let updated_at = base_time + Duration::seconds(30 * j as i64);

            sqlx::query(
                "INSERT INTO bicycles_location (bicycle_id, location, updated_at) \
                 VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4)",
            )
            .bind(id)
            .bind(lon) // PostGIS: MakePoint(lon, lat)
            .bind(lat)
            .bind(updated_at)
            .execute(pool)
            .await
            .unwrap_or_else(|e| {
                error!(
                    "Failed to insert position {}/{} for bicycle {id}: {e}",
                    j + 1,
                    positions.len()
                );
                std::process::exit(1);
            });
        }

        total_positions += positions.len();
        info!(
            "  ✓ Bicycle {bike_num} seeded with {} positions",
            positions.len()
        );
    }

    info!(
        "Seed complete: {} bicycles, {} total positions",
        SEED_IDS.len(),
        total_positions
    );
}

/// Live ingestor: continuously insert positions every second to simulate movement.
async fn run_live(pool: &PgPool) {
    let all_routes = routes();
    let interpolated: Vec<Vec<(f64, f64)>> = all_routes
        .iter()
        .map(|r| interpolate_route(r, 15))
        .collect();

    info!(
        "Live ingestor started: {} bicycles, route lengths: {:?}",
        SEED_IDS.len(),
        interpolated.iter().map(|r| r.len()).collect::<Vec<_>>()
    );

    let mut indices: Vec<usize> = vec![0; SEED_IDS.len()];
    let mut tick: u64 = 0;
    let mut total_positions: u64 = 0;
    let start = Instant::now();

    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(1));

    loop {
        tokio::select! {
            _ = interval.tick() => {
                tick += 1;
                let now = Utc::now();

                for (i, id) in SEED_IDS.iter().enumerate() {
                    let route = &interpolated[i];
                    let idx = indices[i];
                    let (lat, lon) = route[idx];

                    sqlx::query(
                        "INSERT INTO bicycles_location (bicycle_id, location, updated_at) \
                         VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4)",
                    )
                    .bind(id)
                    .bind(lon)
                    .bind(lat)
                    .bind(now)
                    .execute(pool)
                    .await
                    .unwrap_or_else(|e| {
                        error!("Failed to insert position for bicycle {id}: {e}");
                        std::process::exit(1);
                    });

                    // Advance and wrap
                    indices[i] = (idx + 1) % route.len();
                }

                total_positions += SEED_IDS.len() as u64;
                info!(
                    "Tick {tick}: inserted {} positions ({total_positions} total)",
                    SEED_IDS.len()
                );
            }
            _ = tokio::signal::ctrl_c() => {
                let elapsed = start.elapsed();
                info!(
                    "Shutting down live ingestor: {total_positions} positions inserted over {:.1}s ({tick} ticks)",
                    elapsed.as_secs_f64()
                );
                break;
            }
        }
    }
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let cli = Cli::parse();

    // Read DATABASE_URL
    let database_url = match std::env::var("DATABASE_URL") {
        Ok(url) => url,
        Err(_) => {
            error!("DATABASE_URL is not set. Please set it in your environment or .env file.");
            std::process::exit(1);
        }
    };

    // Connect to database
    let pool = match PgPoolOptions::new()
        .max_connections(2)
        .connect(&database_url)
        .await
    {
        Ok(pool) => {
            info!("Connected to database");
            pool
        }
        Err(e) => {
            error!("Failed to connect to database: {e}");
            error!("Make sure PostgreSQL is running (docker compose up -d db)");
            std::process::exit(1);
        }
    };

    // Run migrations
    match sqlx::migrate!().run(&pool).await {
        Ok(_) => info!("Migrations applied successfully"),
        Err(e) => {
            error!("Migration failed: {e}");
            std::process::exit(1);
        }
    }

    if cli.live {
        run_live(&pool).await;
    } else {
        run_seed(&pool).await;
    }
}
