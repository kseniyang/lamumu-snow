/**
 * Snow Bros Game Utilities
 * Yardımcı fonksiyonlar ve ortak kullanılan kodlar
 */

class Utils {
    /**
     * İki dikdörtgen arasında çarpışma kontrolü (AABB)
     */
    static checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    /**
     * İki nokta arasındaki mesafeyi hesaplar
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Değeri min ve max arasında sınırlar
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    /**
     * Min ve max arasında rastgele sayı
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * Min ve max arasında rastgele tam sayı
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * Açıyı radyana çevirir
     */
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    
    /**
     * Radyanı açıya çevirir
     */
    static toDegrees(radians) {
        return radians * 180 / Math.PI;
    }
    
    /**
     * Değeri 0-1 arasında normalize eder
     */
    static normalize(value, min, max) {
        return (value - min) / (max - min);
    }
    
    /**
     * Linear interpolation
     */
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    /**
     * Değerin belirli bir aralıkta olup olmadığını kontrol eder
     */
    static inRange(value, min, max) {
        return value >= min && value <= max;
    }
    
    /**
     * Array'den rastgele eleman seçer
     */
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    /**
     * Renk kodunu HSL'den RGB'ye çevirir
     */
    static hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    /**
     * Rastgele HSL renk üretir
     */
    static randomColor(saturation = 70, lightness = 50) {
        const hue = Math.random() * 360;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    /**
     * Debounce fonksiyonu
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * FPS hesaplayıcı
     */
    static createFPSCounter() {
        let lastTime = 0;
        let frameCount = 0;
        let fps = 0;
        
        return (currentTime) => {
            frameCount++;
            if (currentTime - lastTime >= 1000) {
                fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
            }
            return fps;
        };
    }
    
    /**
     * Canvas'ı yüksek çözünürlük için ayarlar
     */
    static setupHighDPI(canvas, ctx) {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;
        
        ctx.scale(devicePixelRatio, devicePixelRatio);
        
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }
    
    /**
     * Local storage'a güvenli şekilde veri kaydeder
     */
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
            return false;
        }
    }
    
    /**
     * Local storage'dan güvenli şekilde veri okur
     */
    static loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
            return defaultValue;
        }
    }
    
    /**
     * Platform seviyesini Y koordinatından hesaplar
     */
    static getPlatformLevel(y) {
        return Math.floor(y / 100);
    }
    
    /**
     * Seviye numarasından platform düzenini belirler (1-10 döngüsü)
     */
    static getLevelIndex(levelNum) {
        return ((levelNum - 1) % 10) + 1;
    }
}

// Export for global access
window.Utils = Utils;
