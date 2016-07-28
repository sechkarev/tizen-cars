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

const CAR_HEIGHT = 73;
const CAR_WIDTH = 35;

const playerVelocity = 9;
const overtakingDistance = 50;

var intervalID;

const FPS = 25;
const FRAME_INTERVAL = 1000 / FPS; //40

const DIRECTION_DIRECT = 0;
const DIRECTION_LEFT = -1;
const DIRECTION_RIGHT = 1;

const LIGHT_NONE = 0;
const LIGHT_LEFT = -1;
const LIGHT_RIGHT = 1;

const FRAMES_TO_CHANGE_LANE = 12;
const NUMBER_OF_LANES = 4;

const LIGHT_MARGIN_TOP = 8;
const LIGHT_MARGIN_BOTTOM = 16;
const LIGHT_MARGIN_LEFT = 8;
const LIGHT_MARGIN_RIGHT = 18;

var velocityIncrease = 0;
const velocityIncreasePerFrame = 0.002;
const MAXIMAL_VELOCITY_INCREASE = 4;

//TODO: добавить новые ТС (грузовик, трактор) (проблема: нет спрайтов)

//TODO: БД.
//TODO: переделать кнопки. дома: создать проект с тау и скопировать потом результат

var spawn_interval = FPS - 1;
var spawn_interval_decrease = 0; //что-то типа ускорения
const MAXIMAL_SPAWN_INTERVAL_DECREASE = 15; //15 здесь, похоже - оптимальный вариант

function rotaryDetentHandler(e){
	var direction = e.detail.direction;
	//нужно как-то научиться не регистрировать колесо два раза
	//костыль: 12 фреймов - это, в общем-то, не так много. не считывать инпут, пока поворот не завершится.
	if (player.turnCounter < 0){
		if (direction === "CW"){
			if (player.lane !== NUMBER_OF_LANES - 1){
				player.lane++; //теперь полоса меняется сразу же
				player.direction = DIRECTION_RIGHT;
				player.turnCounter = FRAMES_TO_CHANGE_LANE;
				console.log("the wheel turned clockwise");
			}
		}
		else{
			if (player.lane !== 0){
				player.lane--;
				player.direction = DIRECTION_LEFT;
				player.turnCounter = FRAMES_TO_CHANGE_LANE;
				console.log("the wheel turned counterclockwise");
			}
		}
	}
	else{ //поворот уже идет
		if (direction === "CW" && player.direction === DIRECTION_LEFT){
			player.lane++;
			player.direction = DIRECTION_RIGHT;
			player.turnCounter = FRAMES_TO_CHANGE_LANE - player.turnCounter;
			//ВЕРНУТЬСЯ НА ПРЕЖНЕЕ МЕСТО: вычислить, сколько фреймов для этого нужно
		}
		else if (direction === "CCW" && player.direction === DIRECTION_RIGHT){
			player.direction = DIRECTION_LEFT;
			player.turnCounter = FRAMES_TO_CHANGE_LANE - player.turnCounter;
			player.lane--;
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
	spawn_interval_decrease = 0;
	velocityIncrease = 0;
	var x = canvas.getContext("2d");
	x.font='18px Verdana';
	for (var i = 0; i < 3; ++i){
		stripes.push([]);
		for (var j = 0; j < 5; j++){
			stripes[i].push(new stripe(width / 6 * (i + 2), stripeHeight * j * 2));
		}
	}
	player = new playerSprite(1, (screenHeight - CAR_HEIGHT) / 10 * 9); 
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
	
	player.draw(context); //DRAWING PLAYER
	player.move();
	counter++;
	if (velocityIncrease < MAXIMAL_VELOCITY_INCREASE){
		velocityIncrease += velocityIncreasePerFrame;
	}
	
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
	
	/*if (counter % (FPS * 5) === 25){
		cars.push(new otherCar(2, -100, 4.5)); //РАНЬШЕ ЗДЕСЬ БЫЛО 5 ЕСЛИ ЧО
		cars.push(new otherCar(3, -100, 6)); 
	}
	
	if (counter % (FPS * 5) === 50){
		cars.push(new otherCar(2, -100, 7)); 
		cars.push(new otherCar(3, -100, 7)); 
	}*/
	
	//а теперь я просто попробую наспавнить много машинок и посмотреть, что получится
	//идея: не спавнить новые машинки на той линии, где находится игрок, если на соседних линиях
	//рядом с ним находятся машинки
	if (counter % (FPS * 5) === 0 && spawn_interval_decrease < MAXIMAL_SPAWN_INTERVAL_DECREASE){ //каждые 5 секунд 
		spawn_interval_decrease++; //ускорить спавн машинок
	}
	if (counter % FPS === spawn_interval){
		spawn_interval -= spawn_interval_decrease;
		if(spawn_interval < 0){
			spawn_interval += FPS;
		}
		var leftLaneCarPresent = (player.lane === 0); //если игрок движется по крайней слева линии
		//то это тоже стоит учесть
		var rightLaneCarPresent = (player.lane === (NUMBER_OF_LANES - 1));
		for (var i = 0; i < cars.length; ++i){
			if (cars[i].lane === player.lane - 1 && cars[i].positionY < player.positionY + CAR_HEIGHT){//and probably smth else
				leftLaneCarPresent = true;
			}
			if (cars[i].lane === player.lane + 1 && cars[i].positionY < player.positionY + CAR_HEIGHT){//and probably smth else
				rightLaneCarPresent = true;
			}
		}
		var spawnSameLaneAllowed = !(leftLaneCarPresent === true && rightLaneCarPresent === true);
		//если машины есть слева и справа, то спавнить машинку прямо перед игроком нельзя
		var lane = player.lane;
		//если слева или справа от игрока нет машинок, то новая заспавнится прямо перед ним.
		//скорость машины зависит от полосы, по которой она едет. 
		//(в реальной жизни обычно наоборот, но игры - это ложь.)
		/*if (Math.random() > 0.5){
			lane = player.lane;
		}
		else{
			lane = Math.floor(Math.random() * 4);
		}*/
		while (!spawnSameLaneAllowed && lane === player.lane){
			//увеличить вероятность спавна на наиболее удаленной полосе
			if (Math.random() < 0.5){
				while (lane <= player.lane + 1 && lane >= player.lane - 1){
					lane = Math.floor(Math.random() * 4);
				}
			}
			else{
				lane = Math.floor(Math.random() * 4);
			}
		}
		var velocity = Math.random() * 1.5 + (5 + lane / 2) + velocityIncrease; //точные цифры - в блокноте.
		var car = new otherCar(lane, -CAR_HEIGHT, velocity);
		console.log("new car spawned: lane = " + car.lane + ", velocity = " + car.velocity + ", #frame = " + counter + ", #frame in second = " + counter % FPS);
		cars.push(car);
		
	}
	//идея: обгонять тогда, когда становится понятно, что машины не доедут до края экрана без коллизии
	
	//КОРОЧЕ ВАЖНАЯ ТЕМА
	//скорость всех ТС будет ограничена в пределах, скажем, от 4,5 до 7
	//окончательное решение примет рандом
	//OTHER CARS' SPAWN -- end
	
	//FOR EACH CAR -- beginning
	for (var i = 0; i < cars.length; ++i){
		cars[i].draw(context); //draw
		if (player.checkCollision(cars[i]) === true){ //collisions
			gameOver();
		}
		for (var j = 0; j < cars.length; ++j){
			if (cars[j].isOvertaking === false && i !== j && cars[i].lane === cars[j].lane && 
			cars[i].positionY - cars[j].positionY >= (cars[j].velocity - cars[i].velocity) * 30 - cars[i].height &&
			//cars[i].positionY - cars[j].positionY >= cars[i].height * -2 && //i give up. maybe enhance later.
			//вот это число в правой части напрямую зависит от разницы скоростей.
			//идея: добавить немного рандома?
			cars[i].positionY - cars[j].positionY < 0 &&
			cars[i].velocity > cars[j].velocity){
				var leftLaneFree = (cars[j].lane !== 0); //если обгоняющая машина движется по крайней левой полосе, то 
				//обгон по левой полосе невозможен: ее просто нет
				var rightLaneFree = (cars[j].lane !== (NUMBER_OF_LANES - 1)); //аналогично с правой
				for (var k = 0; k < cars.length; ++k){ //O(n^3)
					if (cars[k].lane === cars[j].lane + 1){ //если на линии, куда может быть совершен обгон, 
						//есть другие автомобили, то обгон туда невозможен
						rightLaneFree = false;
					}
					else if (cars[k].lane === cars[j].lane - 1){ //аналогично
						leftLaneFree = false;
					}
				}
				if (cars[j].lane === player.lane - 1){ //машинка игрока не находится в векторе машинок, но ее тоже надо учитывать.
					rightLaneFree = false;
				} //по-хорошему, это надо бы как-то организовать с помощью наследования, но я не очень-то умею в джаваскрипт, а умные люди говорят мне, что местная механика наследования сильно отличается от привычных мне 
				if (cars[j].lane === player.lane + 1){ 
					leftLaneFree = false;
				}
				if (leftLaneFree === true){
					cars[j].overtake(cars[i], true);
					console.log("overtake started: left lane");
				}
				else if (rightLaneFree === true){
					cars[j].overtake(cars[i], false);
					console.log("overtake started: right lane");
				}
				else{ //когда обгон вроде бы и должен быть, но полос для него нет
					cars[j].velocity = cars[i].velocity; //снизить скорость во избежание аварии
					console.log("overtake is impossible: no free lanes");
				}
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

function playerSprite (lane, y){
	this.texture = new Image();
	this.texture.src = "img/violet_priora_35.png";
	this.lane = lane;
	this.positionX = (lane + 1) * screenWidth / 6 + (screenWidth / 6 - CAR_WIDTH) / 2;
	this.positionY = y;
	this.height = CAR_HEIGHT;
	this.width = CAR_WIDTH;
	this.draw = function(context){
		context.drawImage(this.texture, this.positionX, this.positionY);
	};
	this.direction = DIRECTION_DIRECT;
	this.turnCounter = -1;
	this.checkCollision = function(otherCar){
		if (this.positionX < otherCar.positionX + otherCar.width &&
			this.positionX + this.width > otherCar.positionX &&
			this.positionY < otherCar.positionY + otherCar.height &&
			this.height + this.positionY > otherCar.positionY) {
			return true;
		}
		return false;
	};
	this.move = function(){
		var displacementX = this.direction * screenWidth / 6 / FRAMES_TO_CHANGE_LANE;
		this.positionX += displacementX;
		this.turnCounter--;
		if (this.turnCounter === 0){
			this.direction = DIRECTION_DIRECT;
			console.log("player's lane = " + this.lane);
		}
	};
}

function otherCar (lane, y, velocity){
	this.texture = new Image();
	this.texture.src = "img/blue_priora_35.png";
	this.lightTexture = new Image();
	this.lightTexture.src = "img/star_30.gif";
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
	this.light = LIGHT_NONE;
	this.draw = function(context){
		context.drawImage(this.texture, this.positionX, this.positionY);
		if (this.light === LIGHT_LEFT){
			context.drawImage(this.lightTexture, this.positionX - LIGHT_MARGIN_LEFT, this.positionY - LIGHT_MARGIN_TOP);
			context.drawImage(this.lightTexture, this.positionX - LIGHT_MARGIN_LEFT, this.positionY + CAR_HEIGHT - LIGHT_MARGIN_BOTTOM);
		}
		else if (this.light === LIGHT_RIGHT){
			context.drawImage(this.lightTexture, this.positionX - LIGHT_MARGIN_RIGHT + CAR_WIDTH, this.positionY - LIGHT_MARGIN_TOP);
			context.drawImage(this.lightTexture, this.positionX - LIGHT_MARGIN_RIGHT + CAR_WIDTH, this.positionY - LIGHT_MARGIN_BOTTOM + CAR_HEIGHT);
		}
	};
	this.move = function(){
		this.positionY += this.velocity;
		var displacementX = this.direction * screenWidth / 6 / FRAMES_TO_CHANGE_LANE;
		this.positionX += displacementX;
		/*if (this.isOvertaking === true){
			console.log("position: " + this.positionX + " " + this.positionY + ", displacementX = " +
					displacementX + ", direction = " + this.direction + ", lane = " + this.lane + ", velocity = " + 
					this.velocity);
		}*/
		this.overtakeCounter--;
		if (this.overtakeCounter === 0){
			this.lane += this.direction; //меняем полосу
			this.direction = DIRECTION_DIRECT;
			this.isOvertaking = false;
			this.light = LIGHT_NONE;
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
		this.light = leftDirection ? LIGHT_LEFT : LIGHT_RIGHT;
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