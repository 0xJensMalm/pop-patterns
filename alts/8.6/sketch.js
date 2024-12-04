let cols, rows;
let cellSize;
let gridWidth = 10;
let gridHeight = 10;
let paddingTop = 80;
let paddingBottom = 80;
let paddingLeft = 80;
let paddingRight = 80;
let themeIndex = 0; // Index to keep track of the current color theme
let seed = "0x822b8fec20"; // Presaved seed
const originalWidth = 4000;
const originalHeight = 4400;

let titleHorizontalOffset = -180; // Adjust horizontal position of title
let seedHorizontalOffset = 125; // Adjust horizontal position of seed
let cubeVerticalOffset = 15; // Adjust vertical offset position of the cubes
let colorIndex = 0; // Index to keep track of the current color in the theme
let signatureVerticalOffset = -25; // Global variable to adjust the vertical position of the entire signature

// Array of color themes
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
  { name: "Pop", colors: ["#00ff3f", "#35b5ff", "#ff479c", "#fffb38"] },
  {
    name: "Meadow",
    colors: ["#556B2F", "#8FBC8F", "#FFD700", "#FF8C00", "#2E8B57"],
  },
  {
    name: "Sunset",
    colors: ["#FF4500", "#FF8C00", "#FFD700", "#2E8B57", "#6A5ACD"],
  },
  { name: "Marguerita", colors: ["#0A7029", "#FEDE00", "#C8DF52", "#DBE8D8"] },
  { name: "Apple", colors: ["#FF8370", "#00B1B0", "#FEC84D", "#E42256"] },
];

let pg; // Graphics buffer for high-resolution image

class Pattern {
  constructor(size, colors) {
    this.size = size;
    this.colors = colors;
    this.pattern = this.generatePattern();
  }

  generatePattern() {
    let shapes = [];
    let numShapes = int(random(2, 5)); // Generate 2-4 shapes
    let increment = this.size / 4;

    for (let i = 0; i < numShapes; i++) {
      let shapeType = int(random(4)); // 0: half-circle, 1: reversed half-circle, 2: S shape, 3: centered circle
      let startX = int(random(1, 4)) * increment;
      let startY = int(random(1, 4)) * increment;
      let start = createVector(startX, startY);
      shapes.push({ shapeType, start });
    }

    return shapes;
  }

  draw(x, y) {
    push();
    translate(x, y);
    noStroke();
    for (let i = 0; i < this.pattern.length; i++) {
      fill(this.colors[i % this.colors.length]);
      let { shapeType, start } = this.pattern[i];
      let d = this.size;

      switch (shapeType) {
        case 0: // Half-circle
          arc(start.x, start.y, d, d, 0, PI);
          break;
        case 1: // Reversed half-circle
          arc(start.x, start.y, d, d, PI, 0);
          break;
        case 2: // S shape (half of a yin-yang)
          arc(start.x, start.y, d, d, 0, PI);
          arc(start.x + d / 2, start.y, d, d, PI, 0);
          break;
        case 3: // Centered circle (half the size of the cell)
          ellipse(this.size / 2, this.size / 2, d / 2, d / 2);
          break;
      }
    }
    pop();
  }

  drawHighRes(pg, x, y, scaleFactor) {
    pg.push();
    pg.translate(x, y);
    pg.noStroke();
    let highResSize = this.size * scaleFactor;

    for (let i = 0; i < this.pattern.length; i++) {
      pg.fill(this.colors[i % this.colors.length]);
      let { shapeType, start } = this.pattern[i];
      let d = highResSize;

      switch (shapeType) {
        case 0: // Half-circle
          pg.arc(start.x * scaleFactor, start.y * scaleFactor, d, d, 0, PI);
          break;
        case 1: // Reversed half-circle
          pg.arc(start.x * scaleFactor, start.y * scaleFactor, d, d, PI, 0);
          break;
        case 2: // S shape (half of a yin-yang)
          pg.arc(start.x * scaleFactor, start.y * scaleFactor, d, d, 0, PI);
          pg.arc(
            (start.x + this.size / 2) * scaleFactor,
            start.y * scaleFactor,
            d,
            d,
            PI,
            0
          );
          break;
        case 3: // Centered circle (half the size of the cell)
          pg.ellipse(highResSize / 2, highResSize / 2, d / 2, d / 2);
          break;
      }
    }
    pg.pop();
  }
}

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

function generateGlobalPatternAndColors() {
  globalColors = generateColors();
}

function drawPatterns() {
  let patternColors = globalColors;
  let pattern = new Pattern(cellSize, patternColors);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      pattern.draw(i * cellSize, j * cellSize);
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
    "GP // 1014",
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
    "GP // 1014",
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

  let patternColors = generateColors();
  let pattern = new Pattern(highResCellSize, patternColors);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      pattern.drawHighRes(
        pg,
        i * highResCellSize,
        j * highResCellSize,
        scaleFactor
      );
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

function generateColors() {
  randomSeed(parseInt(seed, 16)); // Use the presaved seed
  let patternColors = [];
  for (let i = 0; i < 4; i++) {
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
