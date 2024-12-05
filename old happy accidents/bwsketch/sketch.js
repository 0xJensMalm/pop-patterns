let gridSize = 10;
let cellSize;
let lineAmount = 3;
let increment = 4;
let colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
let padding = 80;

let patternLines = [];
let surfaces = [];

function setup() {
  createCanvas(800, 800);
  cellSize = (width - 2 * padding) / gridSize;
  generatePattern();
  fillSurfaces();
  noLoop();
}

function draw() {
  background(255);
  let offsetX = (width - cellSize * gridSize) / 2;
  let offsetY = (height - cellSize * gridSize) / 2;

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      drawPattern(
        offsetX + x * cellSize,
        offsetY + y * cellSize,
        cellSize,
        cellSize
      );
    }
  }
}

function generatePattern() {
  patternLines = [];
  let points = [];
  for (let i = 0; i < increment; i++) {
    points.push({ x: i * (cellSize / (increment - 1)), y: 0 }); // Top edge
    points.push({ x: i * (cellSize / (increment - 1)), y: cellSize }); // Bottom edge
    points.push({ x: 0, y: i * (cellSize / (increment - 1)) }); // Left edge
    points.push({ x: cellSize, y: i * (cellSize / (increment - 1)) }); // Right edge
  }

  for (let i = 0; i < lineAmount; i++) {
    let startPoint = random(points);
    let endPoint = random(points);
    patternLines.push({ start: startPoint, end: endPoint });
  }
}

function fillSurfaces() {
  surfaces = [];
  let vertices = [];
  for (let i = 0; i < patternLines.length; i++) {
    vertices.push(patternLines[i].start);
    vertices.push(patternLines[i].end);
  }

  // Ensure unique vertices
  vertices = vertices.filter(
    (v, index, self) =>
      index === self.findIndex((t) => t.x === v.x && t.y === v.y)
  );

  // Sort vertices to form closed shapes
  vertices.sort((a, b) => a.x + a.y - (b.x + b.y));

  // Create filled surfaces
  for (let i = 0; i < vertices.length; i++) {
    let surface = [];
    surface.push(vertices[i]);
    surface.push(vertices[(i + 1) % vertices.length]);
    surface.push({
      x: (vertices[i].x + vertices[(i + 1) % vertices.length].x) / 2,
      y: (vertices[i].y + vertices[(i + 1) % vertices.length].y) / 2,
    });
    surface.color = random(colors);
    surfaces.push(surface);
  }
}

function drawPattern(x, y, w, h) {
  push();
  translate(x, y);

  // Draw filled surfaces
  for (let surface of surfaces) {
    fill(surface.color);
    beginShape();
    for (let v of surface) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }

  // Draw lines
  for (let i = 0; i < patternLines.length; i++) {
    stroke(0);
    strokeWeight(2);
    line(
      patternLines[i].start.x,
      patternLines[i].start.y,
      patternLines[i].end.x,
      patternLines[i].end.y
    );
  }

  pop();
}

function keyPressed() {
  if (key === "a") {
    generatePattern();
    fillSurfaces();
    redraw();
  }
}
