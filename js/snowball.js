/**
 * Snow Bros Snowball Class
 * Kar topu mermi sistemi
 */

class Snowball {
    constructor(x, y, vx, game) {
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.SNOWBALL.WIDTH;
        this.height = GAME_CONFIG.SNOWBALL.HEIGHT;
        this.vx = vx;
        this.vy = 0;
        this.game = game;
        this.active = true;
        this.bounces = 0;
        this.maxBounces = GAME_CONFIG.SNOWBALL.MAX_BOUNCES;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Apply gravity (reduced for snowballs)
        this.vy += GAME_CONFIG.GRAVITY * GAME_CONFIG.SNOWBALL.GRAVITY_FACTOR;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Platform collision - allow passing through from sides and bottom
        this.game.platforms.forEach(platform => {
            if (this.checkPlatformCollision(platform)) {
                this.handlePlatformBounce(platform);
            }
        });
        
        // Enemy collision
        this.checkEnemyCollisions();
        
        // Screen boundaries
        this.checkScreenBounds();
    }
    
    /**
     * Platform çarpışması kontrolü
     */
    checkPlatformCollision(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }
    
    /**
     * Platform sekme işlemi
     */
    handlePlatformBounce(platform) {
        // Sadece yukarıdan aşağı düşerken seksin
        const snowballBottom = this.y + this.height;
        const snowballBottomPrevious = snowballBottom - this.vy;
        
        if (this.vy > 0 && snowballBottomPrevious <= platform.y + 5) {
            this.y = platform.y - this.height;
            this.vy = -this.vy * 0.6; // Sekme katsayısı
            this.bounces++;
            
            // Maksimum sekme sayısına ulaştıysa yok ol
            if (this.bounces >= this.maxBounces) {
                this.active = false;
            }
        }
    }
    
    /**
     * Düşman çarpışmalarını kontrol et
     */
    checkEnemyCollisions() {
        this.game.enemies.forEach(enemy => {
            if (Utils.checkCollision(this, enemy)) {
                if (!enemy.frozen) {
                    // Donmamış düşmana kar ekle
                    enemy.addSnow();
                    this.active = false;
                    
                    // Kar isabet efekti
                    this.game.particleSystem.addSnowHitEffect(this.x, this.y);
                } else {
                    // Donmuş düşmandan geç (çarpışma yok)
                    // Kar topları birbirinden geçer
                }
            }
        });
    }
    
    /**
     * Ekran sınırlarını kontrol et
     */
    checkScreenBounds() {
        if (this.x < -this.width || 
            this.x > GAME_CONFIG.CANVAS_WIDTH || 
            this.y > GAME_CONFIG.CANVAS_HEIGHT + 50) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        // Ana kar topu
        ctx.fillStyle = COLORS.SNOWBALL.MAIN;
        ctx.strokeStyle = COLORS.SNOWBALL.EDGE;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.arc(
            this.x + this.width/2, 
            this.y + this.height/2, 
            this.width/2, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();
        
        // Kar taneleri efekti
        this.renderSnowFlakes(ctx);
    }
    
    /**
     * Kar taneleri efekti
     */
    renderSnowFlakes(ctx) {
        ctx.fillStyle = COLORS.SNOWBALL.EDGE;
        
        // Küçük kar taneleri
        for (let i = 0; i < 3; i++) {
            const angle = (Date.now() * 0.01 + i * 120) % 360;
            const radius = this.width * 0.2;
            const flakeX = this.x + this.width/2 + Math.cos(Utils.toRadians(angle)) * radius;
            const flakeY = this.y + this.height/2 + Math.sin(Utils.toRadians(angle)) * radius;
            
            ctx.fillRect(flakeX - 1, flakeY - 1, 2, 2);
        }
    }
    
    /**
     * Kar topunun aktif olup olmadığını döndür
     */
    isActive() {
        return this.active;
    }
    
    /**
     * Kar topunu yok et
     */
    destroy() {
        this.active = false;
    }
    
    /**
     * Kar topunun pozisyonunu döndür
     */
    getPosition() {
        return {
            x: this.x + this.width/2,
            y: this.y + this.height/2
        };
    }
    
    /**
     * Kar topunun hızını döndür
     */
    getVelocity() {
        return {
            vx: this.vx,
            vy: this.vy
        };
    }
    
    /**
     * Kar topunun hızını ayarla
     */
    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }
}

// Export for global access
window.Snowball = Snowball;
