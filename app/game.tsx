import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Alert, BackHandler, useWindowDimensions, Text, ActionSheetIOS, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { NES, Controller } from 'jsnes';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'base-64';
import { VirtualController } from '../components/VirtualController';
import { THEME } from '../constants/Theme';

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;

const BUTTON_MAP = {
  A: Controller.BUTTON_A,
  B: Controller.BUTTON_B,
  SELECT: Controller.BUTTON_SELECT,
  START: Controller.BUTTON_START,
  UP: Controller.BUTTON_UP,
  DOWN: Controller.BUTTON_DOWN,
  LEFT: Controller.BUTTON_LEFT,
  RIGHT: Controller.BUTTON_RIGHT,
};

type ButtonName = keyof typeof BUTTON_MAP;

export default function GameScreen() {
  const { romUri, romName } = useLocalSearchParams<{ romUri: string; romName: string }>();
  const router = useRouter();

  const nesRef = useRef<NES | null>(null);
  const glRef = useRef<ExpoWebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const animationFrameId = useRef<number | null>(null);
  
  const [isGameReady, setGameReady] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const showActionSheet = () => {
    const options = ['Salvar Estado', 'Carregar Estado', 'Sair do Jogo', 'Cancelar'];
    const destructiveButtonIndex = 2;
    const cancelButtonIndex = 3;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        title: 'Menu do Jogo'
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          handleSaveState();
        } else if (buttonIndex === 1) {
          handleLoadState();
        } else if (buttonIndex === 2) {
          quitGame();
        }
      }
    );
  };
  
  const showAndroidMenu = () => {
    Alert.alert(
      'Menu do Jogo',
      '',
      [
        { text: 'Salvar Estado', onPress: handleSaveState },
        { text: 'Carregar Estado', onPress: handleLoadState },
        { text: 'Sair do Jogo', onPress: quitGame, style: 'destructive' },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };
  
  useEffect(() => {
    let isMounted = true;
    
    const startEmulator = async () => {
      if (!romUri) {
        Alert.alert('Erro', 'Nenhuma ROM selecionada.', [{ text: 'OK', onPress: () => router.back() }]);
        return;
      }

      try {
        const romData64 = await FileSystem.readAsStringAsync(romUri, {
          encoding: 'base64',
        });

        const romBinaryString = base64.decode(romData64);

        const screenBuffer = new Uint8Array(SCREEN_WIDTH * SCREEN_HEIGHT * 4);

        const nes = new NES({
          onFrame: (frameBuffer) => {
            for (let i = 0; i < frameBuffer.length; i++) {
              const pixel = frameBuffer[i];
              const B = (pixel >> 16) & 0xFF;
              const G = (pixel >> 8) & 0xFF;
              const R = pixel & 0xFF;

              screenBuffer[i * 4 + 0] = R;
              screenBuffer[i * 4 + 1] = G;
              screenBuffer[i * 4 + 2] = B;
              screenBuffer[i * 4 + 3] = 0xFF;
            }
            updateTexture(screenBuffer);
          },
        });

        nesRef.current = nes;
        nes.loadROM(romBinaryString);
        
        if(isMounted) {
            setGameReady(true);
        }

      } catch (error) {
        console.error('Falha ao iniciar emulador:', error);
        Alert.alert('Erro Crítico', 'Não foi possível carregar a ROM.', [{ text: 'OK', onPress: () => router.back() }]);
      }
    };
    
    startEmulator();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      quitGame();
      return true;
    });

    return () => {
      isMounted = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      backHandler.remove();
      nesRef.current = null;
    };
  }, [romUri, router]);

  const quitGame = () => {
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
    }
    router.back();
  };

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    glRef.current = gl;

    const vertShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texcoord;
      varying vec2 v_texcoord;
      void main() {
         gl_Position = vec4(a_position, 0.0, 1.0);
         v_texcoord = a_texcoord;
      }
    `;
    const fragShaderSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      varying vec2 v_texcoord;
      void main() {
         gl_FragColor = texture2D(u_texture, v_texcoord);
      }
    `;

    const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertShader, vertShaderSource);
    gl.compileShader(vertShader);

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragShader, fragShaderSource);
    gl.compileShader(fragShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    programRef.current = program;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]),
      gl.STATIC_DRAW
    );
    
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0]),
        gl.STATIC_DRAW
    );
    
    const texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
    gl.enableVertexAttribArray(texcoordAttributeLocation);
    gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    textureRef.current = texture;

    gameLoop();
  };

  const gameLoop = () => {
    const gl = glRef.current;
    
    if (gl && nesRef.current) {
        nesRef.current.frame();
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.endFrameEXP();
    }
    
    animationFrameId.current = requestAnimationFrame(gameLoop);
  };
  
  const updateTexture = useCallback((screenBuffer: Uint8Array) => {
    const gl = glRef.current;
    if (gl && textureRef.current) {
        gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, SCREEN_WIDTH, SCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, screenBuffer
        );
    }
  }, []);

  const handleButtonDown = (button: ButtonName) => {
    nesRef.current?.buttonDown(1, BUTTON_MAP[button]);
  };

  const handleButtonUp = (button: ButtonName) => {
    nesRef.current?.buttonUp(1, BUTTON_MAP[button]);
  };

  const getSaveStateKey = () => `@save_state_${romName}`;

  const handleSaveState = async () => {
    if (nesRef.current) {
      try {
        const state = nesRef.current.toJSON();
        await AsyncStorage.setItem(getSaveStateKey(), JSON.stringify(state));
        Alert.alert('Sucesso', 'O estado do jogo foi salvo!');
      } catch (error) {
        console.error('Falha ao salvar estado:', error);
        Alert.alert('Erro', 'Não foi possível salvar o estado do jogo.');
      }
    }
  };

  const handleLoadState = async () => {
    if (nesRef.current) {
        try {
            const savedStateJSON = await AsyncStorage.getItem(getSaveStateKey());
            if (savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);
                nesRef.current.fromJSON(savedState);
                Alert.alert('Sucesso', 'Estado do jogo carregado!');
            } else {
                Alert.alert('Aviso', 'Nenhum estado salvo encontrado para este jogo.');
            }
        } catch (error) {
            console.error('Falha ao carregar estado:', error);
            Alert.alert('Erro', 'Não foi possível carregar o estado do jogo.');
        }
    }
  };
  
  const isLandscape = windowWidth > windowHeight;
  const gameViewStyle = {
    width: isLandscape ? windowHeight * (SCREEN_WIDTH / SCREEN_HEIGHT) : windowWidth,
    height: isLandscape ? windowHeight : windowWidth * (SCREEN_HEIGHT / SCREEN_WIDTH),
  };

  return (
    <View style={styles.container}>
        <View style={styles.gameContainer}>
            {isGameReady ? (
                <GLView style={gameViewStyle} onContextCreate={onContextCreate} />
            ) : (
                <Text style={styles.loadingText}>Carregando jogo...</Text>
            )}
        </View>
        <VirtualController onButtonDown={handleButtonDown} onButtonUp={handleButtonUp} />
        <TouchableOpacity style={styles.menuButton} onPress={Platform.OS === 'ios' ? showActionSheet : showAndroidMenu}>
            <Text style={styles.menuButtonText}>MENU</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  menuButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
