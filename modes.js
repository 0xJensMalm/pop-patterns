// Mode configurations and shape drawing logic
const MODES = {
    default: {
        name: "Default",
        shapeMode: "default",
        maxLines: 5,
        gridDivisor: 4,
        properties: {
            lineWidth: 2,
            opacity: 1.0,
            rotation: 0,
        },
    },
    triangle: {
        name: "Triangle",
        shapeMode: "triangle",
        maxLines: 7,
        gridDivisor: 3,
        properties: {
            lineWidth: 3,
            opacity: 0.8,
            rotation: 45,
        },
    },
    cross: {
        name: "Cross",
        shapeMode: "cross",
        maxLines: 4,
        gridDivisor: 3,
        properties: {
            lineWidth: 2,
            opacity: 0.9,
            rotation: 0,
            size: 0.7, // relative to cell size
        },
    },
    circles: {
        name: "Circles",
        shapeMode: "circles",
        maxLines: 3,
        gridDivisor: 4,
        properties: {
            lineWidth: 2,
            opacity: 0.85,
            rotation: 0,
            innerRadius: 0.2, // relative to cell size
            outerRadius: 0.4, // relative to cell size
        },
    },
    parallelogram: {
        name: "Parallelogram",
        shapeMode: "parallelogram",
        maxLines: 5,
        gridDivisor: 3,
        properties: {
            lineWidth: 2,
            opacity: 0.9,
            rotation: 0,
            skew: 15, // degrees
        },
    },
};

// Shape drawing functions
function drawShape(pg, mode, x, y, size, color) {
    const modeConfig = MODES[mode];
    if (!modeConfig) return;

    const props = modeConfig.properties;
    pg.push();
    pg.translate(x, y);
    pg.rotate(radians(props.rotation));
    pg.stroke(color);
    pg.strokeWeight(props.lineWidth);
    pg.noFill();

    switch (modeConfig.shapeMode) {
        case "default":
            drawDefaultShape(pg, size);
            break;
        case "triangle":
            drawTriangleShape(pg, size);
            break;
        case "cross":
            drawCrossShape(pg, size, props.size);
            break;
        case "circles":
            drawCirclesShape(pg, size, props.innerRadius, props.outerRadius);
            break;
        case "parallelogram":
            drawParallelogramShape(pg, size, props.skew);
            break;
    }
    pg.pop();
}

function drawDefaultShape(pg, size) {
    const halfSize = size / 2;
    pg.rect(-halfSize, -halfSize, size, size);
}

function drawTriangleShape(pg, size) {
    const halfSize = size / 2;
    pg.triangle(0, -halfSize, -halfSize, halfSize, halfSize, halfSize);
}

function drawCrossShape(pg, size, sizeFactor = 0.7) {
    const length = size * sizeFactor;
    const thickness = length * 0.2;
    
    // Horizontal bar
    pg.rect(-length/2, -thickness/2, length, thickness);
    
    // Vertical bar
    pg.rect(-thickness/2, -length/2, thickness, length);
}

function drawCirclesShape(pg, size, innerRadiusFactor = 0.2, outerRadiusFactor = 0.4) {
    const innerRadius = size * innerRadiusFactor;
    const outerRadius = size * outerRadiusFactor;
    
    // Inner circle
    pg.circle(0, 0, innerRadius * 2);
    
    // Outer circle
    pg.circle(0, 0, outerRadius * 2);
}

function drawParallelogramShape(pg, size, skewAngle = 15) {
    const halfSize = size / 2;
    const skew = halfSize * tan(radians(skewAngle));
    
    pg.beginShape();
    pg.vertex(-halfSize - skew, -halfSize);  // Top left
    pg.vertex(halfSize - skew, -halfSize);   // Top right
    pg.vertex(halfSize + skew, halfSize);    // Bottom right
    pg.vertex(-halfSize + skew, halfSize);   // Bottom left
    pg.endShape(CLOSE);
}
