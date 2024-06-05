// Global variables for easy tweaking
let gridSize = 10; // Number of cells in one row/column
let baseWidth; // Base width of each 3D block
let baseHeight; // Base height of each 3D block

// Color theme
let colors = ["#d12a2f", "#fcbc18", "#ebe4d8", "#29a691", "#b7d9cd"];

let frontVertices, sideVertices, topVertices;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
}

function draw() {
  background(50);

  // Calculate the base dimensions based on the grid size
  baseWidth = width / gridSize;
  baseHeight = height / gridSize;

  let W = baseWidth;
  let H = baseHeight;

  let cols = gridSize;
  let rows = gridSize;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = col * W;
      let y = row * H;

      // Randomly select colors from the theme for each part
      let frontColor = color(random(colors));
      let sideColor = color(random(colors));
      let topColor = color(random(colors));

      // Generate a random structure for the current grid position
      generateRandomStructure();

      // Draw a 3D structure at each grid position
      draw3DStructure(x, y, frontColor, sideColor, topColor);
    }
  }
}

function generateRandomStructure() {
  let W = baseWidth; // Width
  let H = baseHeight; // Height

  // Randomize vertices for the 3D shape with more variety
  frontVertices = [
    createVector(0, 0),
    createVector(W * random(0.6, 1.4), 0),
    createVector(W * random(0.3, 1.7), H * random(0.7, 1.5)),
    createVector(W * random(-0.3, 0.3), H * random(0.7, 1.5)),
  ];

  sideVertices = [
    createVector(W * random(0.6, 1.4), 0),
    createVector(W * random(1.2, 2), H * random(-0.5, 0.5)),
    createVector(W * random(1.2, 2), H * random(0.5, 1.5)),
    frontVertices[2],
  ];

  topVertices = [
    createVector(0, 0),
    createVector(W * random(0.6, 1.4), 0),
    sideVertices[1],
    frontVertices[3],
  ];
}

function draw3DStructure(x, y, frontColor, sideColor, topColor) {
  stroke(0);

  // Draw front face
  fill(frontColor);
  beginShape();
  frontVertices.forEach((v) => vertex(x + v.x, y + v.y));
  endShape(CLOSE);

  // Draw side face
  fill(sideColor);
  beginShape();
  sideVertices.forEach((v) => vertex(x + v.x, y + v.y));
  endShape(CLOSE);

  // Draw top face
  fill(topColor);
  beginShape();
  topVertices.forEach((v) => vertex(x + v.x, y + v.y));
  endShape(CLOSE);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

function keyPressed() {
  let upperKey = key.toUpperCase();
  if (upperKey === "A") {
    redraw();
  }
  // Allow changing the grid size with number keys
  if (upperKey >= "1" && upperKey <= "9") {
    gridSize = int(upperKey);
    redraw();
  }
}
