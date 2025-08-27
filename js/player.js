/**
 * Snow Bros Player Class
 * Oyuncu karakteri ve kontrolleri
 */

class Player {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.PLAYER.WIDTH;
        this.height = GAME_CONFIG.PLAYER.HEIGHT;
        this.vx = 0;
        this.vy = 0;
        this.game = game;
        this.onGround = false;
        this.maxSpeed = GAME_CONFIG.PLAYER.MAX_SPEED;
        this.acceleration = GAME_CONFIG.PLAYER.ACCELERATION;
        this.jumpPower = GAME_CONFIG.PLAYER.JUMP_POWER;
        this.shootCooldown = 0;
        this.direction = 1; // 1 for right, -1 for left
        this.isMoving = false;
        this.isShooting = false;
        this.shootingTimer = 0;
        this.deathCooldown = 0;
        
        // Character images
        this.images = {
            front: new Image(),
            right: new Image()
        };
        
        this.loadImages();
    }
    
    /**
     * Karakter resimlerini yükle
     */
    loadImages() {
        this.images.front.src = 'images/main_char.png';
        this.images.right.src = 'images/main_char_right.png';
        
        this.imagesLoaded = 0;
        this.totalImages = 2;
        
        this.images.front.onload = () => {
            this.imagesLoaded++;
            console.log('Front character image loaded');
        };
        
        this.images.right.onload = () => {
            this.imagesLoaded++;
            console.log('Right character image loaded');
        };
        
        this.images.front.onerror = () => {
            console.log('Failed to load front character image');
        };
        
        this.images.right.onerror = () => {
            console.log('Failed to load right character image');
        };
    }
    
    update(deltaTime) {
        this.handleInput(deltaTime);
        this.updatePhysics(deltaTime);
        this.checkCollisions();
        this.checkDeathConditions();
        this.updateTimers(deltaTime);
    }
    
    /**
     * Oyuncu girişlerini işle
     */
    handleInput(deltaTime) {
        this.isMoving = false;
        
        // Hareket kontrolü
        if (this.game.keys['a'] || this.game.keys['ArrowLeft']) {
            this.vx -= this.acceleration;
            if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;
            this.direction = -1;
            this.isMoving = true;
        } else if (this.game.keys['d'] || this.game.keys['ArrowRight']) {
            this.vx += this.acceleration;
            if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
            this.direction = 1;
            this.isMoving = true;
        } else {
            this.applyFriction();
        }
        
        // Zıplama kontrolü
        if ((this.game.keys['w'] || this.game.keys['ArrowUp']) && this.onGround) {
            this.jump();
        }
        
        // Atış/İtme kontrolü
        if (this.game.keys[' '] && this.shootCooldown <= 0) {
            this.handleShootOrPush();
        }
    }
    
    /**
     * Sürtünme uygula
     */
    applyFriction() {
        if (Math.abs(this.vx) < 0.1) {
            this.vx = 0;
        } else {
            this.vx *= GAME_CONFIG.FRICTION;
            // Kayma durumunda hala hareket ediyor sayılır
            if (Math.abs(this.vx) > 0.5) {
                this.isMoving = true;
            }
        }
    }
    
    /**
     * Zıplama işlemi
     */
    jump() {
        this.vy = -this.jumpPower;
        this.onGround = false;
        
        // Zıplama efekti
        this.game.particleSystem.addJumpEffect(
            this.x + this.width/2, 
            this.y + this.height
        );
    }
    
    /**
     * Atış veya itme işlemi
     */
    handleShootOrPush() {
        let pushedEnemy = false;
        
        // Yakındaki donmuş düşmanları kontrol et
        this.game.enemies.forEach(enemy => {
            if (enemy.frozen && this.canPushEnemy(enemy)) {
                enemy.push(this.direction);
                pushedEnemy = true;
                this.shootCooldown = GAME_CONFIG.PLAYER.SHOOT_COOLDOWN;
                this.startShootingAnimation();
            }
        });
        
        // Düşman itilmediyse kar at
        if (!pushedEnemy) {
            this.shoot();
            this.shootCooldown = GAME_CONFIG.PLAYER.SHOOT_COOLDOWN * 1.5;
            this.startShootingAnimation();
        }
    }
    
    /**
     * Düşmanın itilip itilemeyeceğini kontrol et
     */
    canPushEnemy(enemy) {
        const distance = Math.abs((this.x + this.width/2) - (enemy.x + enemy.width/2));
        const verticalDistance = Math.abs((this.y + this.height/2) - (enemy.y + enemy.height/2));
        
        return distance < 50 && verticalDistance < 40;
    }
    
    /**
     * Atış animasyonunu başlat
     */
    startShootingAnimation() {
        this.isShooting = true;
        this.shootingTimer = 300;
    }
    
    /**
     * Kar topu at
     */
    shoot() {
        const snowball = new Snowball(
            this.x + (this.direction > 0 ? this.width : 0),
            this.y + this.height/2,
            this.direction * GAME_CONFIG.SNOWBALL.SPEED,
            this.game
        );
        this.game.snowballs.push(snowball);
    }
    
    /**
     * Fizik güncellemesi
     */
    updatePhysics(deltaTime) {
        // Yerçekimi uygula
        this.vy += GAME_CONFIG.GRAVITY;
        
        // Pozisyonu güncelle
        this.x += this.vx;
        this.y += this.vy;
        
        // Ekran sınırları
        this.x = Utils.clamp(this.x, 0, GAME_CONFIG.CANVAS_WIDTH - this.width);
    }
    
    /**
     * Çarpışmaları kontrol et
     */
    checkCollisions() {
        this.onGround = false;
        
        this.game.platforms.forEach(platform => {
            if (this.checkPlatformCollision(platform)) {
                this.handlePlatformCollision(platform);
            }
        });
    }
    
    /**
     * Platform çarpışması kontrolü
     */
    checkPlatformCollision(platform) {
        return Utils.checkCollision(this, platform);
    }
    
    /**
     * Platform çarpışmasını işle
     */
    handlePlatformCollision(platform) {
        const playerBottom = this.y + this.height;
        const playerBottomPrevious = playerBottom - this.vy;
        
        // Yukarıdan aşağı düşerken platforma çarpma
        if (this.vy > 0 && playerBottomPrevious <= platform.y + 5) {
            this.y = platform.y - this.height;
            this.vy = 0;
            this.onGround = true;
        }
        // Zemin platformları için yan çarpışma (duvar)
        else if (platform.type === 'ground') {
            this.handleWallCollision(platform);
        }
    }
    
    /**
     * Duvar çarpışmasını işle
     */
    handleWallCollision(platform) {
        const playerCenterX = this.x + this.width / 2;
        const platformCenterX = platform.x + platform.width / 2;
        
        if (playerCenterX < platformCenterX && this.vx > 0) {
            // Soldan çarpma
            this.x = platform.x - this.width;
            this.vx = 0;
        } else if (playerCenterX > platformCenterX && this.vx < 0) {
            // Sağdan çarpma
            this.x = platform.x + platform.width;
            this.vx = 0;
        }
    }
    
    /**
     * Ölüm koşullarını kontrol et
     */
    checkDeathConditions() {
        if (this.deathCooldown <= 0) {
            // Ekrandan düşme
            if (this.y > GAME_CONFIG.CANVAS_HEIGHT) {
                this.die();
            }
            
            // Düşman çarpışması
            this.game.enemies.forEach(enemy => {
                if (Utils.checkCollision(this, enemy) && !enemy.frozen) {
                    this.die();
                }
            });
        }
    }
    
    /**
     * Zamanlayıcıları güncelle
     */
    updateTimers(deltaTime) {
        this.shootCooldown -= deltaTime;
        this.shootingTimer -= deltaTime;
        this.deathCooldown -= deltaTime;
        
        if (this.shootingTimer <= 0) {
            this.isShooting = false;
        }
    }
    
    /**
     * Oyuncu öldü
     */
    die() {
        this.game.lives--;
        
        // Ölüm efekti
        this.game.particleSystem.addDeathEffect(
            this.x + this.width/2, 
            this.y + this.height/2
        );
        
        // Pozisyonu sıfırla
        this.resetPosition();
        
        // Ölüm cooldown'u
        this.deathCooldown = GAME_CONFIG.PLAYER.DEATH_COOLDOWN;
    }
    
    /**
     * Oyuncu pozisyonunu sıfırla
     */
    resetPosition() {
        this.x = GAME_CONFIG.PLAYER.SPAWN_X;
        this.y = GAME_CONFIG.PLAYER.SPAWN_Y;
        this.vx = 0;
        this.vy = 0;
        this.isMoving = false;
        this.isShooting = false;
    }
    
    render(ctx) {
        // Ölüm cooldown sırasında yanıp sönme efekti
        if (this.deathCooldown > 0 && 
            Math.floor(this.deathCooldown / GAME_CONFIG.VISUAL.BLINK_INTERVAL) % 2 === 0) {
            return;
        }
        
        if (this.imagesLoaded === this.totalImages) {
            this.renderWithImages(ctx);
        } else {
            this.renderFallback(ctx);
        }
    }
    
    /**
     * Resimlerle render et
     */
    renderWithImages(ctx) {
        ctx.save();
        
        let imageToUse;
        
        // Duruma göre resim seç
        if (this.isShooting || this.isMoving) {
            imageToUse = this.images.right;
            
            if (this.direction === -1) {
                // Sola bakış için yatay çevir
                ctx.translate(this.x + this.width, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(imageToUse, 0, 0, this.width, this.height);
            } else {
                // Sağa bakış
                ctx.drawImage(imageToUse, this.x, this.y, this.width, this.height);
            }
        } else {
            // Durgun halde ön görünüm
            imageToUse = this.images.front;
            ctx.drawImage(imageToUse, this.x, this.y, this.width, this.height);
        }
        
        ctx.restore();
    }
    
    /**
     * Fallback render (resim yüklenene kadar)
     */
    renderFallback(ctx) {
        // Ana gövde - beyaz
        ctx.fillStyle = COLORS.PLAYER.BODY;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Siyah lekeler
        ctx.fillStyle = COLORS.PLAYER.SPOT;
        ctx.fillRect(this.x + 15, this.y + 15, 18, 18);
        ctx.fillRect(this.x + 50, this.y + 25, 15, 15);
        ctx.fillRect(this.x + 25, this.y + 50, 20, 12);
        
        // Gözler
        ctx.fillStyle = COLORS.PLAYER.EYES;
        ctx.fillRect(this.x + 20, this.y + 20, 8, 8);
        ctx.fillRect(this.x + 50, this.y + 20, 8, 8);
        
        // Burun
        ctx.fillStyle = COLORS.PLAYER.NOSE;
        ctx.fillRect(this.x + 35, this.y + 35, 12, 8);
        
        // Kenarlık
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    /**
     * Oyuncunun pozisyonunu döndür
     */
    getPosition() {
        return {
            x: this.x + this.width/2,
            y: this.y + this.height/2
        };
    }
    
    /**
     * Oyuncunun hızını döndür
     */
    getVelocity() {
        return {
            vx: this.vx,
            vy: this.vy
        };
    }
    
    /**
     * Oyuncunun yerdeki durumunu döndür
     */
    isOnGround() {
        return this.onGround;
    }
    
    /**
     * Oyuncunun hareket durumunu döndür
     */
    isPlayerMoving() {
        return this.isMoving;
    }
    
    /**
     * Oyuncunun atış durumunu döndür
     */
    isPlayerShooting() {
        return this.isShooting;
    }
    
    /**
     * Oyuncunun yönünü döndür
     */
    getDirection() {
        return this.direction;
    }
}

// Export for global access
window.Player = Player;
