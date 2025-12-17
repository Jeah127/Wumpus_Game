class MapGenerator {
  constructor(gridSize = 4) {
    this.gridSize = gridSize;
  }

  generateMap() {
    // Player always starts at (0, 0)
    const playerPos = { x: 0, y: 0 };

    // Generate Wumpus position (not at player start)
    const wumpusPos = this.getRandomPosition([playerPos]);

    // Generate Gold position (not at player start or wumpus)
    const goldPos = this.getRandomPosition([playerPos, wumpusPos]);

    // Generate Pits (not at player start, wumpus, or gold)
    // Number of pits: 20% of total cells (minimum 1, maximum gridSize)
    const numPits = Math.max(1, Math.min(this.gridSize, Math.floor((this.gridSize * this.gridSize) * 0.2)));
    const pits = this.generatePits(numPits, [playerPos, wumpusPos, goldPos]);

    return {
      player: playerPos,
      wumpus: wumpusPos,
      gold: goldPos,
      pits: pits
    };
  }

  getRandomPosition(excludePositions = []) {
    let position;
    let isValid = false;

    while (!isValid) {
      position = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize)
      };

      isValid = !excludePositions.some(pos => 
        pos.x === position.x && pos.y === position.y
      );
    }

    return position;
  }

  generatePits(count, excludePositions = []) {
    const pits = [];
    
    for (let i = 0; i < count; i++) {
      const pitPos = this.getRandomPosition([...excludePositions, ...pits]);
      pits.push(pitPos);
    }

    return pits;
  }

  isValidPosition(x, y) {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
  }

  getAdjacentCells(x, y) {
    const adjacent = [];
    const directions = [
      { dx: 0, dy: 1 },  // North
      { dx: 1, dy: 0 },  // East
      { dx: 0, dy: -1 }, // South
      { dx: -1, dy: 0 }  // West
    ];

    directions.forEach(dir => {
      const newX = x + dir.dx;
      const newY = y + dir.dy;
      if (this.isValidPosition(newX, newY)) {
        adjacent.push({ x: newX, y: newY });
      }
    });

    return adjacent;
  }
}

module.exports = MapGenerator;