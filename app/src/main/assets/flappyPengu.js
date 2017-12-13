var canvas;
var canvasContext;
var canvasX;
var canvasY;
var mouseIsDown = 0;

var gravity = 1000;
var jumpheight = -500;

var bkgdImage;
var pengu;

var pipes = [];
var timebetweenpipe = 3;
var timesincelastpipe = 0;

var lastPt = null;

var gameState = 0;

var score = 0;
var lives = 1;

var backgroundMusic = new Audio('background.mp3');
var flapSound = new Audio("flap.mp3");
var menuMusic = new Audio("menumusic.mp3");

var startTimeMS;

// load() is called upon script load, gets canvas and context along with setting some values and calling
// various starting functions and beginning the game loop.
function load(){

    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    init();

    // Set canvas position values
    canvasX = canvas.width/2;
    canvasY = canvas.height-30;

    // If a valid gameState is used then run the game loop.
    if(gameState < 4){
    gameLoop();
    }

}

// Object to store a pipe, a pipe is programmatically actually both parts of the pipe,
// both the top section and the bottom section which are then rendered using fillRects.
//
// Logic is inspired and derived from tutorial by "The Coding Train" on Youtube for Flappy Bird, reference available on wiki.
function Pipe(){

    // Used to generate a value for the height of the gap between the top and bottom sections.
    // Ranges between 150px and 425px.
    var pipespacing = Math.floor(Math.random() * 275 ) + 150;
    // Used to center a location that a passage between both pipe sections will be placed,
    // this is the location for the gap between both pipe sections and is randomly placed vertically.
    var pipegapcentering = Math.floor(Math.random() * canvas.height);

    // this.top is the top pipe section, this.bottom is the bottom pipe section, both seperated by x distance
    // where x is the pipespacing value, this seperation is centered at the pipegapcentering location.
    this.top = pipegapcentering - pipespacing / 2;
    this.bottom = canvas.height - (pipegapcentering + pipespacing / 2);
    this.x = canvas.width;
    this.pipewidth = 160;

    // this.speed is the value of the velocity at which the pipes move towards the player.
    this.speed = 8;

}

// Simple render function, this will render a fillRect for bothm the top and bottom
// sections in the colour blue.
Pipe.prototype.render = function(){

    canvasContext.fillStyle = "blue";
    canvasContext.fillRect(this.x, 0, this.pipewidth, this.top);
    canvasContext.fillRect(this.x, canvas.height-this.bottom, this.pipewidth, this.bottom);

}

// Update function, only handles the position of the pipes as a function of the speed and previous position.
Pipe.prototype.update = function(){

    this.x -= this.speed;

}

// Simple collision detection for the pipes, takes in aSprite as a parameter which is only
// the pengu in this program.
Pipe.prototype.collision = function(aSprite){

    // check if sprite is within the y positions that are filled with pipe.
    if(aSprite.y < this.top || aSprite.y > canvas.height - this.bottom){
        // check if the x value for the sprite is within the boundaries of the pipe x coords.
        if(aSprite.x > this.x && aSprite.x < this.x + this.pipewidth){
            return true;
        }
    }
    // If no collision return false.
    return false;

}

// Object to represent a sprite, contains coordinate values, axis velocities and image object and source.
function aSprite(x, y, imageSRC, velx, vely){

    this.zindex = 0;
    this.x = x;
    this.y = y;
    this.vx = velx;
    this.vy = vely;
    this.sImage = new Image();
    this.sImage.src = imageSRC;
}

// Function of sprite object to render given a specified set of dimensions (Only used for backgrounds).
aSprite.prototype.renderF = function(width, height){

    canvasContext.drawImage(this.sImage, this.x, this.y, width, height );

}

// Function of a sprite object to render without a given set of dimensions, will render at sprite dimensions.
aSprite.prototype.render = function(){

    canvasContext.drawImage(this.sImage, this.x, this.y);

}

// Function of sprite object to update, only used to handle position in relation to deltaTime and speed components.
aSprite.prototype.update = function(deltaTime){

    this.x += deltaTime * this.vx;
    this.y += deltaTime * this.vy;

}


// Initialize function, adds event listeners, adjusts canvas size, begins timer,
// check for gameState to make sure it's main menu and then start music and set background.
function init(){

    if(canvas.getContext){

        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('orientationchange', resizeCanvas, false);

        canvas.addEventListener('touchstart', touchDown, false);
        canvas.addEventListener('touchmove', touchXY, true);
        canvas.addEventListener('touchend', touchUp, false);

        document.body.addEventListener('touchcancel', touchUp, false);

        startTimeMS = Date.now();

        resizeCanvas();

            if(gameState == 0){

            menuMusic.play();
            bkgdImage = new aSprite(0, 0, "mainmenu.png", 0, 0);

            }
    }
}

// Used to scale the canvas to the REAL window dimensions, this updated function
// will stop extreme upscaling on high dpi devices due to device pixel ratio being scale factor.
function resizeCanvas(){

    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;

}

// Game loop, runs every frame.
function gameLoop(){

    // Update elapsed/deltaTime value.
    var elapsed = (Date.now() - startTimeMS)/1000;

    // If playing game, add more score and round score value that will be displayed.
    // Add deltaTime to timesincelastpipe, timesincelastpipe is used to spawn pipes every x time.
    if(gameState == 1){

        score += elapsed * 10;
        var scoreToDisplay = Math.round(score);
        timesincelastpipe += elapsed;

        // Check for life depletion, if less than 1 then take us to end menu.
        if(lives < 1){
            gameState = 2;
        }
    }

    var scoreToDisplay = Math.round(score);

    // Call update and render functions and update startTime.
    update(elapsed);
    render(elapsed);
    startTimeMS = Date.now();
    requestAnimationFrame(gameLoop);

    // If playing game then show user score at top left.
    if(gameState == 1){

        canvasContext.font = "30px Arial";
        canvasContext.fillStyle = "white";
        canvasContext.textAlign = "start";
        canvasContext.fillText("Score: " + scoreToDisplay, 10, 50);

    }

    // If in the end menu then stop game music and show user score and instructions.
    if(gameState == 2){

        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        canvasContext.font = "40px Arial";
        canvasContext.fillStyle = "white";
        canvasContext.textAlign = "center";
        canvasContext.fillText("Final Score: " + Math.round(score), canvas.width/2, canvas.height/2);
        canvasContext.font = "24px Arial";
        canvasContext.fillText("Tap to try again!", canvas.width/2, canvas.height/2 + 40);


    }
}

// Universal render function, used to call all other render functions and handle pipe logic.
function render(delta){

        // render background after clearing previous frame.
        canvasContext.clearRect(0, 0, canvas.height, canvas.width);
        bkgdImage.renderF(canvas.width, canvas.height);

        // If playing game...
        if(gameState == 1){

        // If x time has passed (x = timesincelastpipe) then create a new pipe and add to pipe array.
        if(timesincelastpipe >= timebetweenpipe){

            pipes.push(new Pipe());
            timesincelastpipe = 0;

        }

        // For each pipe in pipe array render then update position,
        // Check for collisions, if collision then remove life.
        for (var i = pipes.length-1; i >= 0; i--){

            pipes[i].render();
            pipes[i].update();

            if(pipes[i].collision(pengu)){

                lives--;
                bkgdImage.sImage.src = "endscreen.png";


            }

            // If a pipe is off screen to the left then splice pipe array.
            if(pipes[i].x < -pipes[i].pipewidth){

                pipes.splice(i, 1);

            }

        }

        // Render pengu.
        pengu.render();
        }


}

// Update used mostly for positional updates, called each frame.
function update(delta){

    // If playing game...
    if(gameState == 1){

    // If pengu has hit bottom of canvas or below bottom then set position to 1px from bottom.
    if (pengu.y > canvas.height - pengu.sImage.height){


                pengu.y = canvas.height - pengu.sImage.height - 1;
                pengu.vy = 0;

            }

            // If pengu has hit the top of the canvas or past this then set position to top of canvas.
            if(pengu.y < 0){

                pengu.y = 0;
                pengu.vy = 0;

            }

    // Take into account offset and check if pengu isn't off screen, if so perform physics calculation.
    if(!(pengu.y > canvas.height - pengu.sImage.height)){

        pengu.vy += gravity * delta;

    }
    // Update pengu.
    pengu.update(delta);
    }

}

// Function to perform actions when touch is finished.
function touchUp(evt){

    evt.preventDefault();
    lastPt = null;

}

// Function to perform actions when screen is touched.
function touchDown(evt){

    evt.preventDefault();

        // If playing game then call jump.
        if(gameState == 1){

        jump();

        }

        // If at main menu then start game and stop menu music and start in-game background music,
        // also change background to appropriate sprite and create a new pengu.
        if(gameState == 0){

        gameState = 1;

        menuMusic.pause();
        menuMusic.currentTime = 0;

        backgroundMusic.play();

        bkgdImage.sImage.src = "background.png";
        pengu = new aSprite(25,canvas.height/2,"Pengu.png", 0, 0);

        }

        // If on end menu then reset values for score, lives and clear pipes from array,
        // start background music for game again and change background to appropriate sprite.
        if(gameState == 2){

        score = 0;

        pipes = [];

        lives = 1;
        gameState = 1;

        backgroundMusic.play();

        bkgdImage.sImage.src = "background.png";
        pengu = new aSprite(25,canvas.height/2,"Pengu.png", 0, 0);

        }

    touchXY(evt);

}

// Used to determine touch location.
function touchXY(evt){

    evt.preventDefault();
    if(lastPt!=null){

        var touchX = evt.touches[0].pageX - canvas.offsetLeft;
        var touchY = evt.touches[0].pageY - canvas.offsetTop;

    }

    lastPt = {x:evt.touches[0].pageX, y:evt.touches[0].pageY};

}

// Function is virtually the same as touchDown, for commentary/documentation see touchDown section.
onclick = function(){

    if(gameState == 1){

    jump();

    }

    if(gameState == 0){

    menuMusic.pause();
    menuMusic.currentTime = 0;

    gameState = 1;

    backgroundMusic.play();

    bkgdImage.sImage.src = "background.png";
    pengu = new aSprite(25,canvas.height/2,"Pengu.png", 0, 0);

    }

    if(gameState == 2){

    score = 0;

    pipes = [];

    lives = 1;
    gameState = 1;

    backgroundMusic.play();

    bkgdImage.sImage.src = "background.png";
    pengu = new aSprite(25,canvas.height/2,"Pengu.png", 0, 0);

    }



}

// Used to play sounds when user clicks or taps screen, main function is to change jump velocity to
// create a jump.
function jump(){

    // Set sound playback time to 0 to restart playback if sound is currently playing.
    flapSound.currentTime=0;
    flapSound.play();

    // Set pengu speed to jump height, note not additive but explicitly set velocity.
    pengu.vy = jumpheight;

}

// Code base was derived from PumpkinShooter project available from GCULearn under labs,
// this code is credit to Robert Law at GCU, only some remnants remain of said code base.


