-- Drop the existing table and recreate with bicycle_id as INTEGER
DROP TABLE IF EXISTS bicycles_location;

CREATE TABLE bicycles_location (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bicycle_id  INTEGER NOT NULL,
    location    GEOGRAPHY(POINT, 4326) NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bicycles_location_geo ON bicycles_location USING GIST(location);
CREATE INDEX idx_bicycles_location_bicycle_id ON bicycles_location (bicycle_id);
