import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/Theme';

interface Rom {
  name: string;
  uri: string;
}

interface RomListItemProps {
  rom: Rom;
  onDelete: () => void;
}

export const RomListItem = ({ rom, onDelete }: RomListItemProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.name} numberOfLines={1}>{rom.name}</Text>
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.COLORS.SURFACE,
    padding: THEME.SPACING.LARGE,
    borderRadius: THEME.SPACING.SMALL,
    marginBottom: THEME.SPACING.MEDIUM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    color: THEME.COLORS.TEXT,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: THEME.SPACING.MEDIUM,
    paddingVertical: THEME.SPACING.SMALL,
    marginLeft: THEME.SPACING.MEDIUM,
  },
  deleteButtonText: {
    color: THEME.COLORS.PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
  }
});
