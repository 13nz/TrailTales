import { createNativeStackNavigator } from '@react-navigation/native-stack'

import TripsScreen from '../screens/TripsScreen'
import CreateTripScreen from '../screens/CreateTripScreen'
import TripDetailScreen from '../screens/TripDetailScreen'
import AddTrailScreen from '../screens/AddTrailScreen'
import AddCampsiteScreen from '../screens/AddCampsiteScreen'
import TrailDetailScreen from '../screens/TrailDetailScreen'
import CampgroundDetailScreen from '../screens/CampgroundDetailScreen'
import AddActivityScreen from '../screens/AddActivityScreen'
import EditTripScreen from '../screens/EditTripScreen'
import EditItineraryItemScreen from '../screens/EditItineraryItemScreen'

const Stack = createNativeStackNavigator()

// manages navigation between the trip list and individual trip planning screens
export default function TripsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                // screens provide their own custom headers to match the trail tales visual style
                headerShown: false,

                // keeps navigation animations consistent across trip screens
                animation: 'slide_from_right',
            }}
        >
            {/* displays the user's upcoming and past adventures */}
            <Stack.Screen
                name="TripsHome"
                component={TripsScreen}
            />

            {/* provides the form used to create a new adventure */}
            <Stack.Screen
                name="CreateTrip"
                component={CreateTripScreen}
            />

            {/* displays the complete planning workspace for an adventure */}
            <Stack.Screen
                name="TripDetail"
                component={TripDetailScreen}
            />

            {/* provides trail search and selection */}
            <Stack.Screen
                name="AddTrail"
                component={AddTrailScreen}
            />

            {/* provides campground search and selection */}
            <Stack.Screen
                name="AddCampsite"
                component={AddCampsiteScreen}
            />

            {/* displays the existing trail detail experience */}
            <Stack.Screen
                name="TrailDetail"
                component={TrailDetailScreen}
            />

            {/* displays the existing campground detail experience */}
            <Stack.Screen
                name="CampgroundDetail"
                component={CampgroundDetailScreen}
            />

            <Stack.Screen
                name="AddActivity"
                component={AddActivityScreen}
            />

            <Stack.Screen
                name="EditTrip"
                component={EditTripScreen}
            />  

            <Stack.Screen
                name="EditItineraryItem"
                component={EditItineraryItemScreen}
            />

        </Stack.Navigator>
    )
}