// Player class - extracted from game.js
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
        this.maxSpeed = 1.8; // Reduced from 2.5 to 1.8
        this.acceleration = 0.2; // Reduced from 0.3 to 0.2
        this.jumpPower = 9; // Reduced from 9 to 8
        this.shootCooldown = 0;
        this.pushCooldown = 0; // Prevent spam pushing
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
        
        if (this.game.keys[' ']) {
            // PRIORITY 1: Try to push frozen enemies first (no cooldown needed for checking)
            let pushedEnemy = false;
            console.log(`🎯 SPACE PRESSED: Checking for pushable snowballs first...`);
            
            // Check for pushable snowballs
            if (this.pushCooldown <= 0) {
            this.game.enemies.forEach((enemy, index) => {
                // DEBUG: Log enemy state - only show enemies with snow hits
                if (enemy.snowHits > 0 || enemy.frozen) {
                    console.log(`Enemy ${index}: frozen=${enemy.frozen}, snowHits=${enemy.snowHits}, isRolling=${enemy.isRolling}, active=${enemy.active}, x=${enemy.x.toFixed(1)}, y=${enemy.y.toFixed(1)}`);
                }
                
                if (enemy.frozen && enemy.snowHits >= 3 && !enemy.isRolling) { // Only LEVEL 3 snowballs can be pushed
                    // Check if player and enemy are on same level (similar Y position)
                    const playerCenterX = this.x + this.width/2;
                    const playerCenterY = this.y + this.height/2;
                    const enemyCenterX = enemy.x + enemy.width/2;
                    const enemyCenterY = enemy.y + enemy.height/2;
                    
                    const horizontalDistance = Math.abs(playerCenterX - enemyCenterX);
                    const verticalDistance = Math.abs(playerCenterY - enemyCenterY);
                    
                    console.log(`Push Check: H=${horizontalDistance.toFixed(1)}, V=${verticalDistance.toFixed(1)} (need H<60, V<50), pushCooldown=${this.pushCooldown.toFixed(0)}`);
                    
                    // Very close range push - must be right next to snowball
                    if (horizontalDistance < 60 && verticalDistance < 50) {
                        // Determine push direction based on player position relative to enemy
                        const pushDirection = (playerCenterX < enemyCenterX) ? 1 : -1;
                        
                        console.log(`ATTEMPTING PUSH: direction=${pushDirection}`);
                        
                        // Push the frozen enemy with MAXIMUM force
                        const pushSuccess = enemy.push(pushDirection);
                        console.log(`PUSH RESULT: success=${pushSuccess}`);
                        
                        if (pushSuccess) {
                            pushedEnemy = true;
                            this.pushCooldown = 500; // 0.5 second cooldown after successful push
                            this.game.soundManager.playPush(); // Play push sound
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
            }
            
            // PRIORITY 2: If no enemy was pushed and shoot cooldown is ready, shoot snowball
            if (!pushedEnemy && this.shootCooldown <= 0) {
                console.log(`❄️ NO SNOWBALL TO PUSH: Shooting snowball instead (shootCooldown=${this.shootCooldown.toFixed(0)})`);
                this.shoot();
                this.shootCooldown = 300; // milliseconds
                this.isShooting = true;
                this.shootingTimer = 300; // Show shooting animation
            } else if (!pushedEnemy) {
                console.log(`⏳ SHOOT BLOCKED: shootCooldown=${this.shootCooldown.toFixed(0)}`);
            }
        }
        
        // Update cooldown and shooting timer
        this.shootCooldown -= deltaTime;
        this.pushCooldown -= deltaTime;
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
            // Check if player is overlapping with platform (with tolerance for edges)
            const tolerance = 8; // 8px tolerance for better movement through gaps
            const overlapping = this.x + tolerance < platform.x + platform.width &&
                               this.x + this.width - tolerance > platform.x &&
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
        
        // Check wall collisions for platforms with walls
        this.game.platforms.forEach(platform => {
            if (platform.walls) {
                this.checkWallCollision(platform);
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
                if (this.game.checkCollision(this, enemy)) {
                    if (enemy.snowHits === 0) {
                        // Only ACTIVE enemies (0 snow hits) can kill player
                        console.log(`💀 PLAYER KILLED by ACTIVE enemy (${enemy.snowHits} snow hits)`);
                        this.die();
                    } else if (enemy.snowHits >= 3 && enemy.frozen && !enemy.isRolling) {
                        // Level 3 snowball - drag it by touching (not push/launch)
                        const playerCenterX = this.x + this.width/2;
                        const enemyCenterX = enemy.x + enemy.width/2;
                        const dragDirection = (playerCenterX < enemyCenterX) ? -1 : 1; // Drag towards player
                        
                        console.log(`🤏 PLAYER DRAGGING SNOWBALL! direction=${dragDirection}`);
                        // Gentle drag movement instead of violent push
                        enemy.x += dragDirection * 2; // Slow drag movement
                        enemy.vx = dragDirection * 1; // Gentle momentum
                    } else {
                        // Level 1 or Level 2 frozen enemy - safe, no damage
                        console.log(`🛡️ PLAYER SAFE: Enemy has ${enemy.snowHits} snow hits (frozen/slowed, can't kill)`);
                    }
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
        this.game.soundManager.playShoot(); // Play shoot sound
    }
    
    die() {
        this.game.lives--;
        this.game.addParticle(this.x + this.width/2, this.y + this.height/2, '#FF0000');
        this.game.soundManager.playPlayerDeath(); // Play death sound
        
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
    
    checkWallCollision(platform) {
        platform.walls.forEach(wall => {
            const wallWidth = wall.width || 8; // Default 8px if not specified
            let wallX, wallY, wallW, wallH;
            
            switch(wall.type) {
                case 'left':
                    // Sol taraftan yukarı duvar
                    wallX = platform.x;
                    wallY = platform.y + platform.height;
                    wallW = wallWidth;
                    wallH = wall.height;
                    break;
                case 'right':
                    // Sağ taraftan yukarı duvar
                    wallX = platform.x + platform.width - wallWidth;
                    wallY = platform.y + platform.height;
                    wallW = wallWidth;
                    wallH = wall.height;
                    break;
                case 'left-down':
                    // Sol taraftan aşağı duvar
                    wallX = platform.x;
                    wallY = platform.y - wall.height;
                    wallW = wallWidth;
                    wallH = wall.height;
                    break;
                case 'right-down':
                    // Sağ taraftan aşağı duvar
                    wallX = platform.x + platform.width - wallWidth;
                    wallY = platform.y - wall.height;
                    wallW = wallWidth;
                    wallH = wall.height;
                    break;
            }
            
            // Check collision with wall
            if (this.x < wallX + wallW &&
                this.x + this.width > wallX &&
                this.y < wallY + wallH &&
                this.y + this.height > wallY) {
                
                // Determine collision side and respond
                const playerCenterX = this.x + this.width / 2;
                const wallCenterX = wallX + wallW / 2;
                
                if (playerCenterX < wallCenterX && this.vx > 0) {
                    // Hit wall from left
                    this.x = wallX - this.width;
                    this.vx = 0;
                } else if (playerCenterX > wallCenterX && this.vx < 0) {
                    // Hit wall from right
                    this.x = wallX + wallW;
                    this.vx = 0;
                }
            }
        });
    }
}
