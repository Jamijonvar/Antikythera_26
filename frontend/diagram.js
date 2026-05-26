// TODO: Front End team works here
// This file draws the solar system on the HTML canvas element

const canvas = document.getElementById('solar-system');
const ctx = canvas.getContext('2d');
const cx = canvas.width / 2;
const cy = canvas.height / 2;

// Draw the Sun
function drawSun() {
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, 2 * Math.PI);
  ctx.fillStyle = '#FFD700';
  ctx.fill();
}

// Draw a planet at a given angle on a given orbit ring
function drawPlanet(orbitRadius, angle, color, name) {
  const x = cx + orbitRadius * Math.cos(angle);
  const y = cy + orbitRadius * Math.sin(angle);
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px Arial';
  ctx.fillText(name, x + 7, y + 4);
}

// Draw orbit ring
function drawOrbit(radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#222244';
  ctx.stroke();
}

// Initial render
drawSun();
// TODO: call drawOrbit and drawPlanet with real data from the API
