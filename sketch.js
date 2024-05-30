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
  let mid = size / 2;
  points.push(createVector(0, 0));
  points.push(createVector(size, 0));
  points.push(createVector(size, size));
  points.push(createVector(0, size));
  points.push(createVector(mid, 0));
  points.push(createVector(size, mid));
  points.push(createVector(mid, size));
  points.push(createVector(0, mid));

  let lines = [];
  let angles = [];
  if (mode === "symmetric") {
    for (let i = 0; i < numLines; i++) {
      let start = random(points);
      let end = random(points);
      while (start.equals(end)) {
        end = random(points);
      }
      lines.push([start, end]);
      points.push(p5.Vector.lerp(start, end, 0.5)); // Add midpoint of the line as a new possible point
      angles.push(degrees(start.angleBetween(end)));
    }
  } else if (mode === "a45" || mode === "a90") {
    let angleStep = mode === "a45" ? PI / 4 : PI / 2;
    for (let i = 0; i < numLines; i++) {
      let start = random(points);
      let angle = int(random(mode === "a45" ? 8 : 4)) * angleStep;
      let end = p5.Vector.add(start, p5.Vector.fromAngle(angle).mult(mid));
      end.x = constrain(end.x, 0, size);
      end.y = constrain(end.y, 0, size);
      lines.push([start, end]);
      points.push(p5.Vector.lerp(start, end, 0.5)); // Add midpoint of the line as a new possible point
      angles.push(degrees(angle));
    }
  }

  return { lines, angles };
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

function drawPatternFromPoints(pattern, patternColors) {
  let lines = pattern.lines;
  noStroke();
  for (let i = 0; i < lines.length; i++) {
    fill(patternColors[i]);
    let start = lines[i][0];
    let end = lines[i][1];
    beginShape();
    vertex(start.x, start.y);
    vertex(end.x, end.y);
    vertex((end.x + cellSize) % cellSize, (end.y + cellSize) % cellSize);
    vertex((start.x + cellSize) % cellSize, (start.y + cellSize) % cellSize);
    endShape(CLOSE);
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
    console.log(
      "Colors:",
      globalColors.map((c) => c.toString())
    );
    console.log("Lines and Angles:");
    globalPattern.lines.forEach((line, index) => {
      console.log(
        `Line ${index + 1}: Start (${line[0].x}, ${line[0].y}) - End (${
          line[1].x
        }, ${line[1].y}), Angle: ${globalPattern.angles[index]} degrees`
      );
    });
    generateGlobalPatternAndColors();
    redraw();
  }
}
