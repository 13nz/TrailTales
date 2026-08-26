import { createNativeStackNavigator } from '@react-navigation/native-stack'

import MapScreen from '../screens/MapScreen'
import ParkDetailScreen from '../screens/ParkDetailScreen'
import TrailDetailScreen from '../screens/TrailDetailScreen'
import CampgroundDetailScreen from '../screens/CampgroundDetailScreen'

const Stack = createNativeStackNavigator()

// manages navigation between the map and detailed geographic locations
export default function MapStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                // individual screens provide their own visual headers
                headerShown: false,

                // keeps navigation transitions consistent across the map experience
                animation: 'slide_from_right',
            }}
        >
            {/* the map is the root screen of the map navigation stack */}
            <Stack.Screen
                name="MapHome"
                component={MapScreen}
            />

            {/* allows a park selected from the map to open its detailed page */}
            <Stack.Screen
                name="MapParkDetail"
                component={ParkDetailScreen}
            />

            {/* allows trails selected from the map to open the normal trail detail screen */}
            <Stack.Screen
                name="TrailDetail"
                component={TrailDetailScreen}
            />

            {/* allows campgrounds selected from the map to open the normal campground detail screen */}
            <Stack.Screen
                name="CampgroundDetail"
                component={CampgroundDetailScreen}
            />
        </Stack.Navigator>
    )
}