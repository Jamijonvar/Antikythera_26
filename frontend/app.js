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
var screenSky = document.getElementById("screen-sky");
var screenBrowse = document.getElementById("screen-browse");
var browseSearch = document.getElementById("browse-search");
var browseList = document.getElementById("browse-list");

// We keep the full list of events for the browse screen here, so searching does not
// need to ask the backend again on every keystroke.
var allEvents = [];

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

// Ask the backend for the planet positions on a date and draw them.
function loadPositions(date) {
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
            drawSolarSystem(canvas, data.planets);
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
            renderEvents(eventsList, data.events, "No recorded events within this window.");
        });
}

// When the form is submitted, load both the positions and the events together.
dateForm.addEventListener("submit", function (submitEvent) {
    submitEvent.preventDefault();
    showMessage("");

    var date = dateInput.value;
    var days = daysInput.value || 30;

    Promise.all([loadPositions(date), loadEvents(date, days)])
        .catch(function (problem) {
            // If either request failed, show the reason and clear the diagram so nothing is stale.
            showMessage(problem.message);
            var context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
        });
});

// Switch between the two screens when a tab is clicked.
function showScreen(which) {
    if (which === "sky") {
        tabSky.classList.add("active");
        tabBrowse.classList.remove("active");
        screenSky.classList.add("active");
        screenBrowse.classList.remove("active");
    } else {
        tabBrowse.classList.add("active");
        tabSky.classList.remove("active");
        screenBrowse.classList.add("active");
        screenSky.classList.remove("active");
        loadAllEvents();
    }
}

tabSky.addEventListener("click", function () {
    showScreen("sky");
});

tabBrowse.addEventListener("click", function () {
    showScreen("browse");
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
            applyBrowseSearch();
        })
        .catch(function () {
            renderEvents(browseList, [], "Could not reach the backend. Is the server running?");
        });
}

// Filter the full event list by whatever the user typed in the search box.
function applyBrowseSearch() {
    var term = browseSearch.value.trim().toLowerCase();
    var matches = allEvents.filter(function (event) {
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
    renderEvents(browseList, matches, "No events match your search.");
}

browseSearch.addEventListener("input", applyBrowseSearch);

// When the page first loads, show the sky for the date already in the box.
dateForm.dispatchEvent(new Event("submit"));
