/**
 * Snow Bros Enemy Class
 * Düşman AI ve davranışları
 */

class Enemy {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.ENEMY.WIDTH;
        this.height = GAME_CONFIG.ENEMY.HEIGHT;
        this.maxSpeed = GAME_CONFIG.ENEMY.MAX_SPEED;
        this.acceleration = GAME_CONFIG.ENEMY.ACCELERATION;
        this.jumpPower = GAME_CONFIG.ENEMY.JUMP_POWER;
        this.vx = Math.random() > 0.5 ? 1.0 : -1.0;
        this.vy = 0;
        this.game = game;
        this.onGround = false;
        this.active = true;
        this.frozen = false;
        this.frozenTime = 0;
        this.snowHits = 0;
        this.maxSnowHits = GAME_CONFIG.ENEMY.MAX_SNOW_HITS;
        this.isPushed = false;
        this.isRolling = false;
        this.rollSpeed = 0;
        this.jumpCooldown = 0;
        this.color = Utils.randomColor();
        
        // Doğal hareket için
        this.baseSpeed = this.maxSpeed; // Orijinal hız
        this.currentSpeed = this.maxSpeed; // Mevcut hız (kar ile yavaşlar)
        this.stuckTimer = 0; // Sıkışma kontrolü
        this.lastX = x;
        this.movementDirection = this.vx > 0 ? 1 : -1;
        this.directionChangeTimer = Utils.random(2000, 4000);
        
        // Kişilik özellikleri
        this.aggressiveness = Utils.random(0.3, 0.8);
        this.patience = Utils.random(1000, 3000);
        this.currentGoal = 'patrol';
        this.goalTimer = Utils.random(3000, 6000);
        
        // Pathfinding
        this.currentPlatformLevel = 0;
        this.targetPlatformLevel = 0;
        this.pathfindingCooldown = 0;
        this.isPreparingToJump = false;
        this.jumpPreparationTime = 0;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        this.updateTimers(deltaTime);
        
        if (this.frozen) {
            this.updateFrozenState(deltaTime);
        } else {
            this.updateAI(deltaTime);
            this.updateMovement(deltaTime);
        }
        
        this.updatePhysics(deltaTime);
        this.checkCollisions();
        this.preventStuck(deltaTime);
    }
    
    /**
     * Zamanlayıcıları güncelle
     */
    updateTimers(deltaTime) {
        this.goalTimer -= deltaTime;
        this.directionChangeTimer -= deltaTime;
        this.jumpCooldown -= deltaTime;
        this.pathfindingCooldown -= deltaTime;
        this.jumpPreparationTime -= deltaTime;
        
        if (this.goalTimer <= 0) {
            this.changeGoal();
            this.goalTimer = Utils.random(3000, 6000);
        }
    }
    
    /**
     * Donmuş durum güncellemesi
     */
    updateFrozenState(deltaTime) {
        this.frozenTime -= deltaTime;
        
        // Frozen time bittiğinde kesin ölüm - canlanma yok
        if (this.frozenTime <= 0) {
            this.destroy(); // Kesin ölüm
            
            // Frozen time ölüm efekti
            for (let i = 0; i < 6; i++) {
                this.game.particleSystem.addDestroyEffect(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height
                );
            }
            return;
        }
        
        // Köşede takılı kalmış frozen enemy'yi öldür
        const isStuckInCorner = (this.x <= 10 || this.x >= GAME_CONFIG.CANVAS_WIDTH - this.width - 10) && 
                               Math.abs(this.vx) < 0.5 && this.onGround;
        
        if (isStuckInCorner) {
            this.destroy(); // Köşede takılırsa kesin ölüm
            
            // Köşe stuck ölüm efekti
            for (let i = 0; i < 8; i++) {
                this.game.particleSystem.addDestroyEffect(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height
                );
            }
            return;
        }
        
        // Donmuş düşman yerçekimi etkisinde
        this.vy += GAME_CONFIG.GRAVITY;
        
        if (this.isRolling) {
            this.updateRolling(deltaTime);
        }
    }
    
    /**
     * Yuvarlanma güncellemesi
     */
    updateRolling(deltaTime) {
        this.x += this.rollSpeed;
        
        // Ekran kenarlarında bouncing - köşelerde durmasın
        if (this.x <= 0) {
            this.x = 2; // Biraz içeride pozisyonla
            this.rollSpeed = Math.abs(this.rollSpeed) * 0.8; // Sağa doğru bounce
            this.vy = -3; // Yukarı bounce ekle
        } else if (this.x + this.width >= GAME_CONFIG.CANVAS_WIDTH) {
            this.x = GAME_CONFIG.CANVAS_WIDTH - this.width - 2; // Biraz içeride pozisyonla
            this.rollSpeed = -Math.abs(this.rollSpeed) * 0.8; // Sola doğru bounce
            this.vy = -3; // Yukarı bounce ekle
        }
        
        // Platform kenarlarında bouncing
        this.game.platforms.forEach(platform => {
            if (platform.type === 'ground' && this.y + this.height > platform.y - 10) {
                const snowballCenterX = this.x + this.width / 2;
                const platformCenterX = platform.x + platform.width / 2;
                
                // Sol kenardan çarpma
                if (snowballCenterX < platformCenterX && this.rollSpeed > 0 && 
                    this.x + this.width >= platform.x && this.x <= platform.x + 5) {
                    this.x = platform.x - this.width - 3;
                    this.rollSpeed = -Math.abs(this.rollSpeed) * 0.85;
                    this.vy = -4; // Daha güçlü yukarı bounce
                }
                // Sağ kenardan çarpma
                else if (snowballCenterX > platformCenterX && this.rollSpeed < 0 && 
                         this.x <= platform.x + platform.width && this.x + this.width >= platform.x + platform.width - 5) {
                    this.x = platform.x + platform.width + 3;
                    this.rollSpeed = Math.abs(this.rollSpeed) * 0.85;
                    this.vy = -4; // Daha güçlü yukarı bounce
                }
            }
        });
        
        // Yavaşlama - agresif friction
        this.rollSpeed *= 0.985; // Çok hızlı yavaşlama
        
        // Yuvarlanma efekti
        if (Math.abs(this.rollSpeed) > 0.3) {
            this.game.particleSystem.addRollEffect(this.x, this.y);
        }
        
        // Rolling timeout - 3 saniye sonra kesin ölüm (daha agresif)
        if (!this.rollStartTime) {
            this.rollStartTime = Date.now();
        }
        
        const rollingTime = Date.now() - this.rollStartTime;
        
        // Köşe detection - eğer köşelerde takılıyorsa anında öl
        const isInCorner = (this.x <= 5 || this.x >= GAME_CONFIG.CANVAS_WIDTH - this.width - 5) && 
                          Math.abs(this.rollSpeed) < 2;
        
        if (Math.abs(this.rollSpeed) < 1.5 || rollingTime > 1000 || isInCorner) { // 1 saniye max + çok yüksek speed threshold
            this.destroy(); // Kesin ölüm - canlanma yok
            
            // Köşede ölüm efekti
            for (let i = 0; i < 10; i++) {
                this.game.particleSystem.addDestroyEffect(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height
                );
            }
            return;
        }
        
        // Ekran dışına çıktıysa kesin ölüm
        if (this.x < -this.width || this.x > GAME_CONFIG.CANVAS_WIDTH + this.width || 
            this.y > GAME_CONFIG.CANVAS_HEIGHT + this.height) {
            this.destroy(); // Kesin ölüm
            return;
        }
    }
    
    /**
     * AI güncellemesi
     */
    updateAI(deltaTime) {
        this.updatePlatformLevel();
        
        const playerDistance = Utils.distance(
            this.x + this.width/2, 
            this.y + this.height/2,
            this.game.player.x + this.game.player.width/2,
            this.game.player.y + this.game.player.height/2
        );
        
        // Oyuncuya yakınsa hunt moduna geç
        if (playerDistance < 200 && Math.random() < this.aggressiveness) {
            this.currentGoal = 'hunt';
            this.goalTimer = Utils.random(2000, 4000);
        }
        
        switch (this.currentGoal) {
            case 'patrol':
                this.patrolBehavior(deltaTime);
                break;
            case 'hunt':
                this.huntBehavior(deltaTime);
                break;
            case 'explore':
                this.exploreBehavior(deltaTime);
                break;
        }
    }
    
    /**
     * Devriye davranışı - doğal hareket
     */
    patrolBehavior(deltaTime) {
        // Yön değiştirme
        if (this.directionChangeTimer <= 0) {
            this.movementDirection *= -1;
            this.directionChangeTimer = Utils.random(2000, 5000);
        }
        
        // Doğal hız
        this.vx = this.movementDirection * this.currentSpeed * 0.7;
    }
    
    /**
     * Avcılık davranışı - oyuncuya doğru
     */
    huntBehavior(deltaTime) {
        const playerX = this.game.player.x + this.game.player.width/2;
        const playerY = this.game.player.y + this.game.player.height/2;
        const enemyX = this.x + this.width/2;
        const enemyY = this.y + this.height/2;
        
        // Yatay mesafe
        const horizontalDistance = playerX - enemyX;
        
        if (Math.abs(horizontalDistance) > 20) {
            // Oyuncuya doğru hareket et
            this.movementDirection = horizontalDistance > 0 ? 1 : -1;
            this.vx = this.movementDirection * this.currentSpeed * this.aggressiveness;
            
            // Platform atlama kontrolü
            if (Math.abs(playerY - enemyY) > 60 && this.jumpCooldown <= 0) {
                this.attemptJump();
            }
        } else {
            // Oyuncunun yanında - yavaş hareket
            this.vx *= 0.5;
        }
    }
    
    /**
     * Keşif davranışı - rastgele hareket
     */
    exploreBehavior(deltaTime) {
        // Rastgele yön değişimi
        if (Math.random() < 0.002) { // %0.2 şans her frame
            this.movementDirection = Math.random() > 0.5 ? 1 : -1;
        }
        
        this.vx = this.movementDirection * this.currentSpeed * 0.5;
    }
    
    /**
     * Zıplama denemesi
     */
    attemptJump() {
        if (this.onGround && this.jumpCooldown <= 0) {
            this.isPreparingToJump = true;
            this.jumpPreparationTime = 300; // 300ms hazırlık
            this.jumpCooldown = Utils.random(1500, 3000);
        }
    }
    
    /**
     * Hareket güncellemesi
     */
    updateMovement(deltaTime) {
        // Zıplama hazırlığı
        if (this.isPreparingToJump && this.jumpPreparationTime <= 0) {
            this.vy = -this.jumpPower;
            this.onGround = false;
            this.isPreparingToJump = false;
        }
        
        // Hız sınırlaması
        this.vx = Utils.clamp(this.vx, -this.currentSpeed, this.currentSpeed);
    }
    
    /**
     * Fizik güncellemesi
     */
    updatePhysics(deltaTime) {
        // Yerçekimi
        this.vy += GAME_CONFIG.GRAVITY;
        
        // Pozisyon güncelleme
        this.x += this.vx;
        this.y += this.vy;
        
        // Ekran sınırları - düşmanlar harita dışına çıkmasın
        if (this.x < 0) {
            this.x = 0;
            this.vx = Math.abs(this.vx); // Sağa doğru zorla
            this.movementDirection = 1;
        }
        if (this.x + this.width > GAME_CONFIG.CANVAS_WIDTH) {
            this.x = GAME_CONFIG.CANVAS_WIDTH - this.width;
            this.vx = -Math.abs(this.vx); // Sola doğru zorla
            this.movementDirection = -1;
        }
        
        // Ekran altına düşerse kesin ölüm - respawn yok!
        if (this.y > GAME_CONFIG.CANVAS_HEIGHT + 100) {
            this.destroy(); // Kesin ölüm, respawn yok!
        }
    }
    
    /**
     * Çarpışma kontrolü
     */
    checkCollisions() {
        this.onGround = false;
        
        this.game.platforms.forEach(platform => {
            if (Utils.checkCollision(this, platform)) {
                this.handlePlatformCollision(platform);
            }
        });
    }
    
    /**
     * Platform çarpışması
     */
    handlePlatformCollision(platform) {
        const enemyBottom = this.y + this.height;
        const enemyBottomPrevious = enemyBottom - this.vy;
        
        // Yukarıdan düşme
        if (this.vy > 0 && enemyBottomPrevious <= platform.y + 5) {
            this.y = platform.y - this.height;
            this.vy = 0;
            this.onGround = true;
            this.isPreparingToJump = false;
        }
    }
    
    /**
     * Sıkışma önleme
     */
    preventStuck(deltaTime) {
        // Hareket kontrolü
        if (Math.abs(this.x - this.lastX) < 1) {
            this.stuckTimer += deltaTime;
        } else {
            this.stuckTimer = 0;
            this.lastX = this.x;
        }
        
        // Sıkıştıysa yön değiştir
        if (this.stuckTimer > 1000) { // 1 saniye sıkışma
            this.movementDirection *= -1;
            this.vx = this.movementDirection * this.currentSpeed;
            this.stuckTimer = 0;
            
            // Zıplama dene
            if (this.onGround && Math.random() < 0.5) {
                this.attemptJump();
            }
        }
    }
    
    /**
     * Platform seviyesini güncelle
     */
    updatePlatformLevel() {
        this.currentPlatformLevel = Utils.getPlatformLevel(this.y);
    }
    
    /**
     * Hedef değiştir
     */
    changeGoal() {
        const goals = ['patrol', 'hunt', 'explore'];
        const weights = [0.4, 0.4, 0.2]; // %40 patrol, %40 hunt, %20 explore
        
        const rand = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < goals.length; i++) {
            cumulative += weights[i];
            if (rand < cumulative) {
                this.currentGoal = goals[i];
                break;
            }
        }
    }
    
    /**
     * Kar ekleme - kademeli yavaşlama
     */
    addSnow() {
        this.snowHits++;
        
        // Kademeli yavaşlama - her kar isabet ettiğinde %20 yavaşla
        const slowdownFactor = 1 - (this.snowHits * 0.2);
        this.currentSpeed = this.baseSpeed * Math.max(slowdownFactor, 0.2); // Minimum %20 hız
        
        // Görsel sersemletme efekti
        this.vx *= 0.3;
        
        // Kar isabet efekti
        this.game.particleSystem.addSnowHitEffect(
            this.x + this.width/2, 
            this.y + this.height/2
        );
        
        // Donma kontrolü - kar erima sistemi KALDIRILDI
        if (this.snowHits >= this.maxSnowHits) {
            this.freeze(); // Donunca kesin ölüm, canlanma yok
        }
        // Kar erima timer tamamen kaldırıldı - kar isabet ettiğinde geri dönüş yok!
    }
    
    /**
     * Donma
     */
    freeze() {
        this.frozen = true;
        this.frozenTime = GAME_CONFIG.ENEMY.FROZEN_TIME;
        this.vx = 0;
        this.snowHits = this.maxSnowHits;
        this.currentSpeed = 0;
        
        // Donma efekti
        this.game.particleSystem.addFreezeEffect(
            this.x + this.width/2, 
            this.y + this.height/2
        );
        
        // 1 saniye sonra kesin ölüm - canlanma yok (ultra agresif)
        setTimeout(() => {
            if (this.frozen && this.active) {
                this.destroy(); // Kesin ölüm
                
                // Timeout ölüm efekti
                for (let i = 0; i < 15; i++) {
                    this.game.particleSystem.addDestroyEffect(
                        this.x + Math.random() * this.width,
                        this.y + Math.random() * this.height
                    );
                }
            }
        }, 1000); // 1 saniye sonra kesin ölüm
    }
    
    /**
     * Donmayı çöz - KALDIRILDI! Artık canlanma yok, sadece ölüm var!
     */
    // unfreeze() metodu tamamen kaldırıldı - kar topu olan düşman ASLA canlanamaz!
    
    /**
     * İtme
     */
    push(direction) {
        if (this.frozen) {
            this.isPushed = true;
            this.isRolling = true;
            this.rollSpeed = direction * 15; // Daha güçlü itme
            this.rollStartTime = Date.now(); // Rolling timer başlat
            this.vy = -2; // Hafif yukarı bounce
            
            // İtme efekti
            this.game.particleSystem.addSnowHitEffect(this.x, this.y);
        }
    }
    
    /**
     * Yeniden spawn etme - KALDIRILDI! Artık respawn yok, sadece ölüm var!
     */
    // respawn() metodu tamamen kaldırıldı - düşman öldüğünde ASLA geri gelmez!
    
    /**
     * Yok etme
     */
    destroy() {
        this.active = false;
        
        // Yok etme efekti
        this.game.particleSystem.addDestroyEffect(
            this.x + this.width/2, 
            this.y + this.height/2
        );
    }
    
    render(ctx) {
        if (!this.active) return;
        
        if (this.frozen) {
            this.renderFrozen(ctx);
        } else {
            this.renderNormal(ctx);
        }
    }
    
    /**
     * Donmuş düşman render
     */
    renderFrozen(ctx) {
        // Kar topu
        ctx.fillStyle = COLORS.SNOWBALL.FROZEN;
        ctx.strokeStyle = COLORS.SNOWBALL.FROZEN_EDGE;
        ctx.lineWidth = 2;
        
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
        
        // Parıltı efekti
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 3; i++) {
            const sparkleX = this.x + Math.random() * this.width;
            const sparkleY = this.y + Math.random() * this.height;
            ctx.fillRect(sparkleX, sparkleY, 2, 2);
        }
    }
    
    /**
     * Normal düşman render
     */
    renderNormal(ctx) {
        // Zıplama hazırlığında sıkışma efekti
        const jumpCompress = this.isPreparingToJump ? 0.9 : 1.0;
        const compressedHeight = this.height * jumpCompress;
        const yOffset = this.height - compressedHeight;
        
        // Ana gövde
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y + yOffset, this.width, compressedHeight);
        
        // Gözler
        ctx.fillStyle = COLORS.ENEMY.EYES_WHITE;
        ctx.fillRect(this.x + 10, this.y + yOffset + 10, 8, 8);
        ctx.fillRect(this.x + 32, this.y + yOffset + 10, 8, 8);
        
        ctx.fillStyle = COLORS.ENEMY.EYES_BLACK;
        ctx.fillRect(this.x + 14, this.y + yOffset + 14, 4, 4);
        ctx.fillRect(this.x + 36, this.y + yOffset + 14, 4, 4);
        
        // Kar birikimi göster
        if (this.snowHits > 0) {
            const alpha = 0.3 + (this.snowHits / this.maxSnowHits) * 0.4;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(this.x, this.y + yOffset, this.width, compressedHeight);
            
            // Kar noktaları
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < this.snowHits; i++) {
                const dotX = this.x + (i * 15) % this.width;
                const dotY = this.y + yOffset + (Math.floor(i / 3) * 10);
                ctx.fillRect(dotX, dotY, 3, 3);
            }
        }
        
        // Hız göstergesi (debug)
        if (this.currentSpeed < this.baseSpeed) {
            ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
            const speedRatio = this.currentSpeed / this.baseSpeed;
            ctx.fillRect(this.x, this.y - 5, this.width * speedRatio, 3);
        }
    }
    
    /**
     * Düşmanın aktif olup olmadığını döndür
     */
    isActive() {
        return this.active;
    }
    
    /**
     * Düşmanın pozisyonunu döndür
     */
    getPosition() {
        return {
            x: this.x + this.width/2,
            y: this.y + this.height/2
        };
    }
}

// Export for global access
window.Enemy = Enemy;
