"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plane = exports.Parachutist = exports.Boat = void 0;
var Boat = /** @class */ (function () {
    function Boat(canvas) {
        this.canvas = canvas;
        this.x = canvas.width / 2 - 40;
        this.y = canvas.height - canvas.height / 3; // Adjusted to be in the upper two-thirds
        this.speed = 5;
        this.image = new Image();
        this.image.src = 'resources/boat.png'; // Correct path to your boat image
    }
    Boat.prototype.draw = function (ctx) {
        ctx.drawImage(this.image, this.x, this.y, 80, 20);
    };
    Boat.prototype.update = function () {
        if (Boat.keys['ArrowLeft']) {
            this.x -= this.speed;
        }
        if (Boat.keys['ArrowRight']) {
            this.x += this.speed;
        }
        this.x = Math.max(0, Math.min(this.x, this.canvas.width - 80));
    };
    Boat.prototype.checkCollision = function (parachutist) {
        if (parachutist.x > this.x &&
            parachutist.x < this.x + 80 &&
            parachutist.y + 10 > this.y &&
            parachutist.y < this.y + 30) {
            parachutist.caught = true;
            parachutist.caughtTime = Date.now(); // Record the time the parachutist was caught
            return true;
        }
        return false;
    };
    Boat.keys = {}; // משתנה סטטי
    return Boat;
}());
exports.Boat = Boat;
var Parachutist = /** @class */ (function () {
    function Parachutist(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.caught = false;
        this.caughtTime = null;
        this.image = new Image();
        this.image.src = 'resources/parachutist.png'; // Path to your parachutist image
        this.releaseTime = Date.now();
    }
    Parachutist.prototype.draw = function (ctx) {
        if (Date.now() - this.releaseTime <= 3000 || !this.isOffScreen()) {
            ctx.drawImage(this.image, this.x - 15, this.y - 15, 30, 30); // Adjust dimensions as needed
        }
    };
    Parachutist.prototype.update = function () {
        if (!this.caught) {
            this.y += this.speed;
        }
    };
    Parachutist.prototype.isOffScreen = function () {
        return Date.now() - this.releaseTime > 3000;
    };
    Parachutist.prototype.isCaughtAndTimeExceeded = function () {
        return this.caught && this.caughtTime !== null && Date.now() - this.caughtTime > 1000;
    };
    return Parachutist;
}());
exports.Parachutist = Parachutist;
var Plane = /** @class */ (function () {
    function Plane(canvas) {
        this.canvas = canvas;
        this.x = 0;
        this.y = 50;
        this.speed = 2;
        this.image = new Image();
        this.image.src = 'resources/plane.png';
    }
    Plane.prototype.draw = function (ctx) {
        ctx.drawImage(this.image, this.x, this.y, 60, 20);
    };
    Plane.prototype.update = function () {
        this.x += this.speed;
        if (this.x > this.canvas.width) {
            this.x = -60;
        }
    };
    Plane.prototype.releaseParachutist = function () {
        return new Parachutist(this.x + 30, this.y + 20);
    };
    return Plane;
}());
exports.Plane = Plane;
var canvas;
var ctx;
var parachutists = [];
var points = 0;
var lives = 0;
var gameOver = false;
var plane;
var boat;
function gameLoop() {
    if (!ctx)
        return;
    if (Math.random() < 0.01) {
        parachutists.push(plane.releaseParachutist());
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var _i = 0, parachutists_1 = parachutists; _i < parachutists_1.length; _i++) {
        var parachutist = parachutists_1[_i];
        parachutist.update();
        parachutist.draw(ctx);
    }
    boat.update();
    boat.draw(ctx);
    plane.update();
    plane.draw(ctx);
    // Remove parachutists that have been off screen for more than 3 seconds or caught for more than 1 second
    for (var i = parachutists.length - 1; i >= 0; i--) {
        if (boat.checkCollision(parachutists[i])) {
            points += 10;
            parachutists.splice(i, 1);
        }
        else if (parachutists[i].isOffScreen()) {
            lives += 1;
            parachutists.splice(i, 1);
        }
    }
    // Display points and lives
    ctx.fillStyle = "black"; // Choose a color that contrasts with your background
    ctx.font = "20px Arial";
    ctx.fillText("Points: ".concat(points), 15, 30);
    ctx.fillText("Lives: ".concat(lives), 15, 60);
    if (lives > 2) {
        gameOver = true;
    }
    if (gameOver) {
        drawGameOver(ctx);
    }
    else {
        requestAnimationFrame(gameLoop);
    }
}
function drawGameOver(ctx) {
    ctx.fillStyle = "red";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var x = canvas.width / 2;
    var y = canvas.height / 2;
    ctx.fillText("Game Over", x, y);
}
function resetGame() {
    points = 0;
    lives = 0;
    gameOver = false;
    parachutists.length = 0;
    plane.x = 0;
    boat = new Boat(canvas);
    gameLoop();
}
function init() {
    canvas = document.getElementById("gameCanvas");
    var context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Could not get canvas context");
    }
    ctx = context;
    window.addEventListener('keydown', function (e) {
        Boat.keys[e.key] = true;
    });
    window.addEventListener('keyup', function (e) {
        Boat.keys[e.key] = false;
    });
    plane = new Plane(canvas);
    boat = new Boat(canvas);
    gameLoop();
}
var restartButton = document.getElementById("restartButton");
if (restartButton) {
    restartButton.addEventListener("click", resetGame);
}
window.onload = init;
