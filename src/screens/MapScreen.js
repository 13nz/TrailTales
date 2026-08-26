import {
    View,
    Text,
    Pressable,
    StyleSheet,
    TextInput,
    Keyboard
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import {
    useEffect,
    useRef,
    useState,
    useCallback
} from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Location from 'expo-location'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from '../services/supabase'

import theme from '../constants/theme'

import {
    getAllParks,
    getTrailsByPark,
    getCampgrounds,
} from '../api/npsApi'

// provides the main geographic discovery experience for parks and other outdoor locations
export default function MapScreen({ navigation }) {
    const insets = useSafeAreaInsets()

    const mapRef = useRef(null)

    const [selectedLocation, setSelectedLocation] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [mapType, setMapType] = useState('standard')
    const [activeFilter, setActiveFilter] = useState('Parks')
    const [parks, setParks] = useState([])
    const [trails, setTrails] = useState([])
    const [campgrounds, setCampgrounds] = useState([])
    const [loadedFilters, setLoadedFilters] = useState({})
    const [useLocation, setUseLocation] = useState(true)

    // loads the user's location preference whenever the map becomes active
    useFocusEffect(
        useCallback(() => {
            let active = true

            async function loadLocationPreference() {
                try {
                    const { data: userData, error: userError } =
                        await supabase.auth.getUser()

                    if (userError) {
                        throw userError
                    }

                    const user = userData.user

                    if (!user || user.is_anonymous) {
                        if (active) {
                            setUseLocation(true)
                        }

                        return
                    }

                    const { data: preferences, error: preferencesError } =
                        await supabase
                            .from('user_preferences')
                            .select('use_location')
                            .eq('user_id', user.id)
                            .maybeSingle()

                    if (preferencesError) {
                        throw preferencesError
                    }

                    if (active) {
                        setUseLocation(
                            preferences?.use_location ?? true
                        )
                    }
                } catch (error) {
                    console.error(
                        'supabase map location preference error:',
                        error
                    )
                }
            }

            loadLocationPreference()

            return () => {
                active = false
            }
        }, [])
    )

    // loads the national parks when the map screen first opens
    useEffect(() => {
        let active = true

        async function loadParks() {
            try {
                const parkData =
                    await getAllParks()

                if (active) {
                    setParks(
                        parkData || []
                    )

                    setLoadedFilters(
                        (current) => ({
                            ...current,
                            Parks: true,
                        })
                    )
                }
            } catch (error) {
                console.error(
                    'NPS map parks error:',
                    error
                )
            }
        }

        loadParks()

        return () => {
            active = false
        }
    }, [])

    // loads the selected map category only when the user needs it
    useEffect(() => {
        let active = true

        async function loadSelectedCategory() {
            if (
                loadedFilters[
                    activeFilter
                ]
            ) {
                return
            }

            try {
                if (
                    activeFilter ===
                    'Trails'
                ) {
                    const parkData =
                        parks.length > 0
                            ? parks
                            : await getAllParks()

                    const trailResults =
                        await Promise.all(
                            parkData.map(
                                async (
                                    park
                                ) => {
                                    try {
                                        const parkTrails =
                                            await getTrailsByPark(
                                                park.id
                                            )

                                        return (
                                            parkTrails ||
                                            []
                                        ).map(
                                            (
                                                trail
                                            ) => ({
                                                ...trail,
                                                parkId:
                                                    park.id,
                                                parkName:
                                                    park.name,
                                            })
                                        )
                                    } catch (
                                        parkError
                                    ) {
                                        console.error(
                                            `NPS map trail error for ${park.name}:`,
                                            parkError
                                        )

                                        return []
                                    }
                                }
                            )
                        )

                    if (!active) {
                        return
                    }

                    setTrails(
                        trailResults.flat()
                    )

                    setParks(
                        parkData
                    )

                    setLoadedFilters(
                        (current) => ({
                            ...current,
                            Trails: true,
                        })
                    )
                }

                if (
                    activeFilter ===
                    'Campgrounds'
                ) {
                    const campgroundData =
                        await getCampgrounds()

                    if (!active) {
                        return
                    }

                    setCampgrounds(
                        campgroundData || []
                    )

                    setLoadedFilters(
                        (current) => ({
                            ...current,
                            Campgrounds: true,
                        })
                    )
                }
            } catch (error) {
                console.error(
                    `NPS map ${activeFilter.toLowerCase()} error:`,
                    error
                )
            }
        }

        loadSelectedCategory()

        return () => {
            active = false
        }
    }, [
        activeFilter,
        loadedFilters,
        parks,
    ])

    // converts the api records into the marker structure used by the map
    const visibleLocations =
        activeFilter === 'Parks'
            ? parks
                  .filter(
                      (park) =>
                          park.coordinates
                              ?.latitude !==
                              null &&
                          park.coordinates
                              ?.longitude !==
                              null
                  )
                  .map(
                      (park) => ({
                          id: park.id,
                          name: park.name,
                          type: 'park',
                          latitude:
                              park.coordinates
                                  .latitude,
                          longitude:
                              park.coordinates
                                  .longitude,
                          subtitle:
                              park.states.join(
                                  ' · '
                              ),
                          description:
                              park.description,
                          park,
                      })
                  )
            : activeFilter ===
              'Trails'
              ? trails
                    .filter(
                        (trail) =>
                            trail.latitude !==
                                null &&
                            trail.longitude !==
                                null
                    )
                    .map(
                        (trail) => ({
                            id: trail.id,
                            name: trail.name,
                            type: 'trail',
                            parkId:
                                trail.parkId,
                            trailId:
                                trail.id,
                            latitude:
                                trail.latitude,
                            longitude:
                                trail.longitude,
                            subtitle:
                                [
                                    trail.distance,
                                    trail.difficulty,
                                ]
                                    .filter(
                                        Boolean
                                    )
                                    .join(
                                        ' · '
                                    ),
                            description:
                                trail.description,
                            trail,
                        })
                    )
              : campgrounds
                    .filter(
                        (campground) =>
                            campground.latitude !==
                                null &&
                            campground.longitude !==
                                null
                    )
                    .map(
                        (
                            campground
                        ) => ({
                            id:
                                campground.id,
                            name:
                                campground.name,
                            type: 'campground',
                            parkId:
                                campground.parkCode,
                            campgroundId:
                                campground.id,
                            latitude:
                                campground.latitude,
                            longitude:
                                campground.longitude,
                            subtitle:
                                campground.totalSites
                                    ? `${campground.totalSites} sites`
                                    : 'Campground',
                            description:
                                campground.description,
                            campground,
                        })
                    )

    const uniqueLocations = Array.from(
        new Map(
            visibleLocations.map((location) => [
                `${location.type}-${location.id}`,
                location,
            ])
        ).values()
    )

    // filters the currently loaded locations by name
    const filteredLocations = uniqueLocations.filter(
        (location) =>
            location.name
                ?.toLowerCase()
                .includes(
                    searchQuery.trim().toLowerCase()
                )
    )

    const handleMarkerPress = (location) => {
        Keyboard.dismiss()
        setSelectedLocation(location)
    }

   const handleMapPress = () => {
        // dismisses the keyboard when the user taps outside the search field
        Keyboard.dismiss()

        // closes the selected location preview when the user taps elsewhere on the map
        setSelectedLocation(
            null
        )
    }   

    

    const handleViewLocation = () => {
        if (!selectedLocation) {
            return
        }

        // opens the park detail screen inside the map stack
        if (
            selectedLocation.type ===
            'park'
        ) {
            navigation.navigate(
                'MapParkDetail',
                {
                    parkId:
                        selectedLocation
                            .park.id,
                }
            )

            return
        }

        // switches to the explore tab and opens the trail detail screen
        if (
            selectedLocation.type ===
            'trail'
        ) {
            navigation
                .getParent()
                ?.navigate(
                    'Explore',
                    {
                        screen:
                            'TrailDetail',
                        params: {
                            parkId:
                                selectedLocation
                                    .parkId,
                            trailId:
                                selectedLocation
                                    .trailId,
                        },
                    }
                )

            return
        }

        // switches to the explore tab and opens the campground detail screen
        if (
            selectedLocation.type ===
            'campground'
        ) {
            navigation
                .getParent()
                ?.navigate(
                    'Explore',
                    {
                        screen:
                            'CampgroundDetail',
                        params: {
                            parkId:
                                selectedLocation
                                    .parkId,
                            campgroundId:
                                selectedLocation
                                    .campgroundId,
                        },
                    }
                )

            return
        }
    }

    const handleShowUserLocation =
        async () => {
            try {
                // requests location permission only when the user asks to see their location
                const {
                    status,
                } =
                    await Location.requestForegroundPermissionsAsync()

                if (
                    status !==
                    'granted'
                ) {
                    return
                }

                // gets the user's current position so the map can center on it
                const location =
                    await Location.getCurrentPositionAsync(
                        {
                            accuracy:
                                Location.Accuracy.Balanced,
                        }
                    )

                const {
                    latitude,
                    longitude,
                } =
                    location.coords

                // centers the map on the user's current location without changing the selected filter
                mapRef.current?.animateToRegion(
                    {
                        latitude,
                        longitude,
                        latitudeDelta:
                            0.08,
                        longitudeDelta:
                            0.08,
                    },
                    500
                )
            } catch (error) {
                // prevents a location failure from breaking the map experience
                console.log(
                    'unable to get user location',
                    error
                )
            }
        }

    return (
        <View
            style={
                styles.screen
            }
        >
            <MapView
                ref={mapRef}
                style={styles.map}
                mapType={mapType}
                initialRegion={{
                    latitude: 39.8283,
                    longitude: -98.5795,
                    latitudeDelta: 35,
                    longitudeDelta: 45,
                }}
                showsUserLocation={useLocation}
                showsMyLocationButton={false}
                showsCompass
                
            >
                {/* renders only the locations belonging to the currently selected map category */}
                {filteredLocations.map(
                    (
                        location
                    ) => (
                        <Marker
                            key={`${location.type}-${location.id}`}
                            coordinate={{
                                latitude:
                                    Number(
                                        location.latitude
                                    ),
                                longitude:
                                    Number(
                                        location.longitude
                                    ),
                            }}
                            title={
                                location.name
                            }
                            description={
                                location.subtitle
                            }
                            onPress={() =>
                                handleMarkerPress(
                                    location
                                )
                            }
                        >
                            <View
                                style={[
                                    styles.marker,
                                    location.type !==
                                        'park' &&
                                        styles.secondaryMarker,
                                ]}
                            >
                                <Text
                                    style={
                                        styles.markerIcon
                                    }
                                >
                                    {location.type ===
                                    'park'
                                        ? '🌲'
                                        : location.type ===
                                          'trail'
                                            ? '🥾'
                                            : '🏕️'}
                                </Text>
                            </View>
                        </Marker>
                    )
                )}
            </MapView>

            {/* keeps the map controls above the map without obscuring the entire screen */}
            <View
                style={[
                    styles.topControls,
                    {
                        top:
                            insets.top +
                            theme.spacing.sm,
                    },
                ]}
            >
                <View
                    style={
                        styles.searchButton
                    }
                >
                    <Text
                        style={
                            styles.searchIcon
                        }
                    >
                        ⌕
                    </Text>

                    <TextInput
                        style={
                            styles.searchInput
                        }
                        value={
                            searchQuery
                        }
                        onChangeText={
                            setSearchQuery
                        }
                        placeholder="Search parks, trails..."
                        placeholderTextColor={
                            theme.colors.earth
                        }
                        autoCapitalize="none"
                        autoCorrect={
                            false
                        }
                        returnKeyType="search"
                    />

                    {searchQuery.length >
                    0 ? (
                        <Pressable
                            style={
                                styles.searchClearButton
                            }
                            onPress={() => {
                                Keyboard.dismiss()
                                setSearchQuery('')
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="clear map search"
                            hitSlop={8}
                        >
                            <Text
                                style={
                                    styles.searchClearText
                                }
                            >
                                ×
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                <Pressable
                    style={
                        styles.controlButton
                    }
                    onPress={() => {
                        Keyboard.dismiss()
                        // switches between the standard and satellite map styles
                        setMapType(
                            (
                                currentType
                            ) =>
                                currentType ===
                                'standard'
                                    ? 'satellite'
                                    : 'standard'
                        )
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="change map type"
                >
                    <Text
                        style={
                            styles.controlIcon
                        }
                    >
                        ◈
                    </Text>
                </Pressable>
            </View>

            <View
                style={[
                    styles.filterRow,
                    {
                        top:
                            insets.top +
                            70,
                    },
                ]}
            >
                {[
                    'Parks',
                    'Trails',
                    'Campgrounds',
                ].map(
                    (
                        filter
                    ) => (
                        <MapFilter
                            key={
                                filter
                            }
                            label={
                                filter
                            }
                            active={
                                activeFilter ===
                                filter
                            }
                            onPress={() => {
                                Keyboard.dismiss()
                                // changes the visible map category without leaving the map screen
                                setActiveFilter(
                                    filter
                                )
                                setSelectedLocation(
                                    null
                                )
                                setSearchQuery(
                                    ''
                                )
                            }}
                        />
                    )
                )}
            </View>

            {/* displays contextual information after a user selects any map marker */}
            {selectedLocation ? (
                <View
                    style={
                        styles.selectedCard
                    }
                >
                    <Pressable
                        style={
                            styles.selectedCloseButton
                        }
                        onPress={() =>
                            setSelectedLocation(
                                null
                            )
                        }
                        accessibilityRole="button"
                        accessibilityLabel="close location preview"
                        hitSlop={8}
                    >
                        <Text
                            style={
                                styles.selectedCloseButtonText
                            }
                        >
                            ×
                        </Text>
                    </Pressable>

                    <View
                        style={[
                            styles.selectedImage,
                            selectedLocation.type !==
                                'park' &&
                                styles.secondarySelectedImage,
                        ]}
                    >
                        <Text
                            style={
                                styles.selectedIcon
                            }
                        >
                            {selectedLocation.type ===
                            'park'
                                ? '🌲'
                                : selectedLocation.type ===
                                'trail'
                                    ? '🥾'
                                    : '🏕️'}
                        </Text>
                    </View>

                    <View
                        style={
                            styles.selectedContent
                        }
                    >
                        <Text
                            style={
                                styles.selectedEyebrow
                            }
                        >
                            {selectedLocation.type ===
                            'park'
                                ? 'NATIONAL PARK'
                                : selectedLocation.type ===
                                'trail'
                                    ? 'TRAIL'
                                    : 'CAMPGROUND'}
                        </Text>

                        <Text
                            style={
                                styles.selectedTitle
                            }
                        >
                            {
                                selectedLocation.name
                            }
                        </Text>

                        <Text
                            style={
                                styles.selectedLocation
                            }
                        >
                            {
                                selectedLocation.subtitle
                            }
                        </Text>

                        <Text
                            style={
                                styles.selectedDescription
                            }
                            numberOfLines={
                                2
                            }
                        >
                            {
                                selectedLocation.description
                            }
                        </Text>

                        <View
                            style={
                                styles.selectedActions
                            }
                        >
                            <Pressable
                                style={
                                    styles.viewButton
                                }
                                onPress={
                                    handleViewLocation
                                }
                                accessibilityRole="button"
                            >
                                <Text
                                    style={
                                        styles.viewButtonText
                                    }
                                >
                                    {selectedLocation.type ===
                                    'park'
                                        ? 'View park'
                                        : selectedLocation.type ===
                                        'trail'
                                            ? 'View trail'
                                            : 'View campground'}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={
                                    styles.closeButton
                                }
                                onPress={() => {
                                    Keyboard.dismiss()
                                    setSelectedLocation(
                                        null
                                    )
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="close location preview"
                                hitSlop={8}
                            >
                                <Text
                                    style={
                                        styles.closeButtonText
                                    }
                                >
                                    ×
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            ) : null}

            {/* provides a quick way to center the map on the user's current location, if location allowed */}
            {useLocation ? (
                <Pressable
                    style={
                        styles.locationButton
                    }
                    onPress={async () => {
                        Keyboard.dismiss()
                        await handleShowUserLocation()
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="show my location"
                >
                    <Text
                        style={
                            styles.locationIcon
                        }
                    >
                        ◎
                    </Text>
                </Pressable>
            ) : null}
        </View>
    )
}

function MapFilter({
    label,
    active = false,
    onPress,
}) {
    return (
        <Pressable
            style={[
                styles.filter,
                active &&
                    styles.activeFilter,
            ]}
            onPress={
                onPress
            }
            accessibilityRole="button"
            accessibilityLabel={`filter map by ${label}`}
        >
            <Text
                style={[
                    styles.filterText,
                    active &&
                        styles.activeFilterText,
                ]}
            >
                {label}
            </Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.parchment,
    },

    map: {
        flex: 1,
    },

    topControls: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        left: theme.spacing.lg,
        position: 'absolute',
        right: theme.spacing.lg,
    },

    searchButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.parchment,
        borderRadius: theme.radii.md,
        flex: 1,
        flexDirection: 'row',
        minHeight: 50,
        paddingHorizontal: theme.spacing.md,
        ...theme.shadows.card,
    },

    searchIcon: {
        color: theme.colors.forest,
        fontSize: 24,
        marginRight: theme.spacing.sm,
    },

    searchInput: {
        color: theme.colors.ink,
        flex: 1,
        fontSize: theme.typography.bodySmall.fontSize,
        paddingVertical: 0,
    },

    searchClearButton: {
        alignItems: 'center',
        height: 32,
        justifyContent: 'center',
        width: 32,
    },

    searchClearText: {
        color: theme.colors.earth,
        fontSize: 24,
    },

    controlButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.parchment,
        borderRadius: theme.radii.md,
        height: 50,
        justifyContent: 'center',
        width: 50,
        ...theme.shadows.card,
    },

    controlIcon: {
        color: theme.colors.forest,
        fontSize: 22,
    },

    filterRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        left: theme.spacing.lg,
        position: 'absolute',
        right: theme.spacing.lg,
    },

    filter: {
        backgroundColor: theme.colors.parchment,
        borderRadius: 20,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        ...theme.shadows.card,
    },

    activeFilter: {
        backgroundColor: theme.colors.forest,
    },

    filterText: {
        color: theme.colors.earth,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: '600',
    },

    activeFilterText: {
        color: theme.colors.parchment,
    },

    marker: {
        alignItems: 'center',
        backgroundColor: theme.colors.forest,
        borderColor: theme.colors.parchment,
        borderRadius: 20,
        borderWidth: 3,
        height: 40,
        justifyContent: 'center',
        width: 40,
    },

    secondaryMarker: {
        backgroundColor: theme.colors.earth,
    },

    markerIcon: {
        fontSize: 18,
    },

    selectedCard: {
        backgroundColor: theme.colors.parchment,
        borderRadius: theme.radii.lg,
        bottom: 90,
        flexDirection: 'row',
        left: theme.spacing.lg,
        overflow: 'hidden',
        position: 'absolute',
        right: theme.spacing.lg,
        ...theme.shadows.card,
    },

    selectedCloseButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.parchment,
        borderRadius: 16,
        height: 32,
        justifyContent: 'center',
        position: 'absolute',
        right: theme.spacing.xs,
        top: theme.spacing.xs,
        width: 32,
        zIndex: 2,
    },

    selectedCloseButtonText: {
        color: theme.colors.earth,
        fontSize: 24,
        lineHeight: 26,
    },

    selectedImage: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        justifyContent: 'center',
        width: 105,
    },

    secondarySelectedImage: {
        backgroundColor: theme.colors.canvas,
    },

    selectedIcon: {
        fontSize: 32,
    },

    selectedContent: {
        flex: 1,
        padding: theme.spacing.md,
        paddingRight: theme.spacing.lg,
    },

    selectedEyebrow: {
        color: theme.colors.forest,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: '700',
        letterSpacing: 1,
    },

    selectedTitle: {
        color: theme.colors.ink,
        fontSize: theme.typography.body.fontSize,
        fontWeight: '700',
        marginTop: theme.spacing.xs,
    },

    selectedLocation: {
        color: theme.colors.earth,
        fontSize: theme.typography.caption.fontSize,
        marginTop: 2,
    },

    selectedDescription: {
        color: theme.colors.bark,
        fontSize: theme.typography.caption.fontSize,
        lineHeight: theme.typography.caption.lineHeight,
        marginTop: theme.spacing.xs,
    },

    selectedActions: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.sm,
    },

    viewButton: {
        backgroundColor: theme.colors.forest,
        borderRadius: theme.radii.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
    },

    viewButtonText: {
        color: theme.colors.parchment,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: '700',
    },

    locationButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.parchment,
        borderRadius: 25,
        bottom: 105,
        height: 50,
        justifyContent: 'center',
        position: 'absolute',
        right: theme.spacing.lg,
        width: 50,
        ...theme.shadows.card,
    },

    locationIcon: {
        color: theme.colors.forest,
        fontSize: 28,
    },
})