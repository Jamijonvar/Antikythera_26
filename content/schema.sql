-- TODO: Content team defines tables here

CREATE TABLE IF NOT EXISTS bodies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  date TEXT NOT NULL,
  event_type TEXT NOT NULL,
  planets TEXT NOT NULL,
  description TEXT,
  source TEXT
);
