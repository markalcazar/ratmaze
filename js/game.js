class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.player = null;
        this.maze = null;
        this.gameState = 'playing';
        this.startTime = null;
        this.timerElement = document.getElementById('timer');
        this.animationId = null;
        this.frameCount = 0;
    }

    async init(assets = null) {
        // Get difficulty setting
        const difficultySelect = document.getElementById('difficulty');
        const difficulty = difficultySelect ? difficultySelect.value : 'hard';
        
        // Set maze size based on difficulty
        let mazeWidth, mazeHeight;
        if (difficulty === 'easy') {
            mazeWidth = 15;
            mazeHeight = 10;
            this.renderer.spotlightRadius = 4.5; // Bigger spotlight for easy
        } else {
            mazeWidth = 20;
            mazeHeight = 15;
            this.renderer.spotlightRadius = 3.6; // Normal spotlight for hard
        }
        
        this.maze = Maze.create(mazeWidth, mazeHeight);
        
        this.renderer.init(mazeWidth, mazeHeight);
        
        // Pass assets to renderer
        if (assets) {
            this.renderer.setAssets(assets);
        }
        
        this.player = new Player(
            this.maze.entrance.x,
            this.maze.entrance.y,
            this.renderer.cellSize,
            this.maze
        );
        
        PlayerController.init(this.player);
        
        this.startTime = Date.now();
        
        // Initialize audio system
        await Audio.init();
        
        // Start background music after a brief delay
        setTimeout(() => {
            Audio.startBackgroundMusic();
        }, 1000);
        
        this.gameLoop();
    }

    gameLoop() {
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            console.log(`Game loop running, frame: ${this.frameCount}, player moving: ${this.player ? this.player.moving : 'no player'}`);
        }
        
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (this.gameState !== 'playing') return;
        
        // Call player update to process movement
        if (this.player) {
            this.player.update();
        }
        
        this.updateTimer();
        
        if (this.player.isAtExit(this.maze.exit.x, this.maze.exit.y)) {
            this.victory();
        }
    }

    render() {
        if (this.gameState === 'victory') {
            // During victory, only render the victory screen and fireworks
            this.renderer.clear();
            const victoryTime = Date.now() - this.victoryStartTime;
            console.log('Rendering victory screen, victoryTime:', victoryTime);
            this.renderer.renderFireworks(victoryTime);
            this.renderer.renderVictoryScreen();
        } else {
            // Normal gameplay with fog
            this.renderer.renderMaze(this.maze, this.player.gridX, this.player.gridY);
            this.renderer.renderPlayer(this.player);
            this.renderer.renderFog(this.player);
        }
    }

    updateTimer() {
        const elapsed = Date.now() - this.startTime;
        const seconds = Math.floor(elapsed / 1000) % 60;
        const minutes = Math.floor(elapsed / 60000);
        
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerElement.textContent = formattedTime;
    }

    victory() {
        this.gameState = 'victory';
        this.victoryStartTime = Date.now();
        console.log('Victory! You found the exit!');
        
        // Reset fireworks for fresh display
        this.renderer.resetFireworks();
        
        // Stop all player movement
        if (PlayerController) {
            PlayerController.stopHoldTimer();
            PlayerController.holdDirection = null;
        }
        
        // Stop background music and play victory sound
        Audio.stopBackgroundMusic();
        Audio.playVictorySound();
        
        // Show victory screen for 5 seconds, then reset
        setTimeout(() => {
            this.reset();
        }, 5000);
    }

    debugVictory() {
        this.victory();
    }

    reset() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.gameState = 'playing';
        this.init();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}