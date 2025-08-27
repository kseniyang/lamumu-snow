/**
 * Snow Bros Game Configuration
 * Game constants and configuration settings
 */

// Game constants
const GAME_CONFIG = {
    // Canvas dimensions
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // Physics constants
    GRAVITY: 0.35,
    FRICTION: 0.75,
    
    // Scale factor (1.8x larger than original Snow Bros)
    SCALE_FACTOR: 1.8,
    
    // Player settings
    PLAYER: {
        WIDTH: 86,  // 48 * 1.8
        HEIGHT: 86, // 48 * 1.8
        MAX_SPEED: 2.5,
        ACCELERATION: 0.3,
        JUMP_POWER: 9,
        SPAWN_X: 100,
        SPAWN_Y: 444,
        LIVES: 3,
        DEATH_COOLDOWN: 2000, // 2 saniye invincibility
        SHOOT_COOLDOWN: 200
    },
    
    // Enemy settings
    ENEMY: {
        WIDTH: 50,  // Hafif daha ince
        HEIGHT: 60, // Yükseklik aynı
        MAX_SPEED: 1.8,
        ACCELERATION: 0.2,
        JUMP_POWER: 9,
        MAX_SNOW_HITS: 3, // Donmak için gereken kar isabet sayısı
        FROZEN_TIME: 1000, // 1 saniye kar topu olarak kalır - ultra agresif
        SNOW_MELT_TIME: 2000, // 2 saniye sonra kar erir
        PATHFINDING_COOLDOWN: 500
    },
    
    // Kartopu ayarları
    SNOWBALL: {
        WIDTH: 14,  // 8 * 1.8
        HEIGHT: 14, // 8 * 1.8
        SPEED: 8,
        MAX_BOUNCES: 3,
        GRAVITY_FACTOR: 0.5
    },
    
    // Platform settings
    PLATFORM: {
        HEIGHT: 45,
        GROUND_Y: 530,
        GROUND_HEIGHT: 90,
        ZIGZAG_SIZE: 14 // 8 * 1.8
    },
    
    // Görsel ayarları
    VISUAL: {
        TILE_SIZE: 58, // 32 * 1.8
        PARTICLE_COUNT: 5,
        BLINK_INTERVAL: 100 // Invincibility yanıp sönme
    },
    
    // AI ayarları
    AI: {
        GOAL_CHANGE_TIME: { MIN: 3000, MAX: 8000 },
        DIRECTION_CHANGE_TIME: { MIN: 4000, MAX: 8000 },
        JUMP_COOLDOWN: { MIN: 500, MAX: 1500 },
        PATHFINDING_RANGE: { DIRECT: 200, INTERMEDIATE: 400 }
    },
    
    // Puan ayarları
    SCORING: {
        ENEMY_KILL: 100,
        LEVEL_COMPLETE: 1000,
        CHAIN_BONUS: 500
    }
};

// Renk paleti
const COLORS = {
    BACKGROUND: {
        PRIMARY: '#9B59B6',
        SECONDARY: '#8E44AD'
    },
    PLATFORM: {
        MAIN: '#FF8C00',
        EDGE: '#FF6B00'
    },
    PLAYER: {
        BODY: '#FFFFFF',
        SPOT: '#A0A0A0',
        EYES: '#000000',
        NOSE: '#FFB6C1'
    },
    ENEMY: {
        EYES_WHITE: '#FFFFFF',
        EYES_BLACK: '#000000'
    },
    SNOWBALL: {
        MAIN: '#FFFFFF',
        EDGE: '#E0E0E0',
        FROZEN: '#E6F3FF',
        FROZEN_EDGE: '#B0D4F1'
    },
    PARTICLES: {
        DEATH: '#FF0000',
        FREEZE: '#FFFFFF',
        DESTROY: '#FFFF00'
    }
};

// Kontrol tuşları
const CONTROLS = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight', 
    JUMP: 'ArrowUp',
    SHOOT: ' ', // Space
    RESTART: 'KeyR'
};

// Level color schemes
const LEVEL_COLORS = [
    { primary: '#9B59B6', secondary: '#8E44AD' }, // Purple
    { primary: '#3498DB', secondary: '#2980B9' }, // Blue  
    { primary: '#E74C3C', secondary: '#C0392B' }, // Red
    { primary: '#F39C12', secondary: '#E67E22' }, // Orange
    { primary: '#27AE60', secondary: '#229954' }, // Green
    { primary: '#E91E63', secondary: '#AD1457' }, // Pink
    { primary: '#9C27B0', secondary: '#7B1FA2' }, // Purple-2
    { primary: '#FF5722', secondary: '#D84315' }, // Red-orange
    { primary: '#607D8B', secondary: '#455A64' }, // Gray-blue
    { primary: '#795548', secondary: '#5D4037' }  // Brown
];

// Export for global access
window.GAME_CONFIG = GAME_CONFIG;
window.COLORS = COLORS;
window.CONTROLS = CONTROLS;
window.LEVEL_COLORS = LEVEL_COLORS;
