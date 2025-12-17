import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { gameStyles } from '../styles/gameStyles';

const Cell = ({ 
  x, 
  y, 
  isVisited, 
  isCurrent, 
  playerDirection,
  percepts,
  onPress 
}) => {
  
  // Determine cell style
  const getCellStyle = () => {
    if (isCurrent) {
      return [gameStyles.cell, gameStyles.cellCurrent];
    } else if (isVisited) {
      return [gameStyles.cell, gameStyles.cellVisited];
    } else {
      return [gameStyles.cell, gameStyles.cellUnvisited];
    }
  };

  // Get player direction arrow
  const getPlayerArrow = () => {
    const arrows = ['↑', '→', '↓', '←'];
    return arrows[playerDirection];
  };

  // Render percept indicators
  const renderPercepts = () => {
    if (!isCurrent || !isVisited) return null;

    return (
      <View style={gameStyles.cellContent}>
        {percepts.stench && (
          <Text style={[gameStyles.cellIcon, { color: '#ff6b6b', position: 'absolute', top: 2, left: 2 }]}>
            💀
          </Text>
        )}
        {percepts.breeze && (
          <Text style={[gameStyles.cellIcon, { color: '#4dabf7', position: 'absolute', top: 2, right: 2 }]}>
            🌬️
          </Text>
        )}
        {percepts.glitter && (
          <Text style={[gameStyles.cellIcon, { color: '#ffd700', position: 'absolute', bottom: 2 }]}>
            ✨
          </Text>
        )}
      </View>
    );
  };

  // Render fog of war for unvisited cells
  const renderFog = () => {
    if (isVisited) return null;
    
    return (
      <View style={[gameStyles.cellContent, { backgroundColor: 'rgba(11, 14, 22, 0.9)' }]}>
        <Text style={{ fontSize: 24, color: '#2a3f5f' }}>❓</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={getCellStyle()} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Grid coordinates (for debugging) */}
      <Text style={{ 
        position: 'absolute', 
        top: 2, 
        left: 4, 
        fontSize: 10, 
        color: '#4a5f7f',
        fontWeight: 'bold'
      }}>
        {x},{y}
      </Text>

      {/* Player indicator */}
      {isCurrent && isVisited && (
        <Text style={[gameStyles.player, { color: '#00ff88', textShadowColor: '#00ff88', textShadowRadius: 10 }]}>
          {getPlayerArrow()}
        </Text>
      )}

      {/* Percepts */}
      {renderPercepts()}

      {/* Fog of war */}
      {renderFog()}
    </TouchableOpacity>
  );
};

export default Cell;