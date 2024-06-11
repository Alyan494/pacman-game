const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const pacmanImg = new Image();
pacmanImg.src = 'https://i.postimg.cc/4HdMSMRT/pacman.png';

const ghost1Img = new Image();
ghost1Img.src = 'https://i.postimg.cc/5Q673C84/ghost1.png';

const ghost2Img = new Image();
ghost2Img.src = 'https://i.postimg.cc/dDxS05KL/ghost2.png';

const pacman = {
    x: 224,
    y: 248,
    dx: 0,
    dy: 0,
    size: 16,
    speed: 2
};

const ghosts = [
    { x: 208, y: 200, dx: 2, dy: 0, size: 16, image: ghost1Img, scared: false, direction: 'right' },
    { x: 240, y: 200, dx: -2, dy: 0, size: 16, image: ghost2Img, scared: false, direction: 'left' }
];

const walls = [
    { x: 0, y: 0, width: canvas.width, height: 16 },
    { x: 0, y: canvas.height - 16, width: canvas.width, height: 16 },
    { x: 0, y: 0, width: 16, height: canvas.height },
    { x: canvas.width - 16, y: 0, width: 16, height: canvas.height },
    { x: 64, y: 64, width: 320, height: 16 },
    { x: 64, y: 64, width: 16, height: 128 },
    // Add more walls here to create the maze
];

const dots = [];
const powerPellets = [];
for (let i = 16; i < canvas.width; i += 32) {
    for (let j = 16; j < canvas.height; j += 32) {
        if (!isWall(i, j)) {
            dots.push({ x: i, y: j });
            if (Math.random() < 0.1) {
                powerPellets.push({ x: i, y: j });
            }
        }
    }
}

function isWall(x, y) {
    return walls.some(wall => x > wall.x && x < wall.x + wall.width && y > wall.y && y < wall.y + wall.height);
}

function drawPacman() {
    ctx.drawImage(pacmanImg, pacman.x - pacman.size / 2, pacman.y - pacman.size / 2, pacman.size, pacman.size);
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        ctx.drawImage(ghost.image, ghost.x - ghost.size / 2, ghost.y - ghost.size / 2, ghost.size, ghost.size);
    });
}

function drawWalls() {
    ctx.fillStyle = 'blue';
    walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}

function drawDots() {
    ctx.fillStyle = 'white';
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    });
}

function drawPowerPellets() {
    ctx.fillStyle = 'orange';
    powerPellets.forEach(pellet => {
        ctx.beginPath();
        ctx.arc(pellet.x, pellet.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    });
}

function updatePacman() {
    const nextX = pacman.x + pacman.dx;
    const nextY = pacman.y + pacman.dy;

    if (!isWall(nextX, nextY)) {
        pacman.x = nextX;
        pacman.y = nextY;
    }

    dots.forEach((dot, index) => {
        if (Math.hypot(pacman.x - dot.x, pacman.y - dot.y) < pacman.size / 2) {
            dots.splice(index, 1);
        }
    });

    powerPellets.forEach((pellet, index) => {
        if (Math.hypot(pacman.x - pellet.x, pacman.y - pellet.y) < pacman.size / 2) {
            powerPellets.splice(index, 1);
            ghosts.forEach(ghost => ghost.scared = true);
            setTimeout(() => {
                ghosts.forEach(ghost => ghost.scared = false);
            }, 10000);
        }
    });
}

function updateGhosts() {
    ghosts.forEach(ghost => {
        const nextX = ghost.x + ghost.dx;
        const nextY = ghost.y + ghost.dy;

        if (!isWall(nextX, nextY)) {
            ghost.x = nextX;
            ghost.y = nextY;
        } else {
            changeGhostDirection(ghost);
        }

        if (Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y) < pacman.size / 2) {
            if (ghost.scared) {
                ghost.x = 208;
                ghost.y = 200;
                ghost.scared = false;
            } else {
                // End game or reduce life
                alert('Game Over!');
                resetGame();
            }
        }
    });
}

function changeGhostDirection(ghost) {
    const directions = [
        { dx: 2, dy: 0, direction: 'right' },
        { dx: -2, dy: 0, direction: 'left' },
        { dx: 0, dy: 2, direction: 'down' },
        { dx: 0, dy: -2, direction: 'up' }
    ];
    
    const possibleDirections = directions.filter(dir => {
        const nextX = ghost.x + dir.dx;
        const nextY = ghost.y + dir.dy;
        return !isWall(nextX, nextY);
    });

    if (possibleDirections.length > 0) {
        const newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        ghost.dx = newDirection.dx;
        ghost.dy = newDirection.dy;
        ghost.direction = newDirection.direction;
    }
}

function resetGame() {
    pacman.x = 224;
    pacman.y = 248;
    pacman.dx = 0;
    pacman.dy = 0;

    ghosts.forEach(ghost => {
        ghost.x = 208;
        ghost.y = 200;
        ghost.dx = 2;
        ghost.dy = 0;
        ghost.scared = false;
    });

    dots.length = 0;
    powerPellets.length = 0;
    for (let i = 16; i < canvas.width; i += 32) {
        for (let j = 16; j < canvas.height; j += 32) {
            if (!isWall(i, j)) {
                dots.push({ x: i, y: j });
                if (Math.random() < 0.1) {
                    powerPellets.push({ x: i, y: j });
                }
            }
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawWalls();
    drawDots();
    drawPowerPellets();
    drawPacman();
    drawGhosts();
    updatePacman();
    updateGhosts();

    requestAnimationFrame(gameLoop);
}

function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            pacman.dx = 0;
            pacman.dy = -pacman.speed;
            break;
        case 'ArrowDown':
            pacman.dx = 0;
            pacman.dy = pacman.speed;
            break;
        case 'ArrowLeft':
            pacman.dx = -pacman.speed;
            pacman.dy = 0;
            break;
        case 'ArrowRight':
            pacman.dx = pacman.speed;
            pacman.dy = 0;
            break;
    }
}

document.addEventListener('keydown', handleKeyDown);

document.getElementById('up').addEventListener('click', () => {
    pacman.dx = 0;
    pacman.dy = -pacman.speed;
});

document.getElementById('down').addEventListener('click', () => {
    pacman.dx = 0;
    pacman.dy = pacman.speed;
});

document.getElementById('left').addEventListener('click', () => {
    pacman.dx = -pacman.speed;
    pacman.dy = 0;
});

document.getElementById('right').addEventListener('click', () => {
    pacman.dx = pacman.speed;
    pacman.dy = 0;
});

requestAnimationFrame(gameLoop);