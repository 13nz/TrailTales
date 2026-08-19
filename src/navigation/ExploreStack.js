import {
    createNativeStackNavigator,
} from '@react-navigation/native-stack'

import ExploreScreen from '../screens/ExploreScreen'
import ParkDirectoryScreen from '../screens/ParkDirectoryScreen'
import ParkDetailScreen from '../screens/ParkDetailScreen'
import TrailDetailScreen from '../screens/TrailDetailScreen'
import CampgroundDetailScreen from '../screens/CampgroundDetailScreen'

import ExploreSearchScreen from '../screens/ExploreSearchScreen'
import TrailDirectoryScreen from '../screens/TrailDirectoryScreen'
import CampgroundDirectoryScreen from '../screens/CampgroundDirectoryScreen'
import ActivityDirectoryScreen from '../screens/ActivityDirectoryScreen'
// import PassportScreen from '../screens/PassportScreen'
import ReportWildlifeScreen from '../screens/ReportWildlifeScreen'

import ActivityDetailScreen from '../screens/ActivityDetailScreen'

const Stack =
    createNativeStackNavigator()

// manages navigation between discovery categories and their detailed content
export default function ExploreStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                // each explore screen manages its own visual header
                headerShown: false,

                // keeps the explore navigation visually consistent with the rest of the app
                animation:
                    'slide_from_right',
            }}
        >
            <Stack.Screen
                name="ExploreHome"
                component={
                    ExploreScreen
                }
            />

            <Stack.Screen
                name="ParkDirectory"
                component={
                    ParkDirectoryScreen
                }
            />

            <Stack.Screen
                name="ParkDetail"
                component={
                    ParkDetailScreen
                }
            />

            <Stack.Screen
                name="TrailDirectory"
                component={
                    TrailDirectoryScreen
                }
            />

            <Stack.Screen
                name="TrailDetail"
                component={
                    TrailDetailScreen
                }
            />

            <Stack.Screen
                name="CampgroundDirectory"
                component={
                    CampgroundDirectoryScreen
                }
            />

            <Stack.Screen
                name="CampgroundDetail"
                component={
                    CampgroundDetailScreen
                }
            />

            <Stack.Screen
                name="ExploreSearch"
                component={
                    ExploreSearchScreen
                }
            />

            {/* <Stack.Screen
                name="Passport"
                component={
                    PassportScreen
                }
            /> */}

            <Stack.Screen
                name="ActivityDirectory"
                component={
                    ActivityDirectoryScreen
                }
            />

            <Stack.Screen
                name="ActivityDetail"
                component={
                    ActivityDetailScreen
                }
            />

            <Stack.Screen
                name="ReportWildlife"
                component={
                    ReportWildlifeScreen
                }
            />
        </Stack.Navigator>
    )
}