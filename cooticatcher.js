let mouse, laggymouse;
let hue, targetHue;
let lines = false;
let coloredBackground = true;
let debug = false;
let corners = false;
let showOrigins = false;
let tri = false;
let fold1, fold2, fold3, fold4;
let foldingMode = false;
let open = false;
let merriweather;
let img;

var animationPoint = 0;

const outerOptions = ["red", "blue", "green", "yellow"];
let outerChoice = "";

const innerOptions = ["fox", "sheep", "cow", "chicken", "octopus", "frog", "rabbit", "cat"];
let innerChoice = "";

const textColors = {};

const GAP = 0.02;
const LENGTH = 100;

function preload() {
    merriweather = loadFont('fonts/Merriweather-Regular.ttf');
    img = loadImage('textures/paper.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  mouse = createVector(mouseX, mouseY);
  laggymouse = createVector(0, 1.5 * height);
  hue = color('black');
  targetHue = randomColor();
  textColors["red"] = color(224, 0, 30);
  textColors["blue"] = color(84, 105, 255);
  textColors["green"] = color(27, 181, 0);
  textColors["yellow"] = color(255, 214, 0);
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
  
  ambientLight(200);
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
  if(open == false){
    fold3 = -PI + GAP;
  }else{
    fold3 = -2.35;
  }

  // making the first choice
  if(outerChoice == "" && mouseIsPressed){
    var selection; // 0 - 3, clockwise from lower right
    if(mouseX > width/2 && mouseY > height/2){ // lower right
      selection = 0;
    }
    if(mouseX < width/2 && mouseY > height/2){ // lower left
      selection = 1;
    }
    if(mouseX < width/2 && mouseY < height/2){ // upper left
      selection = 2;
    }
    if(mouseX > width/2 && mouseY < height/2){ // upper right
      selection = 3;
    }

    outerChoice = outerOptions[selection];
    console.log("outerChoice:", outerChoice, "from Selection:", selection);
  }  

  // after first choice, catcher opens and stops
  if (outerChoice != "" && open == false){
      fold3 = map(animationPoint, 0, 50, -PI + GAP, -2.35);
      animationPoint += 1;
    if(animationPoint >= 50){
      open = true;
    }   
  }
  
  // mouseIsPressed selects an inner choice
  if (open == true && innerChoice == "" && mouseIsPressed){
    let v = createVector(mouseX - width/2, mouseY - height/2);
    let heading = v.heading();
    let selection = int(map(heading, -PI, PI, 0, 8));

    
    innerChoice = innerOptions[selection];
    console.log("innerChoice:", innerChoice, "from Selection:", selection);
  }

 // if (innerChoice != "" && something == false) {
    // do the second stuff
  
  
  
  // stage 1 user picks   an outer choice
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
    drawQuarter(outerOptions[0], innerOptions[0], innerOptions[1]);
  } else {
    for (let i = 0; i <= 3; i++) {
      push();
      rotateZ(i * HALF_PI);
      drawQuarter(outerOptions[i], innerOptions[i*2], innerOptions[i*2 + 1]);
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

  constructor(x2, y2, x3, y3, text, textRotation) {
    this.x1_ = 1;
    this.y1_ = 1;
    this.x2_ = x2;
    this.y2_ = y2;
    this.x3_ = x3;
    this.y3_ = y3;
    this.text_ = text || "";
    this.textRotation_ = textRotation || 0;

    this.folds_ = [];
  }

  display() {
    push();
    scale(LENGTH / 2);

    for (var fold of this.folds_) {
      fold.perform();
    }

    triangle(this.x1_, this.y1_, this.x2_, this.y2_, this.x3_, this.y3_);

    push();
    // translate(this.x3_, this.y3_);
    translate((this.x1_ + this.x2_ + this.x3_)/3, (this.y1_ + this.y2_ + this.y3_)/3, GAP);
    rotateZ(this.textRotation_);
    textFont(merriweather);
    textSize(0.2);
    var textColor = textColors[this.text_] || color(30); // outside colors are assigned, inside is all black
    fill(textColor);
    text(this.text_, -0.3, 0.1, GAP);
    pop();
    
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

function drawQuarter(outerOption, innerOptionA, innerOptionB) {
  var triangles = [];
  // draw triangles
  texture(img);
  var triangleA = new Triangle(0, 0, 1, 0);
  var triangleB = new Triangle(0, 0, 0, 1);
  var triangleC = new Triangle(0, 2, 0, 1);
  var triangleD = new Triangle(0, 2, 1, 2, innerOptionA, QUARTER_PI*3);
  var triangleE = new Triangle(2, 2, 1, 2, outerOption, -QUARTER_PI*3);
  var triangleF = new Triangle(2, 2, 2, 1);
  var triangleG = new Triangle(2, 0, 2, 1, innerOptionB, QUARTER_PI*3);
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

  const fold3ZFactor = tan(fold3 / -4);

  // Fold 3a - triangles a, g, h
  triangleA.addFold(new Fold({ x: 0, y: 0 }, {}, { x: fold3 / -2, z: fold3 / -4 * fold3ZFactor }));
  triangleG.addFold(new Fold({ x: 2, y: 0 }, {}, { y: fold3 / -2, z: fold3 / -4 * fold3ZFactor }));
  triangleH.addFold(new Fold({ x: 2, y: 0 }, {}, { x: fold3 / 2, z: fold3 / 4 * fold3ZFactor })); 
  
  // Fold 3b - triangles b, c, d
  triangleB.addFold(new Fold({ x: 0, y: 0 }, {}, { y: fold3 / 2, z: fold3 / 4 * fold3ZFactor }));
  triangleD.addFold(new Fold({ x: 0, y: 2 }, {}, { x: fold3 / 2, z: fold3 / 4 * fold3ZFactor }));
  triangleC.addFold(new Fold({ x: 0, y: 2 }, {}, { y: fold3 / -2, z: fold3 / -4 * fold3ZFactor }));
  
  // Fold 3c - triangles e, f
  triangleE.addFold(new Fold({ x: 2, y: 2 }, {}, { x: fold3 / -2, z: fold3 / -4 * fold3ZFactor }));
  triangleE.addFold(new Fold({ x: 1, y: 1}, {z: PI / -2}, {x: fold3 * -0.61 }));
  
  triangleF.addFold(new Fold({ x: 2, y: 2 }, {}, { y: fold3 / 2, z: fold3 / 4 * fold3ZFactor }));
  triangleF.addFold(new Fold({ x: 1, y: 1}, { z: PI / 2}, {y: fold3 * 0.61 }));  

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