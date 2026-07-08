# Content team, database seeder
# This script builds the SQLite database from scratch and fills it with the events
# listed in events.csv.
# Run it with: python content/seed_events.py
# Afterwards you can open content/events.db in DB Browser for SQLite to look inside.
#
# Running this again is always safe. The schema drops the old tables first,
# so you never end up with duplicate rows.

import csv
import sqlite3
from pathlib import Path

# Work out where everything lives, relative to this file, so the script runs
# correctly no matter which folder you start it from.
HERE = Path(__file__).resolve().parent
CSV_PATH = HERE / "events.csv"
SCHEMA_PATH = HERE / "schema.sql"
DB_PATH = HERE / "events.db"

# The bodies we seed into the reference table. This is the same set the calculator reports on,
# plus the Earth, because many events involve the Earth even though we never observe it directly.
KNOWN_BODIES = [
    "Sun", "Mercury", "Venus", "Earth", "Moon",
    "Mars", "Jupiter", "Saturn", "Uranus", "Neptune",
]


def read_event_rows():
    # Read events.csv and hand back a clean list of rows ready for the database.
    # We skip any line that is blank or that starts with a hash, because those are
    # comments and notes the Content team left for themselves, not real data.
    with open(CSV_PATH, newline="", encoding="utf-8") as handle:
        meaningful_lines = []
        for line in handle:
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            meaningful_lines.append(line)

    # The first surviving line is the header, and csv.DictReader uses it to name the columns.
    reader = csv.DictReader(meaningful_lines)

    rows = []
    for entry in reader:
        # Tidy up every value so stray spaces in the spreadsheet do not sneak into the database.
        rows.append({
            "date": entry["date"].strip(),
            "event_type": entry["event_type"].strip(),
            "planets": entry["planets"].strip(),
            "description": entry["description"].strip(),
            "source": entry["source"].strip(),
        })
    return rows


def seed():
    rows = read_event_rows()

    connection = sqlite3.connect(DB_PATH)
    try:
        # Build the empty tables by running the schema file.
        schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
        connection.executescript(schema_sql)

        # Fill the bodies reference table.
        connection.executemany(
            "INSERT INTO bodies (name) VALUES (?)",
            [(name,) for name in KNOWN_BODIES],
        )

        # Fill the events table one row at a time. If a row breaks a rule,
        # for example an event_type that is not one of the four allowed values,
        # SQLite raises an error and we point at the exact row that caused it.
        for index, row in enumerate(rows, start=1):
            try:
                connection.execute(
                    "INSERT INTO events (date, event_type, planets, description, source) "
                    "VALUES (:date, :event_type, :planets, :description, :source)",
                    row,
                )
            except sqlite3.IntegrityError as problem:
                raise SystemExit(
                    f"Row {index} in events.csv could not be loaded: {problem}. "
                    f"The row was: {row}"
                )

        connection.commit()
    finally:
        connection.close()

    print(f"Loaded {len(rows)} events into {DB_PATH}")
    print(f"Seeded {len(KNOWN_BODIES)} bodies into the bodies table")


if __name__ == "__main__":
    seed()
