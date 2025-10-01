import React from "react";
import { View, StyleSheet } from "react-native";
import { GamepadButton } from "./GamepadButton";
import { THEME } from "../constants/Theme";

interface VirtualControllerProps {
  onButtonDown: (button: any) => void;
  onButtonUp: (button: any) => void;
}
export function VirtualController({
  onButtonDown,
  onButtonUp,
}: VirtualControllerProps) {
  return (
    <View style={styles.container2}>
      <View style={styles.container}>
        <View style={styles.dpadContainer}>
          <View style={styles.dpadRow}>
            <GamepadButton
              name="UP"
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              style={styles.dpadUp}
              text="▲"
            />
          </View>
          <View style={styles.dpadRow}>
            <GamepadButton
              name="LEFT"
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              style={styles.dpadLeft}
              text="◀"
            />
            <View style={styles.dpadCenter} />
            <GamepadButton
              name="RIGHT"
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              style={styles.dpadRight}
              text="▶"
            />
          </View>
          <View style={styles.dpadRow}>
            <GamepadButton
              name="DOWN"
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              style={styles.dpadDown}
              text="▼"
            />
          </View>
        </View>
        <View style={styles.actionButtonsContainer}>
          <GamepadButton
            name="B"
            onButtonDown={onButtonDown}
            onButtonUp={onButtonUp}
            style={styles.actionButton}
            text="B"
          />
          <GamepadButton
            name="A"
            onButtonDown={onButtonDown}
            onButtonUp={onButtonUp}
            style={[styles.actionButton, styles.buttonA]}
            text="A"
          />
        </View>
      </View>
      <View style={styles.systemButtonsContainer}>
        <GamepadButton
          name="SELECT"
          onButtonDown={onButtonDown}
          onButtonUp={onButtonUp}
          style={styles.systemButton}
          text="SELECT"
        />
        <GamepadButton
          name="START"
          onButtonDown={onButtonDown}
          onButtonUp={onButtonUp}
          style={styles.systemButton}
          text="START"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#111",
  },
  container2: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#111",
  },
  dpadContainer: {
    width: 150,
    height: 150,
  },
  dpadRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dpadCenter: {
    width: 50,
    height: 50,
  },
  dpadUp: { position: "absolute", top: 10, left: 48 },
  dpadDown: { position: "absolute", top: 60, left: 48 },
  dpadLeft: { position: "absolute", top: 60, left: -5 },
  dpadRight: { position: "absolute", top: 60, left: 100 },

  systemButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 40,
  },
  systemButton: {
    width: 70,
    height: 30,
    borderRadius: 15,
  },
  actionButtonsContainer: {
    width: 150,
    height: 70,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 10,
  },
  buttonA: {
    backgroundColor: THEME.COLORS.PRIMARY,
  },
});
