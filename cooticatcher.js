let mouse, laggymouse;
let hue, targetHue;
let lines = true;
let coloredBackground = true;
let debug = false;
let corners = false;
let showOrigins = false;
let tri = false;
let fold1, fold2, fold3, fold4;
let foldingMode = false;

const outerOptions = ["red", "blue", "green", "yellow"];
let outerChoice = "";

const innerOptions = ["fox", "sheep", "cow", "chicken", "octopus", "frog", "rabbit", "cat"];
let innerChoice = "";


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
  if (foldingMode == true){
    calculateFolds();
  }else{
    play();
  }
  drawPaper();
}


function setScene() {
  if(foldingMode){
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
  }else{
    //rotateX(PI/20);
    rotateX(0);
    //rotateZ(PI/8);
    scale(4);
  }

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

function play() {
  fold1 = -PI + GAP;
  fold2 = -PI + GAP;
  // fold3 = -PI + GAP;

  // catcher stops folding/unfolding and stays in its last position
  // the rotation stays

  var animationPoint = frameCount % 100;
  if (animationPoint < 50) {
    fold3 = map(animationPoint, 0, 50, -2.35, -PI + GAP);
  } else {
    fold3 = map(animationPoint, 50, 99, -PI + GAP, -2.35);    
  }

  if (outerChoice != "" && innerChoice == "" && mouseIsPressed){
    let v = createVector(mouseX - width/2, mouseY - height/2);
    let heading = v.heading();
    let selection = int(map(heading, -PI, PI, 0, 8));

    
    innerChoice = innerOptions[selection];
    console.log("innerChoice:", innerChoice, "from Selection:", selection);

  }

  if(outerChoice == "" && mouseIsPressed){
    var selection; // 1 - 4, clockwise from upper left
    if(mouseX < width/2 && mouseY < height/2){
      selection = 1;
    }
    if(mouseX > width/2 && mouseY < height/2){
      selection = 2;
    }
    if(mouseX > width/2 && mouseY > height/2){
      selection = 3;
    }
    if(mouseX < width/2 && mouseY > height/2){
      selection =4;
    }

    outerChoice = outerOptions[selection - 1];
    console.log("outerChoice:", outerChoice, "from Selection:", selection);
  }  

  // stage 1 user picks an outer choice
    // user chooses direction to count
    // counts along the inside options
  
  
  // user can click different triangles and the catcher will flip open in 2 different directions
  // depending on letter count it flips a certain amount of times
  // last click the catcher flattens and opens the clicked flap (reversing fold2 for that one)
  
}


function calculateFolds() {
  fold1 = foldFrom(1, 3, 8); // fold 1 happens when mouseX > 1/8 and < 3/8 of the screen
  fold2 = foldFrom(3, 5, 8); // fold 2 happens when mouseX > 3/8 and < 5/8 of the screen
  fold3 = foldFrom(5, 7, 8); // fold 3 happens when mouseX > 5/8 and < 7/8 of the screen
  fold4 = foldFrom(7, 8, 8); // fold 4 happens when mouseX > 7/8 of the screen
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


class Triangle {

  constructor(x2, y2, x3, y3) {
    this.x1_ = 1;
    this.y1_ = 1;
    this.x2_ = x2;
    this.y2_ = y2;
    this.x3_ = x3;
    this.y3_ = y3;

    this.folds_ = [];
  }

  display() {
    push();
    scale(LENGTH / 2);

    for (var fold of this.folds_) {
      fold.perform();
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

      //draw Z
      push();
      translate((this.x1_ + this.x2_ + this.x3_)/3, (this.y1_ + this.y2_ + this.y3_)/3);
      rotateX(PI/2);
      cone(.02, .10);      
      pop();
      
    }
    pop();
  }

  addFold(fold) {
    this.folds_.push(fold);
  }
}

class Fold {
  constructor(origin, rotations, folds) {
    this.origin_ = origin;
    this.rotations_ = rotations;
    this.folds_ = folds;
  }

  perform() {
    translate(this.origin_.x, this.origin_.y, this.origin_.z);
    if (showOrigins) {
      sphere(0.02);
    }
    rotateX(this.rotations_.x || 0);
    rotateY(this.rotations_.y || 0);
    rotateZ(this.rotations_.z || 0);

    rotateX(this.folds_.x || 0);
    rotateY(this.folds_.y || 0);
    rotateZ(this.folds_.z || 0);
    rotateX(this.folds_.x2 || 0);
    rotateY(this.folds_.y2 || 0);
    rotateZ(this.folds_.z2 || 0);

    rotateZ(-this.rotations_.z || 0);
    rotateY(-this.rotations_.y || 0);
    rotateX(-this.rotations_.x || 0);
    translate(-this.origin_.x, -this.origin_.y, -this.origin_.z)
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
  triangleD.addFold(new Fold({ x: 1, y: 1 }, { z: PI / -4 }, { x: fold1 }));
  triangleE.addFold(new Fold({ x: 1, y: 1 }, { z: PI / -4 }, { x: fold1 }));
  triangleF.addFold(new Fold({ x: 1, y: 1 }, { z: PI / -4 }, { x: fold1 }));
  triangleG.addFold(new Fold({ x: 1, y: 1 }, { z: PI / -4 }, { x: fold1 }));

  // Fold 2a
  triangleH.addFold(new Fold({ x: 1, y: 0 }, {}, { y: fold2 }));
  triangleG.addFold(new Fold({ x: 0, y: 1 }, {}, { x: -fold2 }));

  // Fold 2b
  triangleC.addFold(new Fold({ x: 0, y: 1 }, {}, { x: -fold2 }));
  triangleD.addFold(new Fold({ x: 1, y: 0 }, {}, { y: fold2 }));

  var fold3ZFactor = tan(fold3 / -4);

  // Fold 3a - triangles a, g, h
  triangleA.addFold(new Fold({ x: 0, y: 0 }, {}, { x: fold3 / -2, z: fold3 / -4 * fold3ZFactor }));
  triangleG.addFold(new Fold({ x: 2, y: 0 }, {}, { y: fold3 / -2, z: fold3 / -4 * fold3ZFactor }));
  triangleH.addFold(new Fold({ x: 2, y: 0 }, {}, { x: fold3 / 2, z: fold3 / 4 * fold3ZFactor })); 
  
  // Fold 3b - triangles b, c, d
  triangleB.addFold(new Fold({ x: 0, y: 0 }, {}, { y: fold3 / 2, z: fold3 / 4 * fold3ZFactor }));
  triangleD.addFold(new Fold({ x: 0, y: 2 }, {}, { x: fold3 / 2, z: fold3 / 4 * fold3ZFactor }));
  triangleC.addFold(new Fold({ x: 0, y: 2 }, {}, { y: fold3 / -2, z: fold3 / -4 * fold3ZFactor }));
  
  // Fold 3c - triangles e, f
  //fold just like c folds in 3b
  triangleE.addFold(new Fold({ x: 2, y: 2 }, {}, { x: fold3 / -2, z: fold3 / -4 * fold3ZFactor }));
  triangleE.addFold(new Fold({ x: 1, y: 1}, {z: PI / -2}, {x: fold3 * -0.61 }));
  
  //fold just like h folds in 3a
  triangleF.addFold(new Fold({ x: 2, y: 2 }, {}, { y: fold3 / 2, z: fold3 / 4 * fold3ZFactor }));
  triangleF.addFold(new Fold({ x: 1, y: 1}, { z: PI / 2}, {y: fold3 * 0.61 }));  

  //Fold 4 - half open
  

  
  // triangleF.display(); 
  triangles.forEach(t => t.display());

  if (tri) {
    drawEandF();
  }
}

function drawEandF() {
  // s = sqrt(2) ~= 1.4
  // sphere corner moves (1, 1, 0) => (0, 0, s)
  // triangle corner (right angle) (0, 1, 0) =>  (0, s/2, s/2)
  // cube corner (0,0,0) => ??? (s*2/3, s*2/3, s*2/3) 

    push();
    stroke(255, 150);
    scale(LENGTH / 2);
    let s = sqrt(2);

    beginShape();
    vertex(0, 0, s);
    vertex(0, s/2, s/2);
    vertex(s*2/3, s*2/3, s*2/3);
    endShape();

    beginShape();
    vertex(0, 0, s);
    vertex(s/2, 0, s/2);
    vertex(s*2/3, s*2/3, s*2/3);
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
  if (key == 'l') {
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
  if (key == 'o') {
    showOrigins = !showOrigins;
  }
  if (key == 't') {
    tri = !tri;
  }
  if (keyCode == 32){
    foldingMode = !foldingMode;
  }
}