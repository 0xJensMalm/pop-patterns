// Signature configuration and drawing functions
class Signature {
  constructor(artwork) {
    this.artwork = artwork;
    this.config = CONFIG.SIGNATURE;
  }

  drawText(centerX, lineY) {
    const textY = lineY + 10 + this.config.CUBE_SIZE / 2;

    textFont("Helvetica");
    textSize(this.config.TEXT_SIZE);
    fill(this.artwork.state.colors[this.artwork.state.colorIndex]);

    // Draw title parts
    const baseX =
      centerX -
      (this.artwork.state.colors.length *
        (this.config.CUBE_SIZE + this.config.CUBE_SPACING)) /
        2 +
      this.config.TITLE_OFFSET_X;

    // Draw "GRI"
    textAlign(RIGHT, CENTER);
    text("GRI", baseX - 30, textY);

    // Draw flipped "D"
    push();
    const dWidth = textWidth("D");
    translate(baseX - 29 + dWidth / 2, textY);
    scale(-1, 1);
    text("D", dWidth / 2, 0);
    pop();

    // Draw "LOCK"
    textAlign(LEFT, CENTER);
    text("LOCK", baseX - 20, textY);

    // Draw seed
    textAlign(LEFT, CENTER);
    text(
      `seed: ${this.artwork.state.seed}`,
      centerX +
        (this.artwork.state.colors.length *
          (this.config.CUBE_SIZE + this.config.CUBE_SPACING)) /
          2 +
        this.config.SEED_OFFSET_X,
      textY
    );
  }

  drawLine(centerX, lineY) {
    const lineWidth =
      this.artwork.state.colors.length *
      (this.config.CUBE_SIZE + this.config.CUBE_SPACING);

    stroke(this.artwork.state.colors[this.artwork.state.colorIndex]);
    strokeWeight(2);
    line(centerX - lineWidth / 2, lineY, centerX + lineWidth / 2, lineY);
  }

  drawColorCubes(centerX, lineY) {
    noStroke();
    const colors = this.artwork.state.colors;

    for (let i = 0; i < colors.length; i++) {
      fill(colors[i]);
      rect(
        centerX -
          (colors.length * (this.config.CUBE_SIZE + this.config.CUBE_SPACING)) /
            2 +
          i * (this.config.CUBE_SIZE + this.config.CUBE_SPACING),
        lineY - this.config.CUBE_SIZE - 5,
        this.config.CUBE_SIZE,
        this.config.CUBE_SIZE
      );
    }
  }

  draw(centerX, lineY) {
    this.drawLine(centerX, lineY);
    this.drawColorCubes(centerX, lineY);
    this.drawText(centerX, lineY);
  }
}
