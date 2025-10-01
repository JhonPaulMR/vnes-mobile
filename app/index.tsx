import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RomListItem } from '../components/RomListItem';
import { THEME } from '../constants/Theme';

interface Rom {
  name: string;
  uri: string;
}

const ROMS_STORAGE_KEY = '@nes_player_roms';

export default function RomListScreen() {
  const [roms, setRoms] = useState<Rom[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadRomsFromStorage();
  }, []);

  const loadRomsFromStorage = async () => {
    try {
      const storedRoms = await AsyncStorage.getItem(ROMS_STORAGE_KEY);
      if (storedRoms) {
        setRoms(JSON.parse(storedRoms));
      }
    } catch (error) {
      console.error('Falha ao carregar ROMs:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de jogos salvos.');
    }
  };

  const saveRomsToStorage = async (newRoms: Rom[]) => {
    try {
      await AsyncStorage.setItem(ROMS_STORAGE_KEY, JSON.stringify(newRoms));
    } catch (error) {
      console.error('Falha ao salvar ROMs:', error);
    }
  };

  const handleImportRom = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if(!asset.uri) {
            Alert.alert('Erro', 'Não foi possível obter o caminho do arquivo.');
            return;
        }
        const newRom: Rom = { name: asset.name, uri: asset.uri };
        if (roms.some(rom => rom.name === newRom.name)) {
            Alert.alert('Aviso', 'Este jogo já foi adicionado à sua lista.');
            return;
        }
        const updatedRoms = [...roms, newRom];
        setRoms(updatedRoms);
        await saveRomsToStorage(updatedRoms);
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Erro de Importação', 'Não foi possível importar o arquivo ROM.');
    }
  };

  const handleDeleteRom = async (romToDelete: Rom) => {
    const updatedRoms = roms.filter(rom => rom.uri !== romToDelete.uri);
    setRoms(updatedRoms);
    await saveRomsToStorage(updatedRoms);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={roms}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: '/game', params: { romUri: item.uri, romName: item.name } })}>
             <RomListItem rom={item} onDelete={() => handleDeleteRom(item)} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum jogo na sua biblioteca.</Text>
                <Text style={styles.emptySubText}>Clique em "Importar ROM" para começar.</Text>
            </View>
        }
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.importButton} onPress={handleImportRom}>
        <Text style={styles.importButtonText}>Importar ROM</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.BACKGROUND,
  },
  listContent: {
    padding: THEME.SPACING.MEDIUM,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: THEME.COLORS.TEXT,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubText: {
    color: THEME.COLORS.SUBTLE,
    fontSize: 14,
    marginTop: THEME.SPACING.SMALL,
  },
  importButton: {
    backgroundColor: THEME.COLORS.PRIMARY,
    padding: THEME.SPACING.MEDIUM,
    margin: THEME.SPACING.MEDIUM,
    borderRadius: THEME.SPACING.SMALL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
