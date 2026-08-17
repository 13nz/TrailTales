import {
    createNativeStackNavigator,
} from '@react-navigation/native-stack'

import JournalScreen from '../screens/JournalScreen'
import JournalPagesScreen from '../screens/JournalPagesScreen'
import JournalPageScreen from '../screens/JournalPageScreen'

const Stack =
    createNativeStackNavigator()

export default function JournalStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="JournalHome"
                component={
                    JournalScreen
                }
            />

            <Stack.Screen
                name="JournalPages"
                component={
                    JournalPagesScreen
                }
            />

            <Stack.Screen
                name="JournalPage"
                component={
                    JournalPageScreen
                }
            />
        </Stack.Navigator>
    )
}