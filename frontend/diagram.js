// Front End team, solar system diagram
// This file draws a stylised solar system onto the canvas.
// The Sun sits in the centre. Each planet sits on its own ring, ordered outward from the Sun
// the way the real planets are. The angle of each planet around its ring comes from its real
// right ascension, which is the direction it appears in the sky, so the picture moves with the date.
//
// A few honest notes about the choices here, so nobody is misled:
//  - The ring spacing is even and stylised. It is not drawn to the true scale of the solar system,
//    because Neptune is thirty times further out than the Earth and would not fit nicely.
//  - The angle around each ring is the real right ascension of that body.
//  - The Earth is not returned by the backend, because you cannot observe the Earth from the Earth.
//    We work out where to draw it from the Sun instead. The Sun always appears in the opposite
//    direction to where the Earth actually is, so the Earth angle is the Sun angle turned by 180 degrees.
//  - The Moon is drawn circling the Earth, using its real direction in the sky.

// The order of the planets outward from the Sun, along with a colour and a label for each.
var RING_BODIES = [
    { name: "Mercury", colour: "#b7b7b7" },
    { name: "Venus", colour: "#e6c27a" },
    { name: "Earth", colour: "#4a8fe7" },
    { name: "Mars", colour: "#d9603b" },
    { name: "Jupiter", colour: "#d9a066" },
    { name: "Saturn", colour: "#e3d19a" },
    { name: "Uranus", colour: "#86d0e0" },
    { name: "Neptune", colour: "#5a7ff0" }
];

// Turn a right ascension in degrees into an angle in radians for our drawing maths.
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

// Build a quick lookup so we can find a body by its name in the data the backend sent.
function indexByName(planets) {
    var lookup = {};
    for (var i = 0; i < planets.length; i++) {
        lookup[planets[i].name] = planets[i];
    }
    return lookup;
}

// Draw a small filled circle with a label beside it. Used for every body.
function drawBody(context, x, y, radius, colour, label) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = colour;
    context.fill();

    context.fillStyle = "#cdd6ee";
    context.font = "12px Calibri, 'Segoe UI', sans-serif";
    context.fillText(label, x + radius + 4, y + 4);
}

// Draw a bright ring around a body to mark it as one of the bodies in the event being shown.
// We use white so it stands out on every body, including the yellow Sun.
function drawHighlightRing(context, x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;
    context.stroke();
    context.lineWidth = 1;
}

// The main entry point. app.js calls this with the canvas and the list of bodies from the backend.
// The optional highlight argument is a list of body names to emphasise, such as the Sun and Moon
// of a clicked eclipse. When it is left out, nothing is emphasised and the diagram looks as before.
function drawSolarSystem(canvas, planets, highlight) {
    var context = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var centreX = width / 2;
    var centreY = height / 2;

    // Start from a clean canvas every time so old drawings do not pile up.
    context.clearRect(0, 0, width, height);

    // Scatter a few faint stars for atmosphere. The pattern is fixed so it does not flicker
    // each time we redraw.
    context.fillStyle = "rgba(255, 255, 255, 0.35)";
    var seed = 7;
    for (var s = 0; s < 90; s++) {
        // A tiny predictable pseudo random generator, so the stars land in the same spots every time.
        seed = (seed * 9301 + 49297) % 233280;
        var starX = (seed / 233280) * width;
        seed = (seed * 9301 + 49297) % 233280;
        var starY = (seed / 233280) * height;
        context.fillRect(starX, starY, 1, 1);
    }

    var lookup = indexByName(planets);

    // Build a set of the bodies to emphasise, so we can check each one quickly as we draw.
    var highlightSet = {};
    if (highlight) {
        for (var hi = 0; hi < highlight.length; hi++) {
            highlightSet[highlight[hi]] = true;
        }
    }

    // The innermost ring radius and the gap between rings. These keep every ring inside the canvas.
    var firstRing = 60;
    var ringGap = 32;

    // Draw the faint ring for each planet first, so the planet dots sit on top of them.
    context.strokeStyle = "rgba(150, 165, 210, 0.22)";
    context.lineWidth = 1;
    for (var r = 0; r < RING_BODIES.length; r++) {
        var ringRadius = firstRing + r * ringGap;
        context.beginPath();
        context.arc(centreX, centreY, ringRadius, 0, Math.PI * 2);
        context.stroke();
    }

    // Draw the Sun in the centre with a soft glow.
    var glow = context.createRadialGradient(centreX, centreY, 2, centreX, centreY, 26);
    glow.addColorStop(0, "#ffe9a8");
    glow.addColorStop(1, "rgba(245, 196, 81, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(centreX, centreY, 26, 0, Math.PI * 2);
    context.fill();
    drawBody(context, centreX, centreY, highlightSet["Sun"] ? 12 : 10, "#f5c451", "Sun");
    if (highlightSet["Sun"]) {
        drawHighlightRing(context, centreX, centreY, 18);
    }

    // Work out the Earth angle from the Sun, because the backend does not send the Earth itself.
    // We will reuse this to place the Moon around the Earth further down.
    var earthX = null;
    var earthY = null;
    var sunBody = lookup["Sun"];

    // Now place each planet on its ring.
    for (var b = 0; b < RING_BODIES.length; b++) {
        var body = RING_BODIES[b];
        var ringRadius = firstRing + b * ringGap;
        var angleRadians;

        if (body.name === "Earth") {
            // The Earth sits opposite the Sun, so we only draw it if we know where the Sun is.
            if (!sunBody) {
                continue;
            }
            angleRadians = toRadians(sunBody.ra_deg + 180);
        } else {
            // Every other planet uses its own right ascension. Skip it if the backend had no data.
            var data = lookup[body.name];
            if (!data) {
                continue;
            }
            angleRadians = toRadians(data.ra_deg);
        }

        var x = centreX + ringRadius * Math.cos(angleRadians);
        var y = centreY + ringRadius * Math.sin(angleRadians);
        var emphasised = highlightSet[body.name] === true;
        drawBody(context, x, y, emphasised ? 8 : 6, body.colour, body.name);
        if (emphasised) {
            drawHighlightRing(context, x, y, 12);
        }

        if (body.name === "Earth") {
            earthX = x;
            earthY = y;
        }
    }

    // Finally draw the Moon circling the Earth, using its real direction in the sky.
    var moonBody = lookup["Moon"];
    if (moonBody && earthX !== null) {
        var moonAngle = toRadians(moonBody.ra_deg);
        var moonDistance = 16;
        var moonX = earthX + moonDistance * Math.cos(moonAngle);
        var moonY = earthY + moonDistance * Math.sin(moonAngle);
        drawBody(context, moonX, moonY, highlightSet["Moon"] ? 5 : 3, "#cfd4e0", "Moon");
        if (highlightSet["Moon"]) {
            drawHighlightRing(context, moonX, moonY, 9);
        }
    }
}
