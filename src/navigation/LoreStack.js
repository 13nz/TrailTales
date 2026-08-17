import {
    createNativeStackNavigator,
} from '@react-navigation/native-stack'

import LoreScreen from '../screens/LoreScreen'
import LoreParkScreen from '../screens/LoreParkScreen'
import LoreStoryScreen from '../screens/LoreStoryScreen'
import CampfireScreen from '../screens/CampfireScreen'
import CampfireSelectionScreen from '../screens/CampfireSelectionScreen'

const Stack =
    createNativeStackNavigator()

// keeps all lore navigation inside the lore tab
export default function LoreStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="LoreHome"
                component={
                    LoreScreen
                }
            />

            <Stack.Screen
                name="LorePark"
                component={
                    LoreParkScreen
                }
            />

            <Stack.Screen
                name="LoreStory"
                component={
                    LoreStoryScreen
                }
            />

            <Stack.Screen
                name="CampfireSelection"
                component={
                    CampfireSelectionScreen
                }
            />

            <Stack.Screen
                name="CampfireStory"
                component={
                    CampfireScreen
                }
            />

        </Stack.Navigator>
    )
}