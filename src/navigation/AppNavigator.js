import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

import ExploreStack from './ExploreStack'
import MapStack from './MapStack'
import TripsStack from './TripsStack'
import JournalStack from './JournalStack'
import LoreStack from './LoreStack'

import theme from '../constants/theme'

const Tab = createBottomTabNavigator()

export default function AppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                // checks which screen is currently active inside the lore stack
                const focusedLoreRoute =
                    route.name === 'Lore'
                        ? getFocusedRouteNameFromRoute(
                              route
                          )
                        : null

                // both campfire screens use the nighttime navigation appearance
                const isCampfireMode =
                    route.name === 'Lore' &&
                    (
                        focusedLoreRoute ===
                            'CampfireSelection' ||
                        focusedLoreRoute ===
                            'CampfireStory'
                    )

                return {
                    // the application uses custom screen content instead of default navigation headers
                    headerShown: false,

                    // campfire mode uses a separate nighttime color palette without changing the rest of the app
                    tabBarActiveTintColor:
                        isCampfireMode
                            ? '#E7B76B'
                            : theme.colors.forest,

                    tabBarInactiveTintColor:
                        isCampfireMode
                            ? '#8B8176'
                            : theme.colors.earth,

                    tabBarStyle: {
                        backgroundColor:
                            isCampfireMode
                                ? '#11100E'
                                : theme.colors.parchment,

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
                    tabBarIcon: ({
                        color,
                        focused,
                        size,
                    }) => {
                        let iconName

                        if (
                            route.name ===
                            'Explore'
                        ) {
                            iconName =
                                focused
                                    ? 'compass'
                                    : 'compass-outline'
                        } else if (
                            route.name ===
                            'Map'
                        ) {
                            iconName =
                                focused
                                    ? 'map'
                                    : 'map-outline'
                        } else if (
                            route.name ===
                            'Trips'
                        ) {
                            iconName =
                                focused
                                    ? 'trail-sign'
                                    : 'trail-sign-outline'
                        } else if (
                            route.name ===
                            'Journal'
                        ) {
                            iconName =
                                focused
                                    ? 'book'
                                    : 'book-outline'
                        } else {
                            iconName =
                                focused
                                    ? 'bonfire'
                                    : 'bonfire-outline'
                        }

                        return (
                            <Ionicons
                                name={
                                    iconName
                                }
                                size={
                                    size
                                }
                                color={
                                    color
                                }
                            />
                        )
                    },
                }
            }}
        >
            {/* explore uses its own stack so the landing page can navigate to parks, trails, and campgrounds */}
            <Tab.Screen
                name="Explore"
                component={
                    ExploreStack
                }
            />

            {/* map uses its own stack so users can navigate from geographic markers into detailed locations */}
            <Tab.Screen
                name="Map"
                component={
                    MapStack
                }
            />

            {/* trips uses its own stack for creating and managing adventures */}
            <Tab.Screen
                name="Trips"
                component={
                    TripsStack
                }
            />

            {/* journal contains private and public memories, photos, and wildlife reports */}
            <Tab.Screen
                name="Journal"
                component={
                    JournalStack
                }
            />

            {/* lore contains the curated folklore and campfire storytelling experience */}
            <Tab.Screen
                name="Lore"
                component={
                    LoreStack
                }
            />
        </Tab.Navigator>
    )
}