import React, { useState } from 'react';
import { Text, Pressable, StyleSheet, ViewStyle } from 'react-native';

interface GamepadButtonProps {
  name: any;
  text: string;
  onButtonDown: (name: any) => void;
  onButtonUp: (name: any) => void;
  style?: ViewStyle | ViewStyle[];
}

export function GamepadButton({ name, text, onButtonDown, onButtonUp, style }: GamepadButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    onButtonDown(name);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    onButtonUp(name);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        styles.button,
        style,
        (isPressed || pressed) && styles.buttonPressed
      ]}
    >
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  buttonPressed: {
    backgroundColor: '#777',
    transform: [{ scale: 0.95 }],
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
