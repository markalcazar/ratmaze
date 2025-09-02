class MazeGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.entrance = { x: 0, y: 0 };
        this.exit = { x: width - 1, y: height - 1 };
    }

    generate() {
        this.initializeGrid();
        this.generateMaze();
        
        this.grid[this.entrance.y][this.entrance.x].isEntrance = true;
        this.grid[this.exit.y][this.exit.x].isExit = true;
        
        return {
            grid: this.grid,
            width: this.width,
            height: this.height,
            entrance: this.entrance,
            exit: this.exit
        };
    }

    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = {
                    x: x,
                    y: y,
                    walls: {
                        top: true,
                        right: true,
                        bottom: true,
                        left: true
                    },
                    visited: false
                };
            }
        }
    }

    generateMaze() {
        const stack = [];
        const start = this.grid[0][0];
        start.visited = true;
        stack.push(start);

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const unvisitedNeighbors = this.getUnvisitedNeighbors(current);

            if (unvisitedNeighbors.length > 0) {
                const next = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
                this.removeWallBetween(current, next);
                next.visited = true;
                stack.push(next);
            } else {
                stack.pop();
            }
        }
    }

    getUnvisitedNeighbors(cell) {
        const neighbors = [];
        const { x, y } = cell;

        if (y > 0 && !this.grid[y - 1][x].visited) {
            neighbors.push(this.grid[y - 1][x]);
        }
        if (x < this.width - 1 && !this.grid[y][x + 1].visited) {
            neighbors.push(this.grid[y][x + 1]);
        }
        if (y < this.height - 1 && !this.grid[y + 1][x].visited) {
            neighbors.push(this.grid[y + 1][x]);
        }
        if (x > 0 && !this.grid[y][x - 1].visited) {
            neighbors.push(this.grid[y][x - 1]);
        }

        return neighbors;
    }

    removeWallBetween(cell1, cell2) {
        const dx = cell1.x - cell2.x;
        const dy = cell1.y - cell2.y;

        if (dx === 1) {
            cell1.walls.left = false;
            cell2.walls.right = false;
        } else if (dx === -1) {
            cell1.walls.right = false;
            cell2.walls.left = false;
        } else if (dy === 1) {
            cell1.walls.top = false;
            cell2.walls.bottom = false;
        } else if (dy === -1) {
            cell1.walls.bottom = false;
            cell2.walls.top = false;
        }
    }
}

const Maze = {
    generator: null,
    data: null,
    cellSize: 30,

    create(width, height) {
        this.generator = new MazeGenerator(width, height);
        this.data = this.generator.generate();
        return this.data;
    },

    getCell(x, y) {
        if (this.data && y >= 0 && y < this.data.height && x >= 0 && x < this.data.width) {
            return this.data.grid[y][x];
        }
        return null;
    },

    canMove(fromX, fromY, direction) {
        const cell = this.getCell(fromX, fromY);
        if (!cell) return false;

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
};