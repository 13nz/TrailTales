import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import AppNavigator from './src/navigation/AppNavigator'
import { TripProvider } from './src/context/TripContext'

export default function App() {
    return (
        // provides device safe-area information to every screen
        <SafeAreaProvider>
            {/* provides shared trip state to the entire navigation tree */}
            <TripProvider>
                {/* manages navigation state for the entire application */}
                <NavigationContainer>
                    <AppNavigator />
                </NavigationContainer>
            </TripProvider>
        </SafeAreaProvider>
    )
}