import { registerRootComponent } from 'expo';
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WumpusGame from './WumpusGame';

function App() {
  const [screen, setScreen] = useState('home');

  const renderHome = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Wumpus World</Text>
      <Text style={styles.subtitle}>AI Adventure Game</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setScreen('game')}
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.buttonSecondary]}
        onPress={() => setScreen('settings')}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.buttonSecondary]}
        onPress={() => setScreen('about')}
      >
        <Text style={styles.buttonText}>About</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGame = () => (
    <View style={styles.gameContainer}>
      <WumpusGame onExit={() => setScreen('home')} />
    </View>
  );

  const renderSettings = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.text}>Game settings will be here</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setScreen('home')}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAbout = () => (
    <View style={styles.container}>
      <Text style={styles.title}>About Wumpus World</Text>
      <Text style={styles.text}>
        Navigate a dangerous cave filled with pits and the fearsome Wumpus. 
        Use your AI agent to find the gold and escape!
      </Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setScreen('home')}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScreen = () => {
    switch(screen) {
      case 'game':
        return renderGame();
      case 'settings':
        return renderSettings();
      case 'about':
        return renderAbout();
      default:
        return renderHome();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 40,
  },
  text: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#0f3460',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#16213e',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

registerRootComponent(App);