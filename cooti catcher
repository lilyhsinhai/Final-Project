let mouse, laggymouse;
let hue, targetHue;
let lines = true;
let coloredBackground = true;
let fold1, fold2, fold3, fold4, fold5 = 0;
const GAP = 0.02;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  mouse = createVector(mouseX, mouseY);
  laggymouse = createVector(0, 1.5 * height);
  hue = color('black');
  targetHue = randomColor();
}

function draw() {
  setScene();
  makeFolds();
  drawPaper();
}

function setScene() {
  mouse.x = mouseX;
  mouse.y = mouseY;
  laggymouse.lerp(mouse, 0.02); //catch up to mouse


  let x = map(laggymouse.y, 0, height, HALF_PI, -HALF_PI);
  // x = 0; //DEBUG
  rotateX(x + QUARTER_PI); //mouseY rotates around x axis

  let z = map(laggymouse.x, 0, width, HALF_PI, -HALF_PI);
  z = 0; //DEBUG     
  rotateZ(z); //mouseX spins shape

  let zoom = map(laggymouse.y, 0, height, 3 * height / 566, 0.5 * height / 566);
  zoom = 5;
  scale(zoom); //zoom in and out based on mouseY

  hue = lerpColor(hue, targetHue, 0.05); //catch up to target hue
  background(coloredBackground ? hue : 0);

  ambientLight(100);
  pointLight(150, 150, 150, width, -height, -height / 2);


  if (lines) {
    stroke(255, 150);
  } else {
    noStroke();
  }
  specularMaterial(hue);
}

function makeFolds() {
  fold1 = map(laggymouse.x, width / 8, 3 * width / 8, 0, -PI);
  fold1 = constrain(fold1, -PI + GAP, 0);
  fold2 = map(laggymouse.x, 3 * width / 8, width / 2, 0, -PI);
  fold2 = constrain(fold2, -PI + GAP, 0);
  fold3 = map(laggymouse.x, width / 2, 5 * width / 8, 0, -PI);
  fold3 = constrain(fold3, -PI + GAP, 0);
  fold4 = map(laggymouse.x, 5 * width / 8, 3 * width / 4, 0, -PI);
  fold4 = constrain(fold4, -PI + GAP, 0);
  fold5 = map(laggymouse.x, 3 * width / 4, 7 * width / 8, 0, -PI);
  fold5 = constrain(fold5, -PI + GAP, 0);
}

function drawPaper() {
  drawBase();
  for (let ang = 0; ang < TWO_PI; ang += HALF_PI) {
  // for (let ang = 0; ang < TWO_PI; ang += TWO_PI) {
    push();
    rotateZ(ang);
    foldSides(ang);
    pop();
  }
}

function drawBase() {
  push(); //base square
  push();
  translate(-50,-50,0);
  sphere(2);
  pop();
  beginShape();
  vertex(-50, -50, 0);
  vertex(-50, 50, 0);
  vertex(50, 50, 0);
  vertex(50, -50, 0);
  endShape();
  pop();
}

function foldSides(ang) {
  push();
  rotateY(fold1 / 2);
  rotateX(fold1 / 4);
  beginShape();
  vertex(0, 0, 0);
  vertex(50, 50, 0);
  vertex(50, 0, 0);
  endShape();
  pop();

  push(); 
  rotateX(fold1 / -2);
  rotateY(fold1 / -4);
  beginShape();
  vertex(0, 0, 0);
  vertex(50, 50, 0);
  vertex(0, 50, 0);
  endShape();
  pop();  
}

function randomColor() {
  return color(random(155), random(155), random(155), 150);
}

function mousePressed() {
  targetHue = randomColor();
}

function keyPressed() {
  if (keyCode == 32) {
    lines = !lines;
  }
  if (key == 'b') {
    coloredBackground = !coloredBackground;
  }
}