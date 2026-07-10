# Back End team, Flask server
# This is the one real server for the project. It ties the frontend to our calculation code.
# Run it with: python backend/app.py
# Then try it in a browser: http://localhost:5001/api/positions?date=2017-08-21
#
# Note for the team: combined_backend_test.py and Keit_code.py are kept as reference only.
# All new backend work happens here in app.py.

from datetime import datetime 
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# We import our own calculation helper. The DateError type lets us tell the difference
# between a bad date from the user and a genuine bug in our code.
from orbital_calculator import positions_for_date, DateError

# We also import the database helper that finds historical events near a date.
from database import get_events, DatabaseMissingError

app = Flask(__name__)

# CORS lets a frontend on a different address call this server without the browser
# blocking the request. We keep it on as a safety net, even though the setup below
# serves the frontend from this same server, which means there is no cross origin issue anyway.
CORS(app)

# This server also hands out the frontend files, the HTML, the CSS, and the JavaScript.
# Serving everything from one place means there is only one address to open in the browser
# and nothing to configure. It is also exactly how the whole thing runs once deployed in Phase 6.
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"


@app.route("/")
def home():
    # Hand back the main page when someone visits the site root.
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:filename>")
def frontend_asset(filename):
    # Hand back any other frontend file the page asks for, such as app.js, diagram.js, or style.css.
    # The api routes above are matched first by Flask, so this never gets in their way.
    return send_from_directory(FRONTEND_DIR, filename)


@app.route("/api/positions")
def get_positions():
    # Read the date the user asked for out of the query string.
    date = request.args.get("date")

    try:
        planets = positions_for_date(date)
    except DateError as problem:
        # The user gave us a date we cannot use, so we explain what went wrong
        # and answer with the 400 status that means "bad request".
        return jsonify({"error": str(problem)}), 400

    # Everything worked, so we send back the date and the list of body positions
    # in the exact shape the API contract describes.
    return jsonify({"date": date, "planets": planets})


@app.route("/api/events")
def events_route():
    # Read the date and the window size out of the query string.
    date = request.args.get("date")
    days_raw = request.args.get("days", "30")

    # The date must be present and correctly formatted, just like on the positions route.
    if not date:
        return jsonify({"error": "date parameter is required, format YYYY-MM-DD"}), 400
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "date parameter is required, format YYYY-MM-DD"}), 400

    # The days value must be a whole number. If it is not, we fall back to the friendly error.
    try:
        days = int(days_raw)
    except ValueError:
        return jsonify({"error": "days parameter must be a whole number"}), 400

    try:
        events = get_events(date, days)
    except DatabaseMissingError as problem:
        # The database has not been built. This is our problem to fix, not the user's,
        # so we answer with the 500 status that means "something went wrong on the server".
        return jsonify({"error": str(problem)}), 500

    # Send back the date, the window we used, and the events we found, matching the API contract.
    return jsonify({"date": date, "days": days, "events": events})


if __name__ == "__main__":
    # Debug mode restarts the server automatically whenever we save a change,
    # which makes development much quicker.
    # We run on port 5001 rather than the usual 5000. On a Mac, port 5000 is quietly
    # taken by the AirPlay Receiver feature, which makes the server look broken even
    # though it is running. Port 5001 sidesteps that completely.
    app.run(debug=True, port=5001)
