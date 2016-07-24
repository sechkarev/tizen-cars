window.onload = function() {
    // TODO:: Do your initialization job

    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if (e.keyName === "back") {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    });

    // Sample code
    document.addEventListener("rotarydetent", rotaryDetentHandler);
};

var counter = 0; //frame counter
var bestScore = 0;

var screenHeight = screen.height;
var screenWidth = screen.width;

var stripeWidth = 6;
var stripeHeight = screenWidth / 9;
var stripes; //two-dimentional array of stripes
var player;
var cars;

var CAR_HEIGHT = 84;
var CAR_WIDTH = 40;
var PLAYER_MOVE = 20;

var playerVelocity = 9;

var intervalID;

function rotaryDetentHandler(e){
	var direction = e.detail.direction;
	if (direction === "CW"){
		player.positionX+=PLAYER_MOVE; //probably will be changed
		if (player.positionX + player.width > 5 * screenWidth / 6 - stripeWidth / 2){
			player.positionX = 5 * screenWidth / 6 - stripeWidth / 2 - player.width;
		}
	}
	else{
		player.positionX-=PLAYER_MOVE;
		if (player.positionX < screenWidth / 6 + stripeWidth / 2){
			player.positionX = screenWidth / 6 + stripeWidth / 2;
		}
	}
}

function initializeField(){
	var height = screen.height;
	var width = screen.width;
	var canvas = document.getElementById("game");
	canvas.height = height;
	canvas.width = width;
	stripes = [];
	cars = [];
	counter = 0;
	var x = canvas.getContext("2d");
	x.font='18px Verdana';
	//wall = new obstacle(wallInitialSize, wallInitialSize);
	for (var i = 0; i < 3; ++i){
		stripes.push([]);
		for (var j = 0; j < 5; j++){
			stripes[i].push(new stripe(width / 6 * (i + 2), stripeHeight * j * 2));
		}
	}
	player = new playerSprite((screenWidth - CAR_WIDTH) / 2, (screenHeight - CAR_HEIGHT) / 10 * 9); 
	intervalID = setInterval(drawField, 40, x);
	document.location.href = "#main";
}

function drawField(context){
	context.fillStyle = "#282B2A"; //asphalt
	context.fillRect(0, 0, screenWidth, screenHeight);
	context.fillStyle = "#F5F5F5";
	context.fillRect(screenWidth / 6 - stripeWidth / 2, 0, stripeWidth, screenHeight);
	
	for (var i = 0; i < stripes.length; ++i){
		for (var j = 0; j < stripes[i].length; ++j){
			stripes[i][j].draw(context);
			stripes[i][j].move(playerVelocity);
		}
	}
	context.fillRect(5 * screenWidth / 6 - stripeWidth / 2, 0, stripeWidth, screenHeight);
	player.draw(context);
	counter++;
	//SPAWN
	if (counter % 50 === 0){ //every 2 seconds
		//easiest way: increase the interval to allow the player to fit into gaps
		var lane = Math.floor(Math.random() * 4);
		//idea: spawn 2 cars simultaneously
		var lane2 = Math.floor(Math.random() * 4);
		while (lane2 === lane){
			lane2 = Math.floor(Math.random() * 4);
		}
		var x1 = screenWidth / 6 + (60 - CAR_WIDTH) / 2 + lane * 60;
		var x2 = screenWidth / 6 + (60 - CAR_WIDTH) / 2 + lane2 * 60;
		var velocity_increase = Math.min(/*Math.floor*/(counter / 500), 3); //increase velocity by 1 every 20 seconds, 7 is maximum
		var velocity = 4 + velocity_increase; 
		//idea: increase the velocity as long as the game progresses
		cars.push(new otherCar(x1, -100, velocity));
		cars.push(new otherCar(x2, -100, velocity));
		//console.log("car pushed, velocity = " + velocity);
	}
	for (var i = 0; i < cars.length; ++i){
		cars[i].draw(context);
		if (player.checkCollision(cars[i]) === true){
			gameOver();
		}
		cars[i].move();
		if (cars[i].positionY > screenWidth){
			cars.splice(i, 1); //in case of a mistake decrement i
			i--;
		}
	}
	//SPAWN
	context.fillText(counter, 5, 20); //figure out how to center text
}

function stripe (x, y){
	this.width = stripeWidth;
	this.height = stripeHeight;
	this.positionX = x; //center
	this.positionY = y; //upper point
	this.draw = function(context){
		context.fillRect(this.positionX - stripeWidth / 2, this.positionY, stripeWidth, stripeHeight);
	};
	this.move = function(velocity){
		this.positionY += velocity;
		if (this.positionY > screenHeight){
			this.positionY = -1 * this.height;
		}
	};
}

function playerSprite (x, y){
	this.texture = new Image();
	this.texture.src = "img/violet_priora_40.png";
	this.positionX = x;
	this.positionY = y;
	this.height = CAR_HEIGHT;
	this.width = CAR_WIDTH;
	this.draw = function(context){
		context.drawImage(this.texture, this.positionX, this.positionY);
	};
	this.checkCollision = function(otherCar){
		if (this.positionX < otherCar.positionX + otherCar.width &&
			this.positionX + this.width > otherCar.positionX &&
			this.positionY < otherCar.positionY + otherCar.height &&
			this.height + this.positionY > otherCar.positionY) {
			return true;
		}
		return false;
	};
}

function otherCar (x, y, velocity){
	this.texture = new Image();
	this.texture.src = "img/blue_priora_40.png";
	this.positionX = x;
	this.positionY = y;
	this.height = CAR_HEIGHT;
	this.width = CAR_WIDTH;
	this.velocity = velocity;
	this.draw = function(context){
		context.drawImage(this.texture, this.positionX, this.positionY);
	};
	this.move = function(){
		this.positionY += this.velocity;
	};
}

function gameOver(){
	clearInterval(intervalID);
	var str1;
	var str2;
	if (bestScore < counter){
		str1 = "New record!";
		str2 = "Previous best = " + bestScore;
		bestScore = counter;
	}
	else{
		str1 = "You lost!";
		str2 = "Best in current session = " + bestScore;
	}
	document.getElementById("score").innerHTML = str1 + "<br>Your score = " + counter + "<br>" + str2;
	document.location.href = "#gameOver";
}


