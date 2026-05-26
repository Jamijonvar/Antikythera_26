# Contributing Rules — Read Before You Touch Anything

## Golden Rules
1. Never commit directly to main. Ever.
2. Always pull before you start working.
3. Stay in your team folder. Do not touch other teams files.
4. Write a real commit message every time.
5. Push at the end of every session no matter what.

## Your Team Folder
| Team | Your folder | Stay out of |
|------|------------|-------------|
| Back End | backend/ | frontend/ content/ |
| Front End | frontend/ | backend/ content/ |
| Content | content/ | backend/ frontend/ |

## Branch Rules
Create your branch before writing a single line.
Name it like this:
- Back End: be/what-you-are-building
- Front End: fe/what-you-are-building
- Content: ct/what-you-are-building

Example: be/planet-positions or fe/date-picker or ct/seed-events

## How to Create a Branch
1. Open GitHub Desktop
2. Click Current Branch at the top
3. Click New Branch
4. Name it using the format above
5. Click Create Branch
6. Now work in VS Code

## How to Merge Into Main
You do not merge yourself. When your work is done:
1. Push your branch
2. Go to github.com/Shubaan7/Antikythera_26
3. Click Compare and pull request
4. Write what you did and why it is ready
5. Wait for the repo owner to review and approve

## Commit Message Rules
Be specific. One sentence. What did you actually do.
Good: added eclipse detection function for solar eclipses
Good: seeded 30 verified events into events.csv
Bad: stuff
Bad: changes
Bad: update
Bad: fixed things

## Reference Material
| What you need | Where to find it |
|--------------|-----------------|
| Planet position library | rhodesmill.org/skyfield |
| Eclipse dates | eclipse.gsfc.nasa.gov |
| Event browser inspiration | theskylive.com |
| Planet position verifier | ssd.jpl.nasa.gov/horizons |
| Repo | github.com/Shubaan7/Antikythera_26 |

## What Each Team Builds
Back End — given a date, return planet positions and detected events as JSON via Flask
Front End — one webpage with a date picker, solar system canvas diagram, and event list
Content — 50 verified real historical events in events.csv loaded into SQLite database

## Contact
Any questions, conflicts, or broken code — post in Discord immediately.
Do not guess. Do not stay stuck. Ask.
