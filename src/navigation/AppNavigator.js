import {
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'

import {
    createNativeStackNavigator,
} from '@react-navigation/native-stack'

import {
    getFocusedRouteNameFromRoute,
} from '@react-navigation/native'

import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'

import ExploreStack from './ExploreStack'
import MapStack from './MapStack'
import TripsStack from './TripsStack'
import JournalStack from './JournalStack'
import LoreStack from './LoreStack'

import CreateTripScreen from '../screens/CreateTripScreen'
import AddTrailScreen from '../screens/AddTrailScreen'
import AddCampsiteScreen from '../screens/AddCampsiteScreen'
import AuthScreen from '../screens/AuthScreen'

import { supabase } from '../services/supabase'

import theme from '../constants/theme'

const Tab = createBottomTabNavigator()

const RootStack = createNativeStackNavigator()

// contains the application's primary bottom-tab navigation
function MainTabs() {
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
                    // screens provide their own headers
                    headerShown: false,

                    // campfire mode uses the nighttime navigation colors
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
                        // keeps each navigation item compact
                        height: 48,
                    },

                    tabBarLabelStyle: {
                        // keeps navigation labels small and balanced
                        fontSize: 11,
                        fontWeight: '600',
                    },

                    // maps each top-level screen to an icon
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
            {/* explore uses its own stack for parks, trails, campgrounds, and activities */}
            <Tab.Screen
                name="Explore"
                component={
                    ExploreStack
                }
            />

            {/* map uses its own stack for geographic content */}
            <Tab.Screen
                name="Map"
                component={
                    MapStack
                }
            />

            {/* trips uses its own stack for trip management */}
            <Tab.Screen
                name="Trips"
                component={
                    TripsStack
                }
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        navigation.navigate(
                            'Trips',
                            {
                                screen:
                                    'TripsHome',
                            }
                        )
                    },
                })}
            />

            {/* journal contains private and public memories */}
            <Tab.Screen
                name="Journal"
                component={
                    JournalStack
                }
            />

            {/* lore contains folklore and campfire stories */}
            <Tab.Screen
                name="Lore"
                component={
                    LoreStack
                }
            />
        </Tab.Navigator>
    )
}

// manages authentication before allowing access to the main application
export default function AppNavigator() {
    const [authReady, setAuthReady] =
        useState(false)

    const [session, setSession] =
        useState(null)

    useEffect(() => {
        // checks whether supabase already has an authenticated session
        const initializeAuth =
            async () => {
                try {
                    const {
                        data,
                        error,
                    } =
                        await supabase.auth.getSession()

                        //await supabase.auth.signOut()

                    if (error) {
                        console.error(
                            'supabase session error:',
                            error
                        )
                    }

                    setSession(
                        data.session ||
                            null
                    )
                } catch (error) {
                    console.error(
                        'supabase authentication initialization error:',
                        error
                    )
                } finally {
                    setAuthReady(true)
                }
            }

        initializeAuth()

        // updates the application whenever the user signs in, signs up, or signs out
        const {
            data:
                authListener,
        } =
            supabase.auth.onAuthStateChange(
                (
                    event,
                    nextSession
                ) => {
                    console.log(
                        'supabase auth event:',
                        event,
                        'has session:',
                        Boolean(
                            nextSession
                        )
                    )

                    setSession(
                        nextSession ||
                            null
                    )
                }
            )

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [])

    // waits until the initial supabase session check is complete
    if (!authReady) {
        return null
    }

    return (
        <RootStack.Navigator
            screenOptions={{
                // workflow screens provide their own headers
                headerShown: false,

                // keeps workflow transitions consistent
                animation:
                    'slide_from_right',
            }}
        >
            {session ? (
                <>
                    {/* contains the normal bottom-tab application */}
                    <RootStack.Screen
                        name="Main"
                        component={
                            MainTabs
                        }
                    />

                    {/* these routes are intentionally at the root level
                        so detail pages can open them without inheriting
                        the TripsStack navigation history */}

                    <RootStack.Screen
                        name="CreateTrip"
                        component={
                            CreateTripScreen
                        }
                    />

                    <RootStack.Screen
                        name="AddTrail"
                        component={
                            AddTrailScreen
                        }
                    />

                    <RootStack.Screen
                        name="AddCampsite"
                        component={
                            AddCampsiteScreen
                        }
                    />
                </>
            ) : (
                // shows authentication before the user enters the application
                <RootStack.Screen
                    name="Auth"
                    component={
                        AuthScreen
                    }
                />
            )}
        </RootStack.Navigator>
    )
}