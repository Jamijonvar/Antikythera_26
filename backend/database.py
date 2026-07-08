# Back End team, database queries
# This module reads events out of the SQLite database that the Content team's seeder builds.
# The frontend never talks to this file directly. Instead app.py calls it and passes the
# results on. Keeping the database code separate here keeps the server file tidy.
#
# Input: a date string in YYYY MM DD format, and how many days on either side to look.
# Output: a list of events near that date, each one shaped exactly for the API contract.

import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

# The database file is created by content/seed_events.py and lives in the content folder,
# which sits next to this backend folder at the repository root.
_DB_PATH = Path(__file__).resolve().parent.parent / "content" / "events.db"


class DatabaseMissingError(RuntimeError):
    """Raised when the events database has not been built yet."""


def _connect():
    # Open the database, but first check it actually exists. If it does not, we give a
    # clear instruction rather than letting SQLite quietly create an empty file.
    if not _DB_PATH.exists():
        raise DatabaseMissingError(
            "The events database has not been built yet. "
            "Run: python content/seed_events.py"
        )
    connection = sqlite3.connect(_DB_PATH)
    # This row factory lets us read each column by its name, which makes the code below easy to read.
    connection.row_factory = sqlite3.Row
    return connection


def get_events(date_string, days=30):
    # Find every event within the given number of days on either side of the date.
    # For example a date of 2017-08-21 with days of 30 looks from 22 July to 20 September.
    # We centre the window on the date because the point of the app is to show what
    # happened near the day you typed in, both before it and after it.
    center = datetime.strptime(date_string, "%Y-%m-%d")
    start = (center - timedelta(days=days)).strftime("%Y-%m-%d")
    end = (center + timedelta(days=days)).strftime("%Y-%m-%d")

    connection = _connect()
    try:
        cursor = connection.execute(
            "SELECT id, date, event_type, planets, description, source "
            "FROM events "
            "WHERE date BETWEEN ? AND ? "
            "ORDER BY date",
            (start, end),
        )
        found = cursor.fetchall()
    finally:
        connection.close()

    events = []
    for row in found:
        events.append({
            "id": row["id"],
            "date": row["date"],
            "event_type": row["event_type"],
            # The database stores the bodies as one space separated string.
            # The frontend expects a real list, so we split it back apart here.
            "planets": row["planets"].split(),
            "description": row["description"],
            "source": row["source"],
        })
    return events
