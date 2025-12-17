const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Create a new game
router.post('/create', gameController.createGame);

// Get game state
router.get('/:gameId', gameController.getGame);

// Get full game state (debug mode - shows all hidden elements)
router.get('/:gameId/debug', gameController.getFullGame);

// Perform an action
router.post('/:gameId/action', gameController.performAction);

// Delete a game
router.delete('/:gameId', gameController.deleteGame);

module.exports = router;