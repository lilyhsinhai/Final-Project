let mouse, laggymouse;
let hue, targetHue;
let lines = true;
let coloredBackground = true;
let debug = true;
let corners = false;
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
  calculateFolds();
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


function calculateFolds() {
  fold1 = foldFrom(1, 3, 8); // fold 1 happens when mouseX > 1/8 and < 3/8 on the screen
  fold2 = foldFrom(3, 5, 8); // fold 2 happens when mouseX > 3/8 and < 5/8 on the screen
  fold3 = foldFrom(5, 7, 8); // fold 3 happens when mouseX > 5/8 and < 7/8 on the screen
}


function foldFrom(start, end, parts) {
  var step = width / parts;
  var fold = map(laggymouse.x, start * step, end * step, 0, -PI); // divides screen into section, assigns mouseX to a fold
  fold = constrain(fold, -PI + GAP, -GAP); // leaves a small space between "paper"
  return fold;
}


function drawPaper() {
  if (debug) {
    drawQuarter(0);
  } else {
    for (let ang = 0; ang < TWO_PI; ang += HALF_PI) {
      push();
      rotateZ(ang);
      drawQuarter(ang);
      pop();
    }    
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

    this.folds_ = [];
  }

  display(){
    push();
    scale(LENGTH/2);

    for(var fold of this.folds_) {
      translate(fold.origin_.x, fold.origin_.y);
      rotateX(fold.rotations_.x || 0);
      rotateY(fold.rotations_.y || 0);
      rotateZ(fold.rotations_.z || 0);

      rotateX(fold.folds_.x || 0);
      rotateY(fold.folds_.y || 0);
      rotateZ(fold.folds_.z || 0);
      rotateX(fold.folds_.x2 || 0);
      rotateY(fold.folds_.y2 || 0);
      rotateZ(fold.folds_.z2 || 0);

      rotateZ(-fold.rotations_.z || 0);
      rotateY(-fold.rotations_.y || 0);
      rotateX(-fold.rotations_.x || 0);
      translate(-fold.origin_.x, -fold.origin_.y)
    }
    
    triangle(this.x1_, this.y1_, this.x2_, this.y2_, this.x3_, this.y3_);
    
    if (corners) { // debugging
      push();
      translate(this.x1_, this.y1_);
      sphere(.02);
      pop();
      push();
      translate(this.x2_, this.y2_);
      box(.02);
      pop();
      push();
      translate(this.x3_, this.y3_);
      cone(.02, .02);
      pop();
    }
    pop();
  }

  addFold(fold){
    this.folds_.push(fold);
  }
}


class Fold {
  constructor(origin, rotations, folds) {
    this.origin_ = origin;
    this.rotations_ = rotations;
    this.folds_ = folds;
  }
}

function drawQuarter() {
  var triangles = [];
  // draw triangles
  var triangleA = new Triangle(0, 0, 1, 0);
  var triangleB = new Triangle(0, 0, 0, 1);
  var triangleC = new Triangle(0, 2, 0, 1);
  var triangleD = new Triangle(0, 2, 1, 2);
  var triangleE = new Triangle(2, 2, 1, 2);
  var triangleF = new Triangle(2, 2, 2, 1);
  var triangleG = new Triangle(2, 0, 2, 1);
  var triangleH = new Triangle(2, 0, 1, 0);

  triangles.push(triangleA, triangleB, triangleC, triangleD, triangleE, triangleF, triangleG, triangleH);

  //Fold 1
  triangleD.addFold(new Fold({x: 1, y: 1}, {z: PI/-4}, {x: fold1}));
  triangleE.addFold(new Fold({x: 1, y: 1}, {z: PI/-4}, {x: fold1}));
  triangleF.addFold(new Fold({x: 1, y: 1}, {z: PI/-4}, {x: fold1}));
  triangleG.addFold(new Fold({x: 1, y: 1}, {z: PI/-4}, {x: fold1}));

  // Fold 2a
  triangleH.addFold(new Fold({x: 1, y: 0}, {}, {y: fold2}));
  triangleG.addFold(new Fold({x: 0, y: 1}, {}, {x: -fold2}));
  
  // Fold 2b
  triangleC.addFold(new Fold({x: 0, y: 1}, {}, {x: -fold2}));
  triangleD.addFold(new Fold({x: 1, y: 0}, {}, {y: fold2}));


  // Fold 3a
  // triangles a, g, h
  // where 0, 0
  // how Y +half X +quarter

  var factor = tan(fold3/-4);
  // console.log(factor);
  triangleA.addFold(new Fold({x: 0, y: 0}, {}, {x: fold3/-2, z: fold3/-4 * factor}));
  
  // Fold 3b
  // triangles b, c, d
  // where 0, 0
  // how X +half Y +quarter

  triangleB.addFold(new Fold({x: 0, y: 0}, {}, {y: fold3/2, z:fold3/4 * factor}));

  // Fold 3c
  // triangles e, f
  // where ?
  // how ?


  // triangleA.display();
  // triangleB.display();
  triangles.forEach(t => t.display());
    
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
  if (key == 'c') {
    corners = !corners;
  }
  if (key == 'd') {
    debug = !debug;
  }
}