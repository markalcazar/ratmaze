class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 30;
        this.wallWidth = 2;
        this.spotlightRadius = 3.6; // 20% increase from 3
        this.visitedCells = new Set();
        this.assets = null;
    }
    
    setAssets(assets) {
        this.assets = assets;
    }
    
    generateAnimatedMouse(animationTime) {
        return this.assets.createPlaceholderMouse(animationTime);
    }

    init(mazeWidth, mazeHeight) {
        this.canvas.width = mazeWidth * this.cellSize;
        this.canvas.height = mazeHeight * this.cellSize;
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('Canvas cleared to black');
    }

    renderMaze(maze, playerX, playerY) {
        this.clear();
        
        this.visitedCells.add(`${playerX},${playerY}`);
        
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                const distance = Math.sqrt(Math.pow(x - playerX, 2) + Math.pow(y - playerY, 2));
                const isVisible = distance <= this.spotlightRadius;
                const wasVisited = this.visitedCells.has(`${x},${y}`);
                
                if (isVisible || wasVisited) {
                    let alpha = 1;
                    if (!isVisible && wasVisited) {
                        alpha = 0.2;
                    } else if (isVisible) {
                        alpha = Math.max(0.3, 1 - (distance / this.spotlightRadius) * 0.5);
                        if (distance <= this.spotlightRadius) {
                            this.visitedCells.add(`${x},${y}`);
                        }
                    }
                    
                    this.renderCell(maze.grid[y][x], alpha);
                }
            }
        }
        
        this.renderExitMarker(maze.exit, playerX, playerY);
    }

    renderFullMaze(maze) {
        this.clear();
        
        // Render entire maze with full visibility
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                this.renderCell(maze.grid[y][x], 1.0); // Full alpha
            }
        }
        
        // Render exit marker with full visibility
        const exit = maze.exit;
        const x = exit.x * this.cellSize + this.cellSize / 2;
        const y = exit.y * this.cellSize + this.cellSize / 2;
        
        this.ctx.fillStyle = '#4ade80';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.cellSize / 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('EXIT', x, y);
    }

    renderCell(cell, alpha) {
        const x = cell.x * this.cellSize;
        const y = cell.y * this.cellSize;
        
        this.ctx.globalAlpha = alpha;
        
        // Draw floor
        const floorTexture = this.assets ? this.assets.get('floor') : null;
        if (floorTexture) {
            this.ctx.drawImage(floorTexture, x, y, this.cellSize, this.cellSize);
        } else {
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        }
        
        // Draw walls using texture or enhanced lines
        const wallTexture = this.assets ? this.assets.get('wall') : null;
        
        this.ctx.strokeStyle = wallTexture ? '#9BB5C7' : '#B8D4F0';
        this.ctx.lineWidth = wallTexture ? 3 : this.wallWidth;
        this.ctx.lineCap = 'square';
        
        // Draw walls with texture background if available
        if (wallTexture && (cell.walls.top || cell.walls.right || cell.walls.bottom || cell.walls.left)) {
            // Draw wall texture in the background for visible walls
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = this.ctx.createPattern(wallTexture, 'repeat');
            
            if (cell.walls.top) {
                this.ctx.fillRect(x, y - 1, this.cellSize, 3);
            }
            if (cell.walls.right) {
                this.ctx.fillRect(x + this.cellSize - 1, y, 3, this.cellSize);
            }
            if (cell.walls.bottom) {
                this.ctx.fillRect(x, y + this.cellSize - 1, this.cellSize, 3);
            }
            if (cell.walls.left) {
                this.ctx.fillRect(x - 1, y, 3, this.cellSize);
            }
        }
        
        // Draw wall outlines
        this.ctx.beginPath();
        
        if (cell.walls.top) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + this.cellSize, y);
        }
        if (cell.walls.right) {
            this.ctx.moveTo(x + this.cellSize, y);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.bottom) {
            this.ctx.moveTo(x, y + this.cellSize);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.left) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, y + this.cellSize);
        }
        
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1;
    }

    renderExitMarker(exit, playerX, playerY) {
        const distance = Math.sqrt(Math.pow(exit.x - playerX, 2) + Math.pow(exit.y - playerY, 2));
        const isVisible = distance <= this.spotlightRadius;
        const wasVisited = this.visitedCells.has(`${exit.x},${exit.y}`);
        
        if (isVisible || wasVisited) {
            const x = exit.x * this.cellSize + this.cellSize / 2;
            const y = exit.y * this.cellSize + this.cellSize / 2;
            
            this.ctx.globalAlpha = isVisible ? 1 : 0.3;
            
            this.ctx.fillStyle = '#4ade80';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize / 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('EXIT', x, y);
            
            this.ctx.globalAlpha = 1;
        }
    }

    renderPlayer(player) {
        const x = player.pixelX;
        const y = player.pixelY;
        
        // Use player's accumulated animation time (only increases when moving)
        const mouseSprite = this.assets ? this.generateAnimatedMouse(player.animationTime) : null;
        
        if (mouseSprite) {
            this.ctx.save();
            this.ctx.translate(x + this.cellSize / 2, y + this.cellSize / 2);
            
            // Rotate sprite based on direction
            if (player.direction === 'left') {
                this.ctx.scale(-1, 1);
            } else if (player.direction === 'up') {
                this.ctx.rotate(-Math.PI / 2);
            } else if (player.direction === 'down') {
                this.ctx.rotate(Math.PI / 2);
            }
            
            // Draw the mouse sprite
            this.ctx.drawImage(
                mouseSprite,
                -this.cellSize / 2,
                -this.cellSize / 2,
                this.cellSize,
                this.cellSize
            );
            
            this.ctx.restore();
        } else {
            // Fallback to drawn mouse if no sprite available
            const size = this.cellSize * 0.6;
            
            this.ctx.save();
            this.ctx.translate(x + this.cellSize / 2, y + this.cellSize / 2);
            
            const bodyWidth = size * 0.7;
            const bodyHeight = size * 0.5;
            this.ctx.fillStyle = '#888';
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, bodyWidth / 2, bodyHeight / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            const headSize = size * 0.35;
            const headX = bodyWidth / 2 - headSize / 4;
            this.ctx.beginPath();
            this.ctx.ellipse(headX, 0, headSize / 2, headSize / 2.5, -0.3, 0, Math.PI * 2);
            this.ctx.fill();
            
            const earSize = size * 0.15;
            this.ctx.beginPath();
            this.ctx.arc(headX - earSize / 2, -headSize / 2.5, earSize / 2, 0, Math.PI * 2);
            this.ctx.arc(headX + earSize / 2, -headSize / 2.5, earSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#333';
            const eyeSize = size * 0.05;
            this.ctx.beginPath();
            this.ctx.arc(headX + headSize / 4, -2, eyeSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(-bodyWidth / 2, 0);
            this.ctx.quadraticCurveTo(-bodyWidth / 2 - size * 0.3, 0, -bodyWidth / 2 - size * 0.4, size * 0.2);
            this.ctx.stroke();
            
            if (player.direction === 'left') {
                this.ctx.scale(-1, 1);
            } else if (player.direction === 'up') {
                this.ctx.rotate(-Math.PI / 2);
            } else if (player.direction === 'down') {
                this.ctx.rotate(Math.PI / 2);
            }
            
            this.ctx.restore();
        }
    }

    renderFog(player) {
        const gradient = this.ctx.createRadialGradient(
            player.pixelX + this.cellSize / 2,
            player.pixelY + this.cellSize / 2,
            0,
            player.pixelX + this.cellSize / 2,
            player.pixelY + this.cellSize / 2,
            this.spotlightRadius * this.cellSize * 1.5
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderVictoryScreen() {
        console.log('renderVictoryScreen called');
        this.ctx.save();
        
        // Test rendering - simple red rectangle
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(50, 50, 100, 100);
        console.log('Test red rectangle drawn');
        
        const time = Date.now() * 0.005;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        console.log('Victory screen rendering at:', centerX, centerY, 'time:', time);
        
        // Animated rainbow gradient background overlay
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, Math.max(this.canvas.width, this.canvas.height)
        );
        
        const hue1 = (time * 30) % 360;
        const hue2 = (time * 30 + 120) % 360;
        const hue3 = (time * 30 + 240) % 360;
        
        gradient.addColorStop(0, `hsla(${hue1}, 70%, 50%, 0.3)`);
        gradient.addColorStop(0.5, `hsla(${hue2}, 70%, 40%, 0.2)`);
        gradient.addColorStop(1, `hsla(${hue3}, 70%, 30%, 0.5)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Pulsating "YOU WON!" text with rainbow effect
        const pulse = 1 + Math.sin(time * 3) * 0.1;
        const fontSize = Math.floor(56 * pulse);
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Create glowing text effect
        const textY = centerY - 30;
        
        // Outer glow
        this.ctx.shadowColor = `hsl(${(time * 60) % 360}, 100%, 50%)`;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Rainbow text gradient
        const textGradient = this.ctx.createLinearGradient(
            centerX - 200, textY,
            centerX + 200, textY
        );
        textGradient.addColorStop(0, `hsl(${(time * 50) % 360}, 100%, 60%)`);
        textGradient.addColorStop(0.25, `hsl(${(time * 50 + 90) % 360}, 100%, 70%)`);
        textGradient.addColorStop(0.5, `hsl(${(time * 50 + 180) % 360}, 100%, 60%)`);
        textGradient.addColorStop(0.75, `hsl(${(time * 50 + 270) % 360}, 100%, 70%)`);
        textGradient.addColorStop(1, `hsl(${(time * 50) % 360}, 100%, 60%)`);
        
        this.ctx.fillStyle = textGradient;
        this.ctx.fillText('YOU WON!', centerX, textY);
        
        // Reset shadow for subtitle
        this.ctx.shadowBlur = 0;
        
        // Animated subtitle
        const subtitleY = centerY + 40;
        const subtitlePulse = 1 + Math.sin(time * 4 + 1) * 0.05;
        this.ctx.font = `${Math.floor(24 * subtitlePulse)}px Arial`;
        
        const subtitleGradient = this.ctx.createLinearGradient(
            centerX - 150, subtitleY,
            centerX + 150, subtitleY
        );
        subtitleGradient.addColorStop(0, '#FFD700');
        subtitleGradient.addColorStop(0.5, '#FF69B4');
        subtitleGradient.addColorStop(1, '#00BFFF');
        
        this.ctx.fillStyle = subtitleGradient;
        this.ctx.fillText('🎉 CONGRATULATIONS! 🎉', centerX, subtitleY);
        
        // Animated stars around the text
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time;
            const radius = 180 + Math.sin(time * 2 + i) * 20;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const size = 8 + Math.sin(time * 3 + i) * 4;
            
            this.ctx.fillStyle = `hsl(${(time * 80 + i * 30) % 360}, 100%, 70%)`;
            this.drawStar(x, y, size);
        }
        
        // Floating sparkles
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(time * 0.8 + i) * 0.5 + 0.5) * this.canvas.width;
            const y = (Math.cos(time * 1.2 + i * 0.7) * 0.3 + 0.5) * this.canvas.height;
            const opacity = (Math.sin(time * 2 + i) * 0.5 + 0.5);
            const size = 2 + Math.sin(time * 3 + i) * 2;
            
            this.ctx.fillStyle = `hsla(${(time * 100 + i * 25) % 360}, 100%, 80%, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
        
        // Final test - simple white text
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('VICTORY TEST', centerX, centerY + 100);
        console.log('Victory screen rendering complete');
    }

    drawStar(x, y, size) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        for (let i = 0; i < 5; i++) {
            this.ctx.rotate(Math.PI / 5);
            this.ctx.lineTo(0, -size * 0.4);
            this.ctx.rotate(Math.PI / 5);
            this.ctx.lineTo(0, -size);
        }
        this.ctx.fill();
        this.ctx.restore();
    }

    renderFireworks(time) {
        console.log('renderFireworks called, time:', time);
        if (!this.fireworks) {
            this.fireworks = [];
            this.initializeFireworks();
        }
        console.log('Fireworks count:', this.fireworks.length);

        this.ctx.save();
        
        // Update and render each firework
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const firework = this.fireworks[i];
            
            if (firework.phase === 'launch') {
                this.updateLaunchingFirework(firework, time);
            } else if (firework.phase === 'explode') {
                this.updateExplodingFirework(firework, time);
            }
            
            this.renderFirework(firework);
            
            // Remove dead fireworks
            if (firework.life <= 0) {
                this.fireworks.splice(i, 1);
            }
        }
        
        // Occasionally add new fireworks - more frequent for better show
        if (Math.random() < 0.12) {
            this.addFirework();
        }
        
        this.ctx.restore();
    }

    resetFireworks() {
        this.fireworks = [];
        this.initializeFireworks();
    }

    initializeFireworks() {
        // Add initial fireworks
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.addFirework(), i * 300);
        }
    }

    addFirework() {
        const colors = ['#FFD700', '#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF69B4', '#9B59B6', '#E74C3C', '#00FF7F', '#FF1493', '#00BFFF', '#FFA500'];
        const secondaryColors = ['#FFFF00', '#FF4500', '#40E0D0', '#1E90FF', '#98FB98', '#FFB6C1', '#DDA0DD', '#DC143C', '#ADFF2F', '#FF69B4', '#87CEEB', '#FFD700'];
        
        this.fireworks.push({
            x: Math.random() * this.canvas.width,
            y: this.canvas.height,
            targetY: Math.random() * this.canvas.height * 0.4 + 50,
            vx: (Math.random() - 0.5) * 2, // Small horizontal drift
            vy: -10 - Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            secondaryColor: secondaryColors[Math.floor(Math.random() * secondaryColors.length)],
            phase: 'launch',
            life: 1,
            particles: [],
            trail: [],
            size: 0.8 + Math.random() * 0.4, // Random size variation
            type: Math.random() < 0.3 ? 'burst' : 'shower' // Different explosion types
        });
        
        // Play launch sound
        if (typeof Audio !== 'undefined') {
            Audio.playFireworkLaunch();
        }
    }

    updateLaunchingFirework(firework, time) {
        // Add glowing trail point with color variation
        firework.trail.push({ 
            x: firework.x, 
            y: firework.y, 
            life: 0.8,
            size: 3 + Math.random() * 2
        });
        if (firework.trail.length > 15) firework.trail.shift();
        
        // Update trail life
        firework.trail.forEach(point => point.life -= 0.04);
        
        firework.x += firework.vx;
        firework.y += firework.vy;
        firework.vy += 0.1; // Slight gravity on launch
        
        // Check if reached target height
        if (firework.y <= firework.targetY) {
            firework.phase = 'explode';
            firework.life = 1;
            
            // Play explosion sound
            if (typeof Audio !== 'undefined') {
                Audio.playFireworkExplosion();
            }
            
            // Create explosion particles based on type
            let particleCount, velocityRange, angleStep;
            
            if (firework.type === 'burst') {
                // Circular burst pattern
                particleCount = 25 + Math.random() * 20;
                velocityRange = 4 + Math.random() * 6;
                angleStep = (Math.PI * 2) / particleCount;
            } else {
                // Shower/fountain pattern
                particleCount = 30 + Math.random() * 25;
                velocityRange = 3 + Math.random() * 8;
                angleStep = Math.PI / particleCount;
            }
            
            for (let i = 0; i < particleCount; i++) {
                let angle, velocity;
                
                if (firework.type === 'burst') {
                    angle = i * angleStep + (Math.random() - 0.5) * 0.3;
                    velocity = velocityRange * (0.7 + Math.random() * 0.6);
                } else {
                    // Shower pattern - more downward
                    angle = -Math.PI + (i / particleCount) * Math.PI + (Math.random() - 0.5) * 0.8;
                    velocity = velocityRange * (0.5 + Math.random() * 1);
                }
                
                const useSecondary = Math.random() < 0.3;
                const particleColor = useSecondary ? firework.secondaryColor : firework.color;
                
                firework.particles.push({
                    x: firework.x,
                    y: firework.y,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    life: 0.8 + Math.random() * 0.4,
                    size: (2 + Math.random() * 4) * firework.size,
                    color: particleColor,
                    brightness: 0.8 + Math.random() * 0.4,
                    twinkle: Math.random() < 0.2, // Some particles twinkle
                    fadeRate: 0.015 + Math.random() * 0.015
                });
            }
            
            // Add extra sparkles for burst type
            if (firework.type === 'burst') {
                for (let i = 0; i < 8; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 2 + Math.random() * 3;
                    
                    firework.particles.push({
                        x: firework.x,
                        y: firework.y,
                        vx: Math.cos(angle) * velocity,
                        vy: Math.sin(angle) * velocity,
                        life: 1,
                        size: 1 + Math.random() * 2,
                        color: '#FFFFFF',
                        brightness: 1,
                        twinkle: true,
                        fadeRate: 0.02
                    });
                }
            }
        }
    }

    updateExplodingFirework(firework, time) {
        firework.life -= 0.01;
        
        // Update particles
        for (let i = firework.particles.length - 1; i >= 0; i--) {
            const particle = firework.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.12; // gravity
            particle.vx *= 0.985; // air resistance
            particle.life -= particle.fadeRate;
            particle.size *= 0.985;
            
            // Update brightness for twinkling effect
            if (particle.twinkle) {
                particle.brightness = 0.3 + Math.sin(time * 0.01 + particle.x) * 0.7;
            }
            
            if (particle.life <= 0) {
                firework.particles.splice(i, 1);
            }
        }
        
        if (firework.particles.length === 0) {
            firework.life = 0;
        }
    }

    renderFirework(firework) {
        if (firework.phase === 'launch') {
            // Render glowing trail with gradient effect
            this.ctx.globalCompositeOperation = 'lighter';
            firework.trail.forEach((point, index) => {
                if (point.life > 0) {
                    const gradient = this.ctx.createRadialGradient(
                        point.x, point.y, 0,
                        point.x, point.y, point.size
                    );
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${point.life})`);
                    gradient.addColorStop(0.5, `${firework.color}${Math.floor(point.life * 255).toString(16).padStart(2, '0')}`);
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
            
            // Render launching firework with glow
            const glowSize = 6;
            const gradient = this.ctx.createRadialGradient(
                firework.x, firework.y, 0,
                firework.x, firework.y, glowSize
            );
            gradient.addColorStop(0, firework.color);
            gradient.addColorStop(0.3, `${firework.color}CC`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(firework.x, firework.y, glowSize, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (firework.phase === 'explode') {
            this.ctx.globalCompositeOperation = 'lighter';
            
            // Render explosion particles with enhanced effects
            firework.particles.forEach(particle => {
                const alpha = particle.life * particle.brightness;
                const glowSize = particle.size * 1.5;
                
                // Create radial gradient for each particle
                const gradient = this.ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, glowSize
                );
                
                gradient.addColorStop(0, `${particle.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
                gradient.addColorStop(0.4, `${particle.color}${Math.floor(alpha * 180).toString(16).padStart(2, '0')}`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add bright core
                this.ctx.fillStyle = `${particle.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size * 0.6, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add twinkling stars for special particles
                if (particle.twinkle && Math.random() < 0.3) {
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    this.ctx.beginPath();
                    // Draw a plus shape for star effect
                    const starSize = particle.size * 0.3;
                    this.ctx.fillRect(particle.x - starSize, particle.y - 1, starSize * 2, 2);
                    this.ctx.fillRect(particle.x - 1, particle.y - starSize, 2, starSize * 2);
                    this.ctx.fill();
                }
            });
        }
        
        this.ctx.globalCompositeOperation = 'source-over';
    }
}