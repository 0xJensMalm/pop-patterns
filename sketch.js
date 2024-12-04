// Constants and configuration
const CONFIG = {
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
      shapeMode: "default",
      seed: "0xc3f7f484d5",
      colorIndex: 0,
    };

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

      (this.controls = {
        D: "Cycle through color themes",
        M: "Change pattern mode (default/parallels/dynamic)",
        A: "Generate new seed",
        C: "Cycle through colors for signature",
        V: "Move signature up",
        B: "Move signature down",
        S: "Save high-resolution PNG",
        "1-9": "Set number of lines in pattern",
      }),
    ];
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
    const points = this.generateGridPoints();
    return this.createLines(points);
  }

  generateDefaultPattern() {
    const points = this.generateGridPoints();
    return this.createLines(points, false);
  }

  generateParallelPattern() {
    const points = this.generateGridPoints(6);
    return this.createParallelLines();
  }

  generateDynamicPattern() {
    const points = this.generateGridPoints(4);
    return this.createLines(points, true);
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

  createParallelLines() {
    const lines = [];
    const angles = [];

    for (let i = 0; i < this.state.maxLines; i++) {
      const x = random(this.state.cellSize);
      lines.push([createVector(x, 0), createVector(x, this.state.cellSize)]);
      angles.push(90);
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
      fill(this.state.colors[i % this.state.colors.length]);
      this.drawShape(line[0], line[1]);
    });
  }

  drawShape(start, end) {
    const shapeDrawers = {
      default: () => {
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
      },

      triangle: () => {
        beginShape();
        vertex(start.x, start.y);
        vertex(end.x, end.y);
        vertex(end.x, start.y);
        endShape(CLOSE);
      },

      quadrilateral: () => {
        beginShape();
        vertex(start.x, start.y);
        vertex(end.x, end.y);
        vertex(
          end.x + this.state.cellSize * 0.2,
          end.y + this.state.cellSize * 0.1
        );
        vertex(
          start.x + this.state.cellSize * 0.2,
          start.y + this.state.cellSize * 0.1
        );
        endShape(CLOSE);
      },
    };

    // Add shapeMode to state in constructor:
    if (!this.state.shapeMode) {
      this.state.shapeMode = "default";
    }

    // Draw the selected shape
    shapeDrawers[this.state.shapeMode]();
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
      "GP // 1017",
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

  handleKeyPress(key) {
    const actions = {
      D: () => {
        this.state.themeIndex =
          (this.state.themeIndex + 1) % this.themes.length;
        console.log("Theme:", this.themes[this.state.themeIndex].name);
      },
      X: () => {
        const modes = ["default", "triangle", "quadrilateral"];
        const currentIndex = modes.indexOf(this.state.shapeMode);
        this.state.shapeMode = modes[(currentIndex + 1) % modes.length];
        console.log("Shape Mode:", this.state.shapeMode);
      },
      M: () => {
        const modes = ["default", "parallels", "dynamic"];
        const currentIndex = modes.indexOf(this.state.mode);
        this.state.mode = modes[(currentIndex + 1) % modes.length];
        console.log("Mode:", this.state.mode);
      },
      A: () => {
        this.state.seed = this.generateSeed();
        console.log("New Seed:", this.state.seed);
      },
      C: () => {
        this.state.colorIndex =
          (this.state.colorIndex + 1) % this.state.colors.length;
      },
      V: () => {
        CONFIG.SIGNATURE.VERTICAL_OFFSET += 10;
      },
      B: () => {
        CONFIG.SIGNATURE.VERTICAL_OFFSET -= 10;
      },
      s: () => {
        this.saveHighRes();
        return false; // Don't regenerate pattern after saving
      },
    };

    const upperKey = key.toUpperCase();

    if (/[1-9]/.test(upperKey)) {
      this.state.maxLines = parseInt(upperKey);
      console.log("Max lines:", this.state.maxLines);
      this.initializeWithSeed();
      redraw();
      return;
    }

    const action = actions[key] || actions[upperKey];
    if (action) {
      const shouldRegenerate = action() !== false;
      if (shouldRegenerate) {
        this.initializeWithSeed();
        redraw();
      }
    }
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
    this.pg.text("GP // 1017", centerX - 180 * scaleFactor, textY);
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
