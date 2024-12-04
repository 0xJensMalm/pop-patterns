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
let seed = []; // Presaved seed
const originalWidth = 4000;
const originalHeight = 4400;

let titleHorizontalOffset = -180; // Adjust horizontal position of title
let seedHorizontalOffset = 125; // Adjust horizontal position of seed
let cubeVerticalOffset = 15; // Adjust vertical offset position of the cubes
let colorIndex = 0; // Index to keep track of the current color in the theme
let signatureVerticalOffset = -25; // Global variable to adjust the vertical position of the entire signature

let themes = [
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
  {
    name: "Meadow",
    colors: ["#556B2F", "#8FBC8F", "#FFD700", "#FF8C00", "#2E8B57"],
  },
  {
    name: "Sunset",
    colors: ["#FF4500", "#FF8C00", "#FFD700", "#2E8B57", "#6A5ACD"],
  },
  {
    name: "Marguerita",
    colors: ["#0A7029", "#FEDE00", "#C8DF52", "#DBE8D8"],
  },
  {
    name: "Apple",
    colors: ["#FF8370", "#00B1B0", "#FEC84D", "#E42256"],
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
  randomSeed(parseInt(seed, 16)); // Use the presaved seed
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
  let lineY = height - paddingBottom * 0.8 + signatureVerticalOffset;
  let colorCubeSize = 10;
  let colorCubeSpacing = 2;
  let colorsY = lineY + cubeVerticalOffset;

  let seedTextSize = 12;
  let titleTextSize = 12;
  let horizontalPadding = 120; // Adjust horizontal padding as needed

  let textY = lineY + 10 + colorCubeSize / 2; // Y-coordinate for title and seed text

  stroke(globalColors[colorIndex]);
  strokeWeight(2);
  line(centerX - lineWidth / 2, lineY, centerX + lineWidth / 2, lineY);

  noStroke();
  textFont("Helvetica");

  // Draw title text
  textSize(titleTextSize);
  textAlign(RIGHT, CENTER);
  fill(globalColors[colorIndex]);
  text(
    "GP // 1013",
    centerX -
      (globalColors.length * (colorCubeSize + colorCubeSpacing)) / 2 +
      titleHorizontalOffset,
    textY
  );

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
      colorsY - colorCubeSize / 2,
      colorCubeSize,
      colorCubeSize
    );
  }

  // Draw seed text
  textSize(seedTextSize);
  textAlign(LEFT, CENTER);
  fill(globalColors[colorIndex]);
  text(
    `seed: ${seed}`,
    centerX +
      (globalColors.length * (colorCubeSize + colorCubeSpacing)) / 2 +
      seedHorizontalOffset,
    textY
  );
}

function drawSignatureHighRes() {
  let scaleFactor = originalWidth / width;

  let lineWidth = originalWidth * 0.75;
  let centerX = originalWidth / 2;
  let lineY =
    originalHeight -
    paddingBottom * scaleFactor * 0.8 +
    signatureVerticalOffset * scaleFactor;
  let colorCubeSize = 10 * scaleFactor; // Adjusted for high resolution
  let colorCubeSpacing = 2 * scaleFactor;
  let colorsY = lineY + cubeVerticalOffset * scaleFactor;

  let seedTextSize = 12 * scaleFactor;
  let titleTextSize = 12 * scaleFactor;
  let horizontalPadding = 120 * scaleFactor; // Adjust horizontal padding as needed

  let textY = lineY + 10 * scaleFactor + colorCubeSize / 2; // Y-coordinate for title and seed text

  pg.stroke(globalColors[colorIndex]);
  pg.strokeWeight(2 * scaleFactor);
  pg.line(centerX - lineWidth / 2, lineY, centerX + lineWidth / 2, lineY);

  pg.noStroke();
  pg.textFont("Helvetica");

  // Draw title text
  pg.textSize(titleTextSize);
  pg.textAlign(pg.RIGHT, pg.CENTER);
  pg.fill(globalColors[colorIndex]);
  pg.text(
    "GP // 1013",
    centerX -
      (globalColors.length * (colorCubeSize + colorCubeSpacing)) / 2 +
      titleHorizontalOffset * scaleFactor,
    textY
  );

  // Draw color cubes
  let colorsXStart =
    centerX -
    (globalColors.length * colorCubeSize +
      (globalColors.length - 1) * colorCubeSpacing) /
      2;
  for (let i = 0; i < globalColors.length; i++) {
    pg.fill(globalColors[i]);
    pg.rect(
      colorsXStart + i * (colorCubeSize + colorCubeSpacing),
      colorsY - colorCubeSize / 2,
      colorCubeSize,
      colorCubeSize
    );
  }

  // Draw seed text
  pg.textSize(seedTextSize);
  pg.textAlign(pg.LEFT, pg.CENTER);
  pg.fill(globalColors[colorIndex]);
  pg.text(
    `seed: ${seed}`,
    centerX +
      (globalColors.length * (colorCubeSize + colorCubeSpacing)) / 2 +
      seedHorizontalOffset * scaleFactor,
    textY
  );
}

function drawHighResPatterns() {
  let scaleFactor = originalWidth / width;

  let scaledPaddingTop = paddingTop * scaleFactor;
  let scaledPaddingBottom = paddingBottom * scaleFactor;
  let scaledPaddingLeft = paddingLeft * scaleFactor;
  let scaledPaddingRight = paddingRight * scaleFactor;

  pg.background(40);
  pg.translate(scaledPaddingLeft, scaledPaddingTop); // Translate to start drawing with padding
  let highResCellSize =
    (originalWidth - scaledPaddingLeft - scaledPaddingRight) / cols;
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
  pg.translate(-scaledPaddingLeft, -scaledPaddingTop); // Reset translation
  drawSignatureHighRes();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  adjustCanvasSize();
  adjustGridAndCellSize();
  randomSeed(parseInt(seed, 16)); // Use the presaved seed
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
  randomSeed(parseInt(seed, 16)); // Use the presaved seed
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
      let control1 = createVector(start.x, (start.y + end.y) / 2);
      let control2 = createVector(end.x, (start.y + end.y) / 2);

      beginShape();
      curveVertex(start.x, start.y);
      curveVertex(control1.x, control1.y);
      curveVertex(control2.x, control2.y);
      curveVertex(end.x, end.y);
      curveVertex(start.x, start.y); // Close the shape
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
      let control1 = createVector(start.x, (start.y + end.y) / 2);
      let control2 = createVector(end.x, (start.y + end.y) / 2);

      pg.beginShape();
      pg.curveVertex(start.x, start.y);
      pg.curveVertex(control1.x, control1.y);
      pg.curveVertex(control2.x, control2.y);
      pg.curveVertex(end.x, end.y);
      pg.curveVertex(start.x, start.y); // Close the shape
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
    randomSeed(parseInt(seed, 16)); // Use the presaved seed
    generateGlobalPatternAndColors();
    redraw();
  } else if (upperKey >= "1" && upperKey <= "9") {
    maxLines = int(upperKey);
    console.log("Max lines:", maxLines);
    randomSeed(parseInt(seed, 16)); // Use the presaved seed
    generateGlobalPatternAndColors();
    redraw();
  } else if (upperKey === "M") {
    if (mode === "default") mode = "parallels";
    else if (mode === "parallels") mode = "dynamic";
    else mode = "default";
    console.log("Mode:", mode);
    randomSeed(parseInt(seed, 16)); // Use the presaved seed
    generateGlobalPatternAndColors();
    redraw();
  } else if (upperKey === "A") {
    seed = generateSeed();
    console.log("New Seed:", seed);
    randomSeed(parseInt(seed, 16)); // Use the new seed
    generateGlobalPatternAndColors();
    redraw();
  } else if (upperKey === "C") {
    colorIndex = (colorIndex + 1) % globalColors.length;
    redraw();
  } else if (upperKey === "V") {
    // Increase signature vertical offset
    signatureVerticalOffset += 10;
    redraw();
  } else if (upperKey === "B") {
    // Decrease signature vertical offset
    signatureVerticalOffset -= 10;
    redraw();
  }
}

function keyTyped() {
  if (key === "s") {
    drawHighResPatterns();
    pg.save(`${seed}.png`);
  }
}
