// Game state
const gameState = {
    score: 0,
    lives: 3,
    gameOver: false,
    cooldown: 0,
    maxCooldown: 20,
    hyperspaceReady: true,
    hyperspaceCharge: 0,
    maxHyperspaceCharge: 100,
    difficulty: 1,
    lastAsteroidTime: 0,
    asteroidInterval: 2000,
    keys: {
        up: false,
        down: false,
        left: false,
        right: false,
        space: false,
        h: false
    },
    spaceship: {
        x: 0,
        y: 0,
        width: 40,
        height: 60,
        speed: 5,
        rotation: 0,
        velocityX: 0,
        velocityY: 0,
        friction: 0.95
    },
    asteroids: [],
    fragments: [],
    lasers: [],
    stars: {
        layer1: [],
        layer2: [],
        layer3: []
    }
};

// DOM elements
const elements = {
    gameContainer: document.getElementById('game-container'),
    spaceship: document.getElementById('spaceship'),
    engineFlame: document.getElementById('engine-flame'),
    score: document.getElementById('score'),
    lives: document.getElementById('lives'),
    cooldownBar: document.getElementById('cooldown-bar'),
    hyperspaceButton: document.getElementById('hyperspace-button'),
    hyperspaceCharge: document.getElementById('hyperspace-charge'),
    hyperspaceBar: document.getElementById('hyperspace-bar'),
    gameOver: document.getElementById('game-over'),
    finalScore: document.getElementById('final-score'),
    restartButton: document.getElementById('restart-button'),
    stars1: document.getElementById('stars1'),
    stars2: document.getElementById('stars2'),
    stars3: document.getElementById('stars3')
};

// Initialize game
function initGame() {
    // Clear existing game elements from DOM
    gameState.asteroids.forEach(asteroid => {
        if (asteroid.element && asteroid.element.parentNode) {
            asteroid.element.remove();
        }
    });

    gameState.fragments.forEach(fragment => {
        if (fragment.element && fragment.element.parentNode) {
            fragment.element.remove();
        }
    });

    gameState.lasers.forEach(laser => {
        if (laser.element && laser.element.parentNode) {
            laser.element.remove();
        }
    });

    // Reset game state
    gameState.score = 0;
    gameState.lives = 3;
    gameState.gameOver = false;
    gameState.cooldown = 0;
    gameState.hyperspaceReady = true;
    gameState.hyperspaceCharge = 0;
    gameState.difficulty = 1;
    gameState.lastAsteroidTime = 0;
    gameState.asteroidInterval = 2000;
    gameState.spaceship.x = window.innerWidth / 2 - gameState.spaceship.width / 2;
    gameState.spaceship.y = window.innerHeight / 2 - gameState.spaceship.height / 2;
    gameState.spaceship.velocityX = 0;
    gameState.spaceship.velocityY = 0;
    gameState.spaceship.rotation = 0;
    gameState.asteroids = [];
    gameState.fragments = [];
    gameState.lasers = [];

    // Clear existing stars
    elements.stars1.innerHTML = '';
    elements.stars2.innerHTML = '';
    elements.stars3.innerHTML = '';

    // Create stars for parallax background
    createStars(elements.stars1, 100, 'layer1');
    createStars(elements.stars2, 50, 'layer2');
    createStars(elements.stars3, 25, 'layer3');

    // Update UI
    updateScore();
    updateLives();
    updateCooldown();
    updateHyperspace();

    // Hide game over screen
    elements.gameOver.style.display = 'none';

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Create stars for background
function createStars(container, count, layer) {
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        container.appendChild(star);
    }
}

// Update score display
function updateScore() {
    elements.score.textContent = `SCORE: ${gameState.score}`;
}

// Update lives display
function updateLives() {
    elements.lives.innerHTML = '';
    for (let i = 0; i < gameState.lives; i++) {
        const life = document.createElement('div');
        life.className = 'life';
        elements.lives.appendChild(life);
    }
}

// Update cooldown display
function updateCooldown() {
    const percentage = (gameState.cooldown / gameState.maxCooldown) * 100;
    elements.cooldownBar.style.width = `${100 - percentage}%`;
}

// Update hyperspace display
function updateHyperspace() {
    if (gameState.hyperspaceReady) {
        elements.hyperspaceButton.disabled = false;
        elements.hyperspaceCharge.style.display = 'none';
    } else {
        elements.hyperspaceButton.disabled = true;
        elements.hyperspaceCharge.style.display = 'block';
        const percentage = (gameState.hyperspaceCharge / gameState.maxHyperspaceCharge) * 100;
        elements.hyperspaceBar.style.width = `${percentage}%`;
    }
}

// Handle keyboard input
function handleKeyDown(e) {
    if (gameState.gameOver) return;

    switch (e.key) {
        case 'ArrowUp':
            gameState.keys.up = true;
            break;
        case 'ArrowDown':
            gameState.keys.down = true;
            break;
        case 'ArrowLeft':
            gameState.keys.left = true;
            break;
        case 'ArrowRight':
            gameState.keys.right = true;
            break;
        case ' ':
            gameState.keys.space = true;
            break;
        case 'h':
        case 'H':
            if (gameState.hyperspaceReady) {
                activateHyperspace();
            }
            break;
    }
}

function handleKeyUp(e) {
    switch (e.key) {
        case 'ArrowUp':
            gameState.keys.up = false;
            break;
        case 'ArrowDown':
            gameState.keys.down = false;
            break;
        case 'ArrowLeft':
            gameState.keys.left = false;
            break;
        case 'ArrowRight':
            gameState.keys.right = false;
            break;
        case ' ':
            gameState.keys.space = false;
            break;
    }
}

// Activate hyperspace
function activateHyperspace() {
    gameState.hyperspaceReady = false;
    gameState.hyperspaceCharge = 0;
    updateHyperspace();

    // Teleport to random location with 10% chance of malfunction (hitting asteroid)
    const safeTeleport = Math.random() > 0.1;
    
    if (safeTeleport) {
        gameState.spaceship.x = Math.random() * (window.innerWidth - gameState.spaceship.width);
        gameState.spaceship.y = Math.random() * (window.innerHeight - gameState.spaceship.height);
        gameState.spaceship.velocityX = 0;
        gameState.spaceship.velocityY = 0;
    } else {
        // Malfunction - teleport into asteroid
        gameState.lives--;
        updateLives();
        if (gameState.lives <= 0) {
            gameOver();
        }
        
        // Still teleport but reduce lives
        gameState.spaceship.x = Math.random() * (window.innerWidth - gameState.spaceship.width);
        gameState.spaceship.y = Math.random() * (window.innerHeight - gameState.spaceship.height);
        gameState.spaceship.velocityX = 0;
        gameState.spaceship.velocityY = 0;
    }
}

// Create a new asteroid
function createAsteroid() {
    const size = Math.random() * 40 + 20;
    let x, y;
    
    // Determine spawn edge (0: top, 1: right, 2: bottom, 3: left)
    const edge = Math.floor(Math.random() * 4);
    
    switch (edge) {
        case 0: // top
            x = Math.random() * window.innerWidth;
            y = -size;
            break;
        case 1: // right
            x = window.innerWidth + size;
            y = Math.random() * window.innerHeight;
            break;
        case 2: // bottom
            x = Math.random() * window.innerWidth;
            y = window.innerHeight + size;
            break;
        case 3: // left
            x = -size;
            y = Math.random() * window.innerHeight;
            break;
    }
    
    // Calculate direction towards center with some randomness
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    let angle = Math.atan2(centerY - y, centerX - x);
    angle += (Math.random() - 0.5) * Math.PI / 2; // Add some randomness
    
    // Speed based on size (smaller = faster) and difficulty
    const speed = (1 + gameState.difficulty * 0.2) * (60 / size);
    
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    
    // Rotation speed
    const rotationSpeed = (Math.random() - 0.5) * 3;
    
    // Create asteroid element
    const asteroid = document.createElement('div');
    asteroid.className = 'asteroid';
    asteroid.style.width = `${size}px`;
    asteroid.style.height = `${size}px`;
    asteroid.style.left = `${x}px`;
    asteroid.style.top = `${y}px`;
    
    // Add surface details
    asteroid.innerHTML = `
        <style>
            #${asteroid.id}::before {
                width: ${size * 0.4}px;
                height: ${size * 0.4}px;
                top: ${size * 0.2}px;
                left: ${size * 0.1}px;
            }
            #${asteroid.id}::after {
                width: ${size * 0.3}px;
                height: ${size * 0.3}px;
                top: ${size * 0.6}px;
                left: ${size * 0.6}px;
            }
        </style>
    `;
    
    elements.gameContainer.appendChild(asteroid);
    
    // Add to game state
    gameState.asteroids.push({
        element: asteroid,
        x,
        y,
        size,
        velocityX,
        velocityY,
        rotation: 0,
        rotationSpeed,
        id: asteroid.id
    });
}

// Create fragments when asteroid is destroyed
function createFragments(x, y, size, count) {
    for (let i = 0; i < count; i++) {
        const fragmentSize = size / (Math.random() * 2 + 2);
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
        
        const fragment = document.createElement('div');
        fragment.className = 'fragment';
        fragment.style.width = `${fragmentSize}px`;
        fragment.style.height = `${fragmentSize}px`;
        fragment.style.left = `${x}px`;
        fragment.style.top = `${y}px`;
        
        elements.gameContainer.appendChild(fragment);
        
        gameState.fragments.push({
            element: fragment,
            x,
            y,
            size: fragmentSize,
            velocityX,
            velocityY,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 5,
            lifetime: 100 + Math.random() * 50
        });
    }
}

// Fire laser
function fireLaser() {
    if (gameState.cooldown > 0) return;
    
    gameState.cooldown = gameState.maxCooldown;
    updateCooldown();
    
    const laser = document.createElement('div');
    laser.className = 'laser';
    
    // Position laser at ship's nose
    const laserX = gameState.spaceship.x + gameState.spaceship.width / 2 - 2;
    const laserY = gameState.spaceship.y;
    
    laser.style.left = `${laserX}px`;
    laser.style.top = `${laserY}px`;
    
    elements.gameContainer.appendChild(laser);
    
    gameState.lasers.push({
        element: laser,
        x: laserX,
        y: laserY,
        velocityX: 0,
        velocityY: -10,
        lifetime: 60
    });
    
    // Animate laser beam
    setTimeout(() => {
        laser.style.height = '30px';
        laser.style.transition = 'height 0.05s ease-out';
    }, 10);
}

// Check collision between two objects
function checkCollision(obj1, obj2) {
    const dx = obj1.x + obj1.width / 2 - (obj2.x + obj2.size / 2);
    const dy = obj1.y + obj1.height / 2 - (obj2.y + obj2.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (obj1.width / 2 + obj2.size / 2);
}

// Game over
function gameOver() {
    gameState.gameOver = true;
    elements.finalScore.textContent = `FINAL SCORE: ${gameState.score}`;
    elements.gameOver.style.display = 'flex';
}

// Main game loop
function gameLoop(timestamp) {
    if (gameState.gameOver) return;
    
    // Update spaceship movement
    updateSpaceship();
    
    // Spawn asteroids
    if (timestamp - gameState.lastAsteroidTime > gameState.asteroidInterval / gameState.difficulty) {
        createAsteroid();
        gameState.lastAsteroidTime = timestamp;
        
        // Increase difficulty over time
        gameState.difficulty += 0.01;
        
        // Decrease asteroid interval (but don't go below 500ms)
        gameState.asteroidInterval = Math.max(500, gameState.asteroidInterval - 10);
    }
    
    // Update asteroids
    updateAsteroids();
    
    // Update fragments
    updateFragments();
    
    // Update lasers
    updateLasers();
    
    // Update cooldown
    if (gameState.cooldown > 0) {
        gameState.cooldown--;
        updateCooldown();
    }
    
    // Update hyperspace charge
    if (!gameState.hyperspaceReady) {
        gameState.hyperspaceCharge++;
        if (gameState.hyperspaceCharge >= gameState.maxHyperspaceCharge) {
            gameState.hyperspaceReady = true;
            gameState.hyperspaceCharge = 0;
        }
        updateHyperspace();
    }
    
    // Check for space key to fire laser
    if (gameState.keys.space && gameState.cooldown === 0) {
        fireLaser();
    }
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Update spaceship position and rotation
function updateSpaceship() {
    // Apply rotation
    if (gameState.keys.left) {
        gameState.spaceship.rotation = -20;
    } else if (gameState.keys.right) {
        gameState.spaceship.rotation = 20;
    } else {
        gameState.spaceship.rotation = 0;
    }
    
    // Apply thrust
    if (gameState.keys.up) {
        gameState.spaceship.velocityY = -gameState.spaceship.speed;
        elements.engineFlame.style.height = '20px';
    } else if (gameState.keys.down) {
        gameState.spaceship.velocityY = gameState.spaceship.speed / 2;
        elements.engineFlame.style.height = '10px';
    } else {
        elements.engineFlame.style.height = '0px';
        // Apply friction when not accelerating
        gameState.spaceship.velocityY *= gameState.spaceship.friction;
    }
    
    // Apply horizontal movement
    if (gameState.keys.left) {
        gameState.spaceship.velocityX = -gameState.spaceship.speed;
    } else if (gameState.keys.right) {
        gameState.spaceship.velocityX = gameState.spaceship.speed;
    } else {
        // Apply friction when not accelerating
        gameState.spaceship.velocityX *= gameState.spaceship.friction;
    }
    
    // Update position
    gameState.spaceship.x += gameState.spaceship.velocityX;
    gameState.spaceship.y += gameState.spaceship.velocityY;
    
    // Keep within bounds
    gameState.spaceship.x = Math.max(0, Math.min(window.innerWidth - gameState.spaceship.width, gameState.spaceship.x));
    gameState.spaceship.y = Math.max(0, Math.min(window.innerHeight - gameState.spaceship.height, gameState.spaceship.y));
    
    // Update DOM element
    elements.spaceship.style.left = `${gameState.spaceship.x}px`;
    elements.spaceship.style.top = `${gameState.spaceship.y}px`;
    elements.spaceship.style.transform = `rotate(${gameState.spaceship.rotation}deg)`;
}

// Update asteroids
function updateAsteroids() {
    for (let i = gameState.asteroids.length - 1; i >= 0; i--) {
        const asteroid = gameState.asteroids[i];
        
        // Update position
        asteroid.x += asteroid.velocityX;
        asteroid.y += asteroid.velocityY;
        asteroid.rotation += asteroid.rotationSpeed;
        
        // Update DOM element
        asteroid.element.style.left = `${asteroid.x}px`;
        asteroid.element.style.top = `${asteroid.y}px`;
        asteroid.element.style.transform = `rotate(${asteroid.rotation}deg)`;
        
        // Check if out of bounds
        if (asteroid.x < -asteroid.size * 2 || 
            asteroid.x > window.innerWidth + asteroid.size * 2 ||
            asteroid.y < -asteroid.size * 2 || 
            asteroid.y > window.innerHeight + asteroid.size * 2) {
            // Remove asteroid
            asteroid.element.remove();
            gameState.asteroids.splice(i, 1);
            continue;
        }
        
        // Check collision with spaceship
        if (checkCollision(gameState.spaceship, asteroid)) {
            // Remove asteroid
            asteroid.element.remove();
            gameState.asteroids.splice(i, 1);
            
            // Create fragments
            createFragments(asteroid.x, asteroid.y, asteroid.size, 3);
            
            // Reduce lives
            gameState.lives--;
            updateLives();
            
            if (gameState.lives <= 0) {
                gameOver();
                return;
            }
        }
        
        // Check collision with lasers
        for (let j = gameState.lasers.length - 1; j >= 0; j--) {
            const laser = gameState.lasers[j];
            
            // Simplified collision check for laser (point vs circle)
            const dx = laser.x + 2 - (asteroid.x + asteroid.size / 2);
            const dy = laser.y + 10 - (asteroid.y + asteroid.size / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < asteroid.size / 2) {
                // Remove laser
                laser.element.remove();
                gameState.lasers.splice(j, 1);
                
                // Remove asteroid
                asteroid.element.remove();
                gameState.asteroids.splice(i, 1);
                
                // Create fragments
                createFragments(asteroid.x, asteroid.y, asteroid.size, 3);
                
                // Add score (more points for larger asteroids)
                gameState.score += Math.floor(asteroid.size);
                updateScore();
                
                break;
            }
        }
    }
}

// Update fragments
function updateFragments() {
    for (let i = gameState.fragments.length - 1; i >= 0; i--) {
        const fragment = gameState.fragments[i];
        
        // Update position
        fragment.x += fragment.velocityX;
        fragment.y += fragment.velocityY;
        fragment.rotation += fragment.rotationSpeed;
        fragment.lifetime--;
        
        // Update DOM element
        fragment.element.style.left = `${fragment.x}px`;
        fragment.element.style.top = `${fragment.y}px`;
        fragment.element.style.transform = `rotate(${fragment.rotation}deg)`;
        fragment.element.style.opacity = `${fragment.lifetime / 150}`;
        
        // Check if expired or out of bounds
        if (fragment.lifetime <= 0 || 
            fragment.x < -fragment.size * 2 || 
            fragment.x > window.innerWidth + fragment.size * 2 ||
            fragment.y < -fragment.size * 2 || 
            fragment.y > window.innerHeight + fragment.size * 2) {
            // Remove fragment
            fragment.element.remove();
            gameState.fragments.splice(i, 1);
            continue;
        }
        
        // Check collision with spaceship
        if (checkCollision(gameState.spaceship, fragment)) {
            // Remove fragment
            fragment.element.remove();
            gameState.fragments.splice(i, 1);
            
            // Reduce lives
            gameState.lives--;
            updateLives();
            
            if (gameState.lives <= 0) {
                gameOver();
                return;
            }
        }
    }
}

// Update lasers
function updateLasers() {
    for (let i = gameState.lasers.length - 1; i >= 0; i--) {
        const laser = gameState.lasers[i];
        
        // Update position
        laser.y += laser.velocityY;
        laser.lifetime--;
        
        // Update DOM element
        laser.element.style.top = `${laser.y}px`;
        
        // Check if expired or out of bounds
        if (laser.lifetime <= 0 || laser.y < -20) {
            // Remove laser
            laser.element.remove();
            gameState.lasers.splice(i, 1);
        }
    }
}

// Event listeners
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
elements.restartButton.addEventListener('click', initGame);
elements.hyperspaceButton.addEventListener('click', activateHyperspace);

// Initialize game on window load
window.addEventListener('load', () => {
    // Set game container size
    elements.gameContainer.style.width = `${window.innerWidth}px`;
    elements.gameContainer.style.height = `${window.innerHeight}px`;
    
    // Start game
    initGame();
});

// Handle window resize
window.addEventListener('resize', () => {
    elements.gameContainer.style.width = `${window.innerWidth}px`;
    elements.gameContainer.style.height = `${window.innerHeight}px`;
});