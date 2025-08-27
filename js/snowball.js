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
                    
                    // Play appropriate sound based on hit count
                    if (enemy.snowHits === 2) {
                        this.game.soundManager.playFreeze(); // Final freeze sound
                    } else {
                        this.game.soundManager.playHit(); // Regular hit sound
                    }
                    
                    enemy.addSnow();
                    this.active = false;
                    this.game.addParticle(this.x, this.y, '#FFFFFF');
                } else {
                    // Full snowball - kar topu çarpınca durur (temas eder)
                    console.log(`❄️ SNOWBALL HIT FULL SNOWBALL ENEMY! snowHits: ${enemy.snowHits}`);
                    this.game.soundManager.playHit(); // Hit sound for snowball collision
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
