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
var overtakingDistance = 50;

var intervalID;

const FPS = 25;
const FRAME_INTERVAL = 1000 / FPS; //40

const DIRECTION_DIRECT = 0;
const DIRECTION_LEFT = -1;
const DIRECTION_RIGHT = 1;
const FRAMES_TO_CHANGE_LANE = 12;

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
	for (var i = 0; i < 3; ++i){
		stripes.push([]);
		for (var j = 0; j < 5; j++){
			stripes[i].push(new stripe(width / 6 * (i + 2), stripeHeight * j * 2));
		}
	}
	//player = new playerSprite((screenWidth - CAR_WIDTH) / 2, (screenHeight - CAR_HEIGHT) / 10 * 9); 
	intervalID = setInterval(drawField, FRAME_INTERVAL, x);
	document.location.href = "#main";
}

function drawField(context){
	//STRIPES DRAWING -- beginning
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
	//STRIPES DRAWING -- end
	
	//player.draw(context); //DRAWING PLAYER
	counter++;
	
	//OTHER CARS' SPAWN -- beginning
	/*var velocity_increase = Math.min((counter / 500), 3);
	//increase velocity by 1 every 20 seconds, 7 is maximum
	if (counter % 50 === 0){ //every 2 seconds
		//easiest way: increase the interval to allow the player to fit into gaps
		//decrease the interval of spawn as long as the cars accelerate
		var lane = Math.floor(Math.random() * 4);
		//idea: spawn 2 cars simultaneously
		var lane2 = Math.floor(Math.random() * 4);
		while (lane2 === lane){
			lane2 = Math.floor(Math.random() * 4);
		}
		var velocity = 4 + velocity_increase; 
		//idea: increase the velocity as long as the game progresses
		cars.push(new otherCar(lane, -100, velocity));
		cars.push(new otherCar(lane2, -100, velocity));
	}*/
	
	if (counter % (FPS * 5) === 25){
		cars.push(new otherCar(1, -100, 4)); //РАНЬШЕ ЗДЕСЬ БЫЛО 5 ЕСЛИ ЧО
		cars.push(new otherCar(3, -100, 6)); 
	}
	
	if (counter % (FPS * 5) === 50){
		cars.push(new otherCar(1, -100, 7)); 
		cars.push(new otherCar(3, -100, 7)); 
	}
	
	//КОРОЧЕ ВАЖНАЯ ТЕМА
	//скорость всех ТС будет ограничена в пределах, скажем, от 4,5 до 7
	//окончательное решение примет рандом
	//OTHER CARS' SPAWN -- end
	
	//FOR EACH CAR -- beginning
	for (var i = 0; i < cars.length; ++i){
		cars[i].draw(context); //draw
		/*if (player.checkCollision(cars[i]) === true){ //collisions
			gameOver();
		}*/
		for (var j = 0; j < cars.length; ++j){
			if (i !== j && cars[i].lane === cars[j].lane && 
					cars[i].positionY - cars[j].positionY >= (cars[j].velocity - cars[i].velocity) * 30 - cars[i].height &&
					//вот это число в правой части напрямую зависит от разницы скоростей.
					//идея: добавить немного рандома?
					cars[i].positionY - cars[j].positionY < 0 &&
					cars[i].velocity > cars[j].velocity && 
					cars[j].isOvertaking === false){
				cars[j].overtake(cars[i], true); //алгоритм все еще не закончен: обгон всегда будет идти по левой полосе.
			} 
		}
		cars[i].move(); //move
		if (cars[i].positionY > screenWidth){ //delete if out of the screen
			cars.splice(i, 1); 
			i--;
		}
	}
	//FOR EACH CAR -- end
	
	context.fillText(counter, 5, 20); //display FPS counter
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

function otherCar (lane, y, velocity){
	this.texture = new Image();
	this.texture.src = "img/blue_priora_40.png";
	this.lane = lane;
	this.positionX = (lane + 1) * screenWidth / 6 + (screenWidth / 6 - CAR_WIDTH) / 2;
	this.positionY = y;
	this.height = CAR_HEIGHT;
	this.width = CAR_WIDTH;
	//this.initialVelocity = velocity;
	this.velocity = velocity;
	this.direction = DIRECTION_DIRECT; //others are "left = -1" & "right = 1"
	this.isOvertaking = false;
	this.overtakeCounter = -1;
	this.draw = function(context){
		context.drawImage(this.texture, this.positionX, this.positionY);
	};
	this.move = function(){
		this.positionY += this.velocity;
		var displacementX = this.direction * screenWidth / 6 / FRAMES_TO_CHANGE_LANE;
		this.positionX += displacementX;
		if (this.isOvertaking === true){
			console.log("position: " + this.positionX + " " + this.positionY + ", displacementX = " +
					displacementX + ", direction = " + this.direction + ", lane = " + this.lane + ", velocity = " + 
					this.velocity);
		}
		this.overtakeCounter--;
		if (this.overtakeCounter === 0){
			this.direction = DIRECTION_DIRECT;
			this.lane += 1; //меняем полосу
			this.isOvertaking = false;
			//this.velocity = this.initialVelocity;
			console.log("direction changed to direct, velocity = " + this.velocity);
		}
		//multiplier is the velocity needed do make 
		//the width of a stripe in 12 frames. basically, 5, 0 or -5.
	};
	this.overtake = function(car2, leftDirection){
		console.log("overtake started: overtaking.y = " + this.positionY + ", overtaken.y = " + car2.positionY + ", car1.v = " + 
				this.velocity + ", car2.v = " + car2.velocity);
		//it presumes that the cars are on the same lane, the first car is 50 units close to the other
		//and their velocities differ by at least 2
		//direction: if true, car goes to the left (x decreases), otherwise right (x increases).
		//добавляем 2 к скорости обгоняющей машины
		this.isOvertaking = true;
		//this.velocity -= 2;
		//this.velocity = car2.velocity;
		
		var overtakeDistance = overtakingDistance * 2 + car2.height;
		//это часть того расстояния, что первой машине предстоит пройти.
		//выясняем, за какое время произойдет обгон:
		var overtakeTime = overtakeDistance / (this.velocity - car2.velocity); //pixels divided by pixels per frame
		//рассуждения в блокноте
		//получается, что 50 / car1.velocity машина будет смещаться из полосы в полосу, столько же - обратно, 
		//остальное время - ехать по полосе
		this.direction = leftDirection ? DIRECTION_LEFT : DIRECTION_RIGHT; //поехали менять полосу: это занимает 12 фреймов
		//это можно сделать, например, через setTimeout, но я, наверное, НЕ БУДУ
		//наверное, придется через каунтеры. ИЛИ НЕТ.
		this.overtakeCounter = FRAMES_TO_CHANGE_LANE;
		
		//последние два таймаута возвращают машину в изначальную полосу. если этого не надо, то 
		//их необходимо вычеркнуть и поправить немного кода вверху. (или нет.)
		/*setTimeout(function(){
			stillThis.direction = leftDirection ? DIRECTION_RIGHT : DIRECTION_LEFT;
		}, overtakeTime * FRAME_INTERVAL - FRAME_INTERVAL * FRAMES_TO_CHANGE_LANE);
		
		setTimeout(function(){
			stillThis.direction = DIRECTION_DIRECT;
			stillThis.lane += leftDirection ? 1 : -1; //возвращаемся на свою полосу
			stillThis.velocity += 2;
			stillThis.isOvertaking = false;
		}, overtakeTime * FRAME_INTERVAL);*/
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