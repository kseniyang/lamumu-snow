/**
 * Snow Bros Particle System
 * Parçacık efektleri sistemi
 */

class Particle {
    constructor(x, y, color, vx = 0, vy = 0, life = 1000) {
        this.x = x;
        this.y = y;
        this.vx = vx || (Math.random() - 0.5) * 10;
        this.vy = vy || (Math.random() - 0.5) * 10;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Utils.random(2, 6);
        this.gravity = 0.2;
        this.friction = 0.98;
        this.active = true;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Apply physics
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Update life
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        const alpha = this.life / this.maxLife;
        const size = this.size * alpha;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - size/2, this.y - size/2, size, size);
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    /**
     * Ölüm efekti - kırmızı parçacıklar
     */
    addDeathEffect(x, y) {
        for (let i = 0; i < GAME_CONFIG.VISUAL.PARTICLE_COUNT; i++) {
            const particle = new Particle(
                x, y,
                COLORS.PARTICLES.DEATH,
                Utils.random(-8, 8),
                Utils.random(-12, -4),
                Utils.random(800, 1200)
            );
            this.particles.push(particle);
        }
    }
    
    /**
     * Donma efekti - beyaz parçacıklar
     */
    addFreezeEffect(x, y) {
        for (let i = 0; i < GAME_CONFIG.VISUAL.PARTICLE_COUNT; i++) {
            const particle = new Particle(
                x, y,
                COLORS.PARTICLES.FREEZE,
                Utils.random(-6, 6),
                Utils.random(-10, -2),
                Utils.random(600, 1000)
            );
            this.particles.push(particle);
        }
    }
    
    /**
     * Yok etme efekti - sarı parçacıklar
     */
    addDestroyEffect(x, y) {
        for (let i = 0; i < GAME_CONFIG.VISUAL.PARTICLE_COUNT * 2; i++) {
            const particle = new Particle(
                x, y,
                COLORS.PARTICLES.DESTROY,
                Utils.random(-10, 10),
                Utils.random(-15, -5),
                Utils.random(1000, 1500)
            );
            this.particles.push(particle);
        }
    }
    
    /**
     * Kar isabet efekti - küçük beyaz parçacıklar
     */
    addSnowHitEffect(x, y) {
        for (let i = 0; i < 3; i++) {
            const particle = new Particle(
                x, y,
                COLORS.PARTICLES.FREEZE,
                Utils.random(-4, 4),
                Utils.random(-8, -2),
                Utils.random(400, 600)
            );
            particle.size = Utils.random(1, 3);
            this.particles.push(particle);
        }
    }
    
    /**
     * Zıplama efekti - toz parçacıkları
     */
    addJumpEffect(x, y) {
        for (let i = 0; i < 2; i++) {
            const particle = new Particle(
                x + Utils.random(-10, 10), y,
                '#CCCCCC',
                Utils.random(-3, 3),
                Utils.random(-2, 0),
                Utils.random(300, 500)
            );
            particle.size = Utils.random(1, 2);
            this.particles.push(particle);
        }
    }
    
    /**
     * Kar topu yuvarlanma efekti
     */
    addRollEffect(x, y) {
        const particle = new Particle(
            x + Utils.random(-5, 5), y,
            COLORS.PARTICLES.FREEZE,
            Utils.random(-2, 2),
            Utils.random(-1, 1),
            Utils.random(200, 400)
        );
        particle.size = Utils.random(1, 2);
        this.particles.push(particle);
    }
    
    /**
     * Seviye tamamlama efekti - renkli konfeti
     */
    addLevelCompleteEffect(x, y) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        
        for (let i = 0; i < 15; i++) {
            const particle = new Particle(
                x, y,
                Utils.randomChoice(colors),
                Utils.random(-12, 12),
                Utils.random(-20, -8),
                Utils.random(1500, 2500)
            );
            particle.size = Utils.random(3, 8);
            particle.gravity = 0.15;
            this.particles.push(particle);
        }
    }
    
    update(deltaTime) {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            // Remove inactive particles
            if (!particle.active) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
    }
    
    /**
     * Tüm parçacıkları temizle
     */
    clear() {
        this.particles = [];
    }
    
    /**
     * Aktif parçacık sayısını döndür
     */
    getParticleCount() {
        return this.particles.length;
    }
}

// Export for global access
window.Particle = Particle;
window.ParticleSystem = ParticleSystem;
