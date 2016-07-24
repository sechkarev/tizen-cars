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

function rotaryDetentHandler(e){
	var direction = e.detail.direction;
	if (direction === "CW"){
	}
	else{
	}
}

function initializeField(){
	var height = screen.height;
	var width = screen.width;
	var canvas = document.getElementById("game");
	canvas.height = height;
	canvas.width = width;
	var x = canvas.getContext("2d");
	x.font='18px Verdana';
	setInterval(drawField, 40, x, width, height);
}

function drawField(context, screenWidth, screenHeight){
	context.fillStyle = "#c2b280";
	context.fillRect(0, 0, screenWidth, screenHeight);
}

initializeField();