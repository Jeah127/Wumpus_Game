const { v4: uuidv4 } = require('uuid');

class GameState {
  constructor() {
    this.games = new Map();
  }

  createGame(gridSize = 4) {
    const gameId = uuidv4();
    const game = {
      id: gameId,
      gridSize: gridSize,
      player: { x: 0, y: 0, direction: 0, alive: true, hasGold: false, arrows: 1 },
      wumpus: { x: 0, y: 0, alive: true },
      gold: { x: 0, y: 0, collected: false },
      pits: [],
      visited: [[true, false, false, false], [false, false, false, false], [false, false, false, false], [false, false, false, false]],
      percepts: { stench: false, breeze: false, glitter: false, bump: false, scream: false },
      score: 0,
      moves: 0,
      gameOver: false,
      won: false,
      createdAt: new Date()
    };
    
    this.games.set(gameId, game);
    return game;
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }

  updateGame(gameId, updates) {
    const game = this.games.get(gameId);
    if (game) {
      Object.assign(game, updates);
      this.games.set(gameId, game);
      return game;
    }
    return null;
  }

  deleteGame(gameId) {
    return this.games.delete(gameId);
  }

  getAllGames() {
    return Array.from(this.games.values());
  }

  cleanupOldGames(maxAge = 24 * 60 * 60 * 1000) {
    const now = new Date();
    for (const [gameId, game] of this.games.entries()) {
      if (now - game.createdAt > maxAge) {
        this.games.delete(gameId);
      }
    }
  }
}

// Singleton instance
const gameStateInstance = new GameState();

// Cleanup old games every hour
setInterval(() => {
  gameStateInstance.cleanupOldGames();
}, 60 * 60 * 1000);

module.exports = gameStateInstance;