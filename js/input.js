/**
 * Snow Bros Input Manager
 * Klavye ve kontrol yönetimi
 */

class InputManager {
    constructor() {
        this.keys = {};
        this.previousKeys = {};
        this.setupEventListeners();
    }
    
    /**
     * Event listener'ları ayarla
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
        
        // Sayfa focus kaybında tüm tuşları serbest bırak
        window.addEventListener('blur', () => {
            this.resetAllKeys();
        });
    }
    
    /**
     * Tuş basılması
     */
    handleKeyDown(e) {
        const key = this.normalizeKey(e.code || e.key);
        
        // Oyun kontrollerini engelle
        if (this.isGameKey(key)) {
            e.preventDefault();
        }
        
        this.keys[key] = true;
    }
    
    /**
     * Tuş bırakılması
     */
    handleKeyUp(e) {
        const key = this.normalizeKey(e.code || e.key);
        this.keys[key] = false;
    }
    
    /**
     * Tuş kodunu normalize et
     */
    normalizeKey(key) {
        // KeyCode'ları normalize et
        const keyMap = {
            'KeyA': 'a',
            'KeyD': 'd',
            'KeyW': 'w',
            'KeyS': 's',
            'KeyR': 'r',
            'Space': ' ',
            'ArrowLeft': 'ArrowLeft',
            'ArrowRight': 'ArrowRight',
            'ArrowUp': 'ArrowUp',
            'ArrowDown': 'ArrowDown',
            'Enter': 'Enter',
            'Escape': 'Escape'
        };
        
        return keyMap[key] || key.toLowerCase();
    }
    
    /**
     * Oyun tuşu olup olmadığını kontrol et
     */
    isGameKey(key) {
        const gameKeys = ['a', 'd', 'w', 's', 'r', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        return gameKeys.includes(key);
    }
    
    /**
     * Tuşun basılı olup olmadığını kontrol et
     */
    isPressed(key) {
        const normalizedKey = this.normalizeKey(key);
        return !!this.keys[normalizedKey];
    }
    
    /**
     * Tuşun bu frame'de basılıp basılmadığını kontrol et (tek seferlik)
     */
    isJustPressed(key) {
        const normalizedKey = this.normalizeKey(key);
        return !!this.keys[normalizedKey] && !this.previousKeys[normalizedKey];
    }
    
    /**
     * Tuşun bu frame'de bırakılıp bırakılmadığını kontrol et
     */
    isJustReleased(key) {
        const normalizedKey = this.normalizeKey(key);
        return !this.keys[normalizedKey] && !!this.previousKeys[normalizedKey];
    }
    
    /**
     * Herhangi bir tuşun basılı olup olmadığını kontrol et
     */
    isAnyKeyPressed() {
        return Object.values(this.keys).some(pressed => pressed);
    }
    
    /**
     * Belirli tuş kombinasyonunun basılı olup olmadığını kontrol et
     */
    areKeysPressed(keyArray) {
        return keyArray.every(key => this.isPressed(key));
    }
    
    /**
     * Frame sonunda çağrılır - önceki frame'in durumunu kaydet
     */
    update() {
        this.previousKeys = { ...this.keys };
    }
    
    /**
     * Tüm tuşları serbest bırak
     */
    resetAllKeys() {
        this.keys = {};
        this.previousKeys = {};
    }
    
    /**
     * Belirli bir tuşu serbest bırak
     */
    releaseKey(key) {
        const normalizedKey = this.normalizeKey(key);
        this.keys[normalizedKey] = false;
    }
    
    /**
     * Aktif tuşların listesini döndür
     */
    getActiveKeys() {
        return Object.keys(this.keys).filter(key => this.keys[key]);
    }
    
    /**
     * Debug için tuş durumlarını yazdır
     */
    debugKeys() {
        const activeKeys = this.getActiveKeys();
        if (activeKeys.length > 0) {
            console.log('Active keys:', activeKeys);
        }
    }
    
    /**
     * Kontrol şemasını döndür
     */
    getControlScheme() {
        return {
            movement: {
                left: ['a', 'ArrowLeft'],
                right: ['d', 'ArrowRight'],
                jump: ['w', 'ArrowUp'],
                shoot: [' ']
            },
            game: {
                restart: ['r'],
                pause: ['Escape']
            }
        };
    }
    
    /**
     * Alternatif tuş kontrolü (WASD veya Arrow keys)
     */
    isMovementPressed(direction) {
        switch(direction) {
            case 'left':
                return this.isPressed('a') || this.isPressed('ArrowLeft');
            case 'right':
                return this.isPressed('d') || this.isPressed('ArrowRight');
            case 'up':
                return this.isPressed('w') || this.isPressed('ArrowUp');
            case 'down':
                return this.isPressed('s') || this.isPressed('ArrowDown');
            default:
                return false;
        }
    }
    
    /**
     * Tek seferlik hareket kontrolü
     */
    isMovementJustPressed(direction) {
        switch(direction) {
            case 'left':
                return this.isJustPressed('a') || this.isJustPressed('ArrowLeft');
            case 'right':
                return this.isJustPressed('d') || this.isJustPressed('ArrowRight');
            case 'up':
                return this.isJustPressed('w') || this.isJustPressed('ArrowUp');
            case 'down':
                return this.isJustPressed('s') || this.isJustPressed('ArrowDown');
            default:
                return false;
        }
    }
}

// Export for global access
window.InputManager = InputManager;
