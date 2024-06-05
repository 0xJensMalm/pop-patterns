let cols, rows;
let cellSize;
let gridWidth = 10;
let gridHeight = 10;
let paddingTop = 80;
let paddingBottom = 80;
let paddingLeft = 80;
let paddingRight = 80;
let globalPattern = [];
let globalColors = [];
let maxLines = 5; // Maximum number of lines per pattern
let themeIndex = 0; // Index to keep track of the current color theme
let mode = "default"; // Modes: "default", "parallels", "dynamic"
let seed = 0xc4fe82f92c;
const originalWidth = 4000;
const originalHeight = 4400;

let themes = [
  {
    name: "debug",
    colors: ["#FFFFFF"],
  },
  {
    name: "Default",
    colors: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
  },
  {
    name: "Earthy",
    colors: ["#8B4513", "#FFD700", "#008000", "#4B0082", "#FF69B4", "#CD5C5C"],
  },
  {
    name: "Pastel",
    colors: ["#FF6347", "#40E0D0", "#EE82EE", "#F5DEB3", "#FFFFFF", "#000000"],
  },
  {
    name: "Golid",
    colors: ["#66aeaa", "#ffce3a", "#ff7044", "#5d5f46", "#000000"],
  },
  {
    name: "Hobbs",
    colors: ["#d12a2f", "#fcbc18", "#ebe4d8", "#29a691", "#b7d9cd"],
  },
  {
    name: "Cathode",
    colors: ["#a8216b", "#f1184c", "#f36943", "#f7dc66", "#b7d9cd"],
  },
  {
    name: "Pop",
    colors: ["#00ff3f", "#35b5ff", "#ff479c", "#fffb38"],
  },
]; // Array of color themes

let pg; // Graphics buffer for high-resolution image

function generateSeed() {
  let seed = "0x";
  let chars = "0123456789abcdef";
  for (let i = 0; i < 10; i++) {
    seed += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return seed;
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Adjust canvas size to window size
  pg = createGraphics(originalWidth, originalHeight); // Create high-resolution buffer
  pixelDensity(1); // Ensure high-resolution saving
  adjustCanvasSize();
  adjustGridAndCellSize();
  console.log("Seed:", seed);
  randomSeed(parseInt(seed));
  generateGlobalPatternAndColors();
  noLoop();
}

function draw() {
  background(40);
  translate(paddingLeft, paddingTop); // Translate to start drawing with padding
  drawPatterns();
  resetMatrix(); // Reset the matrix before drawing the signature
  drawSignature(); // Add signature to the canvas
}

function drawPatterns() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      push();
      translate(i * cellSize, j * cellSize);
      drawPatternFromPoints(globalPattern, globalColors);
      pop();
    }
  }
}

function drawSignature() {
  let lineWidth = width * 0.75;
  let centerX = width / 2;
  let lineY = height - paddingBottom * 0.8;
  let colorCubeSize = 10;
  let colorCubeSpacing = 2;
  let colorsY = lineY + 10;
  let textY = colorsY + colorCubeSize + 8;

  let seedTextSize = 12;
  let titleTextSize = 12;
  let titleSpacing = 10;

  stroke(255);
  strokeWeight(2);
  line(centerX - lineWidth / 2, lineY, centerX + lineWidth / 2, lineY);

  noStroke();
  textFont("Helvetica");

  // Draw seed text
  textSize(seedTextSize);
  textAlign(CENTER, CENTER);
  fill(255);
  text(`seed: ${seed}`, centerX, textY);

  // Draw color cubes
  let colorsXStart =
    centerX -
    (globalColors.length * colorCubeSize +
      (globalColors.length - 1) * colorCubeSpacing) /
      2;
  for (let i = 0; i < globalColors.length; i++) {
    fill(globalColors[i]);
    rect(
      colorsXStart + i * (colorCubeSize + colorCubeSpacing),
      colorsY,
      colorCubeSize,
      colorCubeSize
    );
  }

  // Draw title
  textSize(titleTextSize);
  textAlign(LEFT, CENTER);
  text("TITLE // TITLE", centerX + lineWidth / 2 + titleSpacing, textY);
}

function drawHighResPatterns() {
  pg.background(40);
  pg.translate(paddingLeft, paddingTop); // Translate to start drawing with padding
  let highResCellSize = (originalWidth - paddingLeft - paddingRight) / cols;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      pg.push();
      pg.translate(i * highResCellSize, j * highResCellSize);
      drawPatternFromPointsHighRes(
        globalPattern,
        globalColors,
        highResCellSize
      );
      pg.pop();
    }
  }
  drawSignatureHighRes();
}

function drawSignatureHighRes() {
  let lineWidth = originalWidth * 0.8;
  let lineY = originalHeight - paddingBottom / 2;
  let colorsY = lineY + 20;
  let textY = colorsY + 20;
  let centerX = originalWidth / 2;

  pg.stroke(255);
  pg.strokeWeight(2);
  pg.line(centerX - lineWidth / 2, lineY, centerX + lineWidth / 2, lineY);

  pg.noStroke();
  pg.textFont("Helvetica");
  pg.textSize(24);
  pg.textAlign(CENTER, CENTER);
  pg.fill(255);
  pg.text(`seed: ${seed}`, centerX, textY);

  let colorsXStart = centerX - (globalColors.length * 10) / 2;
  for (let i = 0; i < globalColors.length; i++) {
    pg.fill(globalColors[i]);
    pg.rect(colorsXStart + i * 10, colorsY, 10, 10);
  }

  pg.textSize(18);
  pg.textAlign(LEFT, CENTER);
  pg.text("TITLE // TITLE", centerX + lineWidth / 2 + 10, textY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  adjustCanvasSize();
  adjustGridAndCellSize();
  randomSeed(parseInt(seed));
  generateGlobalPatternAndColors();
  redraw();
}

function adjustCanvasSize() {
  let aspectRatio = originalWidth / originalHeight;
  if (windowWidth / windowHeight > aspectRatio) {
    let newWidth = windowHeight * aspectRatio;
    resizeCanvas(newWidth, windowHeight);
  } else {
    let newHeight = windowWidth / aspectRatio;
    resizeCanvas(windowWidth, newHeight);
  }
}

function adjustGridAndCellSize() {
  cols = gridWidth;
  rows = gridHeight;
  let availableWidth = width - paddingLeft - paddingRight;
  let availableHeight = height - paddingTop - paddingBottom;
  cellSize = min(availableWidth / cols, availableHeight / rows); // Adjust cell size based on available space
}

function generateGlobalPatternAndColors() {
  randomSeed(parseInt(seed)); // Ensure consistency in randomness
  if (mode === "default") {
    globalPattern = generatePattern(cellSize, maxLines);
  } else if (mode === "parallels") {
    globalPattern = generateParallelPattern(cellSize, maxLines);
  } else if (mode === "dynamic") {
    globalPattern = generateDynamicPattern(cellSize, maxLines);
  }

  globalColors = generateColors(globalPattern);
}

function generatePattern(size, numLines) {
  let points = [];
  let lines = [];
  let angles = [];

  // Generate a grid of points
  let step = size / 4;
  for (let x = 0; x <= size; x += step) {
    for (let y = 0; y <= size; y += step) {
      points.push(createVector(x, y));
    }
  }

  // Ensure we always have the exact number of lines
  while (lines.length < numLines) {
    let start = random(points);
    let end = random(points);

    if (!start.equals(end)) {
      lines.push([start, end]);
      angles.push(degrees(p5.Vector.sub(end, start).heading()));
    }
  }

  return { lines, angles };
}

function generateParallelPattern(size, numLines) {
  let points = [];
  let lines = [];
  let angles = [];
  let increment = size / 6;

  for (let x = 0; x <= size; x += increment) {
    for (let y = 0; y <= size; y += increment) {
      points.push(createVector(x, y));
    }
  }

  for (let i = 0; i < numLines; i++) {
    let start = createVector(random(points).x, 0);
    let end = createVector(start.x, size);
    lines.push([start, end]);
    angles.push(90);
  }

  return { lines, angles };
}

function generateDynamicPattern(size, numLines) {
  let points = [];
  let lines = [];
  let angles = [];
  let increment = size / 4;

  for (let x = 0; x <= size; x += increment) {
    for (let y = 0; y <= size; y += increment) {
      points.push(createVector(x, y));
    }
  }

  while (lines.length < numLines) {
    let start = random(points);
    let end = random(points);

    if (!start.equals(end)) {
      lines.push([start, end]);
      angles.push(degrees(p5.Vector.sub(end, start).heading()));
    }
  }

  return { lines, angles };
}

function drawPatternFromPoints(pattern, patternColors) {
  let lines = pattern.lines;
  noStroke();
  if (lines.length === 0) {
    console.error("No lines to draw!");
    return;
  }
  for (let i = 0; i < lines.length; i++) {
    fill(patternColors[i % patternColors.length]);
    let start = lines[i][0];
    let end = lines[i][1];
    if (start && end) {
      beginShape();
      vertex(start.x, start.y);
      vertex(end.x, end.y);
      vertex((end.x + cellSize) % cellSize, (end.y + cellSize) % cellSize);
      vertex((start.x + cellSize) % cellSize, (start.y + cellSize) % cellSize);
      endShape(CLOSE);
    }
  }
}

function drawPatternFromPointsHighRes(pattern, patternColors, highResCellSize) {
  let lines = pattern.lines;
  pg.noStroke();
  if (lines.length === 0) {
    console.error("No lines to draw!");
    return;
  }
  for (let i = 0; i < lines.length; i++) {
    pg.fill(patternColors[i % patternColors.length]);
    let start = lines[i][0].copy().mult(highResCellSize / cellSize);
    let end = lines[i][1].copy().mult(highResCellSize / cellSize);
    if (start && end) {
      pg.beginShape();
      pg.vertex(start.x, start.y);
      pg.vertex(end.x, end.y);
      pg.vertex(
        (end.x + highResCellSize) % highResCellSize,
        (end.y + highResCellSize) % highResCellSize
      );
      pg.vertex(
        (start.x + highResCellSize) % highResCellSize,
        (start.y + highResCellSize) % highResCellSize
      );
      pg.endShape(CLOSE);
    }
  }
}

function generateColors(pattern) {
  let lines = pattern.lines;
  let patternColors = [];
  for (let i = 0; i < lines.length; i++) {
    let c = color(random(themes[themeIndex].colors));
    patternColors.push(c);
  }
  return patternColors;
}

function keyPressed() {
  let upperKey = key.toUpperCase();
  if (upperKey === "D") {
    themeIndex = (themeIndex + 1) % themes.length;
    console.log("Theme:", themes[themeIndex].name);
    randomSeed(parseInt(seed));
    generateGlobalPatternAndColors();
    redraw();
  } else if (upperKey >= "1" && upperKey <= "9") {
    maxLines = int(upperKey);
    console.log("Max lines:", maxLines);
    randomSeed(parseInt(seed));
    generateGlobalPatternAndColors();
    redraw();
  } else if (upperKey === "M") {
    if (mode === "default") mode = "parallels";
    else if (mode === "parallels") mode = "dynamic";
    else mode = "default";
    console.log("Mode:", mode);
    randomSeed(parseInt(seed));
    generateGlobalPatternAndColors();
    redraw();
  } else if (upperKey === "A") {
    seed = generateSeed();
    console.log("New Seed:", seed);
    randomSeed(parseInt(seed));
    generateGlobalPatternAndColors();
    redraw();
  }
}

function keyTyped() {
  if (key === "s") {
    drawHighResPatterns();
    pg.save("high_res_image.png");
  }
}
