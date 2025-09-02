class AssetLoader {
    constructor() {
        this.assets = {};
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgressCallback = null;
        this.onCompleteCallback = null;
    }

    loadImage(key, url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets[key] = img;
                this.loadedCount++;
                this.updateProgress();
                resolve(img);
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${url}`);
                reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
        });
    }

    async loadAll(assetList) {
        this.totalCount = assetList.length;
        this.loadedCount = 0;
        
        const promises = assetList.map(asset => {
            if (asset.type === 'image') {
                return this.loadImage(asset.key, asset.url);
            }
            return Promise.resolve();
        });

        try {
            await Promise.all(promises);
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
            }
            return this.assets;
        } catch (error) {
            console.error('Error loading assets:', error);
            // Continue with fallback rendering even if some assets fail
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
            }
            return this.assets;
        }
    }

    get(key) {
        return this.assets[key] || null;
    }

    updateProgress() {
        const progress = this.loadedCount / this.totalCount;
        if (this.onProgressCallback) {
            this.onProgressCallback(progress);
        }
    }

    onProgress(callback) {
        this.onProgressCallback = callback;
    }

    onComplete(callback) {
        this.onCompleteCallback = callback;
    }

    // Create placeholder images if external assets fail to load
    createPlaceholderMouse(animationTime = 0) {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        
        // Scale factor for larger mouse
        const scale = 1.25;
        const centerX = 20;
        const centerY = 20;
        
        // Animation calculations (slower and more subtle)
        const eyeBlinkCycle = Math.sin(animationTime * 0.001) * 0.5 + 0.5; // Very slow blink
        const eyeLookCycle = Math.sin(animationTime * 0.0008) * 0.2; // Subtle eye movement  
        const tailWagCycle = Math.sin(animationTime * 0.0015) * 0.3; // Gentle tail movement
        
        // Draw shadow for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 8, 12 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw mouse body (softer cream color)
        ctx.fillStyle = '#FFF8F0';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 3, 10 * scale, 7 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body shading (softer)
        ctx.fillStyle = 'rgba(240, 240, 220, 0.2)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 5, 8 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw head (even fluffier)
        ctx.fillStyle = '#FFFAF0';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 4, 8.5 * scale, 7 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head highlight for extra fluffiness
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(centerX - 1, centerY - 6, 6 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add ears (bigger and more rounded)
        ctx.fillStyle = '#FFF8F0';
        ctx.beginPath();
        ctx.ellipse(centerX - 7, centerY - 9, 4.5 * scale, 4 * scale, -0.2, 0, Math.PI * 2);
        ctx.ellipse(centerX + 7, centerY - 9, 4.5 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner ears (brighter pink)
        ctx.fillStyle = '#FFE4E6';
        ctx.beginPath();
        ctx.ellipse(centerX - 7, centerY - 8.5, 2.8 * scale, 2.5 * scale, -0.2, 0, Math.PI * 2);
        ctx.ellipse(centerX + 7, centerY - 8.5, 2.8 * scale, 2.5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner inner ears (even more pink)
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(centerX - 7, centerY - 8.5, 1.5 * scale, 1.3 * scale, -0.2, 0, Math.PI * 2);
        ctx.ellipse(centerX + 7, centerY - 8.5, 1.5 * scale, 1.3 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add eyes (animated with blinking and looking around)
        const eyeHeight = eyeBlinkCycle > 0.1 ? 2.5 * scale : 0.3 * scale; // Blink effect
        const leftEyeX = centerX - 3.5 + eyeLookCycle;
        const rightEyeX = centerX + 3.5 + eyeLookCycle;
        const eyeY = centerY - 2;
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 2.5 * scale, eyeHeight, 0, 0, Math.PI * 2);
        ctx.ellipse(rightEyeX, eyeY, 2.5 * scale, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Only show highlights if eyes are open
        if (eyeBlinkCycle > 0.1) {
            // Main eye highlights
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(leftEyeX + 1 + eyeLookCycle * 0.3, eyeY - 1, 1.2 * scale, 0, Math.PI * 2);
            ctx.arc(rightEyeX + 1 + eyeLookCycle * 0.3, eyeY - 1, 1.2 * scale, 0, Math.PI * 2);
            ctx.fill();
            
            // Sparkle highlights
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(leftEyeX - 0.7 + eyeLookCycle * 0.2, eyeY + 1, 0.5 * scale, 0, Math.PI * 2);
            ctx.arc(rightEyeX - 0.7 + eyeLookCycle * 0.2, eyeY + 1, 0.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            
            // Tiny sparkles
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(leftEyeX + 0.7, eyeY + 1.5, 0.2 * scale, 0, Math.PI * 2);
            ctx.arc(rightEyeX + 0.7, eyeY + 1.5, 0.2 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add super cute pink nose (heart-shaped)
        ctx.fillStyle = '#FF1493';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 2, 1.8 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose highlight
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.ellipse(centerX - 0.3, centerY + 1.5, 0.6 * scale, 0.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add whiskers (longer and more delicate)
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        
        // Left whiskers
        ctx.beginPath();
        ctx.moveTo(centerX - 9, centerY);
        ctx.lineTo(centerX - 14, centerY - 1);
        ctx.moveTo(centerX - 9, centerY + 1);
        ctx.lineTo(centerX - 14, centerY + 1);
        ctx.moveTo(centerX - 9, centerY + 2);
        ctx.lineTo(centerX - 14, centerY + 3);
        
        // Right whiskers
        ctx.moveTo(centerX + 9, centerY);
        ctx.lineTo(centerX + 14, centerY - 1);
        ctx.moveTo(centerX + 9, centerY + 1);
        ctx.lineTo(centerX + 14, centerY + 1);
        ctx.moveTo(centerX + 9, centerY + 2);
        ctx.lineTo(centerX + 14, centerY + 3);
        ctx.stroke();
        
        // Add adorable animated tail
        const tailGradient = ctx.createLinearGradient(centerX - 8, centerY + 6, centerX - 15, centerY + 12);
        tailGradient.addColorStop(0, '#FFF8F0');
        tailGradient.addColorStop(1, '#F0E8D0');
        
        ctx.strokeStyle = tailGradient;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX - 8, centerY + 6);
        
        // Animated tail curve
        const tailMidX = centerX - 12 + tailWagCycle * 2;
        const tailMidY = centerY + 8 + Math.abs(tailWagCycle) * 1.5;
        const tailEndX = centerX - 10 + tailWagCycle * 3;
        const tailEndY = centerY + 12 + Math.abs(tailWagCycle) * 2;
        const tailTipX = centerX - 12 + tailWagCycle * 4;
        const tailTipY = centerY + 18 + Math.abs(tailWagCycle) * 1;
        
        ctx.quadraticCurveTo(tailMidX, tailMidY, tailEndX, tailEndY);
        ctx.quadraticCurveTo(tailTipX - tailWagCycle, tailTipY, tailTipX, tailTipY);
        ctx.stroke();
        
        // Add cute little paws
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY + 10, 2 * scale, 0, Math.PI * 2);
        ctx.arc(centerX + 4, centerY + 10, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Paw details
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY + 10, 1 * scale, 0, Math.PI * 2);
        ctx.arc(centerX + 4, centerY + 10, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Convert to image
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    createPlaceholderWall() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Create modern clean wall texture with cool blues and grays
        const gradient = ctx.createLinearGradient(0, 0, 32, 32);
        gradient.addColorStop(0, '#E6F3FF');  // very light blue
        gradient.addColorStop(0.3, '#B8D4F0'); // light blue-gray
        gradient.addColorStop(0.6, '#8BB5DB'); // medium blue
        gradient.addColorStop(1, '#5A9BD4');   // deeper blue
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        
        // Add modern tile blocks with clean lines
        const tiles = [
            {x: 0, y: 0, w: 16, h: 10},
            {x: 16, y: 0, w: 16, h: 10},
            {x: 0, y: 10, w: 8, h: 12},
            {x: 8, y: 10, w: 16, h: 12},
            {x: 24, y: 10, w: 8, h: 12},
            {x: 0, y: 22, w: 16, h: 10},
            {x: 16, y: 22, w: 16, h: 10}
        ];
        
        // Draw each tile with subtle blue-gray variation
        tiles.forEach(tile => {
            const variation = Math.random() * 0.15 - 0.075; // -0.075 to 0.075
            const r = Math.round(200 + variation * 40); // Light blue-gray base
            const g = Math.round(220 + variation * 30);
            const b = Math.round(240 + variation * 15);
            
            ctx.fillStyle = `rgb(${Math.max(180, Math.min(255, r))}, ${Math.max(200, Math.min(255, g))}, ${Math.max(230, Math.min(255, b))})`;
            ctx.fillRect(tile.x, tile.y, tile.w, tile.h);
        });
        
        // Add clean mortar lines (soft gray)
        ctx.strokeStyle = '#9BB5C7';
        ctx.lineWidth = 1;
        
        // Horizontal mortar lines
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(32, 10);
        ctx.moveTo(0, 22);
        ctx.lineTo(32, 22);
        ctx.stroke();
        
        // Vertical mortar lines (offset pattern)
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(16, 10);
        ctx.moveTo(8, 10);
        ctx.lineTo(8, 22);
        ctx.moveTo(24, 10);
        ctx.lineTo(24, 22);
        ctx.moveTo(16, 22);
        ctx.lineTo(16, 32);
        ctx.stroke();
        
        // Add subtle texture spots (cool tones)
        ctx.fillStyle = 'rgba(120, 140, 180, 0.2)'; // soft blue spots
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            const size = Math.random() * 2 + 1;
            ctx.fillRect(x, y, size, size);
        }
        
        // Add light variation marks
        ctx.fillStyle = 'rgba(180, 200, 220, 0.3)';
        for (let i = 0; i < 6; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            const size = Math.random() * 1.5 + 0.5;
            ctx.fillRect(x, y, size, size);
        }
        
        // Add bright highlights for a clean, modern look
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let i = 0; i < 4; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            const size = Math.random() * 1 + 0.5;
            ctx.fillRect(x, y, size, size);
        }
        
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    createPlaceholderFloor() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Create warm stone floor pattern
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 22);
        gradient.addColorStop(0, '#8B7D6B');  // warm gray-brown
        gradient.addColorStop(0.7, '#696158'); // darker
        gradient.addColorStop(1, '#4A453E');   // darkest
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        
        // Add stone tiles with subtle borders
        for (let x = 0; x < 32; x += 16) {
            for (let y = 0; y < 32; y += 16) {
                // Slight color variation per tile
                const variation = Math.random() * 0.1 - 0.05;
                const baseColor = 115 + variation * 20; // Around #73
                
                ctx.fillStyle = `rgb(${Math.round(baseColor * 0.9)}, ${Math.round(baseColor * 0.85)}, ${Math.round(baseColor * 0.75)})`;
                ctx.fillRect(x + 1, y + 1, 14, 14);
                
                // Add subtle tile borders
                ctx.strokeStyle = 'rgba(74, 69, 62, 0.5)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, 16, 16);
            }
        }
        
        // Add wear marks and texture
        ctx.fillStyle = 'rgba(139, 125, 107, 0.3)'; // lighter brown spots
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            const size = Math.random() * 2 + 0.5;
            ctx.fillRect(x, y, size, size);
        }
        
        // Add darker spots for depth
        ctx.fillStyle = 'rgba(58, 53, 47, 0.4)';
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            const size = Math.random() * 1.5 + 0.5;
            ctx.fillRect(x, y, size, size);
        }
        
        // Add tiny highlights
        ctx.fillStyle = 'rgba(160, 150, 130, 0.2)';
        for (let i = 0; i < 12; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            ctx.fillRect(x, y, 1, 1);
        }
        
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }
}

// Global asset loader instance
const Assets = new AssetLoader();