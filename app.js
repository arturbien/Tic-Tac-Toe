

$("#willy").hover(function () {
  $("#willy").toggleClass("visibility");
  $("#sorry").toggleClass("visibility");
  $("#boner").toggleClass("visibility");
 });

$("#onePlayer").hover(function () {
  if(!started){
    $(this).toggleClass("hl");
    $("#handOne").toggleClass("hl");
  }  
 });

 $("#twoPlayers").hover(function () {
   if (!started){
    $(this).toggleClass("hl");
    $("#handOne").toggleClass("hl");
    $("#handTwo").toggleClass("hl");
  }  
 });

$("#backArrow").hover(function () {
  $(this).toggleClass("visibility");
 });

$("#backArrow").click(function () {
  $("#banner").css("opacity","0.5");
  $("#onePlayer").css("display","initial");
  $("#twoPlayers").css("display","initial");
  $("#backArrow").css("display","none");
  started = false;
  clear();
 });

$( "#onePlayer" ).click(function() {
  startGame(true);
});

$( "#twoPlayers" ).click(function() {
  startGame(false);
});

function startGame(solo){
    reset();
    $("#banner").css("opacity","0.14");
    $("#onePlayer").css("display","none");
    $("#twoPlayers").css("display","none");
    $("#backArrow").css("display","initial");
    $("#onePlayer").removeClass("hl");
    $("#twoPlayers").removeClass("hl");
    $("#handOne").removeClass("hl");
    $("#handTwo").removeClass("hl");
    if (solo) {
      onePlayer = true;
    } else {
      onePlayer = false;
    }
    started = true;
}

function whosTurn(player) {
    if (player == "X") {
      $("#xArrow").css("opacity","0.04");
      $("#oArrow").css("opacity","0.60");
    } else {
      $("#xArrow").css("opacity","0.45");
      $("#oArrow").css("opacity","0.08");
    }
}
var onePlayer;
var players;
var started; 
var gameMode;
var turn;
var squares;
var winCombo;
var playersScores;
var symbols;
var scribble =  new Scribble();    
var planetSystems;
var board;
var win;
var mousePos;
var countBars;
var combos = [[0, 1, 2],
                 [3, 4, 5],
                 [6, 7, 8],
                 [0, 3, 6],
                 [1, 4, 7],
                 [2, 5, 8],
                 [0, 4, 8],
                 [6, 4, 2]];

function reset() {
  players = ["X", "O"];
  turn = ["X", "O"];
  squares = ["", "", "", "", "", "", "", "", ""];
  playersScores = { "X" : 0,
                      "O" : 0 };
  symbols = [];
  planetSystems = [];
  sz = 700;
  countBars = [];
  win = false;
  
  board = new Board();
  countBars.push( new CountBar(55, 182, 35, "O"));
  countBars.push( new CountBar(width-55-100, 155, 50, "X"));
  rectMode(CENTER);
  started = false; 
}


function setup() { 
  var canvas = createCanvas(900, 540);
  canvas.parent('canvas');
  scribble.bowing    = 1.5;
  scribble.roughness =1.5;
} 

function draw() { 
  if (started) {
    clear();
    stroke(255);
    board.draw();
    for (var b = 0; b < countBars.length; b++) {
      countBars[b].show();
    }
    
    for (var j = 0; j < symbols.length; j++){
      symbols[j].update();
      symbols[j].show();
    }
    
    for (var i = 0; i < planetSystems.length; i++){
      planetSystems[i].show();
    }
  }
}

function mousePressed() {
  if (started && !win && squares.indexOf("") != -1){
    if (!onePlayer || (onePlayer && players[0] == "X")) {
      mousePos = createVector(mouseX, mouseY);
      for (var i = 0; i < board.squares.length; i++) {
        if (squares[i] == "" && p5.Vector.dist(board.squares[i], mousePos) < board.spacing/2) {
          squares[i] = players[0];
          whosTurn(players[0]);
          win = check(squares, players[0], false);
          players.unshift(players.pop());
          symbols.push(new Symbol(squares[i], board.squares[i], i));
          break;
        }
      }
    } else {
      var bestSpot;
      if (squares.indexOf("X") == -1) {
        var emptySpots = emptyIndexies(squares);
        bestSpot = {};
        bestSpot.index = emptySpots[Math.floor(Math.random()*emptySpots.length)];
      } else {
        bestSpot = minimax(squares, players[0]);
      }
      squares[bestSpot.index] = players[0];
      whosTurn(players[0]);
      win = check(squares, players[0], false);
      players.unshift(players.pop());
      symbols.push(new Symbol(squares[bestSpot.index], board.squares[bestSpot.index], bestSpot.index));
    }  
  } else if (win || squares.indexOf("") == -1) {
      whosTurn(turn[0]);
      turn.unshift(turn.pop());
      players = turn.slice();
      planetSystems = [];
      
      cleanBoard();
  } 
}

function minimax(newBoard, player) {
  var availSpots = emptyIndexies(newBoard);
  
  if (check(newBoard, "O", true)) {
    return {score: 10};
  } else if (check(newBoard, "X", true)) {
    return {score: -1};
  } else if (availSpots.length === 0){
    return {score: 0};
  }
  var moves = [];
  
  for (var i = 0; i < availSpots.length; i++) {
    var move = {};
    move.index = availSpots[i];
    
    newBoard[availSpots[i]] = player;
    
    if (player == "O") {
      var result = minimax(newBoard, "X");
      move.score = result.score;
    } else {
      var result = minimax(newBoard, "O");
      move.score = result.score;
    }
    
    newBoard[availSpots[i]] = "";
    
    moves.push(move);
  }
  var bestMove;
  if (player === "O") {
    var bestScore = - 10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    var bestScore = 10000;
    for(var i = 0; i < moves.length; i++){
      if(moves[i].score < bestScore){
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}


function emptyIndexies(newBoard) {
  var emptySpots = [];
  for (var i = 0; i < newBoard.length; i++) {
    if (newBoard[i] == "") {
      emptySpots.push(i)  
    }
  }
  return emptySpots;
}  
  
function cleanBoard() {
  squares = ["", "", "", "", "", "", "", "", ""];
  symbols = [];
  win = false;
  board = new Board();
}

function check(arr, player, ai) {
  for (var c = 0; c < combos.length; c++) {
    var ifCombo = true;
    for (var k = 0; k < combos[c].length; k++) {
      if (arr[combos[c][k]] != player) {
        ifCombo = false;
        break;
      }
    }
    if (ifCombo == true) {
      if (!ai) {
        winCombo = combos[c];
        playersScores[player] ++;
      }
      return true;
    } 
  }
  return false;
}

function CountBar(x, y, rowOffset, player) {
  this.player = player;
	this.pos = createVector(x, y);
  this.w = 100;
  this.h = 84;
  this.barOffset = this.w / 3;
  this.barLen = 84;
  this.rowOffset = rowOffset;
  
  this.show = function() {
    strokeWeight(2);
    stroke(255, 60);
    var rows = 0;
    for (var i = 0; i < playersScores[this.player]; i++) {
      if ( (i + 1) % 5 == 0 ) {
      	scribble.scribbleLine( this.pos.x - this.barOffset * 0.75, 
             this.pos.y + ((this.h + this.rowOffset) * rows) + this.h - this.barOffset * 0.25,  
             this.pos.x + (i % 5)  * this.barOffset - this.barOffset * 0.25, 
             this.pos.y + ((this.h + this.rowOffset) * rows) + this.barOffset * 0.25);
        rows++;
      } else {
        scribble.scribbleLine(this.pos.x + (i % 5) * this.barOffset, this.pos.y + ((this.h + this.rowOffset) * rows), this.pos.x + (i % 5) * this.barOffset, this.pos.y + ((this.h + this.rowOffset) * rows) + this.h);
      }
    }
  }
}

function Symbol(xOrO, pos, gridPos) {
  this.gridPos = gridPos;
  this.symbol = xOrO;
  this.pos = pos;
  this.r = board.spacing * 0.75
  // movement
  this.angle = 0;
  this.angularVel = PI / Math.floor(random(2, 20));
  this.v = p5.Vector.random2D().mult(32);
  this.g = -1.4;
  this.bounces = Math.floor(random(1, 5));
  this.show = function() {
    push();
    translate(this.pos.x, this.pos.y);
    if (this.symbol == "O"){
      noFill();
      strokeWeight(15);
      stroke(255, 20);
      scribble.scribbleEllipse( 0, 0 , this.r, this.r); 
      strokeWeight(2);
      stroke(255);
      scribble.scribbleEllipse( 0, 0 , this.r, this.r);    
   } else {
      rotate(PI / 4 + this.angle);
      strokeWeight(15);
      stroke(255, 20);
      scribble.scribbleLine(0, - this.r * 1.2 / 2, 0, this.r * 1.2 / 2);
      scribble.scribbleLine(- this.r * 1.2 / 2, 0, this.r * 1.2 / 2, 0);
      strokeWeight(2);
      stroke(255);
      scribble.scribbleLine(0, - this.r / 2, 0, this.r / 2);
      scribble.scribbleLine(- this.r / 2, 0, this.r / 2, 0);
    }
    pop();
  }
  this.edges = function () {
    if (this.bounces) {
      if (this.pos.x > width - this.r / 2 || this.pos.x < 0 + this.r / 2) {
        this.v.x *= -1;
        this.v.mult(0.9);
        this.bounces --;
      } else if (this.pos.y > height - this.r / 2 || this.pos.y < 0 + this.r / 2) {
        this.v.y *= -1;
        this.v.mult(0.9);
        this.bounces --;
      }
    }
  }
  this.update = function () {
    if (win) {
      if (winCombo.indexOf(this.gridPos) == -1) {
        this.v.sub(0, this.g)
        this.pos.add(this.v);
        
        if (this.symbol == "X") {
          this.angle += this.angularVel;
          this.angularVel *= 0.98;
          this.r *= 0.96;
        } else {
          this.edges();
          this.r *= 0.98;
        }
      }
    } 
  }
}

function Board() {
  this.spacing = 120;
  this.offset = 0;
  this.gridThickness = 4;
  this.angle = PI / 2;
  this.lineWeigt = 4;
  this.squares = [];
  this.squaresColor = []
  for (var row = 0; row < 3; row++){
    for (var col = 0; col < 3; col++){
      this.squares.push(createVector( width / 2 - this.spacing + this.spacing * col, height / 2 - this.spacing + this.spacing * row + this.offset));
          this.squaresColor.push(color(Math.floor(random(256)),Math.floor(random(256)),Math.floor(random(256)), 40));
    }
  }
  
  this.draw = function() {
    
    stroke(255, 40); 
    strokeWeight(this.gridThickness);
    scribble.bowing    = 0;
    scribble.roughness =2;
    var horizontalX = width / 2 - 1.5 * this.spacing;
    var horizontalY = height / 2 - 0.5 * this.spacing + this.offset;
    var verticalX = width / 2 - 0.5 * this.spacing;
    var verticalY = height / 2 - 1.5 * this.spacing + this.offset;
    // horizontal lines
    scribble.scribbleLine( horizontalX, horizontalY, horizontalX + 3 * this.spacing, horizontalY);
    scribble.scribbleLine( horizontalX, horizontalY + this.spacing, horizontalX + 3 * this.spacing, horizontalY + this.spacing);
    // vertical lines
    scribble.scribbleLine( verticalX, verticalY, verticalX, verticalY + 3 * this.spacing);
    scribble.scribbleLine( verticalX + this.spacing, verticalY, verticalX + this.spacing, verticalY + 3 * this.spacing);

    scribble.bowing    = 1.5;
    scribble.roughness =1.5;
    
    if (!win && squares.indexOf("") != -1) {
      for (var j = 0; j < this.squares.length; j++) {
        mousePos = createVector(mouseX, mouseY);
        if (p5.Vector.dist(this.squares[j], mousePos) < this.spacing/2 && squares[j] == "" &&
           !(onePlayer && players[0] == "O")) {
          push();
          translate(this.squares[j].x, this.squares[j].y)
          rotate(this.angle);
          noStroke();
          fill(this.squaresColor[j]);
          rect( 0, 0, this.spacing, this.spacing, this.spacing / 4);

          if (players[0] == "O"){
            noFill();
            strokeWeight(15);
            stroke(255, 20);
            scribble.scribbleEllipse( 0, 0 , this.spacing * 0.75, this.spacing * 0.75); 
            strokeWeight(2);
            stroke(255);
            scribble.scribbleEllipse( 0, 0 , this.spacing * 0.75, this.spacing * 0.75);    
          } else {
            rotate(PI / 4);
            strokeWeight(15);
            stroke(255, 20);
            scribble.scribbleLine(0, - this.spacing * 0.85 / 2, 0, this.spacing * 0.85 / 2);
            scribble.scribbleLine(- this.spacing * 0.85 / 2, 0, this.spacing * 0.85 / 2, 0);
            strokeWeight(2);
            stroke(255);
            scribble.scribbleLine(0, - this.spacing * 0.75 / 2, 0, this.spacing * 0.75 / 2);
            scribble.scribbleLine(- this.spacing * 0.75 / 2, 0, this.spacing * 0.75 / 2, 0);
          }
          noStroke();
          pop();
        }
      }
    } else if (!win && squares.indexOf("") == -1) {
      push();
      strokeWeight(2);
      stroke(255, 125);
      var xCoords = [width/2 - 1.5*this.spacing, width/2 - 1.5*this.spacing, 
                     width/2 + 1.5*this.spacing, width/2 + 1.5*this.spacing];
      var yCoords = [height/2 - 1.5*this.spacing, height/2 + 1.5*this.spacing, 
                     height/2 + 1.5*this.spacing, height/2 - 1.5*this.spacing];
      scribble.scribbleFilling( xCoords, yCoords, 22, 50 );
      if (planetSystems.length == 0) {
        planetSystems.push(new PlanetSystem(width/6, height - height/random(1.5, 3)));
        planetSystems.push(new PlanetSystem(width - width/6, height - height/random(1.5, 3)));
      }
      
      pop();
    } else {
      for (var i = 0; i < winCombo.length; i++) {
        push();
        translate(this.squares[winCombo[i]].x, this.squares[winCombo[i]].y)
        noStroke();
        fill(this.squaresColor[winCombo[i]]);
        rect( 0, 0, this.spacing, this.spacing, this.spacing / 4);
        pop();
      }
    }  
  }
}

function PlanetSystem(x, y) {
  this.pos = createVector(x, y).copy();
  if (random() < 0.5) {
    this.rotationDir = -1;
  } else {
    this.rotationDir = 1;
  }
  this.angle = PI/Math.floor(random(0, 9));
  this.angularSpeed = this.rotationDir * PI/Math.floor(random(20, 180));
  this.col = color(Math.floor(random(256)),Math.floor(random(256)),Math.floor(random(256)), 25);
  this.r = Math.floor(random(120, 450));
  this.lsdMode = false;
  
  this.planetAngle = PI/Math.floor(random(0, 9));
  this.planetAngularSpeed = PI/Math.floor(random(20, 180));
  this.planetCol = color(Math.floor(random(256)),Math.floor(random(256)),Math.floor(random(256)), 75);
  this.planetX = random();
  this.planetSpeed = 2;
  this.planetR = Math.floor(random(this.r/10,this.r/6));
  this.show = function() {
    push();
    translate(this.pos.x, this.pos.y)
    rotate(this.angle);
    scribble.scribbleLine(  this.r / 2,0, - this.r / 2, 0  );
    for (var k = 0; k < this.r / 50; k++) {
      if (this.lsdMode){
        fill(Math.floor(random(256)),Math.floor(random(256)),Math.floor(random(256)));
      } else {
        fill(this.col);
      }
      noStroke();
      scribble.scribbleEllipse( 0, 0,  this.r/(k+1),this.r-this.r/(k+1));
    }
    noFill(0);
    strokeWeight(2);
    stroke(255, 90);
    scribble.scribbleEllipse(0, 0, this.r / 2 * 0.8, this.r / 2 * 0.8);
    scribble.scribbleEllipse(0, 0, this.r / 2 * 0.8, this.r / 4);
    scribble.scribbleEllipse(0, 0, this.r / 2 * 0.8, this.r / 8);
    scribble.scribbleEllipse(0, 0, this.r / 2 * 0.8, this.r / 16);
    scribble.scribbleEllipse(0, 0, this.r / random(16,32), this.r * 0.8);
    pop();
    //planet movement
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    fill(this.planetCol);
    // noStroke();
    scribble.scribbleEllipse(0, this.r*sin(this.angle), this.planetR, this.planetR);
    noFill(0);
    stroke(255);
    strokeWeight(0.6);
    scribble.scribbleEllipse(0, this.r/ 2* 0.8*sin(this.angle), this.planetR * 0.6, this.planetR * 0.6);
    pop();
    this.angle += this.angularSpeed;
    this.planetAngle += this.planetAngularSpeed - this.angularSpeed;
    this.planetR *= 0.96;
    this.r *= 0.98;
  }
}

