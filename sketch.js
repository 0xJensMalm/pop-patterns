// Constants and configuration
const CONFIG = {
  MODES: MODES, // Now imported from modes.js
  GRID: {
    WIDTH: 10,
    HEIGHT: 10,
    PADDING: {
      TOP: 80,
      BOTTOM: 80,
      LEFT: 80,
      RIGHT: 80,
    },
  },
  CANVAS: {
    ORIGINAL_WIDTH: 4000,
    ORIGINAL_HEIGHT: 4400,
  },
  SIGNATURE: {
    TITLE_OFFSET_X: -180,
    SEED_OFFSET_X: 125,
    CUBE_OFFSET_Y: 15,
    VERTICAL_OFFSET: -25,
    TEXT_SIZE: 12,
    CUBE_SIZE: 10,
    CUBE_SPACING: 2,
  },
};

class GenerativeArtwork {
  constructor() {
    this.state = {
      cols: 0,
      rows: 0,
      cellSize: 0,
      pattern: [],
      colors: [],
      maxLines: 5,
      themeIndex: 0,
      currentMode: "default",
      seed: "0xc3f7f484d5",
      colorIndex: 0,
      signatureColors: false,
    };

    this.stateHistory = []; // Add state history array
    this.pg = null; // Graphics buffer for high-resolution
    this.themes = [
      {
        name: "Default",
        colors: [
          "#FF0000",
          "#00FF00",
          "#0000FF",
          "#FFFF00",
          "#FF00FF",
          "#00FFFF",
        ],
      },
      {
        name: "Earthy",
        colors: [
          "#8B4513",
          "#FFD700",
          "#008000",
          "#4B0082",
          "#FF69B4",
          "#CD5C5C",
        ],
      },
      {
        name: "Pastel",
        colors: [
          "#FF6347",
          "#40E0D0",
          "#EE82EE",
          "#F5DEB3",
          "#FFFFFF",
          "#000000",
        ],
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
      {
        name: "Marguerita",
        colors: ["#0A7029", "#FEDE00", "#C8DF52", "#DBE8D8"],
      },
      { name: "Apple", colors: ["#FF8370", "#00B1B0", "#FEC84D", "#E42256"] },
    ];

    this.controls = {
      d: "Generate new pattern",
      a: "Go to previous pattern",
      s: "Change shape mode",
      c: "Change color theme",
      v: "Toggle signature colors",
      S: "Save high-resolution PNG",
      "1-9": "Set number of lines in pattern",
    };
  }

  generateSeed() {
    const seed =
      "0x" +
      Array(10)
        .fill()
        .map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)])
        .join("");

    // Ensure seed is valid hexadecimal
    if (!/^0x[0-9a-f]{10}$/.test(seed)) {
      console.warn("Invalid seed generated, using fallback");
      return "0x9b8d5a395d"; // Fallback seed
    }
    return seed;
  }

  setup() {
    createCanvas(windowWidth, windowHeight);
    this.pg = createGraphics(
      CONFIG.CANVAS.ORIGINAL_WIDTH,
      CONFIG.CANVAS.ORIGINAL_HEIGHT
    );
    pixelDensity(1);
    this.adjustCanvasSize();
    this.adjustGridAndCellSize();
    this.initializeWithSeed();
    this.printControls();
    noLoop();
  }

  printControls() {
    console.log("=== Control Keys ===");
    Object.entries(this.controls).forEach(([key, description]) => {
      console.log(`${key}: ${description}`);
    });
    console.log("=================");
  }

  initializeWithSeed() {
    console.log("Seed:", this.state.seed);
    randomSeed(parseInt(this.state.seed, 16));
    this.generatePatternAndColors();
  }

  adjustCanvasSize() {
    const aspectRatio =
      CONFIG.CANVAS.ORIGINAL_WIDTH / CONFIG.CANVAS.ORIGINAL_HEIGHT;
    const newDimensions = this.calculateCanvasDimensions(aspectRatio);
    resizeCanvas(newDimensions.width, newDimensions.height);
  }

  calculateCanvasDimensions(aspectRatio) {
    if (windowWidth / windowHeight > aspectRatio) {
      return { width: windowHeight * aspectRatio, height: windowHeight };
    }
    return { width: windowWidth, height: windowWidth / aspectRatio };
  }

  adjustGridAndCellSize() {
    this.state.cols = CONFIG.GRID.WIDTH;
    this.state.rows = CONFIG.GRID.HEIGHT;

    const availableWidth = Math.max(
      1,
      width - CONFIG.GRID.PADDING.LEFT - CONFIG.GRID.PADDING.RIGHT
    );
    const availableHeight = Math.max(
      1,
      height - CONFIG.GRID.PADDING.TOP - CONFIG.GRID.PADDING.BOTTOM
    );

    this.state.cellSize = Math.max(
      1,
      min(availableWidth / this.state.cols, availableHeight / this.state.rows)
    );
  }

  generatePatternAndColors() {
    randomSeed(parseInt(this.state.seed, 16));
    this.state.pattern = this.generatePattern();
    this.state.colors = this.generateColors();
  }

  generatePattern() {
    const modeConfig = CONFIG.MODES[this.state.currentMode];
    const points = this.generateGridPoints(modeConfig.gridDivisor);

    switch (modeConfig.shapeMode) {
      case "triangle":
        return this.generateTrianglePattern(points);
      case "hexagon":
        return this.generateHexagonPattern(points);
      case "diamond":
        return this.generateDiamondPattern(points);
      case "arc":
        return this.generateArcPattern(points);
      default:
        return this.generateDefaultPattern(points);
    }
  }

  generateDefaultPattern(points) {
    return this.createLines(points);
  }

  generateTrianglePattern(points) {
    const lines = [];
    const angles = [];
    let attempts = 0;
    const MAX_ATTEMPTS = 1000;

    while (lines.length < this.state.maxLines && attempts < MAX_ATTEMPTS) {
      const start = random(points);
      const end = random(points);
      const midPoint = createVector(end.x, start.y);

      if (!start.equals(end)) {
        lines.push([start, end]);
        angles.push(degrees(p5.Vector.sub(end, start).heading()));
      }
      attempts++;
    }

    if (lines.length === 0) {
      lines.push([
        createVector(0, 0),
        createVector(this.state.cellSize, this.state.cellSize),
      ]);
      angles.push(45);
    }

    return { lines, angles };
  }

  generateHexagonPattern(points) {
    const lines = [];
    const angles = [];
    let attempts = 0;
    const MAX_ATTEMPTS = 1000;

    while (lines.length < this.state.maxLines && attempts < MAX_ATTEMPTS) {
      const center = random(points);
      const radius =
        this.state.cellSize * CONFIG.MODES.hexagon.properties.radius;
      const startAngle = random(TWO_PI);

      // Generate two connected points on the hexagon
      const angle1 = startAngle;
      const angle2 = startAngle + TWO_PI / 6;

      const start = createVector(
        center.x + cos(angle1) * radius,
        center.y + sin(angle1) * radius
      );
      const end = createVector(
        center.x + cos(angle2) * radius,
        center.y + sin(angle2) * radius
      );

      if (!start.equals(end)) {
        lines.push([start, end]);
        angles.push(degrees(angle1));
      }
      attempts++;
    }

    return { lines, angles };
  }

  generateDiamondPattern(points) {
    const lines = [];
    const angles = [];
    let attempts = 0;
    const MAX_ATTEMPTS = 1000;

    while (lines.length < this.state.maxLines && attempts < MAX_ATTEMPTS) {
      const start = random(points);
      const end = random(points);

      if (!start.equals(end)) {
        const stretch = CONFIG.MODES.diamond.properties.stretch;
        const midPoint = createVector(
          (start.x + end.x) / 2,
          ((start.y + end.y) / 2) * stretch
        );

        lines.push([start, midPoint]);
        angles.push(degrees(p5.Vector.sub(midPoint, start).heading()));
      }
      attempts++;
    }

    return { lines, angles };
  }

  generateArcPattern(points) {
    const lines = [];
    const angles = [];
    let attempts = 0;
    const MAX_ATTEMPTS = 1000;

    while (lines.length < this.state.maxLines && attempts < MAX_ATTEMPTS) {
      const center = random(points);
      const radius = random(
        this.state.cellSize * 0.2,
        this.state.cellSize * 0.4
      );
      const startAngle = random(TWO_PI);
      const arcSpan = radians(CONFIG.MODES.arc.properties.arcSpan);

      const start = createVector(
        center.x + cos(startAngle) * radius,
        center.y + sin(startAngle) * radius
      );
      const end = createVector(
        center.x + cos(startAngle + arcSpan) * radius,
        center.y + sin(startAngle + arcSpan) * radius
      );

      if (!start.equals(end)) {
        lines.push([start, end, center, radius, startAngle]);
        angles.push(degrees(startAngle));
      }
      attempts++;
    }

    return { lines, angles };
  }

  generateGridPoints(divisor = 4) {
    const points = [];
    const step = this.state.cellSize / divisor;
    for (let x = 0; x <= this.state.cellSize; x += step) {
      for (let y = 0; y <= this.state.cellSize; y += step) {
        points.push(createVector(x, y));
      }
    }
    return points;
  }

  createLines(points) {
    const lines = [];
    const angles = [];
    let attempts = 0;
    const MAX_ATTEMPTS = 1000;

    while (lines.length < this.state.maxLines && attempts < MAX_ATTEMPTS) {
      const start = random(points);
      const end = random(points);

      if (!start.equals(end)) {
        lines.push([start, end]);
        angles.push(degrees(p5.Vector.sub(end, start).heading()));
      }
      attempts++;
    }

    if (lines.length === 0) {
      console.warn("No lines generated, adding fallback line");
      lines.push([
        createVector(0, 0),
        createVector(this.state.cellSize, this.state.cellSize),
      ]);
      angles.push(45);
    }

    return { lines, angles };
  }

  generateColors() {
    const currentTheme = this.themes[this.state.themeIndex];
    if (
      !currentTheme ||
      !currentTheme.colors ||
      currentTheme.colors.length === 0
    ) {
      console.warn(
        "Invalid theme or no colors available, using fallback theme"
      );
      this.state.themeIndex = 0;
      return [color("#FF0000")];
    }

    // Generate a new array of colors for each line
    return Array(this.state.pattern.lines.length)
      .fill()
      .map(() => {
        const randomColor = random(currentTheme.colors);
        return color(randomColor);
      });
  }

  draw() {
    background(40);
    this.drawMainPattern();
    this.drawSignature();
  }

  drawMainPattern() {
    push();
    translate(CONFIG.GRID.PADDING.LEFT, CONFIG.GRID.PADDING.TOP);

    for (let i = 0; i < this.state.cols; i++) {
      for (let j = 0; j < this.state.rows; j++) {
        push();
        translate(i * this.state.cellSize, j * this.state.cellSize);
        this.drawPattern();
        pop();
      }
    }

    pop();
  }

  drawPattern() {
    const { lines } = this.state.pattern;
    noStroke();

    lines.forEach((line, i) => {
      const fillColor = this.state.colors[i % this.state.colors.length];
      fill(fillColor);
      this.drawShape(line[0], line[1], fillColor);
    });
  }

  drawShape(start, end, fillColor) {
    const modeConfig = CONFIG.MODES[this.state.currentMode];
    const props = this.state.properties || modeConfig.properties;

    push();
    if (props.rotation) {
      translate(this.state.cellSize / 2, this.state.cellSize / 2);
      rotate(radians(props.rotation));
      translate(-this.state.cellSize / 2, -this.state.cellSize / 2);
    }

    strokeWeight(props.lineWidth || 2);
    if (props.opacity !== undefined && props.opacity !== 1.0) {
      const currentFill = color(fillColor);
      fill(
        red(currentFill),
        green(currentFill),
        blue(currentFill),
        props.opacity * 255
      );
    }

    switch (modeConfig.shapeMode) {
      case "triangle":
        this.drawTriangle(start, end);
        break;
      case "hexagon":
        this.drawHexagon(start, end);
        break;
      case "diamond":
        this.drawDiamond(start, end);
        break;
      case "arc":
        this.drawArc(start, end);
        break;
      default:
        this.drawDefault(start, end);
    }

    pop();
  }

  drawDefault(start, end) {
    beginShape();
    vertex(start.x, start.y);
    vertex(end.x, end.y);
    vertex(
      (end.x + this.state.cellSize) % this.state.cellSize,
      (end.y + this.state.cellSize) % this.state.cellSize
    );
    vertex(
      (start.x + this.state.cellSize) % this.state.cellSize,
      (start.y + this.state.cellSize) % this.state.cellSize
    );
    endShape(CLOSE);
  }

  drawTriangle(start, end) {
    beginShape();
    vertex(start.x, start.y);
    vertex(end.x, end.y);
    vertex(end.x, start.y);
    endShape(CLOSE);
  }

  drawHexagon(start, end) {
    beginShape();
    const center = p5.Vector.add(start, end).mult(0.5);
    const radius = p5.Vector.dist(start, center);

    for (let i = 0; i < 6; i++) {
      const angle = (i * TWO_PI) / 6;
      vertex(center.x + cos(angle) * radius, center.y + sin(angle) * radius);
    }
    endShape(CLOSE);
  }

  drawDiamond(start, end) {
    const stretch = CONFIG.MODES.diamond.properties.stretch;
    beginShape();
    vertex(start.x, start.y);
    vertex(end.x, end.y);
    vertex(end.x + this.state.cellSize * 0.2, end.y * stretch);
    vertex(start.x + this.state.cellSize * 0.2, start.y * stretch);
    endShape(CLOSE);
  }

  drawArc(start, end, center, radius, startAngle) {
    if (!center) {
      // Fallback if we don't have full arc data
      this.drawDefault(start, end);
      return;
    }

    const arcSpan = radians(CONFIG.MODES.arc.properties.arcSpan);
    beginShape();
    // Draw the arc
    for (let a = 0; a <= arcSpan; a += PI / 16) {
      const x = center.x + cos(startAngle + a) * radius;
      const y = center.y + sin(startAngle + a) * radius;
      vertex(x, y);
    }
    // Close the shape
    vertex(center.x, center.y);
    endShape(CLOSE);
  }

  drawSignature() {
    const config = CONFIG.SIGNATURE;
    const lineWidth = width * 0.75;
    const centerX = width / 2;
    const lineY =
      height - CONFIG.GRID.PADDING.BOTTOM * 0.8 + config.VERTICAL_OFFSET;

    this.drawSignatureLine(centerX, lineY, lineWidth);
    this.drawSignatureText(centerX, lineY);
    this.drawColorCubes(centerX, lineY);
  }

  drawSignatureLine(centerX, lineY, lineWidth) {
    stroke(this.state.colors[this.state.colorIndex]);
    strokeWeight(2);
    line(centerX - lineWidth / 2, lineY, centerX + lineWidth / 2, lineY);
    noStroke();
  }

  drawSignatureText(centerX, lineY) {
    const config = CONFIG.SIGNATURE;
    const textY = lineY + 10 + config.CUBE_SIZE / 2;

    textFont("Helvetica");
    textSize(config.TEXT_SIZE);
    fill(this.state.colors[this.state.colorIndex]);

    // Draw title
    textAlign(RIGHT, CENTER);
    text(
      "GRIDLOCK",
      centerX -
        (this.state.colors.length * (config.CUBE_SIZE + config.CUBE_SPACING)) /
          2 +
        config.TITLE_OFFSET_X,
      textY
    );

    // Draw seed
    textAlign(LEFT, CENTER);
    text(
      `seed: ${this.state.seed}`,

      centerX +
        (this.state.colors.length * (config.CUBE_SIZE + config.CUBE_SPACING)) /
          2 +
        config.SEED_OFFSET_X,
      textY
    );
  }

  drawColorCubes(centerX, lineY) {
    const config = CONFIG.SIGNATURE;
    const colorsY = lineY + config.CUBE_OFFSET_Y;
    const totalWidth =
      this.state.colors.length * config.CUBE_SIZE +
      (this.state.colors.length - 1) * config.CUBE_SPACING;
    let x = centerX - totalWidth / 2;

    this.state.colors.forEach((color) => {
      fill(color);
      rect(
        x,
        colorsY - config.CUBE_SIZE / 2,
        config.CUBE_SIZE,
        config.CUBE_SIZE
      );
      x += config.CUBE_SIZE + config.CUBE_SPACING;
    });
  }

  updateStatusDisplay() {
    // Update current mode
    const modeElement = document.getElementById("current-mode");
    if (modeElement) {
      modeElement.textContent =
        this.state.currentMode.charAt(0).toUpperCase() +
        this.state.currentMode.slice(1);
    }

    // Update current theme
    const themeElement = document.getElementById("current-theme");
    if (themeElement) {
      themeElement.textContent = this.themes[this.state.themeIndex].name;
    }

    // Update current seed
    const seedElement = document.getElementById("current-seed");
    if (seedElement) {
      seedElement.textContent = this.state.seed;
    }
  }

  handleKeyPress(key) {
    let needsRedraw = false;

    // Save current state before any changes
    if (key === "d") {
      this.stateHistory.push({ ...this.state }); // Save current state before generating new one
      this.state.seed = this.generateSeed();
      needsRedraw = true;
    } else if (key === "a" && this.stateHistory.length > 0) {
      this.state = this.stateHistory.pop(); // Restore previous state
      needsRedraw = true;
    } else if (key === "s") {
      needsRedraw = this.cycleShapeMode();
    } else if (key === "c") {
      this.state.themeIndex = (this.state.themeIndex + 1) % this.themes.length;
      needsRedraw = true;
    } else if (key === "v") {
      this.state.signatureColors = !this.state.signatureColors;
      needsRedraw = true;
    } else if (key === "S") {
      this.saveHighRes();
      needsRedraw = false;
    } else if (key >= "1" && key <= "9") {
      this.state.maxLines = parseInt(key);
      needsRedraw = true;
    }

    if (needsRedraw) {
      if (needsRedraw !== "skip-pattern") {
        this.generatePatternAndColors();
      }
      this.updateStatusDisplay();
      redraw();
    }
  }

  cycleShapeMode() {
    const modes = Object.keys(MODES);
    const currentIndex = modes.indexOf(this.state.currentMode);
    this.state.currentMode = modes[(currentIndex + 1) % modes.length];
    console.log("Mode:", this.state.currentMode);
    return true;
  }

  saveHighRes() {
    console.log("Generating high-res image...");
    this.pg.clear();
    this.pg.background(40);

    // Scale everything up
    const scaleFactor = CONFIG.CANVAS.ORIGINAL_WIDTH / width;
    const highResCellSize =
      (CONFIG.CANVAS.ORIGINAL_WIDTH -
        CONFIG.GRID.PADDING.LEFT * 2 * scaleFactor) /
      this.state.cols;

    // Draw patterns
    this.pg.push();
    this.pg.translate(
      CONFIG.GRID.PADDING.LEFT * scaleFactor,
      CONFIG.GRID.PADDING.TOP * scaleFactor
    );

    // Draw all cells
    for (let i = 0; i < this.state.cols; i++) {
      for (let j = 0; j < this.state.rows; j++) {
        this.pg.push();
        this.pg.translate(i * highResCellSize, j * highResCellSize);

        // Draw shapes for this cell
        this.state.pattern.lines.forEach((line, idx) => {
          const scale = highResCellSize / this.state.cellSize;
          const [start, end] = line;

          this.pg.fill(this.state.colors[idx % this.state.colors.length]);
          this.pg.noStroke();
          this.pg.beginShape();
          this.pg.vertex(start.x * scale, start.y * scale);
          this.pg.vertex(end.x * scale, end.y * scale);
          this.pg.vertex(
            (end.x * scale + highResCellSize) % highResCellSize,
            (end.y * scale + highResCellSize) % highResCellSize
          );
          this.pg.vertex(
            (start.x * scale + highResCellSize) % highResCellSize,
            (start.y * scale + highResCellSize) % highResCellSize
          );
          this.pg.endShape(CLOSE);
        });

        this.pg.pop();
      }
    }
    this.pg.pop();

    // Draw signature
    const centerX = CONFIG.CANVAS.ORIGINAL_WIDTH / 2;
    const lineY =
      CONFIG.CANVAS.ORIGINAL_HEIGHT -
      CONFIG.GRID.PADDING.BOTTOM * scaleFactor * 0.8 +
      CONFIG.SIGNATURE.VERTICAL_OFFSET * scaleFactor;

    // Draw signature line
    this.pg.stroke(this.state.colors[this.state.colorIndex]);
    this.pg.strokeWeight(2 * scaleFactor);
    this.pg.line(
      centerX - CONFIG.CANVAS.ORIGINAL_WIDTH * 0.375,
      lineY,
      centerX + CONFIG.CANVAS.ORIGINAL_WIDTH * 0.375,
      lineY
    );

    // Draw text and cubes
    const textY =
      lineY + 10 * scaleFactor + (CONFIG.SIGNATURE.CUBE_SIZE * scaleFactor) / 2;
    const cubeY = lineY + CONFIG.SIGNATURE.CUBE_OFFSET_Y * scaleFactor;
    const scaledCubeSize = CONFIG.SIGNATURE.CUBE_SIZE * scaleFactor;
    const scaledSpacing = CONFIG.SIGNATURE.CUBE_SPACING * scaleFactor;

    this.pg.noStroke();
    this.pg.textFont("Helvetica");
    this.pg.textSize(CONFIG.SIGNATURE.TEXT_SIZE * scaleFactor);
    this.pg.fill(this.state.colors[this.state.colorIndex]);

    // Title and seed
    this.pg.textAlign(this.pg.RIGHT, this.pg.CENTER);
    this.pg.text("Gridlock algorithm", centerX - 180 * scaleFactor, textY);
    this.pg.textAlign(this.pg.LEFT, this.pg.CENTER);
    this.pg.text(
      `seed: ${this.state.seed}`,
      centerX + 125 * scaleFactor,
      textY
    );

    // Color cubes
    let cubeX =
      centerX -
      (this.state.colors.length * (scaledCubeSize + scaledSpacing)) / 2;
    this.state.colors.forEach((color) => {
      this.pg.fill(color);
      this.pg.rect(
        cubeX,
        cubeY - scaledCubeSize / 2,
        scaledCubeSize,
        scaledCubeSize
      );
      cubeX += scaledCubeSize + scaledSpacing;
    });

    saveCanvas(this.pg, `${this.state.seed}`, "png");
    console.log("High-res image saved!");
  }
}

// Global instance and p5.js setup
let artwork;

function setup() {
  artwork = new GenerativeArtwork();
  artwork.setup();
}

function draw() {
  artwork.draw();
}

function windowResized() {
  artwork.setup();
  redraw();
}

function keyPressed() {
  artwork.handleKeyPress(key);
}
