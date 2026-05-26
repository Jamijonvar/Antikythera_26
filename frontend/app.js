// TODO: Front End team works here
// This file handles the date picker, API calls, and event card rendering

const API_BASE = 'http://localhost:5000';

document.getElementById('submit-btn').addEventListener('click', async () => {
  const date = document.getElementById('date-input').value;
  if (!date) return;

  // Fetch planet positions
  const posRes = await fetch(`${API_BASE}/api/positions?date=${date}`);
  const posData = await posRes.json();
  console.log('Positions:', posData);
  // TODO: pass posData to diagram.js to draw planets

  // Fetch nearby events
  const evtRes = await fetch(`${API_BASE}/api/events?date=${date}&days=30`);
  const evtData = await evtRes.json();
  console.log('Events:', evtData);
  // TODO: render evtData.events as cards in #events-list
});
