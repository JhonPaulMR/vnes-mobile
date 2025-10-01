import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#1E1E2E',
                    },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerShadowVisible: false,
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        title: 'Meus Jogos',
                    }}
                />
                <Stack.Screen
                    name="game"
                    options={{
                        title: 'Em Jogo',
                        headerShown: false,
                        gestureEnabled: false,
                    }}
                />
            </Stack>
        </>
    );
}
