import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
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
import ProfileScreen from '../screens/ProfileScreen'
import SettingsScreen from '../screens/SettingsScreen'
import AuthScreen from '../screens/AuthScreen'
import EditProfileScreen from '../screens/EditProfileScreen'

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
                const focusedLoreRoute = route.name === 'Lore' ? getFocusedRouteNameFromRoute(route) : null

                // campfire screens use the nighttime navigation appearance
                const isCampfireMode = route.name === 'Lore' && (focusedLoreRoute === 'CampfireSelection' || focusedLoreRoute === 'CampfireStory')

                return {
                    headerShown: false,

                    tabBarActiveTintColor: isCampfireMode ? '#E7B76B' : theme.colors.forest,
                    tabBarInactiveTintColor: isCampfireMode ? '#8B8176' : theme.colors.earth,

                    tabBarStyle: {
                        backgroundColor: isCampfireMode ? '#11100E' : theme.colors.parchment,
                        borderTopWidth: 0,
                    },

                    tabBarItemStyle: {
                        height: 48,
                    },

                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '600',
                    },

                    // provides the icon for each primary navigation tab
                    tabBarIcon: ({ color, focused, size }) => {
                        let iconName

                        if (route.name === 'Explore') {
                            iconName = focused ? 'compass' : 'compass-outline'
                        } else if (route.name === 'Map') {
                            iconName = focused ? 'map' : 'map-outline'
                        } else if (route.name === 'Trips') {
                            iconName = focused ? 'trail-sign' : 'trail-sign-outline'
                        } else if (route.name === 'Journal') {
                            iconName = focused ? 'book' : 'book-outline'
                        } else if (route.name === 'Lore') {
                            iconName = focused ? 'bonfire' : 'bonfire-outline'
                        } else {
                            iconName = focused ? 'person' : 'person-outline'
                        }

                        return <Ionicons name={iconName} size={size} color={color} />
                    },
                }
            }}
        >
            {/* provides access to parks, trails, campgrounds, and activities */}
            <Tab.Screen name="Explore" component={ExploreStack} />

            {/* provides the geographic discovery experience */}
            <Tab.Screen name="Map" component={MapStack} />

            {/* provides trip planning and saved adventures */}
            <Tab.Screen
                name="Trips"
                component={TripsStack}
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        navigation.navigate('Trips', { screen: 'TripsHome' })
                    },
                })}
            />

            {/* provides the user's journal */}
            <Tab.Screen name="Journal" component={JournalStack} />

            {/* provides folklore, cryptids, and campfire stories */}
            <Tab.Screen name="Lore" component={LoreStack} />

            {/* provides the user's profile and account controls */}
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    )
}

// manages authentication before allowing access to the main application
export default function AppNavigator() {
    const [authReady, setAuthReady] = useState(false)
    const [session, setSession] = useState(null)

    useEffect(() => {
        // checks for an existing supabase session when the application starts
        const initializeAuth = async () => {
            try {
                const { data, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('supabase session error:', error)
                }

                setSession(data.session || null)
            } catch (error) {
                console.error('supabase authentication initialization error:', error)
            } finally {
                setAuthReady(true)
            }
        }

        initializeAuth()

        // keeps navigation synchronized with supabase authentication changes
        const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
            console.log('supabase auth event:', event, 'has session:', Boolean(nextSession))

            setSession(nextSession || null)
        })

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [])

    // waits until the initial session check is complete
    if (!authReady) {
        return null
    }

    return (
        <RootStack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            {session ? (
                <>
                    {/* contains the main application tabs */}
                    <RootStack.Screen name="Main" component={MainTabs} />

                    {/* provides the trip creation workflow */}
                    <RootStack.Screen name="CreateTrip" component={CreateTripScreen} />

                    {/* provides the trail selection workflow */}
                    <RootStack.Screen name="AddTrail" component={AddTrailScreen} />

                    {/* provides the campground selection workflow */}
                    <RootStack.Screen name="AddCampsite" component={AddCampsiteScreen} />

                    {/* provides account and application settings */}
                    <RootStack.Screen name="Settings" component={SettingsScreen} />

                    {/* provides profile editing functionality */}
                    <RootStack.Screen name="EditProfile" component={EditProfileScreen} />
                </>
            ) : (
                // requires authentication or guest mode before entering the application
                <RootStack.Screen name="Auth" component={AuthScreen} />
            )}
        </RootStack.Navigator>
    )
}