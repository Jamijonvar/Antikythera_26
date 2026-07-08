# Back End team, planet positions
# This module uses Skyfield to work out where each body sits in the sky on a given date.
# Input is a date string in the format YYYY MM DD, for example "2017-08-21".
# Output is a list of dictionaries, one per body, matching the API contract fields.
#
# The maths here is the same idea Jonny proved in combined_backend_test.py.
# We stand on the Earth, look out at each body, and read off its position.
# The difference is that this version does every body at once and uses the date
# the user asked for instead of the current moment.

from datetime import datetime
from pathlib import Path

from skyfield.api import load

# The ephemeris file de421.bsp lives at the repository root, one level above this backend folder.
# We build an absolute path to it so the code loads correctly no matter which folder you run it from.
_EPHEMERIS_PATH = Path(__file__).resolve().parent.parent / "de421.bsp"

# de421 only knows about the years 1899 through 2053, so we remember those limits
# and refuse any date outside them with a clear message rather than a confusing crash.
MIN_YEAR = 1899
MAX_YEAR = 2053

# Load the timescale and the ephemeris once when this module is first imported.
# Loading them on every request would be slow, so we keep them ready in memory.
_timescale = load.timescale()
_ephemeris = load(str(_EPHEMERIS_PATH))

# The Earth is where we observe from, so we grab it once here.
_earth = _ephemeris["earth"]

# These are the bodies we report on, in the order we want them to appear.
# The name on the left is the friendly label we send to the frontend.
# The value on the right is the exact key Skyfield expects inside de421.
# The outer planets only exist as barycenters in this file, so their keys say "barycenter".
# We deliberately leave the Earth out of this list. You cannot sensibly observe the Earth
# from the Earth, so including it would only produce meaningless numbers.
_BODIES = {
    "Sun": "sun",
    "Mercury": "mercury",
    "Venus": "venus",
    "Moon": "moon",
    "Mars": "mars",
    "Jupiter": "jupiter barycenter",
    "Saturn": "saturn barycenter",
    "Uranus": "uranus barycenter",
    "Neptune": "neptune barycenter",
}


class DateError(ValueError):
    """Raised when the date string is missing, badly formatted, or outside the ephemeris range."""


def _parse_date(date_string):
    # Turn the incoming text into a real date object.
    # If the text is empty or not in the expected shape, we raise a friendly error.
    if not date_string:
        raise DateError("date parameter is required, format YYYY-MM-DD")

    try:
        parsed = datetime.strptime(date_string, "%Y-%m-%d")
    except ValueError:
        raise DateError("date parameter is required, format YYYY-MM-DD")

    if parsed.year < MIN_YEAR or parsed.year > MAX_YEAR:
        raise DateError(
            f"date must be between {MIN_YEAR} and {MAX_YEAR}, the range covered by the ephemeris"
        )

    return parsed


def positions_for_date(date_string):
    # Work out the position of every body for the given date and hand back a plain list.
    # Each entry has the name, right ascension in degrees, declination in degrees,
    # and distance from Earth in astronomical units, exactly as the API contract asks for.
    parsed = _parse_date(date_string)

    # We fix the moment at midday so the position is representative of the whole day.
    moment = _timescale.utc(parsed.year, parsed.month, parsed.day, 12)

    results = []
    for friendly_name, ephemeris_key in _BODIES.items():
        body = _ephemeris[ephemeris_key]

        # Stand on the Earth at this moment and look towards the body.
        astrometric = _earth.at(moment).observe(body)
        ra, dec, distance = astrometric.radec()

        results.append(
            {
                "name": friendly_name,
                "ra_deg": round(ra._degrees, 4),
                "dec_deg": round(dec.degrees, 4),
                "distance_au": round(distance.au, 6),
            }
        )

    return results
