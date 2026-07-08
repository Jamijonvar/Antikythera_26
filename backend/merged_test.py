from flask import Flask, jsonify, request
from skyfield.api import load

app = Flask(__name__)
ts = load.timescale()
planets = load('de421.bsp')

sel = str(input("Do you want to use the current time? (yes/no) "))
usecurrenttime = 1

if sel == "no":
    print("Input a date in UTC.\n")
    year = int(input("Year: "))
    month = int(input("Month: "))
    day = int(input("Day: "))
    usecurrenttime = 0

planet_selected = str(input("Enter in a planet name: "))

@app.route("/planet", methods=["GET"]) #decorator
def get_planet():

    planet_name = request.args.get("name")
    try:
        if usecurrenttime == 1:
            t = ts.now()
        else:
            t = ts.utc(year, month, day)
        main_planet = planets[planet_selected]
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
    

if __name__ == "main":
    app.run(debug=True)
    # test