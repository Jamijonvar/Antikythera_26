-- Content team, database schema
-- This file defines the tables that hold our celestial bodies and our astronomical events.
-- Run this before seed_events.py. The seeder runs it for you automatically,
-- so you normally do not need to run it by hand.

-- We drop the tables first so that running the seeder again always gives a clean, fresh database
-- rather than piling duplicate rows on top of what was already there.
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS bodies;

-- The bodies table is a simple reference list of the celestial bodies our project knows about.
-- It is here mostly for documentation and future use. The events table does not depend on it yet.
CREATE TABLE bodies (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- The events table is the heart of this database. Every row is one real historical event.
-- The columns line up exactly with the fields the API sends back to the frontend.
CREATE TABLE events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    -- The date the event happened, always written as YYYY MM DD text so it sorts correctly.
    date        TEXT NOT NULL,
    -- The kind of event. The CHECK below only allows the four types the API contract permits,
    -- so a typo in the spreadsheet is caught the moment we try to load it.
    event_type  TEXT NOT NULL CHECK (event_type IN (
        'Solar Eclipse',
        'Lunar Eclipse',
        'Conjunction',
        'Opposition'
    )),
    -- The bodies involved, stored as one space separated string, for example "Sun Moon Earth".
    -- The backend splits this back into a list before sending it to the frontend.
    planets     TEXT NOT NULL,
    -- A short human friendly sentence describing the event.
    description TEXT,
    -- Where the date and details came from, so every claim can be checked.
    source      TEXT
);

-- Searching by date is the most common thing we do, so we add an index to keep it fast.
CREATE INDEX idx_events_date ON events (date);
