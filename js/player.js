class Player {
    constructor(x, y, cellSize, maze) {
        this.gridX = x;
        this.gridY = y;
        this.cellSize = cellSize;
        this.maze = maze;
        this.pixelX = x * cellSize;
        this.pixelY = y * cellSize;
        this.targetX = this.pixelX;
        this.targetY = this.pixelY;
        this.speed = 4;
        this.moving = false;
        this.direction = 'right';
        this.moveQueue = [];
        this.animationTime = 0;
        this.lastUpdateTime = Date.now();
        console.log(`Player created at (${x}, ${y}), moving: ${this.moving}, queue: ${this.moveQueue.length}`);
    }

    update() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        if (this.moving) {
            // Only accumulate animation time when moving
            this.animationTime += deltaTime;
            
            const dx = this.targetX - this.pixelX;
            const dy = this.targetY - this.pixelY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only log first frame and near completion
            if (!this.loggedMovement || distance <= 5) {
                console.log(`Update: distance=${distance}, pos=(${this.pixelX},${this.pixelY}), target=(${this.targetX},${this.targetY})`);
                this.loggedMovement = true;
            }

            if (distance > this.speed) {
                // Move towards target at constant speed
                const moveX = (dx / distance) * this.speed;
                const moveY = (dy / distance) * this.speed;
                
                this.pixelX += moveX;
                this.pixelY += moveY;
            } else {
                // Snap to target when close enough
                this.pixelX = this.targetX;
                this.pixelY = this.targetY;
                this.moving = false;
                this.loggedMovement = false;
                console.log(`Movement complete. Queue length: ${this.moveQueue.length}`);
                
                // Process next queued move
                while (this.moveQueue.length > 0 && !this.moving) {
                    const nextMove = this.moveQueue.shift();
                    console.log(`Processing queued move: ${nextMove}`);
                    const moved = this.tryMove(nextMove);
                    if (moved) {
                        break; // Successfully started moving
                    }
                    // If move failed (hit wall), continue to next queued move
                }
            }
        }
    }

    tryMove(direction) {
        console.log(`tryMove called: direction=${direction}, moving=${this.moving}, queueLength=${this.moveQueue.length}`);
        
        if (this.moving) {
            if (this.moveQueue.length < 2) {
                this.moveQueue.push(direction);
                console.log(`Added ${direction} to queue. New queue length: ${this.moveQueue.length}`);
            } else {
                console.log(`Queue full, ignoring ${direction}`);
            }
            return false;
        }

        let newX = this.gridX;
        let newY = this.gridY;

        switch (direction) {
            case 'up':
                newY--;
                break;
            case 'right':
                newX++;
                break;
            case 'down':
                newY++;
                break;
            case 'left':
                newX--;
                break;
        }

        console.log(`Trying to move ${direction} from (${this.gridX}, ${this.gridY}) to (${newX}, ${newY})`);
        
        const canMove = this.canMoveTo(this.gridX, this.gridY, direction);
        console.log(`Can move: ${canMove}`);
        
        if (canMove) {
            this.gridX = newX;
            this.gridY = newY;
            this.targetX = newX * this.cellSize;
            this.targetY = newY * this.cellSize;
            this.moving = true;
            this.direction = direction;
            console.log(`Moving to (${this.gridX}, ${this.gridY})`);
            return true;
        }

        console.log(`Blocked by wall`);
        return false;
    }

    setPosition(x, y) {
        this.gridX = x;
        this.gridY = y;
        this.pixelX = x * this.cellSize;
        this.pixelY = y * this.cellSize;
        this.targetX = this.pixelX;
        this.targetY = this.pixelY;
        this.moving = false;
        this.moveQueue = [];
    }

    canMoveTo(fromX, fromY, direction) {
        const cell = this.getCell(fromX, fromY);
        if (!cell) {
            console.log(`No cell found at (${fromX}, ${fromY})`);
            return false;
        }

        console.log(`Cell walls at (${fromX}, ${fromY}):`, cell.walls);

        switch (direction) {
            case 'up':
                return !cell.walls.top;
            case 'right':
                return !cell.walls.right;
            case 'down':
                return !cell.walls.bottom;
            case 'left':
                return !cell.walls.left;
            default:
                return false;
        }
    }

    getCell(x, y) {
        if (this.maze && this.maze.grid && y >= 0 && y < this.maze.height && x >= 0 && x < this.maze.width) {
            return this.maze.grid[y][x];
        }
        return null;
    }

    isAtExit(exitX, exitY) {
        return this.gridX === exitX && this.gridY === exitY && !this.moving;
    }
}

const PlayerController = {
    player: null,
    keyPressed: {},
    holdDirection: null,
    holdTimer: null,
    initialDelay: 300, // Initial delay before repeat starts (ms)
    repeatDelay: 150,  // Delay between repeated moves (ms)

    init(player) {
        this.player = player;
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    },

    async handleKeyDown(e) {
        console.log(`Key pressed: ${e.key}`);
        
        // Initialize audio on first interaction
        await Audio.initOnUserInteraction();
        
        if (this.keyPressed[e.key]) return;
        
        // Don't accept input if game is not in playing state
        if (window.game && window.game.gameState !== 'playing') {
            return;
        }
        
        this.keyPressed[e.key] = true;
        
        let direction = null;
        let moved = false;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                direction = 'up';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                direction = 'right';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                direction = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                direction = 'left';
                break;
        }
        
        if (direction) {
            console.log(`Attempting to move ${direction}`);
            moved = this.player.tryMove(direction);
            
            // Start hold movement timer only if in playing state
            if (window.game && window.game.gameState === 'playing') {
                this.holdDirection = direction;
                this.startHoldTimer();
            }
        }
        
        // Play sound based on whether movement was successful
        if (moved) {
            Audio.playMovementSound();
        } else if (direction) {
            Audio.playWallBumpSound();
        }
    },

    handleKeyUp(e) {
        this.keyPressed[e.key] = false;
        
        // Stop hold movement if this key was being held
        const direction = this.getDirectionFromKey(e.key);
        if (direction === this.holdDirection) {
            this.stopHoldTimer();
            this.holdDirection = null;
        }
    },

    getDirectionFromKey(key) {
        switch (key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                return 'up';
            case 'ArrowRight':
            case 'd':
            case 'D':
                return 'right';
            case 'ArrowDown':
            case 's':
            case 'S':
                return 'down';
            case 'ArrowLeft':
            case 'a':
            case 'A':
                return 'left';
            default:
                return null;
        }
    },

    startHoldTimer() {
        this.stopHoldTimer(); // Clear any existing timer
        
        this.holdTimer = setTimeout(() => {
            this.repeatMove();
        }, this.initialDelay);
    },

    stopHoldTimer() {
        if (this.holdTimer) {
            clearTimeout(this.holdTimer);
            this.holdTimer = null;
        }
    },

    repeatMove() {
        if (!this.holdDirection) return;
        
        // Don't move if game is not in playing state
        if (window.game && window.game.gameState !== 'playing') {
            this.holdDirection = null;
            return;
        }
        
        // Check if key is still pressed
        const keys = this.getKeysForDirection(this.holdDirection);
        const stillPressed = keys.some(key => this.keyPressed[key]);
        
        if (!stillPressed) {
            this.holdDirection = null;
            return;
        }
        
        // Try to move in held direction
        const moved = this.player.tryMove(this.holdDirection);
        
        if (moved) {
            Audio.playMovementSound();
            // Schedule next repeat
            this.holdTimer = setTimeout(() => {
                this.repeatMove();
            }, this.repeatDelay);
        } else {
            // Hit a wall, stop repeating
            this.holdDirection = null;
        }
    },

    getKeysForDirection(direction) {
        switch (direction) {
            case 'up':
                return ['ArrowUp', 'w', 'W'];
            case 'right':
                return ['ArrowRight', 'd', 'D'];
            case 'down':
                return ['ArrowDown', 's', 'S'];
            case 'left':
                return ['ArrowLeft', 'a', 'A'];
            default:
                return [];
        }
    }
};