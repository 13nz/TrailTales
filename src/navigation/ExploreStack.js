import { createNativeStackNavigator } from '@react-navigation/native-stack'

import ExploreScreen from '../screens/ExploreScreen'
import ParkDirectoryScreen from '../screens/ParkDirectoryScreen'
import ParkDetailScreen from '../screens/ParkDetailScreen'
import TrailDetailScreen from '../screens/TrailDetailScreen'
import CampgroundDetailScreen from '../screens/CampgroundDetailScreen'

const Stack = createNativeStackNavigator()

// manages navigation between the explore landing page and deeper park-related screens
export default function ExploreStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                // each explore screen manages its own visual header
                headerShown: false,

                // prevents the default native transition from conflicting with the application's design
                animation: 'slide_from_right',
            }}
        >
            {/* the explore landing page is the root of this navigation stack */}
            <Stack.Screen
                name="ExploreHome"
                component={ExploreScreen}
            />

            {/* the park directory contains the complete collection of national parks */}
            <Stack.Screen
                name="ParkDirectory"
                component={ParkDirectoryScreen}
            />

            {/* displays the complete information hub for a selected national park */}
            <Stack.Screen
                name="ParkDetail"
                component={ParkDetailScreen}
            />

            {/* displays detailed information about a selected trail */}
            <Stack.Screen
                name="TrailDetail"
                component={TrailDetailScreen}
            />

            {/* displays detailed information about a selected campground */}
            <Stack.Screen
                name="CampgroundDetail"
                component={CampgroundDetailScreen}
            />

        </Stack.Navigator>
    )
}