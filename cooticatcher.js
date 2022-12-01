let mouse, laggymouse;
let hue, targetHue;
let lines = true;
let coloredBackground = true;
let fold1, fold2, fold3, fold4, fold5 = 0;
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
  fold1 = map(laggymouse.x, width / 8, 7 * width / 8, 0, -PI);
  fold1 = constrain(fold1, -PI + GAP, -GAP);
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

    this.x2_ = x2;
    this.y2_ = y2;
    this.x3_ = x3;
    this.y3_ = y3;
    
  }

  display(x1, y, x2){
    push();
    rotateX(x1);
    rotateY(y);
    rotateX(x2);
    scale(LENGTH/2);
    triangle(1, 1, this.x2_, this.y2_, this.x3_, this.y3_);
    pop();
  }
}

function drawQuarter(ang) {
  
  var triangleA = new Triangle(0, 0, 1, 0);
  triangleA.display(0, fold1/2, fold1/4);

  var triangleB = new Triangle(0, 0, 0, 1);
  triangleB.display(fold1/-2, fold1/-4, 0);

  var triangleC = new Triangle(0, 2, 0, 1);
  triangleC.display(0, 0, 0);

  var triangleD = new Triangle(0, 2, 1, 2);
  triangleD.display(0, 0, 0);

  var triangleE = new Triangle(2, 2, 1, 2);
  triangleE.display(0, 0, 0);

  var triangleF = new Triangle(2, 2, 2, 1);
  triangleF.display(0, 0, 0);

  var triangleG = new Triangle(2, 0, 2, 1);
  triangleG.display(0, 0, 0);

  var triangleH = new Triangle(2, 0, 1, 0);
  triangleH.display(0, 0, 0);

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