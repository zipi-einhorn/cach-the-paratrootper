export interface Drawable {
    draw(ctx: CanvasRenderingContext2D): void;
    update(): void;
}

export class Boat implements Drawable {
    x: number;
    y: number;
    speed: number;
    image: HTMLImageElement;
    canvas: HTMLCanvasElement;
    static keys: { [key: string]: boolean } = {}; // משתנה סטטי

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.x = canvas.width / 2 - 40;
        this.y = canvas.height - canvas.height / 3; // Adjusted to be in the upper two-thirds
        this.speed = 5;
        this.image = new Image();
        this.image.src = 'resources/boat.png'; // Correct path to your boat image
    }

    draw(ctx: CanvasRenderingContext2D) {    
        ctx.drawImage(this.image, this.x, this.y, 80, 20);
    }

    update() {
        if (Boat.keys['ArrowLeft']) {
            this.x -= this.speed;
        }
        if (Boat.keys['ArrowRight']) {
            this.x += this.speed;
        }
        this.x = Math.max(0, Math.min(this.x, this.canvas.width - 80));
    }

    checkCollision(parachutist: Parachutist): boolean {
        if (
            parachutist.x > this.x &&
            parachutist.x < this.x + 80 &&
            parachutist.y + 10 > this.y &&
            parachutist.y < this.y + 30
        ) {
            parachutist.caught = true;
            parachutist.caughtTime = Date.now(); // Record the time the parachutist was caught
            return true;
        }
        return false;
    }
}

export class Parachutist implements Drawable {
    x: number;
    y: number;
    speed: number;
    caught: boolean;
    caughtTime: number | null;
    image: HTMLImageElement;
    releaseTime: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.caught = false;
        this.caughtTime = null;
        this.image = new Image();
        this.image.src = 'resources/parachutist.png'; // Path to your parachutist image
        this.releaseTime = Date.now();
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (Date.now() - this.releaseTime <= 3000 || !this.isOffScreen()) {
            ctx.drawImage(this.image, this.x - 15, this.y - 15, 30, 30); // Adjust dimensions as needed
        }
    }

    update() {
        if (!this.caught) {
            this.y += this.speed;
        }
    }

    isOffScreen(): boolean {
        return Date.now() - this.releaseTime > 3000;
    }

    isCaughtAndTimeExceeded(): boolean {
        return this.caught && this.caughtTime !== null && Date.now() - this.caughtTime > 1000;
    }
}

export class Plane implements Drawable {
    x: number;
    y: number;
    speed: number;
    image: HTMLImageElement;
    canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.x = 0;
        this.y = 50;
        this.speed = 2;
        this.image = new Image();
        this.image.src = 'resources/plane.png';
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.drawImage(this.image, this.x, this.y, 60, 20);
    }

    update() {
        this.x += this.speed;
        if (this.x > this.canvas.width) {
            this.x = -60;
        }
    }

    releaseParachutist(): Parachutist {
        return new Parachutist(this.x + 30, this.y + 20);
    }
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const parachutists: Parachutist[] = [];
let points = 0;
let lives = 0;
let gameOver = false;

let plane: Plane;
let boat: Boat;

function gameLoop() {
    if (!ctx) return;

    if (Math.random() < 0.01) {
        parachutists.push(plane.releaseParachutist());
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const parachutist of parachutists) {
        parachutist.update();
        parachutist.draw(ctx);
    }
    boat.update();
    boat.draw(ctx);

    plane.update();
    plane.draw(ctx);

    // Remove parachutists that have been off screen for more than 3 seconds or caught for more than 1 second
    for (let i = parachutists.length - 1; i >= 0; i--) {
        if (boat.checkCollision(parachutists[i])) {
            points += 10;
            parachutists.splice(i, 1);
        } else if (parachutists[i].isOffScreen()) {
            lives += 1;
            parachutists.splice(i, 1);
        }
    }

    // Display points and lives
    ctx.fillStyle = "black"; // Choose a color that contrasts with your background
    ctx.font = "20px Arial";
    ctx.fillText(`Points: ${points}`, 15, 30);
    ctx.fillText(`Lives: ${lives}`, 15, 60);

    if (lives > 2) {
        gameOver = true;
    }

    if (gameOver) {
        drawGameOver(ctx);
    } else {
        requestAnimationFrame(gameLoop);
    }
}

function drawGameOver(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const x = canvas.width / 2;
    const y = canvas.height / 2;

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
    canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Could not get canvas context");
    }

    ctx = context;

    window.addEventListener('keydown', (e) => {
        Boat.keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
        Boat.keys[e.key] = false;
    });

    plane = new Plane(canvas);
    boat = new Boat(canvas);
    gameLoop();
}

const restartButton = document.getElementById("restartButton");
if (restartButton) {
    restartButton.addEventListener("click", resetGame);
}

window.onload = init;
