/**
 * Snow Bros Renderer
 * Canvas çizim sistemi
 */

class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }
    
    /**
     * Ekranı temizle
     */
    clear() {
        this.ctx.fillStyle = '#E8F4FD';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Arka plan çiz
     */
    drawBackground(level) {
        const colors = LevelManager.getBackgroundColors(level);
        
        // Damalı desen
        const tileSize = GAME_CONFIG.VISUAL.TILE_SIZE;
        for (let x = 0; x < this.canvas.width; x += tileSize) {
            for (let y = 0; y < this.canvas.height; y += tileSize) {
                const isEven = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
                this.ctx.fillStyle = isEven ? colors.primary : colors.secondary;
                this.ctx.fillRect(x, y, tileSize, tileSize);
            }
        }
        
        // Parıltı efektleri
        this.drawSparkles();
    }
    
    /**
     * Parıltı efektleri
     */
    drawSparkles() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 30; i++) {
            const x = (Date.now() * 0.01 + i * 100) % this.canvas.width;
            const y = (Date.now() * 0.02 + i * 50) % this.canvas.height;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    /**
     * Platform çiz
     */
    drawPlatform(platform) {
        if (platform.type === 'ground') {
            this.drawGround(platform);
        } else {
            this.drawRegularPlatform(platform);
        }
        
        // Kenarlık
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    /**
     * Zemin çiz
     */
    drawGround(platform) {
        const gradient = this.ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(1, '#654321');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    /**
     * Normal platform çiz
     */
    drawRegularPlatform(platform) {
        // Ana platform
        this.ctx.fillStyle = COLORS.PLATFORM.MAIN;
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Üst kenar zigzag
        this.drawZigzagEdge(platform, 'top');
        
        // Alt kenar zigzag
        this.drawZigzagEdge(platform, 'bottom');
    }
    
    /**
     * Zigzag kenar çiz
     */
    drawZigzagEdge(platform, edge) {
        this.ctx.fillStyle = COLORS.PLATFORM.EDGE;
        const zigzagSize = GAME_CONFIG.PLATFORM.ZIGZAG_SIZE;
        
        for (let x = platform.x; x < platform.x + platform.width; x += zigzagSize) {
            this.ctx.beginPath();
            
            if (edge === 'top') {
                this.ctx.moveTo(x, platform.y);
                this.ctx.lineTo(x + zigzagSize/2, platform.y - 4);
                this.ctx.lineTo(x + zigzagSize, platform.y);
                this.ctx.lineTo(x + zigzagSize, platform.y + 4);
                this.ctx.lineTo(x, platform.y + 4);
            } else {
                this.ctx.moveTo(x, platform.y + platform.height);
                this.ctx.lineTo(x + zigzagSize/2, platform.y + platform.height + 4);
                this.ctx.lineTo(x + zigzagSize, platform.y + platform.height);
                this.ctx.lineTo(x + zigzagSize, platform.y + platform.height - 4);
                this.ctx.lineTo(x, platform.y + platform.height - 4);
            }
            
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    /**
     * Tüm platformları çiz
     */
    drawPlatforms(platforms) {
        platforms.forEach(platform => {
            this.drawPlatform(platform);
        });
    }
    
    /**
     * Oyun nesnelerini çiz
     */
    drawGameObjects(player, enemies, snowballs, particleSystem) {
        // Player
        if (player) {
            player.render(this.ctx);
        }
        
        // Enemies
        enemies.forEach(enemy => {
            enemy.render(this.ctx);
        });
        
        // Snowballs
        snowballs.forEach(snowball => {
            snowball.render(this.ctx);
        });
        
        // Particles
        if (particleSystem) {
            particleSystem.render(this.ctx);
        }
    }
    
    /**
     * Debug bilgileri çiz
     */
    drawDebugInfo(game) {
        if (!game.debugMode) return;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 120);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        
        let y = 25;
        this.ctx.fillText(`FPS: ${game.fps || 0}`, 15, y);
        y += 15;
        this.ctx.fillText(`Enemies: ${game.enemies.length}`, 15, y);
        y += 15;
        this.ctx.fillText(`Snowballs: ${game.snowballs.length}`, 15, y);
        y += 15;
        this.ctx.fillText(`Particles: ${game.particleSystem ? game.particleSystem.getParticleCount() : 0}`, 15, y);
        y += 15;
        this.ctx.fillText(`Player: ${Math.round(game.player.x)}, ${Math.round(game.player.y)}`, 15, y);
        y += 15;
        this.ctx.fillText(`Level: ${game.level}`, 15, y);
    }
    
    /**
     * Çarpışma kutularını çiz (debug)
     */
    drawCollisionBoxes(game) {
        if (!game.debugMode) return;
        
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.lineWidth = 1;
        
        // Player collision box
        this.ctx.strokeRect(game.player.x, game.player.y, game.player.width, game.player.height);
        
        // Enemy collision boxes
        game.enemies.forEach(enemy => {
            this.ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
        
        // Snowball collision boxes
        game.snowballs.forEach(snowball => {
            this.ctx.strokeRect(snowball.x, snowball.y, snowball.width, snowball.height);
        });
        
        // Platform collision boxes
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        game.platforms.forEach(platform => {
            this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        });
    }
    
    /**
     * Oyun durumu mesajları
     */
    drawGameStateMessage(message, subMessage = '') {
        // Arka plan
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Ana mesaj
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.canvas.width/2, this.canvas.height/2 - 50);
        
        // Alt mesaj
        if (subMessage) {
            this.ctx.font = '24px Arial';
            this.ctx.fillText(subMessage, this.canvas.width/2, this.canvas.height/2 + 20);
        }
        
        this.ctx.textAlign = 'left'; // Reset
    }
    
    /**
     * Seviye geçiş efekti
     */
    drawLevelTransition(level, progress) {
        // Progress: 0-1 arası
        const alpha = Math.sin(progress * Math.PI);
        
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Bölüm ${level}`, this.canvas.width/2, this.canvas.height/2);
        
        this.ctx.textAlign = 'left'; // Reset
    }
    
    /**
     * Performans metrikleri
     */
    drawPerformanceMetrics(metrics) {
        if (!metrics) return;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.canvas.width - 150, 10, 140, 80);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '10px Arial';
        
        let y = 25;
        this.ctx.fillText(`Frame Time: ${metrics.frameTime}ms`, this.canvas.width - 145, y);
        y += 12;
        this.ctx.fillText(`Update: ${metrics.updateTime}ms`, this.canvas.width - 145, y);
        y += 12;
        this.ctx.fillText(`Render: ${metrics.renderTime}ms`, this.canvas.width - 145, y);
        y += 12;
        this.ctx.fillText(`Memory: ${metrics.memoryUsage}MB`, this.canvas.width - 145, y);
    }
    
    /**
     * Canvas boyutunu ayarla
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        // High DPI desteği
        Utils.setupHighDPI(this.canvas, this.ctx);
    }
    
    /**
     * Ekran görüntüsü al
     */
    takeScreenshot() {
        return this.canvas.toDataURL('image/png');
    }
    
    /**
     * Canvas'ı temizle ve sıfırla
     */
    reset() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}

// Export for global access
window.Renderer = Renderer;
