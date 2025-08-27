// Snow Bros Game - JavaScript Implementation
class SnowBrosGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // start, playing, gameOver
        
        // Game properties
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gravity = 0.35; // Reduced for slower jumping
        this.friction = 0.75;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.snowballs = [];
        this.platforms = [];
        this.particles = [];
        
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
        this.platforms = this.getLevelPlatforms(this.level);
        
        // Create player - on ground platform (530 - 86 = 444)
        this.player = new Player(100, 444, this);
        
        // Create enemies
        this.enemies = [];
        this.spawnEnemies();
    }
    
    getLevelPlatforms(levelNum) {
        const levelIndex = ((levelNum - 1) % 10) + 1; // Cycle through 10 different level designs
        
        switch(levelIndex) {
            case 1: // Level 1 - Based on reference design
                return [
                    { x: 0, y: 530, width: 800, height: 90, type: 'ground' },
                    
                    // Bottom level - 3 short platforms
                    { x: 60, y: 420, width: 140, height: 45, type: 'platform' },    
                    { x: 330, y: 420, width: 140, height: 45, type: 'platform' },   
                    { x: 600, y: 420, width: 140, height: 45, type: 'platform' },   
                    
                    // Middle level - single long platform (centered)
                    { x: 200, y: 310, width: 400, height: 45, type: 'platform' },   
                    
                    // Upper-middle level - 2 platforms (on sides)
                    { x: 80, y: 200, width: 200, height: 45, type: 'platform' },    
                    { x: 520, y: 200, width: 200, height: 45, type: 'platform' },   
                    
                    // Top level - medium platform (can drop from edges)
                    { x: 250, y: 90, width: 300, height: 45, type: 'platform' },
                ];
                
            case 2: // Level 2 - Similar to level 1 but aligned left and right
                return [
                    { x: 0, y: 530, width: 800, height: 90, type: 'ground' },
                    
                    // Bottom level - 3 platforms (left-aligned, center, right-aligned)
                    { x: 20, y: 420, width: 140, height: 45, type: 'platform' },    // Left-aligned
                    { x: 330, y: 420, width: 140, height: 45, type: 'platform' },   // Center
                    { x: 640, y: 420, width: 140, height: 45, type: 'platform' },   // Right-aligned
                    
                    // Middle level - single long platform (right-aligned)
                    { x: 400, y: 310, width: 380, height: 45, type: 'platform' },   // Right-aligned long
                    
                    // Upper-middle level - 2 platforms (left-aligned, right-aligned)
                    { x: 20, y: 200, width: 200, height: 45, type: 'platform' },    // Left-aligned
                    { x: 580, y: 200, width: 200, height: 45, type: 'platform' },   // Right-aligned
                    
                    // Top level - center platform (slightly left-aligned)
                    { x: 180, y: 90, width: 300, height: 45, type: 'platform' },    // Slightly left-aligned
                ];
                
            case 3: // Stepped design - Adequate spacing
                return [
                    { x: 0, y: 530, width: 800, height: 90, type: 'ground' },
                    // Bottom level - 4 platforms, 80px gaps between them
                    { x: 40, y: 420, width: 140, height: 45, type: 'platform' },    // 40-180
                    { x: 260, y: 420, width: 140, height: 45, type: 'platform' },   // 260-400 (80px gap)
                    { x: 480, y: 420, width: 140, height: 45, type: 'platform' },   // 480-620 (80px gap)
                    { x: 700, y: 420, width: 100, height: 45, type: 'platform' },   // 700-800 (80px gap)
                    
                    // Lower-middle level - 3 platforms, 100px gaps between them
                    { x: 120, y: 330, width: 160, height: 45, type: 'platform' },   // 120-280
                    { x: 380, y: 330, width: 160, height: 45, type: 'platform' },   // 380-540 (100px gap)
                    { x: 640, y: 330, width: 120, height: 45, type: 'platform' },   // 640-760 (100px gap)
                    
                    // Middle level - 2 platforms, 140px gap between them
                    { x: 180, y: 240, width: 180, height: 45, type: 'platform' },   // 180-360
                    { x: 500, y: 240, width: 180, height: 45, type: 'platform' },   // 500-680 (140px gap)
                    
                    // Top level - single platform
                    { x: 320, y: 150, width: 160, height: 45, type: 'platform' },
                ];
                
            case 4: // Pyramid style - Widened platform gaps
                return [
                    { x: 0, y: 530, width: 800, height: 90, type: 'ground' },
                    
                    // Bottom level - 3 platforms (wide spacing)
                    { x: 80, y: 420, width: 160, height: 45, type: 'platform' },    // Left
                    { x: 320, y: 420, width: 160, height: 45, type: 'platform' },   // Center (80px gap)
                    { x: 560, y: 420, width: 160, height: 45, type: 'platform' },   // Right (80px gap)
                    
                    // Middle level - 2 platforms (very wide spacing)
                    { x: 120, y: 310, width: 200, height: 45, type: 'platform' },   // Left
                    { x: 480, y: 310, width: 200, height: 45, type: 'platform' },   // Right (160px gap)
                    
                    // Upper level - single platform (center)
                    { x: 300, y: 200, width: 200, height: 45, type: 'platform' },   // Center
                    
                    // Top - small platform
                    { x: 350, y: 90, width: 100, height: 45, type: 'platform' },    // Small peak
                ];
                
            case 5: // Complex maze (Floor 05 style)
                return [
                    { x: 0, y: 550, width: 800, height: 50, type: 'ground' },
                    { x: 100, y: 480, width: 100, height: 25, type: 'platform' },
                    { x: 300, y: 480, width: 200, height: 25, type: 'platform' },
                    { x: 600, y: 480, width: 100, height: 25, type: 'platform' },
                    { x: 0, y: 410, width: 150, height: 25, type: 'platform' },
                    { x: 250, y: 410, width: 100, height: 25, type: 'platform' },
                    { x: 450, y: 410, width: 100, height: 25, type: 'platform' },
                    { x: 650, y: 410, width: 150, height: 25, type: 'platform' },
                    { x: 100, y: 340, width: 100, height: 25, type: 'platform' },
                    { x: 300, y: 340, width: 200, height: 25, type: 'platform' },
                    { x: 600, y: 340, width: 100, height: 25, type: 'platform' },
                    { x: 200, y: 270, width: 400, height: 25, type: 'platform' },
                    { x: 350, y: 200, width: 100, height: 25, type: 'platform' },
                ];
                
            case 6: // Vertical challenge (Floor 06 style)
                return [
                    { x: 0, y: 550, width: 800, height: 50, type: 'ground' },
                    { x: 0, y: 480, width: 100, height: 25, type: 'platform' },
                    { x: 700, y: 480, width: 100, height: 25, type: 'platform' },
                    { x: 150, y: 430, width: 100, height: 25, type: 'platform' },
                    { x: 550, y: 430, width: 100, height: 25, type: 'platform' },
                    { x: 300, y: 380, width: 200, height: 25, type: 'platform' },
                    { x: 100, y: 330, width: 100, height: 25, type: 'platform' },
                    { x: 600, y: 330, width: 100, height: 25, type: 'platform' },
                    { x: 250, y: 280, width: 100, height: 25, type: 'platform' },
                    { x: 450, y: 280, width: 100, height: 25, type: 'platform' },
                    { x: 350, y: 230, width: 100, height: 25, type: 'platform' },
                    { x: 300, y: 180, width: 200, height: 25, type: 'platform' },
                ];
                
            case 7: // Scattered platforms (Floor 07 style)
                return [
                    { x: 0, y: 550, width: 800, height: 50, type: 'ground' },
                    { x: 80, y: 480, width: 120, height: 25, type: 'platform' },
                    { x: 280, y: 480, width: 120, height: 25, type: 'platform' },
                    { x: 480, y: 480, width: 120, height: 25, type: 'platform' },
                    { x: 680, y: 480, width: 120, height: 25, type: 'platform' },
                    { x: 40, y: 410, width: 100, height: 25, type: 'platform' },
                    { x: 220, y: 410, width: 100, height: 25, type: 'platform' },
                    { x: 400, y: 410, width: 100, height: 25, type: 'platform' },
                    { x: 580, y: 410, width: 100, height: 25, type: 'platform' },
                    { x: 160, y: 340, width: 120, height: 25, type: 'platform' },
                    { x: 360, y: 340, width: 120, height: 25, type: 'platform' },
                    { x: 560, y: 340, width: 120, height: 25, type: 'platform' },
                    { x: 260, y: 270, width: 100, height: 25, type: 'platform' },
                    { x: 440, y: 270, width: 100, height: 25, type: 'platform' },
                    { x: 350, y: 200, width: 100, height: 25, type: 'platform' },
                ];
                
            case 8: // Cross pattern (Floor 08 style)
                return [
                    { x: 0, y: 550, width: 800, height: 50, type: 'ground' },
                    { x: 100, y: 480, width: 600, height: 25, type: 'platform' },
                    { x: 200, y: 430, width: 100, height: 25, type: 'platform' },
                    { x: 500, y: 430, width: 100, height: 25, type: 'platform' },
                    { x: 300, y: 380, width: 200, height: 25, type: 'platform' },
                    { x: 150, y: 330, width: 100, height: 25, type: 'platform' },
                    { x: 550, y: 330, width: 100, height: 25, type: 'platform' },
                    { x: 250, y: 280, width: 300, height: 25, type: 'platform' },
                    { x: 100, y: 230, width: 100, height: 25, type: 'platform' },
                    { x: 600, y: 230, width: 100, height: 25, type: 'platform' },
                    { x: 200, y: 180, width: 400, height: 25, type: 'platform' },
                    { x: 350, y: 130, width: 100, height: 25, type: 'platform' },
                ];
                
            case 9: // Spiral design (Floor 09 style)
                return [
                    { x: 0, y: 550, width: 800, height: 50, type: 'ground' },
                    { x: 0, y: 480, width: 200, height: 25, type: 'platform' },
                    { x: 300, y: 480, width: 500, height: 25, type: 'platform' },
                    { x: 0, y: 430, width: 150, height: 25, type: 'platform' },
                    { x: 250, y: 430, width: 100, height: 25, type: 'platform' },
                    { x: 450, y: 430, width: 350, height: 25, type: 'platform' },
                    { x: 50, y: 380, width: 200, height: 25, type: 'platform' },
                    { x: 350, y: 380, width: 200, height: 25, type: 'platform' },
                    { x: 650, y: 380, width: 150, height: 25, type: 'platform' },
                    { x: 150, y: 330, width: 300, height: 25, type: 'platform' },
                    { x: 550, y: 330, width: 150, height: 25, type: 'platform' },
                    { x: 250, y: 280, width: 200, height: 25, type: 'platform' },
                    { x: 550, y: 280, width: 100, height: 25, type: 'platform' },
                    { x: 300, y: 230, width: 200, height: 25, type: 'platform' },
                    { x: 350, y: 180, width: 100, height: 25, type: 'platform' },
                ];
                
            case 10: // Final boss style (Floor 10 style)
                return [
                    { x: 0, y: 550, width: 800, height: 50, type: 'ground' },
                    { x: 50, y: 500, width: 100, height: 25, type: 'platform' },
                    { x: 650, y: 500, width: 100, height: 25, type: 'platform' },
                    { x: 100, y: 450, width: 100, height: 25, type: 'platform' },
                    { x: 600, y: 450, width: 100, height: 25, type: 'platform' },
                    { x: 150, y: 400, width: 100, height: 25, type: 'platform' },
                    { x: 550, y: 400, width: 100, height: 25, type: 'platform' },
                    { x: 200, y: 350, width: 400, height: 25, type: 'platform' },
                    { x: 100, y: 300, width: 100, height: 25, type: 'platform' },
                    { x: 600, y: 300, width: 100, height: 25, type: 'platform' },
                    { x: 250, y: 250, width: 300, height: 25, type: 'platform' },
                    { x: 350, y: 200, width: 100, height: 25, type: 'platform' },
                    { x: 300, y: 150, width: 200, height: 25, type: 'platform' },
                ];
                
            default:
                return this.getLevelPlatforms(1); // Fallback to level 1
        }
    }
    
    spawnEnemies() {
        // Number of enemies increases with level
        const baseEnemies = 3;
        const extraEnemies = Math.floor((this.level - 1) / 3); // +1 enemy every 3 levels
        const totalEnemies = Math.min(baseEnemies + extraEnemies, 8); // Max 8 enemies
        
        const playerX = this.player.x;
        const playerY = this.player.y;
        const minDistanceFromPlayer = 200; // Minimum distance from player
        
        // Get suitable spawn positions from platforms, far from player and each other
        const spawnPositions = [];
        this.platforms.forEach(platform => {
            if (platform.type !== 'ground' && platform.width >= 80) {
                // Add spawn points with more spacing to prevent clustering
                const minSpacing = 150; // Minimum distance between spawn points
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
        
        // Spawn enemies
        for (let i = 0; i < Math.min(totalEnemies, spawnPositions.length); i++) {
            const pos = spawnPositions[i];
            this.enemies.push(new Enemy(pos.x, pos.y, this));
        }
        
        // If we need more enemies and don't have enough platform positions, spawn on ground far from player
        if (this.enemies.length < totalEnemies) {
            const remaining = totalEnemies - this.enemies.length;
            for (let i = 0; i < remaining; i++) {
                // Spawn on opposite side of the screen from player
                const x = playerX < 400 ? (600 + i * 100) : (100 + i * 100);
                this.enemies.push(new Enemy(x, 500, this));
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
                        this.score += 200; // Bonus points for chain kills
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
            this.nextLevel();
        }
        
        // Check lose condition
        if (this.lives <= 0) {
            this.gameOver();
        }
        
        // Update UI
        this.updateUI();
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#E8F4FD';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background pattern
        this.drawBackground();
        
        // Draw platforms
        this.platforms.forEach(platform => this.drawPlatform(platform));
        
        // Draw game objects
        if (this.gameState === 'playing') {
            this.player.render(this.ctx);
            this.enemies.forEach(enemy => enemy.render(this.ctx));
            this.snowballs.forEach(snowball => snowball.render(this.ctx));
            this.particles.forEach(particle => particle.render(this.ctx));
        }
    }
    
    drawBackground() {
        // Draw checkered background pattern like original Snow Bros
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
        
        // Add some sparkle effects
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 30; i++) {
            const x = (Date.now() * 0.01 + i * 100) % this.canvas.width;
            const y = (Date.now() * 0.02 + i * 50) % this.canvas.height;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1, 0, Math.PI * 2);
            this.ctx.fill();
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
            // Draw platform with Snow Bros style - orange with zigzag edges
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
        }
        
        // Add border
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
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
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    restart() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.enemies = [];
        this.snowballs = [];
        this.particles = [];
        
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.initializeLevel();
    }
    
    nextLevel() {
        this.level++;
        this.score += 1000;
        this.snowballs = [];
        this.particles = [];
        
        // Update platforms for new level
        this.platforms = this.getLevelPlatforms(this.level);
        
        // Reset player position
        this.player.x = 100;
        this.player.y = 444;
        this.player.vx = 0;
        this.player.vy = 0;
        
        // Spawn new enemies
        this.spawnEnemies();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
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
class Player {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.width = 86; // 48 * 1.8
        this.height = 86; // 48 * 1.8
        this.vx = 0;
        this.vy = 0;
        this.game = game;
        this.onGround = false;
        this.maxSpeed = 2.5;
        this.acceleration = 0.3;
        this.jumpPower = 9; // Reduced jump power to prevent hitting upper enemies
        this.shootCooldown = 0;
        this.direction = 1; // 1 for right, -1 for left
        this.isMoving = false;
        this.isShooting = false;
        this.shootingTimer = 0;
        
        // Load character images
        this.images = {
            front: new Image(),
            right: new Image()
        };
        
        this.images.front.src = 'images/main_char.png';
        this.images.right.src = 'images/main_char_right.png';
        
        this.imagesLoaded = 0;
        this.totalImages = 2;
        this.deathCooldown = 0; // Prevent multiple deaths
        
        this.images.front.onload = () => {
            this.imagesLoaded++;
            console.log('Front character image loaded');
        };
        
        this.images.right.onload = () => {
            this.imagesLoaded++;
            console.log('Right character image loaded');
        };
        
        this.images.front.onerror = (e) => {
            console.log('Failed to load front character image');
        };
        
        this.images.right.onerror = (e) => {
            console.log('Failed to load right character image');
        };
    }
    
    update(deltaTime) {
        // Handle input with acceleration
        let wasMoving = this.isMoving;
        this.isMoving = false;
        
        if (this.game.keys['a'] || this.game.keys['arrowleft']) {
            this.vx -= this.acceleration;
            if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;
            this.direction = -1;
            this.isMoving = true;
        } else if (this.game.keys['d'] || this.game.keys['arrowright']) {
            this.vx += this.acceleration;
            if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
            this.direction = 1;
            this.isMoving = true;
        } else {
            // Apply friction when no input
            if (Math.abs(this.vx) < 0.1) {
                this.vx = 0;
            } else {
                this.vx *= this.game.friction;
                // Still considered moving if sliding
                if (Math.abs(this.vx) > 0.5) {
                    this.isMoving = true;
                }
            }
        }
        
        if ((this.game.keys['w'] || this.game.keys['arrowup']) && this.onGround) {
            this.vy = -this.jumpPower;
            this.onGround = false;
        }
        
        if (this.game.keys[' '] && this.shootCooldown <= 0) {
            // Check if there's a frozen enemy nearby to push - ULTRA RELIABLE DETECTION
            let pushedEnemy = false;
            this.game.enemies.forEach((enemy, index) => {
                // DEBUG: Log enemy state - only show enemies with snow hits
                if (enemy.snowHits > 0 || enemy.frozen) {
                    console.log(`Enemy ${index}: frozen=${enemy.frozen}, snowHits=${enemy.snowHits}, isRolling=${enemy.isRolling}, active=${enemy.active}, x=${enemy.x.toFixed(1)}, y=${enemy.y.toFixed(1)}`);
                }
                
                if (enemy.frozen && enemy.snowHits >= 3 && !enemy.isRolling) { // Only fully frozen, non-rolling enemies
                    // Check if player and enemy are on same level (similar Y position)
                    const playerCenterX = this.x + this.width/2;
                    const playerCenterY = this.y + this.height/2;
                    const enemyCenterX = enemy.x + enemy.width/2;
                    const enemyCenterY = enemy.y + enemy.height/2;
                    
                    const horizontalDistance = Math.abs(playerCenterX - enemyCenterX);
                    const verticalDistance = Math.abs(playerCenterY - enemyCenterY);
                    
                    console.log(`Push Check: H=${horizontalDistance.toFixed(1)}, V=${verticalDistance.toFixed(1)} (need H<80, V<60)`);
                    
                    // More generous push range - must be on same level and close
                    if (horizontalDistance < 80 && verticalDistance < 60) {
                        // Determine push direction based on player position relative to enemy
                        const pushDirection = (playerCenterX < enemyCenterX) ? 1 : -1;
                        
                        console.log(`ATTEMPTING PUSH: direction=${pushDirection}`);
                        
                        // Push the frozen enemy with MAXIMUM force
                        const pushSuccess = enemy.push(pushDirection);
                        console.log(`PUSH RESULT: success=${pushSuccess}`);
                        
                        if (pushSuccess) {
                            pushedEnemy = true;
                            console.log(`ENEMY PUSHED SUCCESSFULLY!`);
                        }
                        this.shootCooldown = 0; // NO cooldown for pushing - instant push
                        this.isShooting = true;
                        this.shootingTimer = 150; // Short shooting animation
                        
                        // Add dramatic push effect particles
                        for (let i = 0; i < 3; i++) {
                            this.game.addParticle(enemyCenterX + (Math.random() - 0.5) * 20, enemyCenterY + (Math.random() - 0.5) * 20, '#FFFFFF');
                            this.game.addParticle(enemyCenterX + (Math.random() - 0.5) * 20, enemyCenterY + (Math.random() - 0.5) * 20, '#87CEEB');
                        }
                        
                        // Push successful - no debug needed in production
                    } else {
                        console.log(`PUSH FAILED: Out of range`);
                    }
                } else {
                    console.log(`PUSH FAILED: Conditions not met`);
                }
            });
            
            // If no enemy was pushed, shoot snowball
            if (!pushedEnemy) {
                this.shoot();
                this.shootCooldown = 300; // milliseconds
                this.isShooting = true;
                this.shootingTimer = 300; // Show shooting animation
            }
        }
        
        // Update cooldown and shooting timer
        this.shootCooldown -= deltaTime;
        this.shootingTimer -= deltaTime;
        this.deathCooldown -= deltaTime;
        
        if (this.shootingTimer <= 0) {
            this.isShooting = false;
        }
        
        // Apply gravity
        this.vy += this.game.gravity;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Platform collision - allow passing through from sides and bottom
        this.onGround = false;
        this.game.platforms.forEach(platform => {
            // Check if player is overlapping with platform
            const overlapping = this.x < platform.x + platform.width &&
                               this.x + this.width > platform.x &&
                               this.y < platform.y + platform.height &&
                               this.y + this.height > platform.y;
            
            if (overlapping) {
                // Only land on platform if falling down and player's bottom was above platform before
                const playerBottom = this.y + this.height;
                const playerBottomPrevious = playerBottom - this.vy;
                const playerTop = this.y;
                const playerTopPrevious = playerTop - this.vy;
                
                // Landing on top of platform (falling down)
                if (this.vy > 0 && playerBottomPrevious <= platform.y + 5) { // 5px tolerance
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                }
                // Passing through from bottom (jumping up) - allow passage
                else if (this.vy < 0 && playerTopPrevious >= platform.y + platform.height - 5) {
                    // Allow player to pass through platform from below
                    // No collision response - player continues upward
                }
                // Side collision only for ground platforms (walls)
                else if (platform.type === 'ground') {
                    const playerCenterX = this.x + this.width / 2;
                    const platformCenterX = platform.x + platform.width / 2;
                    
                    if (playerCenterX < platformCenterX && this.vx > 0) {
                        // Hit from left
                        this.x = platform.x - this.width;
                        this.vx = 0;
                    } else if (playerCenterX > platformCenterX && this.vx < 0) {
                        // Hit from right
                        this.x = platform.x + platform.width;
                        this.vx = 0;
                    }
                }
            }
        });
        
        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.canvas.width) {
            this.x = this.game.canvas.width - this.width;
        }
        
        // Check death conditions only if not in death cooldown
        if (this.deathCooldown <= 0) {
            // Check if player fell off the screen (death)
            if (this.y > this.game.canvas.height) {
                this.die();
            }
            
            // Check enemy collision
            this.game.enemies.forEach(enemy => {
                if (this.game.checkCollision(this, enemy) && !enemy.frozen) {
                    this.die();
                }
            });
        }
    }
    
    shoot() {
        const snowball = new Snowball(
            this.x + (this.direction > 0 ? this.width : 0),
            this.y + this.height/2,
            this.direction * 8,
            this.game
        );
        this.game.snowballs.push(snowball);
    }
    
    die() {
        this.game.lives--;
        this.game.addParticle(this.x + this.width/2, this.y + this.height/2, '#FF0000');
        
        // Reset player position
        this.x = 100;
        this.y = 444; // On ground platform
        this.vx = 0;
        this.vy = 0;
        this.isMoving = false;
        this.isShooting = false;
        
        // Set death cooldown to prevent immediate re-death
        this.deathCooldown = 2000; // 2 seconds of invincibility
    }
    
    render(ctx) {
        // Skip rendering if in death cooldown and blinking
        if (this.deathCooldown > 0 && Math.floor(this.deathCooldown / 100) % 2 === 0) {
            return; // Blinking effect during invincibility
        }
        
        if (this.imagesLoaded === this.totalImages) {
            // Use the actual PNG images based on character state
            ctx.save();
            
            let imageToUse;
            
            // Determine which image to use based on character state
            if (this.isShooting || this.isMoving) {
                // Use side view when shooting or moving
                imageToUse = this.images.right;
                
                if (this.direction === -1) {
                    // Flip horizontally for left movement/shooting
                    ctx.translate(this.x + this.width, this.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(imageToUse, 0, 0, this.width, this.height);
                } else {
                    // Normal right-facing image
                    ctx.drawImage(imageToUse, this.x, this.y, this.width, this.height);
                }
            } else {
                // Use front view when idle/standing
                imageToUse = this.images.front;
                ctx.drawImage(imageToUse, this.x, this.y, this.width, this.height);
            }
            
            ctx.restore();
        } else {
            // Fallback: simple cow-like character while image loads
            const centerX = this.x + this.width/2;
            const centerY = this.y + this.height/2;
            
            // Body (white with gray spot) - 1.4x scaled
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3; // 2 * 1.4
            ctx.fillRect(this.x + 8, this.y + 25, this.width - 16, this.height - 34); // scaled
            ctx.strokeRect(this.x + 8, this.y + 25, this.width - 16, this.height - 34);
            
            // Head
            ctx.fillRect(this.x + 14, this.y + 10, this.width - 28, 32); // 18*1.8=32
            ctx.strokeRect(this.x + 14, this.y + 10, this.width - 28, 32);
            
            // Gray spot
            ctx.fillStyle = '#A0A0A0';
            ctx.fillRect(centerX, this.y + 14, 22, 22); // 12*1.8=22
            
            // Eyes
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x + 25, this.y + 22, 5, 5); // 3*1.8=5
            ctx.fillRect(this.x + 54, this.y + 22, 5, 5);
            
            // Nose
            ctx.fillStyle = '#FFB6C1';
            ctx.fillRect(centerX - 5, this.y + 32, 10, 5); // 6*1.8=10, 3*1.8=5
        }
    }
}

// Enemy class
class Enemy {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.width = 50; // Hafif daha ince
        this.height = 70; // Yükseklik aynı
        this.maxSpeed = 1.8; // Daha yavaş hareket
        this.baseSpeed = 1.8; // Orijinal hız
        this.currentSpeed = 1.8; // Mevcut hız (kar ile yavaşlar)
        this.acceleration = 0.2; // Daha yavaş hızlanma
        this.jumpPower = 9; // Same as player for balanced gameplay
        this.vx = Math.random() > 0.5 ? 1.0 : -1.0;
        this.vy = 0;
        this.game = game;
        this.onGround = false;
        this.active = true;
        
        // Image system for enemy character - only load right image, flip for left
        this.imageRight = new Image();
        this.imagesLoaded = false;
        this.facingRight = this.vx > 0; // Initial facing direction
        
        // Load only right-facing image (will be flipped for left direction)
        this.imageRight.onload = () => {
            this.imagesLoaded = true;
        };
        this.imageRight.src = 'images/enemy_char_right.png';
        this.frozen = false;
        this.frozenTime = 0;
        this.snowHits = 0; // Kar isabet sayısı
        this.maxSnowHits = 3; // Donmak için gereken isabet sayısı
        // frozenTimer removed - no recovery system
        this.isPushed = false;
        this.isRolling = false;
        this.rollSpeed = 0;
        this.jumpCooldown = 0;
        this.directionChangeTimer = 0;
        this.isPreparingToJump = false;
        this.jumpPreparationTime = 0;
        this.targetPlatformX = 0;
        this.justLanded = false;
        this.landingFocusTime = 0;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
        
        // Individual personality traits for more natural behavior
        this.personalityOffset = (Math.random() - 0.5) * 100; // -50 to +50 pixel offset preference
        this.aggressiveness = 0.5 + Math.random() * 0.5; // 0.5 to 1.0 - how aggressive towards player
        this.patience = 0.5 + Math.random() * 1.0; // 0.5 to 1.5 - how long they wait before acting
        
        // Natural behavior patterns
        this.explorationMode = false; // When true, enemy explores instead of hunting
        this.explorationTimer = 0;
        this.currentGoal = 'explore'; // 'explore', 'hunt', 'patrol'
        this.goalChangeTimer = 3000 + Math.random() * 5000; // 3-8 seconds between goal changes
        this.preferredDirection = Math.random() > 0.5 ? 1 : -1; // Natural movement preference
        
        // Smart pathfinding
        this.currentPlatformLevel = 0; // Track which level enemy is on
        this.targetPlatformLevel = 0; // Which level enemy wants to reach
        
        // Anti-stuck system
        this.lastPosition = { x: this.x, y: this.y };
        this.stuckTimer = 0;
        this.explorationDirection = Math.random() > 0.5 ? 1 : -1; // Random exploration direction
        this.explorationTimer = 0;
        this.pathfindingCooldown = 0; // Prevent too frequent pathfinding calculations
        this.currentRoute = null; // Current pathfinding route
        this.routeStep = 0; // Which step of the route we're on
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Update goal and behavior timers
        this.goalChangeTimer -= deltaTime;
        this.pathfindingCooldown -= deltaTime;
        
        if (this.goalChangeTimer <= 0) {
            // Change goals naturally - more aggressive hunting
            const rand = Math.random();
            if (rand < 0.2) {
                this.currentGoal = 'explore'; // 20% exploration
            } else if (rand < 0.4) {
                this.currentGoal = 'patrol'; // 20% patrolling
            } else {
                this.currentGoal = 'hunt'; // 60% hunting
            }
            this.goalChangeTimer = 3000 + Math.random() * 5000; // 3-8 seconds
        }
        
        // Update current platform level
        this.updatePlatformLevel();
        
        // Anti-stuck system - detect if enemy is not moving for too long
        const currentPosition = { x: this.x, y: this.y };
        const distanceMoved = Math.abs(currentPosition.x - this.lastPosition.x) + Math.abs(currentPosition.y - this.lastPosition.y);
        
        if (distanceMoved < 8 && !this.frozen && this.onGround) { // More sensitive stuck detection
            this.stuckTimer += deltaTime;
            
            // Enter exploration mode much faster - no level restrictions
            if (this.stuckTimer > 800) { // Much faster stuck detection (0.8 seconds)
                this.explorationTimer = 4000; // Longer exploration (4 seconds)
                this.explorationDirection = Math.random() > 0.5 ? 1 : -1; // Random direction
                this.stuckTimer = 0; // Reset stuck timer
                
                // Force immediate movement to break stuck state
                this.vx = this.explorationDirection * this.currentSpeed;
                
                // Sometimes jump to change level
                if (Math.random() < 0.3 && this.jumpCooldown <= 0 && this.snowHits === 0) {
                    this.vy = -this.jumpPower;
                    this.onGround = false;
                    this.jumpCooldown = 500;
                }
            }
        } else {
            this.stuckTimer = 0; // Reset if moving
        }
        
        // Update exploration timer
        if (this.explorationTimer > 0) {
            this.explorationTimer -= deltaTime;
        }
        
        this.lastPosition = { ...currentPosition };
        
        // Frozen timer system COMPLETELY REMOVED - no recovery from snow hits
        // Once hit by snow, enemy stays affected until death
        // Only apply gravity to frozen enemies
        if (this.frozen) {
            this.vy += this.game.gravity;
        }
        
        if (this.frozen && this.snowHits >= 3) {
            this.frozenTime -= deltaTime;
            if (this.frozenTime <= 0) {
                // Kar topu olan düşman kesin ölür, yeniden doğmaz
                this.destroy();
                
                // Extra death particles
                for (let i = 0; i < 8; i++) {
                    this.game.addParticle(
                        this.x + Math.random() * this.width,
                        this.y + Math.random() * this.height,
                        '#FFFFFF'
                    );
                }
                return;
            }
            
            // Apply gravity to frozen enemies (so they fall if in air)
            this.vy += this.game.gravity;
            
            // If rolling, continue rolling and check for collisions
            if (this.isRolling) {
                this.vx = this.rollSpeed;

                // Slow down rolling over time (more friction for faster death)
                this.rollSpeed *= 0.988; // Faster deceleration
                
                // Check if rolling for too long (3 seconds max) or too slow - MUCH MORE AGGRESSIVE
                const rollingTime = Date.now() - (this.rollStartTime || Date.now());
                if (Math.abs(this.rollSpeed) < 1.0 || rollingTime > 3000) { // 3 seconds max rolling, higher speed threshold
                    this.isRolling = false;
                    this.destroy(); // Kar topu kesin ölür - NO RECOVERY
                    
                    // Death particles when rolling stops
                    for (let i = 0; i < 6; i++) {
                        this.game.addParticle(
                            this.x + Math.random() * this.width,
                            this.y + Math.random() * this.height,
                            '#FFFFFF'
                        );
                    }
                    return;
                }
                
                // Apply gravity and update position for rolling snowball
                this.vy += this.game.gravity;
                this.x += this.vx;
                this.y += this.vy;
                
                // Check screen boundaries - destroy if off screen
                if (this.x < -this.width || this.x > 800 + this.width || this.y > 600 + this.height) {
                    this.isRolling = false;
                    this.destroy(); // Kar topu ekran dışına çıktı, ölür
                    return;
                }
                
                // Platform collision for rolling snowball - allow passing through from sides and bottom
                this.onGround = false;
                this.game.platforms.forEach(platform => {
                    // Check if snowball is overlapping with platform
                    const overlapping = this.x < platform.x + platform.width &&
                                       this.x + this.width > platform.x &&
                                       this.y < platform.y + platform.height &&
                                       this.y + this.height > platform.y;
                    
                    if (overlapping) {
                        // Only land on platform if falling down and snowball's bottom was above platform before
                        const snowballBottom = this.y + this.height;
                        const snowballBottomPrevious = snowballBottom - this.vy;
                        
                        if (this.vy > 0 && snowballBottomPrevious <= platform.y + 5) { // 5px tolerance
                            this.y = platform.y - this.height;
                            this.vy = 0;
                            this.onGround = true;
                        }
                        // Bounce off walls (ground platforms only) - improved bouncing
                        else if (platform.type === 'ground' && Math.abs(this.rollSpeed) > 1) {
                            const snowballCenterX = this.x + this.width / 2;
                            const platformCenterX = platform.x + platform.width / 2;
                            
                            if (snowballCenterX < platformCenterX && this.rollSpeed > 0) {
                                // Hit from left - bounce but keep momentum
                                this.x = platform.x - this.width - 2; // Extra spacing to prevent sticking
                                this.rollSpeed = -this.rollSpeed * 0.9; // Less energy loss for longer rolling
                                this.vy = -2; // Add small upward bounce to escape corners
                            } else if (snowballCenterX > platformCenterX && this.rollSpeed < 0) {
                                // Hit from right - bounce but keep momentum
                                this.x = platform.x + platform.width + 2; // Extra spacing to prevent sticking
                                this.rollSpeed = -this.rollSpeed * 0.9; // Less energy loss for longer rolling
                                this.vy = -2; // Add small upward bounce to escape corners
                            }
                        }
                    }
                });
                
                // Screen boundaries - better bouncing
                if (this.x <= 0) {
                    this.x = 0;
                    this.rollSpeed = Math.abs(this.rollSpeed) * 0.9; // Less energy loss for longer rolling
                } else if (this.x + this.width >= this.game.canvas.width) {
                    this.x = this.game.canvas.width - this.width;
                    this.rollSpeed = -Math.abs(this.rollSpeed) * 0.9; // Less energy loss for longer rolling
                }
                
            } else {
                // If frozen but not rolling, still apply gravity and platform collision
                this.vx = 0;
                
                // Update position (only vertical movement due to gravity)
                this.y += this.vy;
                
                // Platform collision for stationary frozen enemy
                this.onGround = false;
                this.game.platforms.forEach(platform => {
                    const overlapping = this.x < platform.x + platform.width &&
                                       this.x + this.width > platform.x &&
                                       this.y < platform.y + platform.height &&
                                       this.y + this.height > platform.y;
                    
                    if (overlapping) {
                        // Only land on platform if falling down
                        const enemyBottom = this.y + this.height;
                        const enemyBottomPrevious = enemyBottom - this.vy;
                        const enemyTop = this.y;
                        const enemyTopPrevious = enemyTop - this.vy;
                        
                        // Landing on top of platform (falling down)
                        if (this.vy > 0 && enemyBottomPrevious <= platform.y + 5) {
                            this.y = platform.y - this.height;
                            this.vy = 0;
                            this.onGround = true;
                        }
                        // Passing through from bottom (if somehow moving up while frozen)
                        else if (this.vy < 0 && enemyTopPrevious >= platform.y + platform.height - 5) {
                            // Allow passage through platform from below
                        }
                    }
                });
            }
            return;
        }
        
        // Update timers
        this.jumpCooldown -= deltaTime;
        this.directionChangeTimer -= deltaTime;
        this.jumpPreparationTime -= deltaTime;
        this.landingFocusTime -= deltaTime;
        
        // Smart AI - can jump between platforms like player
        const playerX = this.game.player.x + this.game.player.width / 2;
        const playerY = this.game.player.y + this.game.player.height / 2;
        const enemyX = this.x + this.width / 2;
        const enemyY = this.y + this.height / 2;
        
        // Decide movement direction (like player input simulation)
        let wantsToMoveLeft = false;
        let wantsToMoveRight = false;
        
        // If in exploration mode, always override normal behavior (no level restrictions)
        if (this.explorationTimer > 0) {
            if (this.explorationDirection < 0) {
                wantsToMoveLeft = true;
            } else {
                wantsToMoveRight = true;
            }
        } else {
        
        // If just landed, focus on player for a while
        if (this.justLanded && this.landingFocusTime > 0) {
            // Direct movement towards player after landing
            if (playerX < enemyX) {
                wantsToMoveLeft = true;
                wantsToMoveRight = false;
            } else if (playerX > enemyX) {
                wantsToMoveRight = true;
                wantsToMoveLeft = false;
            }
        } else {
            // Reset landing state when focus time is over
            if (this.justLanded && this.landingFocusTime <= 0) {
                this.justLanded = false;
            }
            // Normal random direction changes - always move, never stop
            if (this.directionChangeTimer <= 0) {
                const rand = Math.random();
                if (rand < 0.5) {
                    wantsToMoveLeft = true;
                } else {
                    wantsToMoveRight = true;
                }
                // Always move - no stopping allowed
                this.directionChangeTimer = 2000 + Math.random() * 3000; // 2-5 seconds - faster direction changes
            } else {
                // Continue current direction tendency
                if (this.vx < 0) wantsToMoveLeft = true;
                else if (this.vx > 0) wantsToMoveRight = true;
            }
        }
        
        // Goal-based behavior system
        let shouldHuntPlayer = false;
        
        if (this.currentGoal === 'hunt') {
            // Smart pathfinding when hunting - much more aggressive
            const playerPlatform = this.getPlayerPlatform();
            const enemyPlatform = this.getCurrentPlatform();
            
            // If player is on different platform or significantly higher/lower, use pathfinding
            const verticalDistance = Math.abs(playerY - (this.y + this.height/2));
            const horizontalDistance = Math.abs(playerX - (this.x + this.width/2));
            
            if ((playerPlatform && enemyPlatform && playerPlatform !== enemyPlatform) || 
                verticalDistance > 80 || 
                (verticalDistance > 40 && horizontalDistance > 150)) {
                
                // More natural pathfinding updates
                if (!this.currentRoute || this.pathfindingCooldown <= 0 || 
                    (this.currentRoute && Math.random() < 0.03)) { // 3% chance to recalculate route
                    this.currentRoute = this.findSmartPath(playerX, playerY);
                    this.routeStep = 0;
                    this.pathfindingCooldown = 800; // Slower recalculation for more natural behavior
                }
                
                const path = this.currentRoute;
                if (path) {
                    if (path.action === 'move_to_edge') {
                        // Move towards platform edge to drop down
                        const distanceToTarget = Math.abs(this.x + this.width/2 - path.targetX);
                        if (distanceToTarget > 20) {
                            if (path.direction < 0) {
                                wantsToMoveLeft = true;
                                wantsToMoveRight = false;
                            } else {
                                wantsToMoveRight = true;
                                wantsToMoveLeft = false;
                            }
                        }
                        // Don't hunt directly when pathfinding
                        shouldHuntPlayer = false;
                    } else if (path.action === 'jump_to_platform') {
                        // Move towards jump position (direct jump)
                        const distanceToTarget = Math.abs(this.x + this.width/2 - path.targetX);
                        if (distanceToTarget > 30) {
                            if (path.targetX < this.x + this.width/2) {
                                wantsToMoveLeft = true;
                                wantsToMoveRight = false;
                            } else {
                                wantsToMoveRight = true;
                                wantsToMoveLeft = false;
                            }
                        }
                        // Don't hunt directly when pathfinding
                        shouldHuntPlayer = false;
                    } else if (path.action === 'move_to_intermediate') {
                        // Move to intermediate platform first (indirect route)
                        const distanceToTarget = Math.abs(this.x + this.width/2 - path.targetX);
                        
                        // Check if we've reached the intermediate platform
                        const currentPlatform = this.getCurrentPlatform();
                        if (currentPlatform && path.intermediatePlatform && 
                            Math.abs(currentPlatform.x - path.intermediatePlatform.x) < 20 &&
                            Math.abs(currentPlatform.y - path.intermediatePlatform.y) < 20) {
                            // We've reached intermediate platform, now move toward final target
                            this.currentRoute = {
                                action: 'jump_to_platform',
                                targetX: path.finalTarget.x,
                                targetY: path.finalTarget.y,
                                type: 'final_jump'
                            };
                        } else if (distanceToTarget > 20) {
                            // Still moving to intermediate platform
                            if (path.targetX < this.x + this.width/2) {
                                wantsToMoveLeft = true;
                                wantsToMoveRight = false;
                            } else {
                                wantsToMoveRight = true;
                                wantsToMoveLeft = false;
                            }
                        }
                        // Don't hunt directly when pathfinding
                        shouldHuntPlayer = false;
                    }
                }
            } else {
                // Same level - clear route and use normal hunting behavior
                this.currentRoute = null;
                this.routeStep = 0;
                
                const playerAboveEnemy = playerY < enemyY - 30;
                const playerDistance = Math.abs(playerX - enemyX);
                
                // More balanced hunting when player is close or above
                let baseDecisionChance = 0.03; // Base 3% chance
                if (playerAboveEnemy) baseDecisionChance = 0.08; // 8% if player above
                if (playerDistance < 200) baseDecisionChance += 0.05; // +5% if close
                if (playerDistance < 100) baseDecisionChance += 0.1; // +10% if very close
                
                const personalizedChance = baseDecisionChance * this.aggressiveness;
                shouldHuntPlayer = Math.random() < personalizedChance;
            }
        } else if (this.currentGoal === 'patrol') {
            // Patrol mode - move in preferred direction, occasionally check player
            const rand = Math.random();
            const playerDistance = Math.abs(playerX - enemyX);
            const playerAbove = playerY < enemyY - 30;
            
            // Higher chance to notice player when close or above
            let noticeChance = 0.02; // Base 2% chance
            if (playerDistance < 200) noticeChance = 0.08; // 8% if close
            if (playerDistance < 100) noticeChance = 0.15; // 15% if very close
            if (playerAbove && playerDistance < 300) noticeChance = 0.12; // 12% if above and nearby
            
            if (rand < noticeChance) {
                shouldHuntPlayer = true;
            } else {
                // Continue patrolling in preferred direction
                if (this.preferredDirection > 0) {
                    wantsToMoveRight = true;
                } else {
                    wantsToMoveLeft = true;
                }
                // Occasionally change preferred direction
                if (Math.random() < 0.002) { // 0.2% chance per frame
                    this.preferredDirection *= -1;
                }
            }
        }
        // 'explore' mode uses the existing random movement above
        
        if (shouldHuntPlayer) { // Goal-based decision making
            const horizontalDistance = Math.abs(playerX - enemyX);
            const verticalDistance = Math.abs(playerY - enemyY);
            
            // If player is on same level or below, move towards them with personality offset
            if (playerY >= enemyY - 20) {
                const targetX = playerX + this.personalityOffset; // Add personality offset
                const distanceToTarget = Math.abs(targetX - enemyX);
                
                // Only move if not too close (prevents jittering)
                if (distanceToTarget > 30) {
                    if (targetX < enemyX) {
                        wantsToMoveLeft = true;
                        wantsToMoveRight = false;
                    } else if (targetX > enemyX) {
                        wantsToMoveRight = true;
                        wantsToMoveLeft = false;
                    }
                }
            }
            // If player is above, use step-by-step climbing strategy
            else if (playerY < enemyY - 50) {
                // Step 1: Check if there's a platform directly above (within jump range)
                let nextLevelPlatform = null;
                let canReachPlayer = false;
                
                // Find platforms directly above current position
                this.game.platforms.forEach(platform => {
                    const platformCenterX = platform.x + platform.width / 2;
                    const horizontalDist = Math.abs(enemyX - platformCenterX);
                    const verticalDist = Math.abs(enemyY - platform.y);
                    
                    // Only consider platforms that are:
                    // 1. Above current position (but not too high)
                    // 2. Within reasonable jump range
                    if (platform.y < enemyY - 20 && verticalDist < 140 && horizontalDist < 200) {
                        if (!nextLevelPlatform || platform.y > nextLevelPlatform.y) {
                            // Prefer the lowest platform above (step-by-step climbing)
                            nextLevelPlatform = platform;
                        }
                    }
                });
                
                // Step 2: Check if player is reachable from current or next level
                const horizontalDistanceToPlayer = Math.abs(playerX - enemyX);
                const verticalDistanceToPlayer = Math.abs(playerY - enemyY);
                
                // Can reach player if they're on same level or one level up
                // Add personality offset to make movement more natural
                const adjustedPlayerX = playerX + this.personalityOffset;
                const adjustedHorizontalDistance = Math.abs(enemyX - adjustedPlayerX);
                
                if (verticalDistanceToPlayer < 140 && adjustedHorizontalDistance < 300) {
                    canReachPlayer = true;
                }
                
                // Step 3: Decision making
                if (canReachPlayer && adjustedHorizontalDistance > 50) {
                    // Player is reachable - move towards adjusted player position for natural spread
                    if (adjustedPlayerX < enemyX) {
                        wantsToMoveLeft = true;
                        wantsToMoveRight = false;
                    } else {
                        wantsToMoveRight = true;
                        wantsToMoveLeft = false;
                    }
                } else if (nextLevelPlatform) {
                    // Player not directly reachable - climb to next level
                    const platformCenterX = nextLevelPlatform.x + nextLevelPlatform.width / 2;
                    const distanceToPlatform = Math.abs(enemyX - platformCenterX);
                    
                    // Check if enemy is under the platform (needs to move to edge to jump)
                    const enemyUnderPlatform = (enemyX + this.width/2 >= nextLevelPlatform.x && 
                                              enemyX + this.width/2 <= nextLevelPlatform.x + nextLevelPlatform.width);
                    
                    if (enemyUnderPlatform) {
                        // Enemy is directly under platform - move to nearest edge to avoid getting stuck
                        const leftEdgeDistance = Math.abs(enemyX - nextLevelPlatform.x);
                        const rightEdgeDistance = Math.abs((enemyX + this.width) - (nextLevelPlatform.x + nextLevelPlatform.width));
                        
                        if (leftEdgeDistance < rightEdgeDistance) {
                            // Move to left edge
                            wantsToMoveLeft = true;
                            wantsToMoveRight = false;
                        } else {
                            // Move to right edge  
                            wantsToMoveRight = true;
                            wantsToMoveLeft = false;
                        }
                    } else if (distanceToPlatform > 30) {
                        // Move towards the platform center
                        if (platformCenterX < enemyX) {
                            wantsToMoveLeft = true;
                            wantsToMoveRight = false;
                        } else {
                            wantsToMoveRight = true;
                            wantsToMoveLeft = false;
                        }
                    } else {
                        // Close enough to platform center, stop and prepare to jump
                        wantsToMoveLeft = false;
                        wantsToMoveRight = false;
                    }
                } else {
                    // No platform above - check if player is below and move to edge to drop down
                    if (playerY > enemyY + 30) { // More sensitive detection
                        // Player is below - move to platform edge to drop down
                        const currentPlatform = this.getCurrentPlatform();
                        if (currentPlatform) {
                            const leftEdge = currentPlatform.x;
                            const rightEdge = currentPlatform.x + currentPlatform.width;
                            const enemyCenterX = enemyX;
                            
                            // Determine which edge is closer to player
                            const distToLeftEdge = Math.abs(leftEdge - playerX);
                            const distToRightEdge = Math.abs(rightEdge - playerX);
                            
                            let targetEdge;
                            if (distToLeftEdge < distToRightEdge) {
                                targetEdge = leftEdge + 5; // Closer to edge for easier dropping
                            } else {
                                targetEdge = rightEdge - 5; // Closer to edge for easier dropping
                            }
                            
                            // Move towards the target edge more aggressively
                            if (Math.abs(enemyCenterX - targetEdge) > 10) { // Smaller tolerance
                                if (targetEdge < enemyCenterX) {
                                    wantsToMoveLeft = true;
                                    wantsToMoveRight = false;
                                } else {
                                    wantsToMoveRight = true;
                                    wantsToMoveLeft = false;
                                }
                            }
                        }
                    } else {
                        // Player not below - move towards player horizontally
                        if (horizontalDistanceToPlayer > 50) {
                            if (playerX < enemyX) {
                                wantsToMoveLeft = true;
                                wantsToMoveRight = false;
                            } else {
                                wantsToMoveRight = true;
                                wantsToMoveLeft = false;
                            }
                        }
                    }
                }
            }
        }
        } // End of exploration mode check
        
        // Strong enemy collision avoidance - prevent clustering
        let avoidanceForce = { x: 0, count: 0 };
        this.game.enemies.forEach(otherEnemy => {
            if (otherEnemy !== this && otherEnemy.active && !otherEnemy.frozen && !this.frozen) {
                const distance = Math.abs((this.x + this.width/2) - (otherEnemy.x + otherEnemy.width/2));
                const verticalDistance = Math.abs((this.y + this.height/2) - (otherEnemy.y + otherEnemy.height/2));
                
                // Much larger avoidance radius to prevent clustering
                if (distance < this.width + 80 && verticalDistance < this.height) {
                    avoidanceForce.count++;
                    
                    // Calculate repulsion force
                    if (this.x < otherEnemy.x) {
                        avoidanceForce.x -= 1; // Push left
                    } else {
                        avoidanceForce.x += 1; // Push right
                    }
                }
            }
        });
        
        // Apply strong avoidance if multiple enemies nearby
        if (avoidanceForce.count > 0) {
            if (avoidanceForce.x < 0) {
                wantsToMoveLeft = true;
                wantsToMoveRight = false;
                // Force immediate movement
                this.vx = Math.min(this.vx - 0.5, -this.currentSpeed);
            } else if (avoidanceForce.x > 0) {
                wantsToMoveRight = true;
                wantsToMoveLeft = false;
                // Force immediate movement
                this.vx = Math.max(this.vx + 0.5, this.currentSpeed);
            }
            
            // If 2+ enemies nearby, enter exploration mode immediately
            if (avoidanceForce.count >= 2) {
                this.explorationTimer = 3000; // Force 3 seconds exploration
                this.explorationDirection = avoidanceForce.x > 0 ? 1 : -1;
            }
        }
        
        // Apply acceleration-based movement (like player) - but adjust if preparing to jump
        if (this.isPreparingToJump && this.targetPlatformX > 0) {
            // Move towards target platform center while preparing to jump
            const enemyCenterX = this.x + this.width / 2;
            const distanceToTarget = Math.abs(enemyCenterX - this.targetPlatformX);
            
            if (distanceToTarget > 10) { // If not close enough to target
                if (this.targetPlatformX < enemyCenterX) {
                    // Move left towards target
                    this.vx -= this.acceleration * 0.5; // Slower movement while preparing
                    if (this.vx < -this.currentSpeed * 0.7) this.vx = -this.currentSpeed * 0.7;
                } else {
                    // Move right towards target
                    this.vx += this.acceleration * 0.5; // Slower movement while preparing
                    if (this.vx > this.currentSpeed * 0.7) this.vx = this.currentSpeed * 0.7;
                }
            } else {
                // Close enough to target, stop moving
                if (Math.abs(this.vx) < 0.1) {
                    this.vx = 0;
                } else {
                    this.vx *= this.game.friction * 0.3; // Stop faster when in position
                }
            }
        } else if (wantsToMoveLeft) {
            this.vx -= this.acceleration;
            if (this.vx < -this.currentSpeed) this.vx = -this.currentSpeed;
            this.facingRight = false; // Update facing direction
        } else if (wantsToMoveRight) {
            this.vx += this.acceleration;
            if (this.vx > this.currentSpeed) this.vx = this.currentSpeed;
            this.facingRight = true; // Update facing direction
        } else {
            // Apply friction when no input (like player)
            if (Math.abs(this.vx) < 0.1) {
                this.vx = 0;
            } else {
                this.vx *= this.game.friction;
            }
        }
        
        // Smart jumping - more aggressive platform seeking
        // Don't jump if affected by snow or frozen
        if (this.onGround && this.jumpCooldown <= 0 && this.snowHits === 0 && !this.frozen) {
            const playerAbove = playerY < enemyY - 30;
            const playerDistance = Math.abs(playerX - enemyX);
            
            // More aggressive jumping when player is above or nearby
            let shouldAttemptJump = false;
            let hasLandingPlatform = false;
            let landingPlatformX = 0;
            let bestPlatformDistance = Infinity;
            
            // First, check if there are any platforms above to jump to
            this.game.platforms.forEach(platform => {
                const jumpHeight = 140; // Balanced jump reach
                if (platform.y < enemyY && platform.y > enemyY - jumpHeight) {
                    // Check if enemy can reach this platform horizontally
                    const horizontalReach = 120;
                    const enemyCenterX = this.x + this.width / 2;
                    const platformCenterX = platform.x + platform.width / 2;
                    const horizontalDistance = Math.abs(enemyCenterX - platformCenterX);
                    
                    if (horizontalDistance < horizontalReach) {
                        // Prefer the lowest platform above (step-by-step climbing)
                        if (!hasLandingPlatform || platform.y > bestPlatformDistance) {
                            hasLandingPlatform = true;
                            landingPlatformX = platformCenterX;
                            bestPlatformDistance = platform.y; // Use Y coordinate to find lowest platform
                        }
                    }
                }
            });
            
            // Only consider jumping if there's a platform above
            if (hasLandingPlatform) {
                // Increased jump motivation - especially when player is above
                if (playerAbove && playerDistance < 400) {
                    shouldAttemptJump = Math.random() < 0.8; // 80% chance when player is above
                } else if (playerAbove && playerDistance < 600) {
                    shouldAttemptJump = Math.random() < 0.6; // 60% chance when player is above and far
                } else if (playerDistance < 150) {
                    shouldAttemptJump = Math.random() < 0.3; // 30% chance when very close
                } else {
                    shouldAttemptJump = Math.random() < 0.15; // 15% chance otherwise
                }
            } else {
                // No platform above - don't jump
                shouldAttemptJump = false;
            }
            
            // More aggressive jumping if just landed and player still above
            const justLandedBonus = this.justLanded && playerAbove ? 0.15 : 0; // 15% extra chance if just landed and player above
            
            // Extra bonus if player is directly above (within 60 pixels horizontally)
            const directlyAboveBonus = (Math.abs(playerX - enemyX) < 60 && playerAbove) ? 0.25 : 0; // 25% extra if directly above
            
            const personalityJumpChance = (0.05 + justLandedBonus + directlyAboveBonus) * this.aggressiveness; // Personality affects jump chance
            
            const shouldPrepareJump = shouldAttemptJump && hasLandingPlatform; // Only jump when motivated AND platform available
            
            if (shouldPrepareJump && !this.isPreparingToJump) {
                // Start preparing to jump
                this.isPreparingToJump = true;
                // Shorter preparation time for more responsive jumping
                const basePrepTime = this.justLanded ? (100 + Math.random() * 100) : (200 + Math.random() * 200);
                const personalityPrepTime = basePrepTime * Math.min(this.patience, 1.2); // Cap patience effect
                this.jumpPreparationTime = personalityPrepTime;
                this.targetPlatformX = landingPlatformX; // Remember target platform
            }
            
            // Execute jump after preparation
            if (this.isPreparingToJump && this.jumpPreparationTime <= 0) {
                this.vy = -this.jumpPower; // Use enemy's jump power
                this.onGround = false;
                this.jumpCooldown = 300 + Math.random() * 200; // Much shorter cooldown for continuous climbing
                this.isPreparingToJump = false;
                this.targetPlatformX = 0; // Reset target
            }
        }
        
        // Check if about to fall off platform and maybe jump
        const nextX = this.x + this.vx * 2; // Look ahead
        let willBeOnPlatform = false;
        
        this.game.platforms.forEach(platform => {
            if (this.y + this.height >= platform.y - 5 && 
                this.y + this.height <= platform.y + platform.height + 10 &&
                nextX + this.width > platform.x && 
                nextX < platform.x + platform.width) {
                willBeOnPlatform = true;
            }
        });
        
        // If about to fall off and on ground, prepare to jump or turn around
        // Don't jump if affected by snow or frozen
        if (!willBeOnPlatform && this.onGround && this.jumpCooldown <= 0 && !this.isPreparingToJump && 
            this.snowHits === 0 && !this.frozen) {
            const playerAbove = playerY < enemyY - 20; // Even more sensitive
            const playerNearby = Math.abs(playerX - enemyX) < 200; // Player is nearby
            
            if ((playerAbove || playerNearby) && Math.random() < 0.3) { // More reasonable chance to 30%
                // Find best platform to jump to
                let bestPlatform = null;
                let bestDistance = Infinity;
                
                this.game.platforms.forEach(platform => {
                    if (platform.y < enemyY && platform.y > enemyY - 140) {
                        const platformCenterX = platform.x + platform.width / 2;
                        const distance = Math.abs(platformCenterX - playerX); // Distance to player
                        if (distance < bestDistance) {
                            bestDistance = distance;
                            bestPlatform = platform;
                        }
                    }
                });
                
                this.isPreparingToJump = true;
                this.jumpPreparationTime = 400 + Math.random() * 200; // Shorter prep at edge
                this.targetPlatformX = bestPlatform ? bestPlatform.x + bestPlatform.width / 2 : playerX;
            } else if (Math.random() < 0.7) { // 70% chance to turn around - more defensive
                this.vx = -this.vx;
            } else { // 30% chance to prepare jump off - less risky
                this.isPreparingToJump = true;
                this.jumpPreparationTime = 400 + Math.random() * 200; // Shorter prep at edge
                this.targetPlatformX = playerX; // Jump towards player
            }
        }
        
        // Execute edge jump after preparation
        // Don't jump if affected by snow or frozen
        if (!willBeOnPlatform && this.onGround && this.isPreparingToJump && this.jumpPreparationTime <= 0 && 
            this.snowHits === 0 && !this.frozen) {
            this.vy = -this.jumpPower; // Use enemy's jump power
            this.onGround = false;
            this.jumpCooldown = 800;
            this.isPreparingToJump = false;
            this.targetPlatformX = 0; // Reset target
        }
        
        // Screen boundaries - STRICT enforcement
        if (this.x <= 0) {
            this.x = 0; // Force position back inside
            this.vx = Math.abs(this.vx); // Force movement to the right
        } else if (this.x + this.width >= this.game.canvas.width) {
            this.x = this.game.canvas.width - this.width; // Force position back inside
            this.vx = -Math.abs(this.vx); // Force movement to the left
        }
        
        // Apply gravity
        this.vy += this.game.gravity;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Platform collision - allow passing through from sides and bottom
        this.onGround = false;
        this.game.platforms.forEach(platform => {
            // Check if enemy is overlapping with platform
            const overlapping = this.x < platform.x + platform.width &&
                               this.x + this.width > platform.x &&
                               this.y < platform.y + platform.height &&
                               this.y + this.height > platform.y;
            
            if (overlapping) {
                // Only land on platform if falling down and enemy's bottom was above platform before
                const enemyBottom = this.y + this.height;
                const enemyBottomPrevious = enemyBottom - this.vy;
                const enemyTop = this.y;
                const enemyTopPrevious = enemyTop - this.vy;
                
                // Landing on top of platform (falling down)
                if (this.vy > 0 && enemyBottomPrevious <= platform.y + 5) { // 5px tolerance
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    
                    // Mark as just landed for focused movement
                    if (!this.justLanded) {
                        this.justLanded = true;
                        this.landingFocusTime = 1500 + Math.random() * 1000; // 1.5-2.5 seconds focus on player
                        
                        // Reset jump cooldown when landing to allow immediate next jump
                        this.jumpCooldown = 0; // Allow immediate jumping after landing
                        
                        // If player is above, be even more motivated to jump again
                        if (playerY < this.y - 30) {
                            this.jumpCooldown = -100; // Negative cooldown = immediate jump readiness
                        }
                    }
                }
                // Passing through from bottom (jumping up) - allow passage
                else if (this.vy < 0 && enemyTopPrevious >= platform.y + platform.height - 5) {
                    // Allow enemy to pass through platform from below
                    // No collision response - enemy continues upward
                }
                // Side collision only for ground platforms (walls)
                else if (platform.type === 'ground') {
                    const enemyCenterX = this.x + this.width / 2;
                    const platformCenterX = platform.x + platform.width / 2;
                    
                    if (enemyCenterX < platformCenterX && this.vx > 0) {
                        // Hit from left
                        this.x = platform.x - this.width;
                        this.vx = -this.vx;
                    } else if (enemyCenterX > platformCenterX && this.vx < 0) {
                        // Hit from right
                        this.x = platform.x + platform.width;
                        this.vx = -this.vx;
                    }
                }
            }
        });
        
        // FINAL BOUNDARY CHECK - Ensure enemy never goes off screen
        if (this.x < 0) {
            this.x = 0;
            this.vx = Math.abs(this.vx); // Force movement to the right
        } else if (this.x + this.width > this.game.canvas.width) {
            this.x = this.game.canvas.width - this.width;
            this.vx = -Math.abs(this.vx); // Force movement to the left
        }
        
        // If enemy falls too far down, destroy it (fell off screen)
        if (this.y > this.game.canvas.height + 100) {
            console.log(`Enemy fell off screen! Destroying...`);
            this.destroy();
        }
    }
    
    addSnow() {
        this.snowHits++;
        console.log(`❄️ ENEMY HIT BY SNOW! snowHits=${this.snowHits}, frozen=${this.frozen}, x=${this.x.toFixed(1)}, y=${this.y.toFixed(1)}`);
        
        if (this.snowHits === 1) {
            // 1st Hit: Stop and freeze (can't move and can't kill player)
            this.frozen = true; // IMPORTANT: Set frozen to prevent killing player
            this.currentSpeed = 0;
            this.maxSpeed = 0;
            this.vx = 0;
            // Don't reset vy - let enemy fall with gravity if in air
            
            // Cancel jump preparation
            this.isPreparingToJump = false;
            this.jumpPreparationTime = 0;
            
            // Visual effect - yellow color (stopped)
            this.game.addParticle(this.x + this.width/2, this.y + this.height/2, '#FFFF00');
            
            // No timer - permanent stop until death
            
        } else if (this.snowHits === 2) {
            // 2nd Hit: Medium freeze (slightly longer stop)
            this.frozen = true;
            this.currentSpeed = 0;
            this.maxSpeed = 0;
            this.vx = 0;
            // Don't reset vy - let enemy fall with gravity if in air
            
            // Cancel jump preparation
            this.isPreparingToJump = false;
            this.jumpPreparationTime = 0;
            
            // Visual effect - blue color (medium freeze)
            this.game.addParticle(this.x + this.width/2, this.y + this.height/2, '#00FFFF');
            
            // No timer - permanent freeze until death
            
        } else if (this.snowHits >= 3) {
            console.log(`🎯 ENEMY BECOMING FULL SNOWBALL! snowHits=${this.snowHits}`);
            
            // 3rd Hit: Full snowball transformation - DIRECT SETUP
            this.frozen = true;
            this.currentSpeed = 0;
            this.maxSpeed = 0;
            this.vx = 0;
            // Don't reset vy - let enemy fall with gravity if in air
            
            // Set as fully frozen snowball - ready to be pushed
            this.frozenTime = 5000; // 5 seconds to melt
            this.canMelt = true; // Can melt after 5 seconds
            
            // Set timer to unfreeze after 5 seconds if not pushed
            setTimeout(() => {
                if (this.active && this.frozen && this.snowHits >= 3 && !this.isPushed) {
                    console.log(`🔥 SNOWBALL MELTING! Enemy unfreezing after 5 seconds`);
                    this.unfreeze();
                }
            }, 5000);
            
            // Cancel jump preparation
            this.isPreparingToJump = false;
            this.jumpPreparationTime = 0;
            
            console.log(`✅ SNOWBALL READY TO PUSH! frozen=${this.frozen}, snowHits=${this.snowHits}, frozenTime=${this.frozenTime}`);
            
            // Visual effect - white color (full snowball)
            this.game.addParticle(this.x + this.width/2, this.y + this.height/2, '#FFFFFF');
            
            // Add extra particles for full snowball effect
            for (let i = 0; i < 5; i++) {
                this.game.addParticle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    '#FFFFFF'
                );
            }
        }
        
        // Snow melting system COMPLETELY REMOVED - no recovery allowed
        // Once hit by snow, effects are permanent until enemy dies
    }
    
    // freeze() method removed - now handled directly in addSnow() for 3rd hit
    
    unfreeze() {
        console.log(`🔥 ENEMY UNFREEZING! snowHits=${this.snowHits} → 0`);
        
        // Reset all snow effects
        this.frozen = false;
        this.snowHits = 0;
        this.frozenTime = 0;
        this.canMelt = true;
        
        // Restore movement capabilities
        this.currentSpeed = this.maxSpeed;
        this.maxSpeed = 1.8; // Original speed
        
        // Add unfreeze particles
        for (let i = 0; i < 8; i++) {
            this.game.addParticle(
                this.x + Math.random() * this.width,
                this.y + Math.random() * this.height,
                '#FFD700' // Gold color for melting
            );
        }
    }
    
    push(direction) {
        console.log(`PUSH METHOD CALLED: frozen=${this.frozen}, snowHits=${this.snowHits}, isRolling=${this.isRolling}`);
        
        if (this.frozen && this.snowHits >= 3 && !this.isRolling) { // Only fully frozen, non-rolling enemies
            console.log(`PUSH CONDITIONS MET - EXECUTING PUSH`);
            
            // Push the frozen enemy with MAXIMUM force
            this.vx = direction * 25; // MAXIMUM push force
            this.vy = -5; // Higher bounce for better trajectory
            this.isPushed = true;
            this.rollSpeed = direction * 25; // MAXIMUM rolling speed
            this.isRolling = true;
            this.rollStartTime = Date.now(); // Track when rolling started
            
            // DISABLE ALL MELTING - enemy will never recover
            this.frozenTime = 999999; // Infinite frozen time - no melting
            this.canMelt = false; // Flag to prevent any melting
            
            console.log(`PUSH EXECUTED: vx=${this.vx}, vy=${this.vy}, rollSpeed=${this.rollSpeed}, isRolling=${this.isRolling}`);
            
            // Add MASSIVE push effect particles
            for (let i = 0; i < 8; i++) {
                this.game.addParticle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    '#FFFFFF'
                );
            }
            
            // Add blue ice particles for dramatic effect
            for (let i = 0; i < 5; i++) {
                this.game.addParticle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    '#87CEEB'
                );
            }
            
            return true; // Indicate successful push
        }
        
        console.log(`PUSH CONDITIONS NOT MET`);
        return false; // Indicate failed push
    }
    
    destroy() {
        this.active = false;
        this.game.score += 100;
        this.game.addParticle(this.x + this.width/2, this.y + this.height/2, this.color);
        
        // Enemy destroyed successfully
    }
    
    render(ctx) {
        if (!this.active) return;
        
        if (this.frozen) {
            // Draw as snowball
            ctx.fillStyle = '#E6F3FF';
            ctx.strokeStyle = '#B0D4F1';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Add sparkles
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 3; i++) {
                const sparkleX = this.x + Math.random() * this.width;
                const sparkleY = this.y + Math.random() * this.height;
                ctx.fillRect(sparkleX, sparkleY, 2, 2);
            }
        } else {
            // Draw enemy with image if loaded, otherwise fallback to colored rectangle
            const jumpCompress = this.isPreparingToJump ? 0.9 : 1.0;
            const compressedHeight = this.height * jumpCompress;
            const yOffset = this.height - compressedHeight;
            
            if (this.imagesLoaded) {
                // Always use the right-facing image and flip for left direction
                ctx.save();
                
                if (this.facingRight) {
                    // Normal right-facing image
                    ctx.drawImage(
                        this.imageRight,
                        this.x,
                        this.y + yOffset,
                        this.width,
                        compressedHeight
                    );
                } else {
                    // Flip horizontally for left movement (like main character)
                    ctx.translate(this.x + this.width, this.y + yOffset);
                    ctx.scale(-1, 1);
                    ctx.drawImage(
                        this.imageRight,
                        0,
                        0,
                        this.width,
                        compressedHeight
                    );
                }
                
                ctx.restore();
            } else {
                // Fallback to colored rectangle while images load
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y + yOffset, this.width, compressedHeight);
                
                // Eyes - 1.8x scaled, adjusted for jump compression
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(this.x + 10, this.y + yOffset + 10, 8, 8);
                ctx.fillRect(this.x + 32, this.y + yOffset + 10, 8, 8);
                
                ctx.fillStyle = '#000000';
                ctx.fillRect(this.x + 14, this.y + yOffset + 14, 4, 4);
                ctx.fillRect(this.x + 36, this.y + yOffset + 14, 4, 4);
            }
            
            // Show snow accumulation based on hit count (after image rendering)
            if (this.snowHits === 1) {
                // 1st Hit: Yellow overlay (stopped)
                ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
                ctx.fillRect(this.x, this.y + yOffset, this.width, compressedHeight);
                
                // Stop effect - yellow dots
                ctx.fillStyle = '#FFFF00';
                for (let i = 0; i < 4; i++) {
                    const dotX = this.x + (i * 10) + 8;
                    const dotY = this.y + yOffset + 8 + (i % 2) * 12;
                    ctx.fillRect(dotX, dotY, 3, 3);
                }
                
            } else if (this.snowHits === 2) {
                // 2nd Hit: Blue overlay (medium freeze)
                ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
                ctx.fillRect(this.x, this.y + yOffset, this.width, compressedHeight);
                
                // Medium freeze effect - blue icy appearance
                ctx.fillStyle = '#00FFFF';
                for (let i = 0; i < 8; i++) {
                    const dotX = this.x + (i * 6) + 5;
                    const dotY = this.y + yOffset + 5 + (i % 3) * 10;
                    ctx.fillRect(dotX, dotY, 2, 2);
                }
                
            } else if (this.snowHits >= 3) {
                // 3rd Hit: White overlay (full snowball)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillRect(this.x, this.y + yOffset, this.width, compressedHeight);
                
                // Full snowball effect - white snow particles
                ctx.fillStyle = '#FFFFFF';
                for (let i = 0; i < 12; i++) {
                    const dotX = this.x + (i * 4) + 3;
                    const dotY = this.y + yOffset + 3 + (i % 4) * 8;
                    ctx.fillRect(dotX, dotY, 2, 2);
                }
            }
            
            // Speed indicator - make snow slowdown visible
            if (this.currentSpeed < this.baseSpeed) {
                ctx.fillStyle = 'rgba(0, 100, 255, 0.6)';
                const speedRatio = this.currentSpeed / this.baseSpeed;
                ctx.fillRect(this.x, this.y - 8, this.width * speedRatio, 4);
                
                // Arka plan çubuğu
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(this.x, this.y - 8, this.width, 4);
                
                // Hız çubuğu
                ctx.fillStyle = 'rgba(0, 100, 255, 0.8)';
                ctx.fillRect(this.x, this.y - 8, this.width * speedRatio, 4);
            }
        }
    }
    
    // Update which platform level the enemy is currently on
    updatePlatformLevel() {
        let currentLevel = 0; // Ground level
        
        // Find the platform the enemy is standing on
        this.game.platforms.forEach((platform, index) => {
            if (this.x + this.width/2 >= platform.x && 
                this.x + this.width/2 <= platform.x + platform.width &&
                Math.abs(this.y + this.height - platform.y) < 10) {
                // Enemy is on this platform
                currentLevel = Math.floor(platform.y / 100); // Rough level calculation
            }
        });
        
        this.currentPlatformLevel = currentLevel;
    }
    
    // Get the platform the player is currently on
    getPlayerPlatform() {
        const player = this.game.player;
        const playerCenterX = player.x + player.width/2;
        const playerBottom = player.y + player.height;
        
        for (let platform of this.game.platforms) {
            if (playerCenterX >= platform.x && 
                playerCenterX <= platform.x + platform.width &&
                Math.abs(playerBottom - platform.y) < 15) {
                return platform;
            }
        }
        return null;
    }
    
    // Smart pathfinding that considers intermediate platforms
    findSmartPath(targetX, targetY) {
        const enemyX = this.x + this.width/2;
        const enemyY = this.y + this.height/2;
        const currentPlatform = this.getCurrentPlatform();
        
        if (!currentPlatform) return null;
        
        // Find all platforms that could be intermediate steps
        const platforms = this.game.platforms.filter(p => p !== currentPlatform);
        let bestPath = null;
        let shortestDistance = Infinity;
        
        // Try direct path first
        const directPath = this.findDirectPath(targetX, targetY);
        if (directPath) {
            bestPath = directPath;
            shortestDistance = Math.abs(enemyX - targetX) + Math.abs(enemyY - targetY);
        }
        
        // Try paths through intermediate platforms
        platforms.forEach(intermediatePlatform => {
            const intermediateX = intermediatePlatform.x + intermediatePlatform.width/2;
            const intermediateY = intermediatePlatform.y;
            
            // Check if this intermediate platform helps us get closer to target
            const distanceToIntermediate = Math.abs(enemyX - intermediateX) + Math.abs(enemyY - intermediateY);
            const distanceFromIntermediateToTarget = Math.abs(intermediateX - targetX) + Math.abs(intermediateY - targetY);
            const totalDistance = distanceToIntermediate + distanceFromIntermediateToTarget;
            
            // Only consider if it's reachable and gets us closer
            if (distanceToIntermediate < 300 && totalDistance < shortestDistance) {
                // Check if we can jump to intermediate platform
                if (this.canReachPlatform(currentPlatform, intermediatePlatform)) {
                    bestPath = {
                        action: 'move_to_intermediate',
                        targetX: intermediateX,
                        intermediatePlatform: intermediatePlatform,
                        finalTarget: { x: targetX, y: targetY }
                    };
                    shortestDistance = totalDistance;
                }
            }
        });
        
        return bestPath;
    }
    
    // Check if we can reach a platform from current position
    canReachPlatform(fromPlatform, toPlatform) {
        const horizontalDistance = Math.abs(
            (fromPlatform.x + fromPlatform.width/2) - (toPlatform.x + toPlatform.width/2)
        );
        const verticalDistance = Math.abs(fromPlatform.y - toPlatform.y);
        
        // Can reach if horizontal distance is reasonable and vertical is within jump range
        return horizontalDistance < 200 && verticalDistance < 120;
    }
    
    // Find direct path to target
    findDirectPath(targetX, targetY) {
        const enemyX = this.x + this.width/2;
        const enemyY = this.y + this.height/2;
        const horizontalDistance = Math.abs(enemyX - targetX);
        const verticalDistance = Math.abs(enemyY - targetY);
        
        // If target is above and reachable
        if (targetY < enemyY - 30 && horizontalDistance < 170 && verticalDistance < 120) {
            return {
                action: 'jump_to_platform',
                targetX: targetX,
                direct: true
            };
        }
        
        // If target is below, move to edge
        if (targetY > enemyY + 30) {
            const currentPlatform = this.getCurrentPlatform();
            if (currentPlatform) {
                const leftEdge = currentPlatform.x;
                const rightEdge = currentPlatform.x + currentPlatform.width;
                const distToLeft = Math.abs(enemyX - leftEdge);
                const distToRight = Math.abs(enemyX - rightEdge);
                
                return {
                    action: 'move_to_edge',
                    direction: distToLeft < distToRight ? -1 : 1,
                    targetX: distToLeft < distToRight ? leftEdge : rightEdge
                };
            }
        }
        
        return null;
    }
    
    // Smart pathfinding - find the best way to reach target level
    findPathToLevel(targetLevel) {
        if (this.pathfindingCooldown > 0) return null;
        
        const currentLevel = this.currentPlatformLevel;
        if (currentLevel === targetLevel) return null;
        
        this.pathfindingCooldown = 500; // 0.5 second cooldown - faster pathfinding
        
        // If target is below, find nearest platform edge to drop down
        if (targetLevel > currentLevel) {
            return this.findDropPath();
        }
        // If target is above, find nearest platform to jump up
        else {
            return this.findJumpPath();
        }
    }
    
    // Find path to drop down to lower level
    findDropPath() {
        const currentPlatform = this.getCurrentPlatform();
        if (!currentPlatform) return null;
        
        // Find the closest edge to move towards
        const leftEdge = currentPlatform.x;
        const rightEdge = currentPlatform.x + currentPlatform.width;
        const enemyCenter = this.x + this.width/2;
        
        const distToLeft = Math.abs(enemyCenter - leftEdge);
        const distToRight = Math.abs(enemyCenter - rightEdge);
        
        return {
            action: 'move_to_edge',
            direction: distToLeft < distToRight ? -1 : 1,
            targetX: distToLeft < distToRight ? leftEdge : rightEdge
        };
    }
    
    // Find path to jump up to higher level
    findJumpPath() {
        const enemyX = this.x + this.width/2;
        const enemyY = this.y;
        const currentPlatform = this.getCurrentPlatform();
        
        if (!currentPlatform) return null;
        
        // First, look for platforms on the same level that can lead to upper platforms
        let bestRoute = null;
        let shortestTotalDistance = Infinity;
        
        // Check direct jump to upper platforms
        this.game.platforms.forEach(upperPlatform => {
            if (upperPlatform.y < enemyY - 50) { // Platform is above
                const platformCenterX = upperPlatform.x + upperPlatform.width/2;
                const directDistance = Math.abs(enemyX - platformCenterX);
                
                // If we can reach it directly - increased range for better climbing
                if (directDistance < 200) {
                    const totalDistance = directDistance;
                    if (totalDistance < shortestTotalDistance) {
                        bestRoute = {
                            action: 'jump_to_platform',
                            targetX: platformCenterX,
                            platform: upperPlatform,
                            type: 'direct'
                        };
                        shortestTotalDistance = totalDistance;
                    }
                }
                // If we can't reach directly, look for intermediate platforms
                else {
                    this.game.platforms.forEach(intermediatePlatform => {
                        // Same level as current platform
                        if (Math.abs(intermediatePlatform.y - currentPlatform.y) < 20 && 
                            intermediatePlatform !== currentPlatform) {
                            
                            const intermediateX = intermediatePlatform.x + intermediatePlatform.width/2;
                            const distanceToIntermediate = Math.abs(enemyX - intermediateX);
                            const distanceFromIntermediate = Math.abs(intermediateX - platformCenterX);
                            
                            // Check if intermediate platform can reach the upper platform - increased ranges
                            if (distanceFromIntermediate < 200 && distanceToIntermediate < 400) {
                                const totalDistance = distanceToIntermediate + distanceFromIntermediate;
                                if (totalDistance < shortestTotalDistance) {
                                    bestRoute = {
                                        action: 'move_to_intermediate',
                                        targetX: intermediateX,
                                        intermediatePlatform: intermediatePlatform,
                                        finalPlatform: upperPlatform,
                                        type: 'indirect'
                                    };
                                    shortestTotalDistance = totalDistance;
                                }
                            }
                        }
                    });
                }
            }
        });
        
        return bestRoute;
    }
    
    // Get the platform enemy is currently standing on
    getCurrentPlatform() {
        const enemyCenter = this.x + this.width/2;
        const enemyBottom = this.y + this.height;
        
        for (let platform of this.game.platforms) {
            if (enemyCenter >= platform.x && 
                enemyCenter <= platform.x + platform.width &&
                Math.abs(enemyBottom - platform.y) < 10) {
                return platform;
            }
        }
        return null;
    }
}

// Snowball class
class Snowball {
    constructor(x, y, vx, game) {
        this.x = x;
        this.y = y;
        this.width = 14; // 8 * 1.8
        this.height = 14; // 8 * 1.8
        this.vx = vx;
        this.vy = 0;
        this.game = game;
        this.active = true;
        this.bounces = 0;
        this.maxBounces = 3;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Apply gravity
        this.vy += this.game.gravity * 0.5;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Platform collision - allow passing through from sides and bottom
        this.game.platforms.forEach(platform => {
            // Check if snowball is overlapping with platform
            const overlapping = this.x < platform.x + platform.width &&
                               this.x + this.width > platform.x &&
                               this.y < platform.y + platform.height &&
                               this.y + this.height > platform.y;
            
            if (overlapping) {
                // Only bounce if falling down and snowball's bottom was above platform before
                const snowballBottom = this.y + this.height;
                const snowballBottomPrevious = snowballBottom - this.vy;
                
                if (this.vy > 0 && snowballBottomPrevious <= platform.y + 5) { // 5px tolerance
                    this.y = platform.y - this.height;
                    this.vy = -this.vy * 0.6;
                    this.bounces++;
                    
                    if (this.bounces >= this.maxBounces) {
                        this.active = false;
                    }
                }
            }
        });
        
        // Enemy collision - check both frozen and unfrozen enemies
        this.game.enemies.forEach((enemy, index) => {
            const collision = this.game.checkCollision(this, enemy);
            
            // DEBUG: Log collision attempts for enemies with snowHits > 0
            if (enemy.snowHits > 0) {
                console.log(`🔍 COLLISION CHECK Enemy ${index}: snowHits=${enemy.snowHits}, collision=${collision}, snowball(${this.x.toFixed(1)},${this.y.toFixed(1)}) vs enemy(${enemy.x.toFixed(1)},${enemy.y.toFixed(1)})`);
            }
            
            if (collision) {
                if (enemy.snowHits < 3) {
                    // Add snow to enemy (gradual freezing) - works for all stages
                    console.log(`🎯 SNOWBALL HIT ENEMY! Current snowHits: ${enemy.snowHits} → Will become: ${enemy.snowHits + 1}`);
                    enemy.addSnow();
                    this.active = false;
                    this.game.addParticle(this.x, this.y, '#FFFFFF');
                } else {
                    // Full snowball - kar topu çarpınca durur (temas eder)
                    console.log(`❄️ SNOWBALL HIT FULL SNOWBALL ENEMY! snowHits: ${enemy.snowHits}`);
                    this.active = false;
                    this.game.addParticle(this.x, this.y, '#FFFFFF');
                }
            }
        });
        
        // Screen boundaries
        if (this.x < 0 || this.x > this.game.canvas.width || this.y > this.game.canvas.height) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

// Particle class for effects
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1.0;
        this.decay = 0.02;
        this.color = color;
        this.active = true;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.life -= this.decay;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.restore();
    }
}

// Global game instance
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

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new SnowBrosGame();
});
