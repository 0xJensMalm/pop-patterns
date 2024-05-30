let cols, rows;
let cellSize;
let gridWidth = 10;
let gridHeight = 10;
let padding = 80; // Padding around the grid
let mode = "symmetric"; // Mode variable to control pattern generation
let globalPattern = [];
let globalColors = [];
let maxLines = 1; // Maximum number of lines per pattern
let themeIndex = 0; // Index to keep track of the current color theme

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
]; // Array of color themes

function setup() {
  createCanvas(800, 800); // Adjust canvas size to keep cells square
  cols = gridWidth;
  rows = gridHeight;
  cellSize = (width - 2 * padding) / cols; // Adjust cell size based on padding
  generateGlobalPatternAndColors();
  noLoop();
}

function draw() {
  background(40);
  translate(padding, padding); // Translate to start drawing with padding
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      push();
      translate(i * cellSize, j * cellSize);
      drawPatternFromPoints(globalPattern, globalColors);
      pop();
    }
  }
}

function generateGlobalPatternAndColors() {
  globalPattern = generatePattern(cellSize, maxLines, mode);
  globalColors = generateColors(globalPattern);
}

function generatePattern(size, numLines, mode) {
  let points = [];
  points.push(createVector(0, 0));
  points.push(createVector(size, 0));
  points.push(createVector(size, size));
  points.push(createVector(0, size));

  for (let i = 0; i < numLines; i++) {
    let x1, y1, x2, y2;
    if (mode === "a45") {
      let angle1 = (int(random(8)) * PI) / 4;
      let angle2 = (int(random(8)) * PI) / 4;
      x1 = size / 2 + cos(angle1) * (size / 2);
      y1 = size / 2 + sin(angle1) * (size / 2);
      x2 = size / 2 + cos(angle2) * (size / 2);
      y2 = size / 2 + sin(angle2) * (size / 2);
    } else if (mode === "a90") {
      let angle1 = (int(random(4)) * PI) / 2;
      let angle2 = (int(random(4)) * PI) / 2;
      x1 = size / 2 + cos(angle1) * (size / 2);
      y1 = size / 2 + sin(angle1) * (size / 2);
      x2 = size / 2 + cos(angle2) * (size / 2);
      y2 = size / 2 + sin(angle2) * (size / 2);
    } else {
      x1 = random(size);
      y1 = random(size);
      x2 = random(size);
      y2 = random(size);
    }
    points.push(createVector(x1, y1));
    points.push(createVector(x2, y2));
  }

  return sortPoints(points, size);
}

function sortPoints(points, size) {
  return points.sort((a, b) => {
    if (a.x === b.x) return a.y - b.y;
    return a.x - b.x;
  });
}

function generateColors(points) {
  let len = points.length;
  let patternColors = [];
  for (let i = 0; i < len - 1; i++) {
    for (let j = i + 1; j < len; j++) {
      let c = color(random(themes[themeIndex].colors));
      patternColors.push(c);
    }
  }
  return patternColors;
}

function drawPatternFromPoints(points, patternColors) {
  noStroke();
  let len = points.length;
  let colorIndex = 0;
  for (let i = 0; i < len - 1; i++) {
    for (let j = i + 1; j < len; j++) {
      fill(patternColors[colorIndex]);
      colorIndex++;
      beginShape();
      vertex(points[i].x, points[i].y);
      vertex(points[j].x, points[j].y);
      vertex(points[(j + 1) % len].x, points[(j + 1) % len].y);
      vertex(points[(i + 1) % len].x, points[(i + 1) % len].y);
      endShape(CLOSE);
    }
  }
}

function keyPressed() {
  let upperKey = key.toUpperCase();
  if (upperKey === "S") {
    if (mode === "symmetric") {
      mode = "a45";
    } else if (mode === "a45") {
      mode = "a90";
    } else {
      mode = "symmetric";
    }
    console.log("Mode:", mode);
    generateGlobalPatternAndColors();
    redraw();
  } else if (upperKey === "D") {
    themeIndex = (themeIndex + 1) % themes.length;
    console.log("Theme:", themes[themeIndex].name);
    generateGlobalPatternAndColors();
    redraw();
  } else if (upperKey >= "1" && upperKey <= "9") {
    maxLines = int(upperKey);
    console.log("Max lines:", maxLines);
    generateGlobalPatternAndColors();
    redraw();
  } else if (upperKey === "A") {
    console.log("Refreshed");
    console.log("Mode:", mode);
    console.log("Max lines:", maxLines);
    console.log("Theme:", themes[themeIndex].name);
    generateGlobalPatternAndColors();
    redraw();
  }
}
