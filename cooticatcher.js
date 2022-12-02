let mouse, laggymouse;
let hue, targetHue;
let lines = true;
let coloredBackground = true;
let debug = true;
let fold1, fold2;

const GAP = 0.02;
const LENGTH = 100;

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
  drawBase();
  drawPaper();
}

function setScene() {
  mouse.x = mouseX;
  mouse.y = mouseY;
  laggymouse.lerp(mouse, 0.02); //catch up to mouse


  let x = map(laggymouse.y, 0, height, HALF_PI, -HALF_PI);
  x = debug ? 0 : x;
  rotateX(x + QUARTER_PI); //mouseY rotates around x axis

  let z = map(laggymouse.x, 0, width, HALF_PI, -HALF_PI);
  z = debug ? 0 : z;
  rotateZ(z); //mouseX spins shape

  let zoom = map(laggymouse.y, 0, height, 3 * height / 566, 0.5 * height / 566);
  zoom = debug ? 5 : zoom;
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
  fold1 = foldFrom(1, 3, 8);
  fold2 = foldFrom(3, 5, 8);
  fold3 = foldFrom(5, 7, 8);
}

function foldFrom(start, end, parts) {
  var step = width / parts;
  var fold = map(laggymouse.x, start * step, end * step, 0, -PI);
  fold = constrain(fold, -PI + GAP, -GAP);
  return fold;
}

function drawPaper() {
  for (let ang = 0; ang < TWO_PI; ang += HALF_PI) {
    push();
    rotateZ(ang);
    drawQuarter(ang);
    pop();
  }
}

function drawBase() {
  push(); //base square
  plane(LENGTH, LENGTH, 2, 2);
  pop();
}

class Triangle{

  constructor(x2, y2, x3, y3){
    this.x1_ = 1;
    this.y1_ = 1;
    this.x2_ = x2;
    this.y2_ = y2;
    this.x3_ = x3;
    this.y3_ = y3;
    
  }

  setOrigin(x1, y1) {
    this.x1_ = x1;
    this.y1_ = y1;
  }
  
  display(x1, y, x2){
    push();
    rotateX(x1);
    rotateY(y);
    rotateX(x2);
    scale(LENGTH/2);
    triangle(this.x1_, this.y1_, this.x2_, this.y2_, this.x3_, this.y3_);
    pop();
  }
}

function drawQuarter(ang) {
  
  var triangleA = new Triangle(0, 0, 1, 0);
  triangleA.display(0, fold3/2, fold3/4);

  var triangleB = new Triangle(0, 0, 0, 1);
  triangleB.display(fold3/-2, fold3/-4, 0);

  // var triangleC = new Triangle(0, 2, 0, 1);
  var triangleC = new Triangle(0, 1, 1, 0);
  triangleC.setOrigin(0, 0);
  push();
  translate(0, LENGTH/2, 0);
  triangleC.display(-fold2, 0, 0);
  pop();

  // var triangleD = new Triangle(0, 2, 1, 2);
  var triangleD = new Triangle(0, 1, -1, 1);
  triangleD.setOrigin(0, 0);
  push();
  translate(LENGTH/2, LENGTH/2, 0);
  triangleD.display(0, 0, 0);
  pop();

  var triangleE = new Triangle(2, 2, 1, 2);
  triangleE.display(0, 0, 0);

  var triangleF = new Triangle(2, 2, 2, 1);
  triangleF.display(0, 0, 0);

  var triangleG = new Triangle(2, 0, 2, 1);
  triangleG.display(0, 0, 0);

  // var triangleH = new Triangle(2, 0, 1, 0);
  var triangleH = new Triangle(0, 1, 1, 0);
  triangleH.setOrigin(0, 0);
  push();
  translate(LENGTH/2, 0, 0);
  triangleH.display(0, fold2, 0);
  pop();

}

function foldingTechnique() {
  // draw triangles

  // Fold 1
  // what triangles d, e, f, g
  // where 1, 1
  // how X -full, Y -full

  // Fold 2a
  // triangles h, g
  // where 1, 0
  // how Y +full

  // Fold 2b
  // triangles c, d
  // where 0, 1
  // how X +full

  // Fold 3a
  // triangles a, g, h
  // where 0, 0
  // how Y +half X +quarter

  // Fold 3b
  // triangles b, c, d
  // where 0, 0
  // how X +half Y +quarter

  // Fold 3c
  // triangles e, f
  // where ?
  // how ?
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
  if (key == 'd') {
    debug = !debug;
  }
}