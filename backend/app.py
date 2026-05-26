from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/positions')
def get_positions():
    date = request.args.get('date')
    # TODO: call orbital_calculator.py here
    return jsonify({"date": date, "planets": []})

@app.route('/api/events')
def get_events():
    date = request.args.get('date')
    days = request.args.get('days', 30)
    # TODO: call database.py here
    return jsonify({"date": date, "events": []})

if __name__ == '__main__':
    app.run(debug=True)
