CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE bicycles_location (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bicycle_id  UUID NOT NULL,
    location    GEOGRAPHY(POINT, 4326) NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bicycles_location_geo ON bicycles_location USING GIST(location);
CREATE INDEX idx_bicycles_location_bicycle_id ON bicycles_location (bicycle_id);
