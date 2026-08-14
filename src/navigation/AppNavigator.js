import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import ExploreScreen from '../screens/ExploreScreen'
import MapStack from './MapStack'
import TripsStack from './TripsStack'
import JournalScreen from '../screens/JournalScreen'
import LoreScreen from '../screens/LoreScreen'

import theme from '../constants/theme'

const Tab = createBottomTabNavigator()

export default function AppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                // the application uses custom screen content instead of default navigation headers
                headerShown: false,

                // keeps navigation colors consistent with the trail tales theme
                tabBarActiveTintColor: theme.colors.forest,
                tabBarInactiveTintColor: theme.colors.earth,

                tabBarStyle: {
                    backgroundColor: theme.colors.parchment,

                    // removes the divider so the navigation blends into the application background
                    borderTopWidth: 0,
                },

                tabBarItemStyle: {
                    // keeps each navigation item compact without changing device safe-area behavior
                    height: 48,
                },

                tabBarLabelStyle: {
                    // keeps navigation labels small and balanced with the compact tab bar
                    fontSize: 11,
                    fontWeight: '600',
                },

                // maps each top-level screen to an icon that communicates its purpose
                tabBarIcon: ({ color, focused, size }) => {
                    let iconName

                    if (route.name === 'Explore') {
                        iconName = focused
                            ? 'compass'
                            : 'compass-outline'
                    } else if (route.name === 'Map') {
                        iconName = focused
                            ? 'map'
                            : 'map-outline'
                    } else if (route.name === 'Trips') {
                        iconName = focused
                            ? 'trail-sign'
                            : 'trail-sign-outline'
                    } else if (route.name === 'Journal') {
                        iconName = focused
                            ? 'book'
                            : 'book-outline'
                    } else {
                        iconName = focused
                            ? 'bonfire'
                            : 'bonfire-outline'
                    }

                    return (
                        <Ionicons
                            name={iconName}
                            size={size}
                            color={color}
                        />
                    )
                },
            })}
        >
            {/* explore is the main discovery area for parks, trails, activities, and campgrounds */}
            <Tab.Screen
                name="Explore"
                component={ExploreScreen}
            />

            {/* map uses its own stack so users can navigate from geographic markers into detailed locations */}
            <Tab.Screen
                name="Map"
                component={MapStack}
            />

            {/* trips uses its own stack for creating and managing adventures */}
            <Tab.Screen
                name="Trips"
                component={TripsStack}
            />

            {/* journal contains private and public memories, photos, and wildlife reports */}
            <Tab.Screen
                name="Journal"
                component={JournalScreen}
            />

            {/* lore contains the curated folklore and campfire storytelling experience */}
            <Tab.Screen
                name="Lore"
                component={LoreScreen}
            />
        </Tab.Navigator>
    )
}