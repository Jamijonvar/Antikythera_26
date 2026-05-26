# TODO: Content team runs this to load events.csv into the SQLite database
import csv
import sqlite3

conn = sqlite3.connect('content/events.db')
cursor = conn.cursor()

with open('content/schema.sql', 'r') as f:
    cursor.executescript(f.read())

with open('content/events.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        cursor.execute(
            'INSERT INTO events (date, event_type, planets, description, source) VALUES (?, ?, ?, ?, ?)',
            (row['date'], row['event_type'], row['planets'], row['description'], row['source'])
        )

conn.commit()
conn.close()
print('Done. Events loaded into content/events.db')
