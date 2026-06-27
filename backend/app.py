from flask import Flask, jsonify, request
from skyfield.api import load
from flask_cors import CORS

app = Flask(__name__)
ts = load.timescale()
planets = load('de421.bsp')

@app.route("/planet", methods=["GET"]) #decorator
def get_planet():
    
    planet_name = request.args.get("name")
    try:
        t = ts.now()
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



