// Front End team, main logic
// This file listens for the date form, asks the backend for positions and events,
// draws the solar system, and fills the event cards. It also runs the two tabs and
// the search box on the Browse Events screen.

// The backend now serves this page as well, so the API lives at the same address we loaded from.
// Leaving this empty means every request goes to that same address. This works without changes
// both on your laptop and once the whole thing is deployed in Phase 6.
var API_BASE = "";

// Grab the parts of the page we work with, once, up front.
var dateForm = document.getElementById("date-form");
var dateInput = document.getElementById("date-input");
var daysInput = document.getElementById("days-input");
var messageBar = document.getElementById("message");
var eventsList = document.getElementById("events-list");
var skyHeading = document.getElementById("sky-heading");
var canvas = document.getElementById("solar-canvas");

var tabSky = document.getElementById("tab-sky");
var tabBrowse = document.getElementById("tab-browse");
var tabSources = document.getElementById("tab-sources");
var screenSky = document.getElementById("screen-sky");
var screenBrowse = document.getElementById("screen-browse");
var screenSources = document.getElementById("screen-sources");
var browseSearch = document.getElementById("browse-search");
var browseChips = document.getElementById("browse-chips");
var browseList = document.getElementById("browse-list");

// We keep the full list of events for the browse screen here, so searching does not
// need to ask the backend again on every keystroke.
var allEvents = [];

// The active type filter on the Browse tab. "All" shows every type.
var browseType = "All";

// The five type chips shown on the Browse tab, in order.
var CHIP_TYPES = ["All", "Solar Eclipse", "Lunar Eclipse", "Conjunction", "Opposition"];

// Show a friendly error in the message bar, or hide the bar when there is nothing to say.
function showMessage(text) {
    if (text) {
        messageBar.textContent = text;3333333244
        messageBar.hidden = false;
    } else {
        messageBar.hidden = true;
    }
}

// Build one event card element from a single event object.
function makeEventCard(event) {
    var card = document.createElement("div");
    card.className = "event-card";

    var top = document.createElement("div");
    top.className = "event-top";

    var type = document.createElement("span");
    type.className = "event-type";
    type.textContent = event.event_type;

    var date = document.createElement("span");
    date.className = "event-date";
    date.textContent = event.date;

    top.appendChild(type);
    top.appendChild(date);

    var desc = document.createElement("p");
    desc.className = "event-desc";
    desc.textContent = event.description;

    var meta = document.createElement("div");
    meta.className = "event-meta";

    var planets = document.createElement("span");
    planets.className = "event-planets";
    planets.textContent = event.planets.join(", ");

    var source = document.createElement("span");
    source.textContent = "Source: " + event.source;

    meta.appendChild(planets);
    meta.appendChild(source);

    card.appendChild(top);
    card.appendChild(desc);
    card.appendChild(meta);

    // Clicking the card jumps to the Sky View and draws the snapshot for this event.
    card.addEventListener("click", function () {
        showEventSnapshot(event);
    });

    return card;
}

// Fill a list element with event cards, or a gentle note when the list is empty.
function renderEvents(listElement, events, emptyText) {
    listElement.innerHTML = "";
    if (events.length === 0) {
        var note = document.createElement("p");
        note.className = "empty-note";
        note.textContent = emptyText;
        listElement.appendChild(note);
        return;
    }
    for (var i = 0; i < events.length; i++) {
        listElement.appendChild(makeEventCard(events[i]));
    }
}

// Group events into decades, returning an ordered list of { decade, items }.
// A decade key looks like "1950s". The events arrive already sorted by date from the backend.
function groupByDecade(events) {
    var order = [];
    var buckets = {};
    for (var i = 0; i < events.length; i++) {
        var year = parseInt(events[i].date.slice(0, 4), 10);
        var decade = (Math.floor(year / 10) * 10) + "s";
        if (!buckets[decade]) {
            buckets[decade] = [];
            order.push(decade);
        }
        buckets[decade].push(events[i]);
    }
    return order.map(function (decade) {
        return { decade: decade, items: buckets[decade] };
    });
}

// Fill a list with event cards grouped under decade headings, or a gentle note when empty.
// Each decade heading shows the decade and how many events fall inside it.
function renderGroupedEvents(listElement, events, emptyText) {
    listElement.innerHTML = "";
    if (events.length === 0) {
        var note = document.createElement("p");
        note.className = "empty-note";
        note.textContent = emptyText;
        listElement.appendChild(note);
        return;
    }
    var groups = groupByDecade(events);
    for (var g = 0; g < groups.length; g++) {
        var heading = document.createElement("div");
        heading.className = "decade-heading";

        var label = document.createElement("span");
        label.textContent = groups[g].decade;

        var count = document.createElement("span");
        count.className = "decade-count";
        count.textContent = groups[g].items.length;

        heading.appendChild(label);
        heading.appendChild(count);
        listElement.appendChild(heading);

        for (var i = 0; i < groups[g].items.length; i++) {
            listElement.appendChild(makeEventCard(groups[g].items[i]));
        }
    }
}

// Ask the backend for the planet positions on a date and draw them.
// The highlight list names any bodies to make stand out, such as the Sun and Moon
// of an eclipse. It is empty for an ordinary lookup where nothing needs emphasis.
function loadPositions(date, highlight) {
    return fetch(API_BASE + "/api/positions?date=" + date)
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) {
                    // The backend explained what was wrong, so we pass that message along.
                    throw new Error(data.error || "Could not load positions.");
                }
                return data;
            });
        })
        .then(function (data) {
            skyHeading.textContent = "The sky on " + data.date;
            drawSolarSystem(canvas, data.planets, highlight || []);
        });
}

// Ask the backend for the events near a date and show them on the right.
function loadEvents(date, days) {
    return fetch(API_BASE + "/api/events?date=" + date + "&days=" + days)
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) {
                    throw new Error(data.error || "Could not load events.");
                }
                return data;
            });
        })
        .then(function (data) {
            renderGroupedEvents(eventsList, data.events, "No recorded events within this window.");
        });
}

// Load the sky and the events for a date together. The highlight list is passed straight
// through to the diagram so a clicked event can make its own bodies stand out.
function runForDate(date, days, highlight) {
    showMessage("");
    Promise.all([loadPositions(date, highlight), loadEvents(date, days)])
        .catch(function (problem) {
            // If either request failed, show the reason and clear the diagram so nothing is stale.
            showMessage(problem.message);
            var context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
        });
}

// When the form is submitted, load the typed date with nothing highlighted.
dateForm.addEventListener("submit", function (submitEvent) {
    submitEvent.preventDefault();
    runForDate(dateInput.value, daysInput.value || 30, []);
});

// Jump to the Sky View and draw the snapshot for a clicked event, highlighting the bodies
// that event involves so you can see the geometry that caused it. The event.planets list
// already holds those bodies, for example Sun, Moon, and Earth for a solar eclipse.
function showEventSnapshot(event) {
    dateInput.value = event.date;
    showScreen("sky");
    runForDate(event.date, daysInput.value || 30, event.planets);
}

// Switch between the three screens when a tab is clicked. We turn every tab and screen
// off first, then turn on just the one we want, which keeps the logic simple as we add screens.
function showScreen(which) {
    tabSky.classList.remove("active");
    tabBrowse.classList.remove("active");
    tabSources.classList.remove("active");
    screenSky.classList.remove("active");
    screenBrowse.classList.remove("active");
    screenSources.classList.remove("active");

    if (which === "browse") {
        tabBrowse.classList.add("active");
        screenBrowse.classList.add("active");
        loadAllEvents();
    } else if (which === "sources") {
        tabSources.classList.add("active");
        screenSources.classList.add("active");
    } else {
        tabSky.classList.add("active");
        screenSky.classList.add("active");
    }
}

tabSky.addEventListener("click", function () {
    showScreen("sky");
});

tabBrowse.addEventListener("click", function () {
    showScreen("browse");
});

tabSources.addEventListener("click", function () {
    showScreen("sources");
});

// Load every event once for the browse screen. We do this by asking for a very wide window
// that comfortably covers the whole range the ephemeris knows about.
function loadAllEvents() {
    fetch(API_BASE + "/api/events?date=2000-01-01&days=40000")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            allEvents = data.events || [];
            renderBrowseChips();
            applyBrowseSearch();
        })
        .catch(function () {
            renderEvents(browseList, [], "Could not reach the backend. Is the server running?");
        });
}

// Build the type filter chips on the Browse tab, each showing how many events it holds.
// Clicking a chip sets the active type and re-filters the list.
function renderBrowseChips() {
    browseChips.innerHTML = "";
    for (var i = 0; i < CHIP_TYPES.length; i++) {
        (function (typeName) {
            var count = (typeName === "All")
                ? allEvents.length
                : allEvents.filter(function (e) { return e.event_type === typeName; }).length;

            var chip = document.createElement("button");
            chip.type = "button";
            chip.className = "chip" + (browseType === typeName ? " active" : "");
            chip.textContent = typeName + " (" + count + ")";
            chip.addEventListener("click", function () {
                browseType = typeName;
                renderBrowseChips();
                applyBrowseSearch();
            });
            browseChips.appendChild(chip);
        })(CHIP_TYPES[i]);
    }
}

// Filter the full event list by the active type chip and then by the search text,
// and show the result grouped by decade.
function applyBrowseSearch() {
    var term = browseSearch.value.trim().toLowerCase();
    var matches = allEvents.filter(function (event) {
        // First the type chip, then the words typed into the search box.
        if (browseType !== "All" && event.event_type !== browseType) {
            return false;
        }
        if (!term) {
            return true;
        }
        var haystack = (
            event.event_type + " " +
            event.description + " " +
            event.planets.join(" ") + " " +
            event.date
        ).toLowerCase();
        return haystack.indexOf(term) !== -1;
    });
    renderGroupedEvents(browseList, matches, "No events match your search.");
}

browseSearch.addEventListener("input", applyBrowseSearch);

// When the page first loads, show the sky for the date already in the box.
dateForm.dispatchEvent(new Event("submit"));
