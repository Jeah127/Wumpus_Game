import axios from 'axios';

// Configure your backend URL here
const API_BASE_URL = 'http://192.168.1.90:3001/api/game';

// For mobile development, use your computer's IP address instead of localhost
// Example: const API_BASE_URL = 'http://192.168.1.100:3001/api/game';

class GameApi {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Create a new game
  async createGame(gridSize = 4) {
    try {
      const response = await axios.post(`${this.baseURL}/create`, {
        gridSize: gridSize
      });
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error);
      throw this.handleError(error);
    }
  }

  // Get game state
  async getGame(gameId) {
    try {
      const response = await axios.get(`${this.baseURL}/${gameId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting game:', error);
      throw this.handleError(error);
    }
  }

  // Get full game state (debug mode)
  async getFullGame(gameId) {
    try {
      const response = await axios.get(`${this.baseURL}/${gameId}/debug`);
      return response.data;
    } catch (error) {
      console.error('Error getting full game:', error);
      throw this.handleError(error);
    }
  }

  // Perform an action
  async performAction(gameId, action) {
    try {
      const response = await axios.post(`${this.baseURL}/${gameId}/action`, {
        action: action
      });
      return response.data;
    } catch (error) {
      console.error('Error performing action:', error);
      throw this.handleError(error);
    }
  }

  // Delete a game
  async deleteGame(gameId) {
    try {
      const response = await axios.delete(`${this.baseURL}/${gameId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting game:', error);
      throw this.handleError(error);
    }
  }

  // Action helpers
  async moveForward(gameId) {
    return this.performAction(gameId, 'forward');
  }

  async turnLeft(gameId) {
    return this.performAction(gameId, 'left');
  }

  async turnRight(gameId) {
    return this.performAction(gameId, 'right');
  }

  async shoot(gameId) {
    return this.performAction(gameId, 'shoot');
  }

  async grab(gameId) {
    return this.performAction(gameId, 'grab');
  }

  async climb(gameId) {
    return this.performAction(gameId, 'climb');
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // Server responded with error
      return {
        message: error.response.data.message || 'Server error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'No response from server. Please check if the backend is running.',
        status: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1
      };
    }
  }
}

export default new GameApi();