from flask import Flask, jsonify, request
from flask_cors import CORS
from skyfield.api import load

app = Flask(__name__)

CORS(app)

ts = load.timescale()
planets = load('de421.bsp')


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

#_________________Jonny code VVVV______________

@app.route("/planet", methods=["GET"]) #decorator
def get_planet():
    
    planet_name = request.args.get("name")
    try:
        t = ts.now() #this needs to be changed to the date from the request args, but for now it just uses the current time
        earth = planets['earth']
        target_planet = planets[planet_name]
        astrometric = earth.at(t).observe(target_planet)
        ra, dec, distance = astrometric.radec()
        
        return jsonify({
            "planet": planet_name,
            "ra": ra._degrees,
            "dec": dec._degrees,
            "distance_au": distance.au
        })
    except Exception as e:
         return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
    
#http://127.0.0.1:5000/planet?name=mars
