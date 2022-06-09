    // variables to tinker with
    var acceleration = 0.008;
    var strikerForce = 0.015;
    var standardSpeed = 8;
    var maxStrikerSpeed = 100;
    var maxPuckSpeed = 50;
    var goalWidth = 120;
    var strikerResponsiveness = 3;
    var computerResponsiveness = 8;
    var maxScore = 5;

    // borderlines for striker moving
    var topBottom;
    var bottomTop;

    // puck stuff
    var puckX;
    var puckY;
    var puckXVel = standardSpeed * Math.cos(Math.PI / 3);
    var puckYVel = standardSpeed * Math.sin(Math.PI / 3);
    var puckRadius = 15;
    var puckAlive = false;
    var puckInGoal = false;
    var playersPuck = true;
    
    // striker stuff
    var strikerX;
    var strikerY;
    var strikerXVel = 0;
    var strikerYVel = 0;
    var strikerRadius = 25;

    // computer stuff
    var computerX;
    var computerY;
    var computerXVel = 0;
    var computerYVel = 0;
    var computerGoToX = 0;
    var computerGoToY = 0;
    var computerGoingToAttack = false;
    
    // mouse stuff
    var mouseX;
    var mouseY;

    // scores
    var scorePlayer = 0;
    var scoreComp = 0;
    var gameOver = false;

    // message
    var messageOn = true;
    var message = "CLICK TO BEGIN";
    var messageBottom = "CLICK TO PLAY AGAIN";
    
    window.onload = function() {
        
        // create canvasses
        canv = document.getElementById("airhockey");
        c = canv.getContext("2d");

        canv.addEventListener("touchend", getClick, false);
        setInterval(game, 1000/30);
        
        topBottom = canv.height * 0.38;
        bottomTop = canv.height * 0.62;
        
        puckX = canv.width / 2;
        puckY = canv.height / 2;
        
        strikerX = computerX = mouseX = canv.width / 2;
        strikerY = mouseY = (canv.height + bottomTop) / 2;
        computerY = topBottom / 2;
        
        computerGoToX = canv.width / 2;
        computerGoToY = 50;
    }
    
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt['0'].clientX - rect.left,
            y: evt['0'].clientY - rect.top
        };
    }
    
    function getClick(evt) {
        if (messageOn) {
            messageOn = false;
            if (!puckAlive) {
                resetGame();
            }
        }
    }
    
    function game() {
        // reset screen

        c.clearRect(0, 0, canv.width, canv.height);
        update();

        // check if puck is in a goal

        var leftGoalPost = canv.width / 2 - goalWidth / 2 + puckRadius / 2;
        var rightGoalPost = canv.width / 2 + goalWidth / 2 - puckRadius / 2;

        if (!puckInGoal && puckX > leftGoalPost && puckX < rightGoalPost && (puckY <= 0 || puckY >= canv.height)) {
            puckInGoal = true;
        }
        if (puckAlive && puckInGoal && puckY <= -puckRadius) {
            puckAlive = false;
            scorePlayer++;
            playersPuck = false;
            messageOn = true;
            message = "CLICK TO CONTINUE";
            if (scorePlayer == maxScore) {
                message = "GAME OVER! YOU WIN!";
                gameOver = true;
            }
        } else if (puckAlive && puckInGoal && puckY >= canv.height + puckRadius) {
            puckAlive = false;
            scoreComp++;
            playersPuck = true;
            messageOn = true;
            message = "CLICK TO CONTINUE";
            if (scoreComp == maxScore) {
                message = "GAME OVER! YOU LOSE!";
                gameOver = true;
            }
        }
        if (messageOn) {
            puckX = canv.width / 2;
            puckY = canv.height / 2;
        }

        // update puck location
        
        var leftEdge = puckInGoal ? leftGoalPost + puckRadius / 2 : puckRadius;
        var rightEdge = puckInGoal ? rightGoalPost - puckRadius / 2 : canv.width - puckRadius;

        if (puckAlive) {
            puckX += puckXVel;
            puckY += puckYVel;
            if (puckX > rightEdge && puckXVel > 0) {
                puckXVel = -puckXVel;
                puckX = rightEdge;
            } else if (puckX < leftEdge && puckXVel < 0) {
                puckXVel = -puckXVel;
                puckX = leftEdge;
            } else if (puckY > canv.height - puckRadius && puckYVel > 0 && !(puckX > leftGoalPost && puckX < rightGoalPost)) {
                puckYVel = -puckYVel;
                puckY = canv.height - puckRadius;
            } else if (puckY < puckRadius && puckYVel < 0 && !(puckX > leftGoalPost && puckX < rightGoalPost)) {
                puckYVel = -puckYVel;
                puckY = puckRadius;
            }

            if (!(puckX > leftGoalPost && puckX < rightGoalPost))
                puckY = Math.min(Math.max(puckY, puckRadius), canv.height - puckRadius);
        }

        // detect mouse position and update striker location and speed
        
        var contador = 0;
        canv.addEventListener("touchmove", function ({changedTouches}) {
            // console.log(changedTouches);
            contador += 1;
            // console.log(contador);
            if(contador == 30){
                var mousePos = getMousePos(canv, changedTouches);
                mouseX = Math.min(Math.max(mousePos.x, strikerRadius), canv.width - strikerRadius);
                mouseY = Math.min(Math.max(mousePos.y, canv.height / 2 + strikerRadius), canv.height - strikerRadius);
                contador = 0;
            }
        });

        strikerXVel = mouseX - strikerX;
        strikerYVel = mouseY - strikerY;

        if (strikerXVel > maxStrikerSpeed) {
            strikerXVel = maxStrikerSpeed;
        } else if (strikerXVel < -maxStrikerSpeed) {
            strikerXVel = -maxStrikerSpeed;
        } else if (strikerYVel > maxStrikerSpeed) {
            strikerYVel = maxStrikerSpeed;
        } else if (strikerYVel < -maxStrikerSpeed) {
            strikerYVel = -maxStrikerSpeed;
        }
        
        strikerX += strikerXVel / strikerResponsiveness;
        strikerY += strikerYVel / strikerResponsiveness;

        // detect collision of puck and striker

        var xDif = strikerX - puckX;
        var yDif = strikerY - puckY;
        var distance = Math.sqrt(Math.pow(xDif, 2) + Math.pow(yDif, 2));
        if (distance <= strikerRadius + puckRadius && !messageOn) {
            var angle = Math.atan((puckY - strikerY)/(puckX - strikerX));
            angle = xDif < 0 ? angle : Math.PI + angle;

            puckX = strikerX + (strikerRadius + puckRadius) * Math.cos(angle);
            puckX = Math.min(Math.max(puckX, puckRadius), canv.width - puckRadius);
            puckY = strikerY + (strikerRadius + puckRadius) * Math.sin(angle);
            puckY = Math.min(puckY, canv.height - puckRadius);

            angle = Math.atan((puckY - strikerY)/(puckX - strikerX));
            angle = xDif < 0 ? angle : Math.PI + angle;

            var strikerSpeed = Math.sqrt(Math.pow(strikerXVel, 2) + Math.pow(strikerYVel, 2));

            puckXVel = standardSpeed * Math.cos(angle) * Math.pow(1 + strikerForce, strikerSpeed);
            puckYVel = standardSpeed * Math.sin(angle) * Math.pow(1 + strikerForce, strikerSpeed);

            if (puckX >= canv.width - puckRadius || puckX <= puckRadius || puckY >= canv.height - puckRadius) {
                strikerX = puckX - (strikerRadius + puckRadius) * Math.cos(angle);
                strikerY = puckY - (strikerRadius + puckRadius) * Math.sin(angle);
            }
        }

        // move the computer's striker

        if (puckAlive)
            guardAI(puckX, puckY);
        else
            followAI(canv.width / 2, topBottom / 2)

        // detect collision of puck and computer

        var xDif = computerX - puckX;
        var yDif = computerY - puckY;
        var distance = Math.sqrt(Math.pow(xDif, 2) + Math.pow(yDif, 2));
        if (distance <= strikerRadius + puckRadius) {
            var angle = Math.atan((puckY - computerY)/(puckX - computerX));
            angle = xDif < 0 ? angle : Math.PI + angle;

            puckX = computerX + (strikerRadius + puckRadius) * Math.cos(angle);
            puckX = Math.min(Math.max(puckX, puckRadius), canv.width - puckRadius);
            puckY = computerY + (strikerRadius + puckRadius) * Math.sin(angle);
            puckY = Math.min(Math.max(puckY, puckRadius), canv.height - puckRadius);

            angle = Math.atan((puckY - computerY)/(puckX - computerX));
            angle = xDif < 0 ? angle : Math.PI + angle;

            var computerSpeed = Math.sqrt(Math.pow(computerXVel, 2) + Math.pow(computerYVel, 2));

            puckXVel = standardSpeed * Math.cos(angle) * Math.pow(1 + strikerForce, computerSpeed);
            puckYVel = standardSpeed * Math.sin(angle) * Math.pow(1 + strikerForce, computerSpeed);

            if (puckX >= canv.width - puckRadius || puckX <= puckRadius || puckY >= canv.height - puckRadius) {
                computerX = puckX - (strikerRadius + puckRadius) * Math.cos(angle);
                computerY = puckY - (strikerRadius + puckRadius) * Math.sin(angle);
            }
            
            computerGoToX = canv.width / 2 - goalWidth / 2 + Math.random() * goalWidth;
            computerGoToY = Math.random() * topBottom / 2 + 10;
        }

        // accelerate puck

        var puckSpeed = Math.sqrt(Math.pow(puckXVel, 2) + Math.pow(puckYVel, 2));
        //c.font = "14px Arial";
        //c.textAlign = "center";
        //c.fillText(puckSpeed, canv.width / 2, 100);

        if (puckSpeed > maxPuckSpeed) {
            var scalar = maxPuckSpeed / puckSpeed;
            puckXVel *= scalar;
            puckYVel *= scalar;
        } else if (puckSpeed > standardSpeed) {
            puckXVel *= (1 - acceleration);
            puckYVel *= (1 - acceleration);
        } else if (puckSpeed < standardSpeed) {
            var scalar = standardSpeed / puckSpeed;
            puckXVel *= scalar;
            puckYVel *= scalar;
        }
    }



    function followAI(pX, pY) {
        // just tracks the puck and follows it
        targetX = Math.min(Math.max(pX, strikerRadius), canv.width - strikerRadius);
        targetY = Math.min(Math.max(pY, strikerRadius), canv.height/2 - strikerRadius);

        computerXVel = targetX - computerX;
        computerYVel = targetY - computerY;

        if (computerXVel > maxStrikerSpeed) {
            computerXVel = maxStrikerSpeed;
        } else if (computerXVel < -maxStrikerSpeed) {
            computerXVel = -maxStrikerSpeed;
        } else if (computerYVel > maxStrikerSpeed) {
            computerYVel = maxStrikerSpeed;
        } else if (computerYVel < -maxStrikerSpeed) {
            computerYVel = -maxStrikerSpeed;
        }
        
        computerX += computerXVel / computerResponsiveness;
        computerY += computerYVel / computerResponsiveness;
    }

    function guardAI(pX, pY) {
        // guards the goal sometimes, hits the puck sometimes
        if (puckY <= puckRadius + 2 || puckY > topBottom || (puckYVel > 5 && Math.random() < 0.95 && !computerGoingToAttack)) {
            computerGoingToAttack = false;
            computerResponsiveness = 12;
            followAI(computerGoToX, computerGoToY);
            if (Math.random() < 0.05) {
                computerGoToX = canv.width / 2 - goalWidth / 2 + Math.random() * goalWidth;
                computerGoToY = Math.random() * topBottom / 2 + 10;
            }
        } else {
            computerGoingToAttack = true;
            computerResponsiveness = 8;
            followAI(puckX, puckY);
        }
    }

    function resetGame() {
        // reset game after a goal
        puckX = canv.width / 2;
        puckY = canv.height / 2;

        var newAngle = (playersPuck ? Math.PI / 3 : 4 * Math.PI / 3);
        if (Math.random() < 0.5)
            newAngle += Math.PI / 3;

        puckXVel = standardSpeed * Math.cos(newAngle);
        puckYVel = standardSpeed * Math.sin(newAngle);
        puckAlive = true;
        puckInGoal = false;
        if (gameOver) {
            scorePlayer = 0;
            scoreComp = 0;
            gameOver = false;
        }
    }
    
    function update() {
        // goals
        c.fillStyle = "black";
        c.fillRect(canv.width / 2 - goalWidth / 2, 0, goalWidth, 10);
        c.fillRect(canv.width / 2 - goalWidth / 2, canv.height - 10, goalWidth, 10);

        // scores
        c.font = "bold 120px Arial";
        c.fillStyle = "#EEE";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(scoreComp, canv.width / 2, topBottom / 2);
        c.fillText(scorePlayer, canv.width / 2, (bottomTop + canv.height) / 2);

        // messages
        if (messageOn) {
            c.font = "bold 28px Arial";
            c.fillStyle = "#B00";
            c.textBaseline = "bottom";
            c.fillText(message, canv.width / 2, topBottom);
        }
        if (gameOver) {
            c.textBaseline = "top";
            c.fillText(messageBottom, canv.width / 2, bottomTop);
        }

        // puck and strikers

        c.fillStyle = "black";
        c.beginPath();
        c.arc(puckX, puckY, puckRadius, 0, Math.PI * 2);
        c.fill();
        
        c.fillStyle = "#B00";
        c.beginPath();
        c.arc(strikerX, strikerY, strikerRadius, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#500";
        c.beginPath();
        c.arc(strikerX, strikerY, strikerRadius * 0.4, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#02B";
        c.beginPath();
        c.arc(computerX, computerY, strikerRadius, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#005";
        c.beginPath();
        c.arc(computerX, computerY, strikerRadius * 0.4, 0, Math.PI * 2);
        c.fill();
    }

    function Sound(src) {
        // sound processor, courtesy of w3schools
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = function(){
            this.sound.play();
        }
        this.stop = function(){
            this.sound.pause();
    }
}