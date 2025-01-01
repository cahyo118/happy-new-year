let chars, particles, canvas, ctx, w, h, current;
let duration = 5000;
let textDuration = 3000;
let str = ["HAPPY", "NEW YEAR", "MY PRINCESS", "AMELIA"];
let opacity = 0; // Opacity for fade-in/out effect
let fadeDirection = 1; // 1 for fade-in, -1 for fade-out

init();
resize();
requestAnimationFrame(render);
addEventListener("resize", resize);

function makeChar(c) {
  let tmp = document.createElement("canvas");
  let size = (tmp.width = tmp.height = Math.min(w, h) / 3);
  let tmpCtx = tmp.getContext("2d");
  tmpCtx.font = "bold " + size / c.length + "px Arial";
  tmpCtx.fillStyle = "white";
  tmpCtx.textBaseline = "middle";
  tmpCtx.textAlign = "center";
  tmpCtx.fillText(c, size / 2, size / 2);
  let char2 = tmpCtx.getImageData(0, 0, size, size);
  let char2particles = [];
  for (
    let i = 0;
    char2particles.length < particles * 5 && i < particles * 10;
    i++
  ) {
    let x = size * Math.random();
    let y = size * Math.random();
    let offset = parseInt(y) * size * 4 + parseInt(x) * 4;
    if (char2.data[offset]) char2particles.push([x - size / 2, y - size / 2]);
  }
  return char2particles;
}

function init() {
  canvas = document.createElement("canvas");
  document.body.append(canvas);
  document.body.style.margin = 0;
  document.body.style.overflow = "hidden";
  document.body.style.background = "black";
  ctx = canvas.getContext("2d");
}

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  particles = window.innerWidth < 400 ? 30 : 70;
  updateTextStyle();
}

function updateTextStyle() {
  // Scale font size based on screen size
  let baseFontSize = Math.min(window.innerWidth / 8, 100); // Adjust font size depending on the screen width
  ctx.font = `bold ${baseFontSize}px Arial`; // Update font size for text rendering
}

function makeChars(t) {
  let actual = parseInt(t / textDuration) % str.length;
  if (current === actual) return;
  current = actual;
  chars = [...str[actual]].map(makeChar);

  // Reset opacity and fadeDirection when the text changes
  opacity = 0;
  fadeDirection = 1;
}

function render(t) {
  makeChars(t);
  setTimeout(() => requestAnimationFrame(render), 30);
  ctx.fillStyle = "#00000010";
  ctx.fillRect(0, 0, w, h);

  // Draw stars in the background with fewer particles
  drawStars();

  // Fade-in and fade-out effect for the text
  ctx.save(); // Save the canvas state before applying transformations
  ctx.translate(w / 2, h / 4); // Move to the top-center

  // Apply the fade-in/out effect based on opacity
  ctx.globalAlpha = opacity; // Set the opacity for the text

  // Draw text at the center, adjusting for screen size
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(str[current], 0, 0); // Draw text at the center

  ctx.restore(); // Restore the canvas state

  // Fireworks rendering
  chars.forEach((pts, i) => {
    firework(t, i, pts);
    // Duplicate fireworks and move them 50px to the right and 200px down
    firework(t + 1000, i, pts, 50, 200);
  });

  // Handle fade-in and fade-out
  if (fadeDirection === 1 && opacity < 1) {
    opacity += 0.01; // Increase opacity for fade-in
  } else if (fadeDirection === -1 && opacity > 0) {
    opacity -= 0.01; // Decrease opacity for fade-out
  }

  // Switch fade direction after a certain duration (when the text is fully faded in)
  if (opacity >= 1) {
    fadeDirection = -1; // Start fading out
  }
  if (opacity <= 0) {
    fadeDirection = 1; // Start fading in for the next cycle
  }
}

function firework(t, i, pts, offsetX = 0, offsetY = 0) {
  t -= i * 150;
  let id = i + chars.length * parseInt(t - (t % duration));
  t = (t % duration) / duration;
  let dx = ((i + 1) * w) / (1 + chars.length) + offsetX;
  dx += Math.min(0.33, t) * 100 * Math.sin(id);
  let dy = h * 0.5 + offsetY;
  dy += Math.sin(id * 4547.411) * h * 0.1;
  if (t < 0.33) {
    rocket(dx, dy, id, t * 3);
  } else {
    explosion(pts, dx, dy, id, Math.min(1, Math.max(0, t - 0.33) * 2));
  }
}

function rocket(x, y, id, t) {
  ctx.fillStyle = "white";
  let r = 0.5 - 0.5 * t + Math.pow(t, 15 * t) * 4;
  y = h - y * t;
  circle(x, y, r);
}

function explosion(pts, x, y, id, t) {
  let dy = t * t * t * 20;
  let r = Math.sin(id) * 2 + 5;
  r = t < 0.5 ? (t + 0.5) * t * r : r - t * r;

  r *= 0.4; // Scale down the size of the particles even more

  let hue = id * 55 + Math.random() * 50;
  ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;

  pts.forEach((xy, i) => {
    if (i % 15 === 0) {
      ctx.fillStyle = `hsl(${hue + Math.sin(i * 2) * 50}, 80%, ${
        50 + t * 20
      }%)`;
    }
    circle(t * xy[0] + x, h - y + t * xy[1] + dy, r);
  });
}

function circle(x, y, r) {
  ctx.beginPath();
  ctx.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Function to draw stars in the background with fewer particles
function drawStars() {
  ctx.fillStyle = "white";
  for (let i = 0; i < 30; i++) {
    let starX = Math.random() * w;
    let starY = Math.random() * h;
    let starSize = Math.random() * 1.5;
    ctx.beginPath();
    ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
    ctx.fill();
  }
}
