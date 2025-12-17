const gameLogic = require('../services/gameLogic');

class GameController {
  // Create a new game
  async createGame(req, res) {
    try {
      const { gridSize } = req.body;
      const size = gridSize || 4;

      if (size < 4 || size > 10) {
        return res.status(400).json({
          success: false,
          message: 'Grid size must be between 4 and 10'
        });
      }

      const game = gameLogic.initializeGame(size);

      res.status(201).json({
        success: true,
        message: 'Game created successfully',
        data: {
          gameId: game.id,
          gridSize: game.gridSize,
          player: game.player,
          percepts: game.percepts,
          score: game.score,
          moves: game.moves,
          visited: game.visited
        }
      });
    } catch (error) {
      console.error('Error creating game:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create game',
        error: error.message
      });
    }
  }

  // Get game state
  async getGame(req, res) {
    try {
      const { gameId } = req.params;
      const game = gameLogic.getGameState(gameId);

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }

      // Return game state without revealing hidden information
      res.status(200).json({
        success: true,
        data: {
          gameId: game.id,
          gridSize: game.gridSize,
          player: game.player,
          percepts: game.percepts,
          score: game.score,
          moves: game.moves,
          visited: game.visited,
          gameOver: game.gameOver,
          won: game.won
        }
      });
    } catch (error) {
      console.error('Error getting game:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve game',
        error: error.message
      });
    }
  }

  // Perform an action
  async performAction(req, res) {
    try {
      const { gameId } = req.params;
      const { action } = req.body;

      if (!action) {
        return res.status(400).json({
          success: false,
          message: 'Action is required'
        });
      }

      const result = gameLogic.processAction(gameId, action);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      const game = result.game;

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          gameId: game.id,
          player: game.player,
          percepts: game.percepts,
          score: game.score,
          moves: game.moves,
          visited: game.visited,
          gameOver: game.gameOver,
          won: game.won
        }
      });
    } catch (error) {
      console.error('Error performing action:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform action',
        error: error.message
      });
    }
  }

  // Get full game state (for debugging - reveals all)
  async getFullGame(req, res) {
    try {
      const { gameId } = req.params;
      const game = gameLogic.getGameState(gameId);

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }

      // Return complete game state including hidden elements
      res.status(200).json({
        success: true,
        data: game
      });
    } catch (error) {
      console.error('Error getting full game:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve full game state',
        error: error.message
      });
    }
  }

  // Reset/Delete game
  async deleteGame(req, res) {
    try {
      const { gameId } = req.params;
      const deleted = gameLogic.getGameState(gameId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Game deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting game:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete game',
        error: error.message
      });
    }
  }
}

module.exports = new GameController();