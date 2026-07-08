# Contributing Rules — Read Before You Touch Anything

## Your Branch
You have one branch for the whole project. It is named after you.
Switch to your branch in GitHub Desktop before you do anything else.
Never work on main. Never.

Back End:   be/dieuson  |  be/kiet  |  be/sophia
Front End:  fe/shubaan  |  fe/nia   |  fe/jeremiah
Content:    ct/jonny    |  ct/joseph |  ct/dillon

## Your Folder
You only touch files inside your team folder.
Do not open, edit, or create files in another team folder.

| Team      | Your folder  | Stay out of              |
|-----------|-------------|--------------------------|
| Back End  | backend/    | frontend/  content/      |
| Front End | frontend/   | backend/   content/      |
| Content   | content/    | backend/   frontend/     |

## Every Session — Four Steps In Order
1. Pull — open GitHub Desktop, click Fetch origin then Pull origin
2. Work — write your code or content in VS Code
3. Commit — write a real message describing what you did
4. Push — click Push origin before you close your laptop

## Commit Message Rules
Good: added planet position function for Mars using Skyfield
Good: seeded 30 verified solar eclipse events into events.csv
Good: built date picker input and submit button in index.html
Bad: stuff
Bad: update
Bad: changes
Bad: fixed things

## When Your Work Is Ready to Merge
Do not merge yourself. Do this instead:
1. Push your branch
2. Go to github.com/Shubaan7/Antikythera_26
3. Click Compare and pull request
4. Write a short description of what you built and that it is ready
5. Wait for the repo owner to review and approve

## What Each Team Is Building

Back End
Given a date, return where every planet is as JSON via Flask.
Detect eclipses and conjunctions from those positions.
Query the SQLite database for historical events by date and type.
Files: backend/app.py, backend/orbital_calculator.py, backend/event_detector.py, backend/database.py

Front End
One webpage with a dark theme.
A date picker and submit button at the top.
A solar system canvas diagram on the left showing planet positions.
An event list panel on the right showing nearby events.
A second screen for browsing and searching all events.
Files: frontend/index.html, frontend/style.css, frontend/app.js, frontend/diagram.js

Content
A spreadsheet of 50 verified real historical astronomical events.
A database schema defining the events and bodies tables.
A script that loads the spreadsheet into the SQLite database.
Files: content/events.csv, content/schema.sql, content/seed_events.py

## Reference Links
Planet position library:       rhodesmill.org/skyfield
Eclipse dates source:          eclipse.gsfc.nasa.gov
Conjunction and event dates:   timeanddate.com/eclipse/list.html
Planet position verifier:      ssd.jpl.nasa.gov/horizons
UI inspiration:                theskylive.com
Repo:                          github.com/Shubaan7/Antikythera_26

## Questions and Blockers
Post in Discord immediately if you are stuck, confused, or something is broken.
Do not guess. Do not stay stuck for more than 30 minutes without asking.
