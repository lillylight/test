import swisseph as swe
import datetime
import sys
import json
import os

# Set eph path and JPL file using relative paths that work in any environment
current_dir = os.getcwd()
swe.set_ephe_path(current_dir)  # Use current directory as ephemeris path
swe.set_jpl_file(os.path.join(current_dir, "de406e.eph"))  # Look for de406e.eph in current directory
swe.set_sid_mode(swe.SIDM_LAHIRI)

# === NO LOCATION PRESETS: Use user input for lat/lon/tz ===

def main():
    # Read JSON input from stdin
    data = json.load(sys.stdin)
    city = data.get("city", "lusaka").lower()
    year = int(data["year"])
    month = int(data["month"])
    day = int(data["day"])
    time_hint = data.get("time_hint", "morning").lower()
    physical_traits = data.get("physical_traits", "")
    # Accept latitude, longitude, and timezone directly from user input
    lat = float(data.get("lat"))
    lon = float(data.get("lon"))
    tz = float(data.get("tz"))

    # Map frontend timeOfDay to hour ranges
    time_ranges = {
        "earlyMorning": (4.0, 6.99),
        "morning": (7.0, 10.99),
        "midday": (11.0, 13.99),
        "afternoon": (14.0, 16.99),
        "evening": (17.0, 19.99),
        "night": (20.0, 27.99)  # 20:00 to 03:59 next day (27.99 = 3.99 next day)
    }
    start_hour, end_hour = time_ranges.get(time_hint, (7.0, 10.99))
    # Handle night range crossing midnight
    if time_hint == 'night' and end_hour > 24:
        hours = list(range(int(start_hour), 24)) + list(range(0, int(end_hour-24)+1))
    else:
        hours = list(range(int(start_hour), int(end_hour)+1))

    # Julian day
    jd = swe.julday(year, month, day)
    result = {"sunrise": None, "sunset": None, "intervals": [], "city": city, "lat": lat, "lon": lon, "tz": tz}

    # Sunrise & Sunset
    try:
        sunrise = swe.rise_trans(jd, swe.SUN, (lon, lat, 0), 1013.25, 15, rsmi=swe.CALC_RISE, flag=swe.FLG_SWIEPH)[1]
        sunset = swe.rise_trans(jd, swe.SUN, (lon, lat, 0), 1013.25, 15, rsmi=swe.CALC_SET, flag=swe.FLG_SWIEPH)[1]
        y1, m1, d1, h1 = swe.revjul(sunrise)
        y2, m2, d2, h2 = swe.revjul(sunset)
        result["sunrise"] = f"{int(h1)}:{int((h1%1)*60):02d} UTC"
        result["sunset"] = f"{int(h2)}:{int((h2%1)*60):02d} UTC"
    except Exception as e:
        result["sunrise"] = result["sunset"] = str(e)

    # Ascendant & Planets in Range
    def get_sign_name(degree):
        signs = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
        return signs[int(degree // 30) % 12]

    asc_signs = []
    for h in hours:
        for m in [0, 30]:
            decimal_hour = h + m / 60.0
            jd_hour = swe.julday(year, month, day, decimal_hour - tz)
            houses = swe.houses_ex(jd_hour, lat, lon, b'A', flag=swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
            asc = houses[0][0]
            asc_sign = get_sign_name(asc)
            asc_signs.append(asc_sign)
            planet_positions = {}
            for planet in range(swe.SUN, swe.PLUTO + 1):
                pos, _ = swe.calc_ut(jd_hour, planet, flag=swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
                planet_positions[swe.get_planet_name(planet)] = pos[0]
            result["intervals"].append({
                "time": f"{int(decimal_hour)%24:02d}:{int((decimal_hour%1)*60):02d}",
                "ascendant": asc,
                "ascendant_sign": asc_sign,
                "planets": planet_positions
            })
    # Find the ruling ascendant sign (mode)
    from collections import Counter
    if asc_signs:
        ruling_asc = Counter(asc_signs).most_common(1)[0][0]
        result["ruling_ascendant"] = ruling_asc
    else:
        result["ruling_ascendant"] = None
    # Output JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()
