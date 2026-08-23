console.log('===== APP START =====')
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import AppNavigator from './src/navigation/AppNavigator'
import { TripProvider } from './src/context/TripContext'
import { WildlifeReportProvider } from './src/context/WildlifeReportContext'


export default function App() {
    return (
        // provides device safe-area information to every screen
        <SafeAreaProvider>
            {/* provides shared trip state to the entire navigation tree */}
            <TripProvider>
                <WildlifeReportProvider>
                     {/* manages navigation state for the entire application */}
                    <NavigationContainer>
                        <AppNavigator />
                    </NavigationContainer>
                </WildlifeReportProvider>
            </TripProvider>
        </SafeAreaProvider>
    )
}