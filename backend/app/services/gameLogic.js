const gameState = require('../data/gameState');
const MapGenerator = require('../utils/mapGenerator');

class GameLogic {
  constructor() {
    this.DIRECTIONS = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
    this.ACTIONS = {
      MOVE_FORWARD: 'forward',
      TURN_LEFT: 'left',
      TURN_RIGHT: 'right',
      SHOOT: 'shoot',
      GRAB: 'grab',
      CLIMB: 'climb'
    };
  }

  initializeGame(gridSize = 4) {
    const generator = new MapGenerator(gridSize);
    const map = generator.generateMap();

    const game = gameState.createGame(gridSize);
    
    // Initialize visited grid
    const visited = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    visited[0][0] = true;

    const updatedGame = {
      ...game,
      player: { ...map.player, direction: 0, alive: true, hasGold: false, arrows: 1 },
      wumpus: { ...map.wumpus, alive: true },
      gold: { ...map.gold, collected: false },
      pits: map.pits,
      visited: visited,
      percepts: this.calculatePercepts(map.player.x, map.player.y, map.wumpus, map.pits, map.gold, false)
    };

    return gameState.updateGame(game.id, updatedGame);
  }

  calculatePercepts(x, y, wumpus, pits, gold, hasGold) {
    const generator = new MapGenerator();
    const adjacent = generator.getAdjacentCells(x, y);

    const percepts = {
      stench: false,
      breeze: false,
      glitter: false,
      bump: false,
      scream: false
    };

    // Check for stench (Wumpus in adjacent cell)
    if (wumpus.alive) {
      percepts.stench = adjacent.some(cell => 
        cell.x === wumpus.x && cell.y === wumpus.y
      );
    }

    // Check for breeze (Pit in adjacent cell)
    percepts.breeze = adjacent.some(cell =>
      pits.some(pit => pit.x === cell.x && pit.y === cell.y)
    );

    // Check for glitter (Gold in current cell)
    percepts.glitter = (x === gold.x && y === gold.y && !gold.collected && !hasGold);

    return percepts;
  }

  processAction(gameId, action) {
    const game = gameState.getGame(gameId);
    if (!game) {
      return { success: false, message: 'Game not found' };
    }

    if (game.gameOver) {
      return { success: false, message: 'Game is already over' };
    }

    let result = { success: true, message: '' };
    const newPercepts = { ...game.percepts, bump: false, scream: false };

    switch (action.toLowerCase()) {
      case this.ACTIONS.MOVE_FORWARD:
        result = this.moveForward(game);
        break;
      case this.ACTIONS.TURN_LEFT:
        result = this.turnLeft(game);
        break;
      case this.ACTIONS.TURN_RIGHT:
        result = this.turnRight(game);
        break;
      case this.ACTIONS.SHOOT:
        result = this.shoot(game);
        newPercepts.scream = result.scream || false;
        break;
      case this.ACTIONS.GRAB:
        result = this.grabGold(game);
        break;
      case this.ACTIONS.CLIMB:
        result = this.climb(game);
        break;
      default:
        return { success: false, message: 'Invalid action' };
    }

    if (result.success) {
      game.moves++;
      game.score += result.scoreChange || 0;
      
      // Update percepts
      game.percepts = {
        ...this.calculatePercepts(
          game.player.x, 
          game.player.y, 
          game.wumpus, 
          game.pits, 
          game.gold,
          game.player.hasGold
        ),
        bump: newPercepts.bump,
        scream: newPercepts.scream
      };

      gameState.updateGame(gameId, game);
    }

    return {
      ...result,
      game: game
    };
  }

  moveForward(game) {
    const { player, gridSize } = game;
    let newX = player.x;
    let newY = player.y;

    // Calculate new position based on direction
    switch (player.direction) {
      case 0: newY++; break; // NORTH
      case 1: newX++; break; // EAST
      case 2: newY--; break; // SOUTH
      case 3: newX--; break; // WEST
    }

    // Check if new position is valid
    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
      game.percepts.bump = true;
      return { 
        success: true, 
        message: 'Bump! Hit the wall.', 
        scoreChange: -1 
      };
    }

    // Update player position
    player.x = newX;
    player.y = newY;
    game.visited[newY][newX] = true;

    // Check for death conditions
    const deathResult = this.checkDeath(game);
    if (deathResult.dead) {
      return deathResult;
    }

    return { 
      success: true, 
      message: 'Moved forward', 
      scoreChange: -1 
    };
  }

  turnLeft(game) {
    game.player.direction = (game.player.direction + 3) % 4;
    return { 
      success: true, 
      message: 'Turned left', 
      scoreChange: -1 
    };
  }

  turnRight(game) {
    game.player.direction = (game.player.direction + 1) % 4;
    return { 
      success: true, 
      message: 'Turned right', 
      scoreChange: -1 
    };
  }

  shoot(game) {
    const { player, wumpus, gridSize } = game;

    if (player.arrows <= 0) {
      return { success: false, message: 'No arrows left' };
    }

    player.arrows--;
    let arrowX = player.x;
    let arrowY = player.y;

    // Arrow travels in the direction player is facing
    while (true) {
      switch (player.direction) {
        case 0: arrowY++; break;
        case 1: arrowX++; break;
        case 2: arrowY--; break;
        case 3: arrowX--; break;
      }

      // Check if arrow goes out of bounds
      if (arrowX < 0 || arrowX >= gridSize || arrowY < 0 || arrowY >= gridSize) {
        break;
      }

      // Check if arrow hits Wumpus
      if (arrowX === wumpus.x && arrowY === wumpus.y && wumpus.alive) {
        wumpus.alive = false;
        return { 
          success: true, 
          message: 'You killed the Wumpus!', 
          scoreChange: -10,
          scream: true
        };
      }
    }

    return { 
      success: true, 
      message: 'Arrow missed', 
      scoreChange: -10 
    };
  }

  grabGold(game) {
    const { player, gold } = game;

    if (player.x === gold.x && player.y === gold.y && !gold.collected) {
      gold.collected = true;
      player.hasGold = true;
      return { 
        success: true, 
        message: 'Grabbed the gold!', 
        scoreChange: 1000 
      };
    }

    return { 
      success: false, 
      message: 'No gold here' 
    };
  }

  climb(game) {
    const { player } = game;

    if (player.x === 0 && player.y === 0) {
      game.gameOver = true;
      
      if (player.hasGold) {
        game.won = true;
        return { 
          success: true, 
          message: 'You escaped with the gold! Victory!', 
          scoreChange: 0 
        };
      } else {
        return { 
          success: true, 
          message: 'You escaped but without the gold.', 
          scoreChange: 0 
        };
      }
    }

    return { 
      success: false, 
      message: 'Can only climb out from starting position (0,0)' 
    };
  }

  checkDeath(game) {
    const { player, wumpus, pits } = game;

    // Check if player fell into pit
    if (pits.some(pit => pit.x === player.x && pit.y === player.y)) {
      player.alive = false;
      game.gameOver = true;
      game.score -= 1000;
      return { 
        success: true,
        dead: true,
        message: 'You fell into a pit! Game Over.', 
        scoreChange: -1000 
      };
    }

    // Check if player encountered Wumpus
    if (wumpus.alive && wumpus.x === player.x && wumpus.y === player.y) {
      player.alive = false;
      game.gameOver = true;
      game.score -= 1000;
      return { 
        success: true,
        dead: true,
        message: 'You were eaten by the Wumpus! Game Over.', 
        scoreChange: -1000 
      };
    }

    return { dead: false };
  }

  getGameState(gameId) {
    return gameState.getGame(gameId);
  }
}

module.exports = new GameLogic();