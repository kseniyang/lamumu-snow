/**
 * Snow Bros Level Designs
 * Level designs and platform layouts
 */

class LevelManager {
    /**
     * Returns platform layout based on level number
     * @param {number} levelNum - Level number
     * @returns {Array} Platform array
     */
    static getLevelPlatforms(levelNum) {
        const levelIndex = Utils.getLevelIndex(levelNum);
        
        switch(levelIndex) {
            case 1: // Level 1 - Based on reference design
                return [
                    { x: 0, y: GAME_CONFIG.PLATFORM.GROUND_Y, width: 800, height: GAME_CONFIG.PLATFORM.GROUND_HEIGHT, type: 'ground' },
                    
                    // Alt seviye - 3 kısa platform
                    { x: 60, y: 420, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },    
                    { x: 330, y: 420, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },   
                    { x: 600, y: 420, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },   
                    
                    // Orta seviye - tek uzun platform (ortada)
                    { x: 200, y: 310, width: 400, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },   
                    
                    // Üst-orta seviye - 2 platform (yan taraflarda)
                    { x: 80, y: 200, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },    
                    { x: 520, y: 200, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },   
                    
                    // En üst seviye - orta boyutta platform (kenarlardan inebilir)
                    { x: 250, y: 90, width: 300, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                ];
                
            case 2: // Level 2 - Zigzag stairs design
                return [
                    { x: 0, y: GAME_CONFIG.PLATFORM.GROUND_Y, width: 800, height: GAME_CONFIG.PLATFORM.GROUND_HEIGHT, type: 'ground' },
                    
                    // Alt seviye - 6 basamak (sağdan sola inen zigzag)
                    { x: 650, y: 420, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },   // En sağ üst
                    { x: 500, y: 390, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },   // 2. basamak
                    { x: 350, y: 360, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },   // 3. basamak
                    { x: 200, y: 330, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },   // 4. basamak
                    { x: 50, y: 300, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },    // 5. basamak
                    { x: 0, y: 270, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },     // En sol alt
                    
                    // Orta seviye - 5 basamak (soldan sağa çıkan zigzag)
                    { x: 80, y: 240, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },    // Sol üst
                    { x: 230, y: 210, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },   // 2. basamak
                    { x: 380, y: 180, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },   // 3. basamak
                    { x: 530, y: 150, width: 140, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },   // 4. basamak
                    { x: 680, y: 120, width: 120, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },   // Sağ alt (kısa)
                    
                    // Üst seviye - tek platform (orta)
                    { x: 320, y: 90, width: 160, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                ];
                
            case 3: // Simple design like Level 1 - Wide gaps for easy descent
                return [
                    { x: 0, y: GAME_CONFIG.PLATFORM.GROUND_Y, width: 800, height: GAME_CONFIG.PLATFORM.GROUND_HEIGHT, type: 'ground' },
                    // Bottom level - 2 wide platforms with huge gap in middle
                    { x: 50, y: 420, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 550, y: 420, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    
                    // Middle level - 2 platforms with very wide gap
                    { x: 150, y: 320, width: 180, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 470, y: 320, width: 180, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    
                    // Top level - single wide platform with easy descent from edges
                    { x: 250, y: 220, width: 300, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                ];
                
            case 4: // Pyramid style
                return [
                    { x: 0, y: GAME_CONFIG.PLATFORM.GROUND_Y, width: 800, height: GAME_CONFIG.PLATFORM.GROUND_HEIGHT, type: 'ground' },
                    { x: 50, y: 480, width: 700, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 100, y: 410, width: 600, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 150, y: 340, width: 500, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 200, y: 270, width: 400, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 250, y: 200, width: 300, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 300, y: 130, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                ];
                
            case 5: // Complex maze
                return [
                    { x: 0, y: GAME_CONFIG.PLATFORM.GROUND_Y, width: 800, height: GAME_CONFIG.PLATFORM.GROUND_HEIGHT, type: 'ground' },
                    { x: 100, y: 480, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 300, y: 480, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 600, y: 480, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 0, y: 410, width: 150, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 250, y: 410, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 450, y: 410, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 650, y: 410, width: 150, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 100, y: 340, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 300, y: 340, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 600, y: 340, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 200, y: 270, width: 400, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 350, y: 200, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                ];
                
            case 6: // Vertical challenge
                return [
                    { x: 0, y: GAME_CONFIG.PLATFORM.GROUND_Y, width: 800, height: GAME_CONFIG.PLATFORM.GROUND_HEIGHT, type: 'ground' },
                    { x: 0, y: 480, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 700, y: 480, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 150, y: 430, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 550, y: 430, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 300, y: 380, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 100, y: 330, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 600, y: 330, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 250, y: 280, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 450, y: 280, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 350, y: 230, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 300, y: 180, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                ];
                
            case 7: // Scattered platforms
                return [
                    { x: 0, y: GAME_CONFIG.PLATFORM.GROUND_Y, width: 800, height: GAME_CONFIG.PLATFORM.GROUND_HEIGHT, type: 'ground' },
                    { x: 80, y: 480, width: 120, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 280, y: 480, width: 120, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 480, y: 480, width: 120, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 680, y: 480, width: 120, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 40, y: 410, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 220, y: 410, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 400, y: 410, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 580, y: 410, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 160, y: 340, width: 120, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 360, y: 340, width: 120, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 560, y: 340, width: 120, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 260, y: 270, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 440, y: 270, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 350, y: 200, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                ];
                
            case 8: // Cross pattern
                return [
                    { x: 0, y: GAME_CONFIG.PLATFORM.GROUND_Y, width: 800, height: GAME_CONFIG.PLATFORM.GROUND_HEIGHT, type: 'ground' },
                    { x: 100, y: 480, width: 600, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 200, y: 430, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 500, y: 430, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 300, y: 380, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 150, y: 330, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 550, y: 330, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 250, y: 280, width: 300, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 100, y: 230, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 600, y: 230, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 200, y: 180, width: 400, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 350, y: 130, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                ];
                
            case 9: // Spiral design
                return [
                    { x: 0, y: GAME_CONFIG.PLATFORM.GROUND_Y, width: 800, height: GAME_CONFIG.PLATFORM.GROUND_HEIGHT, type: 'ground' },
                    { x: 0, y: 480, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 300, y: 480, width: 500, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 0, y: 430, width: 150, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 250, y: 430, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 450, y: 430, width: 350, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 50, y: 380, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 350, y: 380, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 650, y: 380, width: 150, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 150, y: 330, width: 300, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 550, y: 330, width: 150, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 250, y: 280, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 550, y: 280, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 300, y: 230, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 350, y: 180, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                ];
                
            case 10: // Final boss style
                return [
                    { x: 0, y: GAME_CONFIG.PLATFORM.GROUND_Y, width: 800, height: GAME_CONFIG.PLATFORM.GROUND_HEIGHT, type: 'ground' },
                    { x: 50, y: 500, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 650, y: 500, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 100, y: 450, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 600, y: 450, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 150, y: 400, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 550, y: 400, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 200, y: 350, width: 400, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 100, y: 300, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 600, y: 300, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 250, y: 250, width: 300, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 350, y: 200, width: 100, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                    { x: 300, y: 150, width: 200, height: GAME_CONFIG.PLATFORM.HEIGHT, type: 'platform' },
                ];
                
            default:
                return LevelManager.getLevelPlatforms(1); // Fallback to level 1
        }
    }
    
    /**
     * Seviye numarasına göre background renklerini döndürür
     * @param {number} levelNum - Seviye numarası
     * @returns {Object} Renk objesi {primary, secondary}
     */
    static getBackgroundColors(levelNum) {
        const levelIndex = Utils.getLevelIndex(levelNum);
        return LEVEL_COLORS[levelIndex - 1] || LEVEL_COLORS[0];
    }
    
    /**
     * Düşman spawn pozisyonlarını hesaplar
     * @param {Array} platforms - Platform dizisi
     * @param {Object} player - Oyuncu objesi
     * @param {number} enemyCount - Spawn edilecek düşman sayısı
     * @returns {Array} Spawn pozisyonları
     */
    static getEnemySpawnPositions(platforms, player, enemyCount) {
        const minDistanceFromPlayer = 200;
        const spawnPositions = [];
        
        // Platform üzerindeki uygun spawn pozisyonlarını bul
        platforms.forEach(platform => {
            if (platform.type !== 'ground' && platform.width >= 80) {
                const numSpawns = Math.floor(platform.width / 120) + 1;
                for (let i = 0; i < numSpawns; i++) {
                    const x = platform.x + (platform.width / (numSpawns + 1)) * (i + 1);
                    const y = platform.y - GAME_CONFIG.ENEMY.HEIGHT;
                    
                    // Oyuncudan mesafe kontrolü
                    const distance = Utils.distance(x, y, player.x, player.y);
                    
                    if (distance >= minDistanceFromPlayer) {
                        spawnPositions.push({
                            x: x - GAME_CONFIG.ENEMY.WIDTH / 2,
                            y: y,
                            distance: distance
                        });
                    }
                }
            }
        });
        
        // Mesafeye göre sırala (uzaktan yakına)
        spawnPositions.sort((a, b) => b.distance - a.distance);
        
        // Gerekli sayıda pozisyon döndür
        return spawnPositions.slice(0, enemyCount);
    }
    
    /**
     * Seviye için düşman sayısını hesaplar
     * @param {number} levelNum - Seviye numarası
     * @returns {number} Düşman sayısı
     */
    static getEnemyCount(levelNum) {
        const baseEnemies = 3;
        const extraEnemies = Math.floor((levelNum - 1) / 3); // Her 3 seviyede +1
        return Math.min(baseEnemies + extraEnemies, 8); // Maksimum 8 düşman
    }
}

// Export for global access
window.LevelManager = LevelManager;
