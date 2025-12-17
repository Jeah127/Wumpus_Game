import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { gameStyles } from '../styles/gameStyles';
import Cell from '../components/Cell';
import gameApi from '../api/gameApi';

const WumpusWorldScreen = () => {
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  // Initialize game on component mount
  useEffect(() => {
    startNewGame();
  }, []);

  // Start a new game
  const startNewGame = async (gridSize = 4) => {
    setLoading(true);
    setMessage('');
    try {
      const response = await gameApi.createGame(gridSize);
      if (response.success) {
        setGameId(response.data.gameId);
        setGameState(response.data);
        showMessage('New game started! Find the gold and escape!', 'info');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  // Perform action
  const performAction = async (action) => {
    if (!gameId || !gameState || gameState.gameOver) restart;

    setLoading(true);
    try {
      const response = await gameApi.performAction(gameId, action);
      if (response.success) {
        setGameState(response.data);
        showMessage(response.message, getMessageType(response.message));
      }
    } catch (error) {
      showMessage(error.message || 'Action failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Show message with type
  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  // Get message type based on content
  const getMessageType = (msg) => {
    if (msg.includes('Victory') || msg.includes('gold') || msg.includes('killed')) {
      return 'success';
    } else if (msg.includes('Game Over') || msg.includes('died') || msg.includes('pit') || msg.includes('eaten')) {
      return 'danger';
    }
    return 'info';
  };

  // Render grid
  const renderGrid = () => {
    if (!gameState) return null;

    const grid = [];
    const size = gameState.gridSize;

    // Render from top to bottom (reverse y-axis for proper display)
    for (let y = size - 1; y >= 0; y--) {
      const row = [];
      for (let x = 0; x < size; x++) {
        const isVisited = gameState.visited[y][x];
        const isCurrent = gameState.player.x === x && gameState.player.y === y;

        row.push(
          <Cell
            key={`${x}-${y}`}
            x={x}
            y={y}
            isVisited={isVisited}
            isCurrent={isCurrent}
            playerDirection={gameState.player.direction}
            percepts={gameState.percepts}
            onPress={() => {}}
          />
        );
      }
      grid.push(
        <View key={y} style={gameStyles.row}>
          {row}
        </View>
      );
    }

    return grid;
  };

  // Render percepts
  const renderPercepts = () => {
    if (!gameState) return null;

    const percepts = [
      { key: 'stench', icon: '💀', label: 'Stench', active: gameState.percepts.stench },
      { key: 'breeze', icon: '🌬️', label: 'Breeze', active: gameState.percepts.breeze },
      { key: 'glitter', icon: '✨', label: 'Glitter', active: gameState.percepts.glitter },
      { key: 'bump', icon: '🧱', label: 'Bump', active: gameState.percepts.bump },
      { key: 'scream', icon: '😱', label: 'Scream', active: gameState.percepts.scream },
    ];

    return (
      <View style={gameStyles.perceptsContainer}>
        {percepts.map((percept) => (
          <View
            key={percept.key}
            style={[
              gameStyles.perceptBadge,
              percept.active ? gameStyles.perceptActive : gameStyles.perceptInactive,
            ]}
          >
            <Text style={gameStyles.perceptIcon}>{percept.icon}</Text>
            <Text style={gameStyles.perceptText}>{percept.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render game over overlay
  const renderGameOver = () => {
    if (!gameState || !gameState.gameOver) return null;

    return (
      <View style={gameStyles.gameOverOverlay}>
        <View
          style={[
            gameStyles.gameOverContent,
            gameState.won ? gameStyles.gameOverWin : gameStyles.gameOverLose,
          ]}
        >
          <Text
            style={[
              gameStyles.gameOverTitle,
              gameState.won ? gameStyles.gameOverTitleWin : gameStyles.gameOverTitleLose,
            ]}
          >
            {gameState.won ? '🏆 VICTORY! 🏆' : '💀 GAME OVER 💀'}
          </Text>

          <View style={gameStyles.gameOverStats}>
            <View style={gameStyles.gameOverStatRow}>
              <Text style={gameStyles.gameOverStatLabel}>Final Score:</Text>
              <Text style={gameStyles.gameOverStatValue}>{gameState.score}</Text>
            </View>
            <View style={gameStyles.gameOverStatRow}>
              <Text style={gameStyles.gameOverStatLabel}>Moves Made:</Text>
              <Text style={gameStyles.gameOverStatValue}>{gameState.moves}</Text>
            </View>
            <View style={gameStyles.gameOverStatRow}>
              <Text style={gameStyles.gameOverStatLabel}>Gold Collected:</Text>
              <Text style={gameStyles.gameOverStatValue}>
                {gameState.player.hasGold ? 'Yes ✓' : 'No ✗'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={gameStyles.newGameButton}
            onPress={() => startNewGame()}
          >
            <Text style={gameStyles.newGameButtonText}>🎮 NEW GAME</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !gameState) {
    return (
      <View style={gameStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={gameStyles.loadingText}>Generating Wumpus World...</Text>
      </View>
    );
  }

  return (
    <View style={gameStyles.container}>
      {/* Header */}
      <View style={gameStyles.header}>
        <Text style={gameStyles.headerTitle}>🏰 WUMPUS WORLD 🏰</Text>
        <View style={gameStyles.statsContainer}>
          <View style={gameStyles.statBox}>
            <Text style={gameStyles.statLabel}>Score</Text>
            <Text style={gameStyles.statValue}>{gameState?.score || 0}</Text>
          </View>
          <View style={gameStyles.statBox}>
            <Text style={gameStyles.statLabel}>Moves</Text>
            <Text style={gameStyles.statValue}>{gameState?.moves || 0}</Text>
          </View>
          <View style={gameStyles.statBox}>
            <Text style={gameStyles.statLabel}>Arrows</Text>
            <Text style={gameStyles.statValue}>{gameState?.player.arrows || 0}</Text>
          </View>
          <View style={gameStyles.statBox}>
            <Text style={gameStyles.statLabel}>Gold</Text>
            <Text style={gameStyles.statValue}>
              {gameState?.player.hasGold ? '✓' : '✗'}
            </Text>
          </View>
        </View>
      </View>

      {/* Message */}
      {message !== '' && (
        <View
          style={[
            gameStyles.messageContainer,
            messageType === 'success' && gameStyles.messageSuccess,
            messageType === 'danger' && gameStyles.messageDanger,
            messageType === 'info' && gameStyles.messageInfo,
          ]}
        >
          <Text style={gameStyles.messageText}>{message}</Text>
        </View>
      )}

      <ScrollView>
        {/* Percepts */}
        {renderPercepts()}

        {/* Game Board */}
        <View style={gameStyles.gameBoard}>
          <View style={gameStyles.grid}>{renderGrid()}</View>
        </View>

        {/* Controls */}
        <View style={gameStyles.controlsContainer}>
          <Text style={gameStyles.controlsTitle}>⚔️ CONTROLS ⚔️</Text>

          {/* Movement Controls */}
          <View style={gameStyles.directionControls}>
            <View style={gameStyles.controlRow}>
              <TouchableOpacity
                style={[
                  gameStyles.controlButton,
                  (loading || gameState?.gameOver) && gameStyles.controlButtonDisabled,
                ]}
                onPress={() => performAction('forward')}
                disabled={loading || gameState?.gameOver}
              >
                <Text style={gameStyles.controlButtonText}>↑ MOVE</Text>
              </TouchableOpacity>
            </View>
            <View style={gameStyles.controlRow}>
              <TouchableOpacity
                style={[
                  gameStyles.controlButton,
                  (loading || gameState?.gameOver) && gameStyles.controlButtonDisabled,
                ]}
                onPress={() => performAction('left')}
                disabled={loading || gameState?.gameOver}
              >
                <Text style={gameStyles.controlButtonText}>← TURN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  gameStyles.controlButton,
                  (loading || gameState?.gameOver) && gameStyles.controlButtonDisabled,
                ]}
                onPress={() => performAction('right')}
                disabled={loading || gameState?.gameOver}
              >
                <Text style={gameStyles.controlButtonText}>TURN →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Controls */}
          <View style={gameStyles.actionControls}>
            <TouchableOpacity
              style={[
                gameStyles.controlButton,
                (loading || gameState?.gameOver || gameState?.player.arrows <= 0) &&
                  gameStyles.controlButtonDisabled,
              ]}
              onPress={() => performAction('shoot')}
              disabled={loading || gameState?.gameOver || gameState?.player.arrows <= 0}
            >
              <Text style={gameStyles.controlButtonText}>🏹 SHOOT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                gameStyles.controlButton,
                (loading || gameState?.gameOver) && gameStyles.controlButtonDisabled,
              ]}
              onPress={() => performAction('grab')}
              disabled={loading || gameState?.gameOver}
            >
              <Text style={gameStyles.controlButtonText}>💰 GRAB</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                gameStyles.controlButton,
                (loading || gameState?.gameOver) && gameStyles.controlButtonDisabled,
              ]}
              onPress={() => performAction('climb')}
              disabled={loading || gameState?.gameOver}
            >
              <Text style={gameStyles.controlButtonText}>🪜 CLIMB</Text>
            </TouchableOpacity>
          </View>

          {/* New Game Button */}
          <TouchableOpacity
            style={gameStyles.newGameButton}
            onPress={() => startNewGame()}
            disabled={loading}
          >
            <Text style={gameStyles.newGameButtonText}>
              {loading ? '⏳ LOADING...' : '🎮 NEW GAME'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Game Over Overlay */}
      {renderGameOver()}
    </View>
  );
};

export default WumpusWorldScreen;