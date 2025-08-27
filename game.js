// Snow Lamumus Game - JavaScript Implementation
class SnowBrosGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // start, playing, gameOver
        
        // Game properties
        this.lives = 3;
        this.level = 1; // Start from Level 1
        this.gravity = 0.35; // Reduced for slower jumping
        this.friction = 0.75;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.snowballs = [];
        this.platforms = [];
        this.particles = [];
        
        // Sound manager
        this.soundManager = new SoundManager();
        
        // Anger Level System
        this.angerLevel = 0; // 0% to 100%
        this.gameStartTime = Date.now();
        this.lastAngerUpdate = Date.now();
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        
        // Game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        
        this.initializeLevel();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Prevent default behavior for game keys to avoid page scrolling
            // Don't prevent system shortcuts (CMD+R, F5, etc.)
            if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase()) && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
            }
            
            // Only prevent 'r' key if it's not a system refresh (CMD+R, Ctrl+R)
            if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey && this.gameState === 'gameOver') {
                e.preventDefault();
            }
            
            if (e.key.toLowerCase() === 'r' && this.gameState === 'gameOver') {
                this.restartGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    initializeLevel() {
        // Load level based on current level number
        this.platforms = getLevelPlatforms(this.level);
        
        // Create player - on ground platform (530 - 86 = 444)
        this.player = new Player(100, 444, this);
        
        // Create enemies
        this.enemies = [];
        this.spawnEnemies();
    }
    
    // Level platforms are now handled by levels.js
    
    updateAngerLevel() {
        // Only update anger level if game is actively playing
        if (this.gameState !== 'playing') return;
        
        const currentTime = Date.now();
        const timeSinceLastUpdate = currentTime - this.lastAngerUpdate;
        
        // Every 10 seconds (10000ms), increase anger by 20%
        if (timeSinceLastUpdate >= 10000) {
            this.angerLevel = Math.min(this.angerLevel + 20, 100); // Max 100%
            this.lastAngerUpdate = currentTime;
            
            this.soundManager.playAngerIncrease(); // Play anger increase sound
            console.log(`🔥 ANGER LEVEL INCREASED: ${this.angerLevel}%`);
            
            // Update all existing enemies with new anger speed
            this.enemies.forEach(enemy => {
                enemy.updateAngerSpeed(this.angerLevel);
            });
            
            // Update UI to show new anger level
            this.updateUI();
        }
    }
    
    spawnEnemies() {
        // Level-based difficulty scaling - each level +10% difficulty
        const difficultyMultiplier = 1 + (this.level - 1) * 0.1; // Level 1=1.0x, Level 2=1.1x, Level 3=1.2x, Level 4=1.3x, Level 5=1.4x
        
        // Level-specific enemy counts with difficulty scaling
        let baseEnemies;
        if (this.level === 5) {
            baseEnemies = 5; // Level 5 always has 5 enemies
        } else {
            baseEnemies = 4; // Other levels have 4 enemies
        }
        
        const angerBonus = this.angerLevel >= 100 ? 1 : 0; // +1 enemy at 100% anger
        const totalEnemies = baseEnemies + angerBonus; // Base + anger bonus
        
        console.log(`🎯 LEVEL ${this.level}: Spawning ${totalEnemies} enemies (base=${baseEnemies} + anger bonus=${angerBonus})`);
        
        const playerX = this.player.x;
        const playerY = this.player.y;
        const minDistanceFromPlayer = 350; // Minimum distance from player - much farther
        
        // Get suitable spawn positions from platforms, far from player and each other
        const spawnPositions = [];
        this.platforms.forEach(platform => {
            if (platform.type !== 'ground' && platform.width >= 80) {
                // Add spawn points with more spacing to prevent clustering
                const minSpacing = 200; // Minimum distance between spawn points - more spread out
                const numSpawns = Math.max(1, Math.floor(platform.width / minSpacing));
                
                for (let i = 0; i < numSpawns; i++) {
                    const x = platform.x + (platform.width / (numSpawns + 1)) * (i + 1);
                    const y = platform.y - 30;
                    
                    // Check distance from player
                    const distanceFromPlayer = Math.sqrt(Math.pow(x - playerX, 2) + Math.pow(y - playerY, 2));
                    
                    // Check distance from other spawn positions
                    let tooCloseToOthers = false;
                    for (let pos of spawnPositions) {
                        const distanceFromOther = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                        if (distanceFromOther < 120) { // Minimum 120px between spawns
                            tooCloseToOthers = true;
                            break;
                        }
                    }
                    
                    if (distanceFromPlayer >= minDistanceFromPlayer && !tooCloseToOthers) {
                        spawnPositions.push({
                            x: x - 15, // Center the enemy
                            y: y,
                            distance: distanceFromPlayer,
                            platformIndex: this.platforms.indexOf(platform)
                        });
                    }
                }
            }
        });
        
        // Sort by distance from player (farthest first) for better distribution
        spawnPositions.sort((a, b) => b.distance - a.distance);
        
        // Spawn enemies with level-based difficulty scaling
        for (let i = 0; i < Math.min(totalEnemies, spawnPositions.length); i++) {
            const pos = spawnPositions[i];
            const enemy = new Enemy(pos.x, pos.y, this);
            
            // Apply level-based difficulty scaling
            enemy.baseSpeed *= difficultyMultiplier;
            enemy.maxSpeed *= difficultyMultiplier;
            enemy.currentSpeed *= difficultyMultiplier;
            enemy.jumpPower *= Math.min(difficultyMultiplier, 1.2); // Cap jump power increase at 20%
            
            // Level 5: Extra difficulty - more hunters and faster AI decisions
            if (this.level === 5) {
                enemy.isHunter = Math.random() < 0.7; // 70% chance to be hunter (vs 40% normally)
                enemy.pathfindingCooldown *= 0.5; // 50% faster pathfinding decisions
                enemy.acceleration *= 1.3; // 30% faster acceleration
            }
            
            enemy.updateAngerSpeed(this.angerLevel); // Apply current anger level
            this.enemies.push(enemy);
            
            console.log(`🔥 LEVEL ${this.level} ENEMY: Speed=${enemy.maxSpeed.toFixed(2)} (${difficultyMultiplier.toFixed(1)}x), Jump=${enemy.jumpPower.toFixed(1)}`);
        }
        
        // If we need more enemies and don't have enough platform positions, spawn on ground far from player
        if (this.enemies.length < totalEnemies) {
            const remaining = totalEnemies - this.enemies.length;
            for (let i = 0; i < remaining; i++) {
                // Spawn on opposite side of the screen from player - much farther
                const x = playerX < 400 ? (650 + i * 120) : (50 + i * 120);
                const enemy = new Enemy(x, 500, this);
                
                // Apply level-based difficulty scaling
                enemy.baseSpeed *= difficultyMultiplier;
                enemy.maxSpeed *= difficultyMultiplier;
                enemy.currentSpeed *= difficultyMultiplier;
                enemy.jumpPower *= Math.min(difficultyMultiplier, 1.2); // Cap jump power increase at 20%
                
                // Level 5: Extra difficulty - more hunters and faster AI decisions
                if (this.level === 5) {
                    enemy.isHunter = Math.random() < 0.7; // 70% chance to be hunter (vs 40% normally)
                    enemy.pathfindingCooldown *= 0.5; // 50% faster pathfinding decisions
                    enemy.acceleration *= 1.3; // 30% faster acceleration
                }
                
                enemy.updateAngerSpeed(this.angerLevel); // Apply current anger level
                this.enemies.push(enemy);
                
                console.log(`🔥 LEVEL ${this.level} GROUND ENEMY: Speed=${enemy.maxSpeed.toFixed(2)} (${difficultyMultiplier.toFixed(1)}x), Jump=${enemy.jumpPower.toFixed(1)}`);
            }
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.update(deltaTime);
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        
        // Check pushed enemy collisions with other enemies
        this.enemies.forEach(pushedEnemy => {
            if (pushedEnemy.isPushed && pushedEnemy.frozen && pushedEnemy.isRolling && 
                Math.abs(pushedEnemy.rollSpeed) > 1) { // Only if rolling fast enough
                this.enemies.forEach(otherEnemy => {
                    if (otherEnemy !== pushedEnemy && otherEnemy.active && 
                        this.checkCollision(pushedEnemy, otherEnemy)) {

                        // Destroy the other enemy
                        otherEnemy.destroy();
                        this.soundManager.playEnemyDeath(); // Play enemy death sound
                        // Chain kill bonus effect
                        this.addParticle(otherEnemy.x + otherEnemy.width/2, 
                                       otherEnemy.y + otherEnemy.height/2, '#FFD700');
                        
                        // Add more particles for dramatic effect
                        for (let i = 0; i < 5; i++) {
                            this.addParticle(
                                otherEnemy.x + Math.random() * otherEnemy.width,
                                otherEnemy.y + Math.random() * otherEnemy.height,
                                '#FFD700'
                            );
                        }
                    }
                });
            }
        });
        
        // Update snowballs
        this.snowballs.forEach(snowball => snowball.update(deltaTime));
        
        // Update particles
        this.particles.forEach(particle => particle.update(deltaTime));
        
        // Removed duplicate rolling snowball collision check - 
        // Only the isPushed check above should handle enemy-enemy collisions
        
        // Remove dead objects
        this.enemies = this.enemies.filter(enemy => enemy.active);
        this.snowballs = this.snowballs.filter(snowball => snowball.active);
        this.particles = this.particles.filter(particle => particle.active);
        
        // Check win condition
        if (this.enemies.length === 0) {
            this.soundManager.playLevelComplete(); // Play level complete sound
            this.playLogoAnimation(); // Play logo animation
            this.nextLevel();
        }
        
        // Check lose condition
        if (this.lives <= 0) {
            this.soundManager.playGameOver(); // Play game over sound
            this.gameOver();
        }
        
        // Update UI
        this.updateUI();
    }
    
    render() {
        // Performance optimization: Save and restore context state
        this.ctx.save();
        
        // Clear canvas efficiently
        this.ctx.fillStyle = '#E8F4FD';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background pattern
        this.drawBackground();
        
        // Draw platforms (optimized)
        this.platforms.forEach(platform => this.drawPlatform(platform));
        
        // Draw game objects
        if (this.gameState === 'playing') {
            this.player.render(this.ctx);
            this.enemies.forEach(enemy => enemy.render(this.ctx));
            this.snowballs.forEach(snowball => snowball.render(this.ctx));
            this.particles.forEach(particle => particle.render(this.ctx));
            
            // Draw UI info
            this.drawUI();
        }
        
        this.ctx.restore();
    }
    
    drawUI() {
        // UI info now shown in HTML header - canvas is clean
    }
    
    drawBackground() {
        // Draw checkered background pattern like original Snow Lamumus
        const levelIndex = ((this.level - 1) % 10) + 1;
        const colors = this.getBackgroundColors(levelIndex);
        
        const tileSize = 58; // 32 * 1.8
        for (let x = 0; x < this.canvas.width; x += tileSize) {
            for (let y = 0; y < this.canvas.height; y += tileSize) {
                const isEven = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
                this.ctx.fillStyle = isEven ? colors.primary : colors.secondary;
                this.ctx.fillRect(x, y, tileSize, tileSize);
            }
        }
        
        // Add some sparkle effects (reduced for performance)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 10; i++) { // Reduced from 30 to 10
            const x = (Date.now() * 0.01 + i * 100) % this.canvas.width;
            const y = (Date.now() * 0.02 + i * 50) % this.canvas.height;
            this.ctx.fillRect(x, y, 2, 2); // Use fillRect instead of arc for better performance
        }
    }
    
    getBackgroundColors(levelIndex) {
        const colorSchemes = [
            { primary: '#9B59B6', secondary: '#8E44AD' }, // Purple (Floor 1-3)
            { primary: '#E91E63', secondary: '#C2185B' }, // Pink (Floor 4-6)
            { primary: '#3498DB', secondary: '#2980B9' }, // Blue (Floor 7-9)
            { primary: '#E67E22', secondary: '#D35400' }, // Orange (Floor 10)
        ];
        
        if (levelIndex <= 3) return colorSchemes[0];
        if (levelIndex <= 6) return colorSchemes[1];
        if (levelIndex <= 9) return colorSchemes[2];
        return colorSchemes[3];
    }
    
    drawPlatform(platform) {
        if (platform.type === 'ground') {
            // Draw ground with gradient
            const gradient = this.ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
            gradient.addColorStop(0, '#8B4513');
            gradient.addColorStop(1, '#654321');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        } else {
            // Draw platform with Snow Lamumus style - orange with zigzag edges
            this.ctx.fillStyle = '#FF8C00';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add zigzag pattern on top edge
            this.ctx.fillStyle = '#FF6B00';
            const zigzagSize = 14; // 8 * 1.8
            for (let x = platform.x; x < platform.x + platform.width; x += zigzagSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, platform.y);
                this.ctx.lineTo(x + zigzagSize/2, platform.y - 4);
                this.ctx.lineTo(x + zigzagSize, platform.y);
                this.ctx.lineTo(x + zigzagSize, platform.y + 4);
                this.ctx.lineTo(x, platform.y + 4);
                this.ctx.closePath();
                this.ctx.fill();
            }
            
            // Add zigzag pattern on bottom edge
            for (let x = platform.x; x < platform.x + platform.width; x += zigzagSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, platform.y + platform.height);
                this.ctx.lineTo(x + zigzagSize/2, platform.y + platform.height + 4);
                this.ctx.lineTo(x + zigzagSize, platform.y + platform.height);
                this.ctx.lineTo(x + zigzagSize, platform.y + platform.height - 4);
                this.ctx.lineTo(x, platform.y + platform.height - 4);
                this.ctx.closePath();
                this.ctx.fill();
            }
            
            // Draw walls if specified in platform data
            if (platform.walls) {
                this.drawPlatformWalls(platform);
            }
        }
        
        // Add border
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    drawPlatformWalls(platform) {
        this.ctx.fillStyle = '#E67300'; // Darker orange for walls
        
        platform.walls.forEach(wall => {
            const wallWidth = wall.width || 8; // Default 8px if not specified
            
            switch(wall.type) {
                case 'left':
                    // Sol taraftan yukarı duvar
                    this.ctx.fillRect(platform.x, platform.y + platform.height, 
                                    wallWidth, wall.height);
                    break;
                case 'right':
                    // Sağ taraftan yukarı duvar
                    this.ctx.fillRect(platform.x + platform.width - wallWidth, platform.y + platform.height, 
                                    wallWidth, wall.height);
                    break;
                case 'left-down':
                    // Sol taraftan aşağı duvar
                    this.ctx.fillRect(platform.x, platform.y - wall.height, 
                                    wallWidth, wall.height);
                    break;
                case 'right-down':
                    // Sağ taraftan aşağı duvar
                    this.ctx.fillRect(platform.x + platform.width - wallWidth, platform.y - wall.height, 
                                    wallWidth, wall.height);
                    break;
            }
        });
    }
    
    gameLoop(currentTime) {
        // Initialize lastTime if not set
        if (!this.lastTime) {
            this.lastTime = currentTime;
        }
        
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent huge jumps during power mode/lag
        // This ensures consistent gameplay regardless of frame rate
        const maxDeltaTime = 50; // 50ms = 20 FPS minimum
        if (deltaTime > maxDeltaTime) {
            console.log(`⚠️ POWER MODE DETECTED: deltaTime capped from ${deltaTime.toFixed(1)}ms to ${maxDeltaTime}ms`);
            deltaTime = maxDeltaTime;
        }
        
        // Skip frame if deltaTime is too small (prevents micro-stutters)
        if (deltaTime < 1) {
            requestAnimationFrame(this.gameLoop);
            return;
        }
        
        // Only update game logic if playing
        if (this.gameState === 'playing') {
            // Update anger level system
            this.updateAngerLevel();
            
            this.update(deltaTime);
        }
        
        // Always render (for visual feedback)
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }
    
    start() {
        this.gameState = 'playing';
        document.getElementById('startScreen').classList.add('hidden');
        requestAnimationFrame(this.gameLoop);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    gameComplete() {
        this.gameState = 'gameComplete';
        this.soundManager.playLevelComplete(); // Play victory sound
        
        // Show game complete screen
        document.getElementById('gameCompleteScreen').classList.remove('hidden');
        
        // Play final logo animation
        this.playLogoAnimation();
        
        console.log('🎉 GAME COMPLETED! All 5 levels finished!');
    }
    
    restart() {
        this.gameState = 'playing';
        this.lives = 3;
        this.level = 1; // Restart from Level 1
        this.enemies = [];
        this.snowballs = [];
        this.particles = [];
        
        // Reset anger level system
        this.angerLevel = 0;
        this.gameStartTime = Date.now();
        this.lastAngerUpdate = Date.now();
        
        // Hide all screens
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('gameCompleteScreen').classList.add('hidden');
        this.initializeLevel();
    }
    
    nextLevel() {
        // Check if game is completed (Level 5 finished)
        if (this.level >= 5) {
            this.gameComplete();
            return;
        }
        
        this.level++;
        this.snowballs = [];
        this.particles = [];
        
        // Reset anger level system for new level
        this.angerLevel = 0;
        this.gameStartTime = Date.now();
        this.lastAngerUpdate = Date.now();
        console.log(`🎉 LEVEL ${this.level}: Anger level reset to 0%`);
        
        // Update platforms for new level
        this.platforms = getLevelPlatforms(this.level);
        
        // Reset player position
        this.player.x = 100;
        this.player.y = 444;
        this.player.vx = 0;
        this.player.vy = 0;
        
        // Spawn new enemies
        this.spawnEnemies();
        
        // Update UI to show reset anger level
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('angerLevel').textContent = this.angerLevel + '%';
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
        
        // Update anger level color
        const angerElement = document.getElementById('angerLevel');
        const angerContainer = angerElement.parentElement;
        if (this.angerLevel < 40) {
            angerContainer.style.color = '#00FF00'; // Green
        } else if (this.angerLevel < 80) {
            angerContainer.style.color = '#FFA500'; // Orange
        } else {
            angerContainer.style.color = '#FF0000'; // Red
        }
    }
    
    playLogoAnimation() {
        const logo = document.querySelector('.game-logo');
        if (logo) {
            // Add animation class
            logo.classList.add('level-complete');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                logo.classList.remove('level-complete');
            }, 2000); // 2 seconds animation duration
            
            console.log('🎉 Logo animation started for level complete!');
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    addParticle(x, y, color = '#FFFFFF') {
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
}

// Player class
let game;

// Global functions for HTML buttons
function startGame() {
    if (!game) {
        game = new SnowBrosGame();
    }
    game.start();
}

function restartGame() {
    if (game) {
        game.restart();
    }
}

// DEV MODE: Jump to specific level
function jumpToLevel(levelNumber) {
    if (game) {
        console.log(`🎮 DEV: Jumping to Level ${levelNumber}`);
        game.level = levelNumber;
        game.angerLevel = 0; // Reset anger
        game.gameStartTime = Date.now();
        game.lastAngerUpdate = Date.now();
        
        // Clear current enemies and snowballs
        game.enemies = [];
        game.snowballs = [];
        
        // Load new level
        game.platforms = getLevelPlatforms(levelNumber);
        game.spawnEnemies();
        
        // Reset player position
        game.player.x = 50;
        game.player.y = 400;
        game.player.vx = 0;
        game.player.vy = 0;
        game.player.onGround = false;
        
        // Update UI
        game.updateUI();
        
        // Resume game if paused
        game.gameRunning = true;
        
        console.log(`✅ DEV: Successfully jumped to Level ${levelNumber}`);
    }
}

// Sound toggle function
function toggleSound() {
    if (game && game.soundManager) {
        const isEnabled = game.soundManager.toggle();
        const button = document.getElementById('soundToggle');
        
        if (isEnabled) {
            button.innerHTML = '♪ Volume';
            button.classList.remove('muted');
            button.title = 'Mute Sound';
        } else {
            button.innerHTML = '✕ Volume';
            button.classList.add('muted');
            button.title = 'Enable Sound';
        }
        
        console.log(`🔊 Sound ${isEnabled ? 'enabled' : 'disabled'}`);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new SnowBrosGame();
});
