import {
    View,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


import theme from '../constants/theme'
import mockParks from '../data/mockParks'

// provides temporary geographic data for map categories that will later come from the nps api and supabase
const mockMapLocations = {
    Trails: [
        {
            id: 'trail-laurel-falls',
            name: 'Laurel Falls Trail',
            type: 'trail',
            parkId: 'great-smoky-mountains',
            trailId: 'laurel-falls',
            latitude: 35.6285,
            longitude: -83.5885,
            subtitle: '2.6 mi · Moderate',
            description:
                'A popular forest trail leading to a historic waterfall in the Great Smoky Mountains.',
        },
        {
            id: 'trail-fairy-falls',
            name: 'Fairy Falls Trail',
            type: 'trail',
            parkId: 'yellowstone',
            trailId: 'fairy-falls',
            latitude: 44.5297,
            longitude: -110.775,
            subtitle: '5.4 mi · Moderate',
            description:
                'A scenic Yellowstone trail leading through lodgepole pine forest to a beautiful waterfall.',
        },
        {
            id: 'trail-delicate-arch',
            name: 'Delicate Arch Trail',
            type: 'trail',
            parkId: 'arches',
            trailId: 'delicate-arch',
            latitude: 38.7359,
            longitude: -109.5209,
            subtitle: '3.2 mi · Moderate',
            description:
                'A classic desert hike leading to one of the most recognizable arches in the park.',
        },
    ],

    Campgrounds: [
        {
            id: 'camp-elkmont',
            name: 'Elkmont Campground',
            type: 'campground',
            parkId: 'great-smoky-mountains',
            campgroundId: 'elkmont',
            latitude: 35.647,
            longitude: -83.582,
            subtitle: '200 sites · Seasonal',
            description:
                'A historic campground surrounded by forest and close to several popular trails.',
        },
        {
            id: 'camp-madison',
            name: 'Madison Campground',
            type: 'campground',
            parkId: 'yellowstone',
            campgroundId: 'madison',
            latitude: 44.646,
            longitude: -110.865,
            subtitle: '278 sites · Seasonal',
            description:
                'A riverside Yellowstone campground with easy access to nearby geothermal areas and wildlife viewing.',
        },
    ],

    Wildlife: [
        {
            id: 'wildlife-bear',
            name: 'Black Bear',
            type: 'wildlife',
            latitude: 35.601,
            longitude: -83.75,
            subtitle: 'Cades Cove · 2 hours ago',
            description:
                'A black bear was reported near the trail by another Trail Tales user.',
        },
        {
            id: 'wildlife-bison',
            name: 'Bison',
            type: 'wildlife',
            latitude: 44.93,
            longitude: -110.32,
            subtitle: 'Lamar Valley · 1 hour ago',
            description:
                'A bison herd was reported near the road in Lamar Valley.',
        },
    ],
}

// provides the main geographic discovery experience for parks and other outdoor locations
export default function MapScreen({ navigation }) {
    const insets = useSafeAreaInsets()

    const [selectedLocation, setSelectedLocation] = useState(null)
    const [mapType, setMapType] = useState('standard')
    const [activeFilter, setActiveFilter] = useState('Parks')

    // determines which geographic markers should be visible based on the selected map filter
    const visibleLocations = useMemo(() => {
        if (activeFilter === 'Parks') {
            return mockParks.map((park) => ({
                id: park.id,
                name: park.name,
                type: 'park',
                latitude: park.coordinates.latitude,
                longitude: park.coordinates.longitude,
                subtitle: park.states.join(' · '),
                description: park.description,
                park,
            }))
        }

        return mockMapLocations[activeFilter] || []
    }, [activeFilter])

    const handleMarkerPress = (location) => {
        // selecting a marker shows a preview card instead of immediately leaving the map
        setSelectedLocation(location)
    }

    const handleViewLocation = () => {
        if (!selectedLocation) {
            return
        }

        // routes the selected location to its corresponding detail screen after the user chooses to view it
        if (selectedLocation.type === 'park') {
            navigation.navigate('MapParkDetail', {
                parkId: selectedLocation.park.id,
            })
        }

        if (selectedLocation.type === 'trail') {
            navigation.navigate('MapTrailDetail', {
                parkId: selectedLocation.parkId,
                trailId: selectedLocation.trailId,
            })
        }

        if (selectedLocation.type === 'campground') {
            navigation.navigate('MapCampgroundDetail', {
                parkId: selectedLocation.parkId,
                campgroundId: selectedLocation.campgroundId,
            })
        }

        setSelectedLocation(null)
    }

    return (
        <View style={styles.screen}>
            <MapView
                style={styles.map}
                mapType={mapType}
                initialRegion={{
                    latitude: 39.8283,
                    longitude: -98.5795,
                    latitudeDelta: 35,
                    longitudeDelta: 45,
                }}
                showsUserLocation={false}
                showsCompass
            >
                {/* renders only the locations belonging to the currently selected map category */}
                {visibleLocations.map((location) => (
                    <Marker
                        key={location.id}
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title={location.name}
                        description={location.subtitle}
                        onPress={() => handleMarkerPress(location)}
                    >
                        <View
                            style={[
                                styles.marker,
                                location.type !== 'park' &&
                                    styles.secondaryMarker,
                            ]}
                        >
                            <Text style={styles.markerIcon}>
                                {location.type === 'park'
                                    ? '🌲'
                                    : location.type === 'trail'
                                        ? '🥾'
                                        : location.type === 'campground'
                                            ? '🏕️'
                                            : '🐾'}
                            </Text>
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* keeps the map controls above the map without obscuring the entire screen */}
            <View style={[
                styles.topControls,
                {
                    top: insets.top + theme.spacing.sm,
                },
            ]}>
                <View style={styles.searchButton}>
                    <Text style={styles.searchIcon}>
                        ⌕
                    </Text>

                    <Text style={styles.searchPlaceholder}>
                        Search parks, trails...
                    </Text>
                </View>

                <Pressable
                    style={styles.controlButton}
                    onPress={() => {
                        // switches between the standard and satellite map styles
                        setMapType((currentType) =>
                            currentType === 'standard'
                                ? 'satellite'
                                : 'standard'
                        )
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="change map type"
                >
                    <Text style={styles.controlIcon}>
                        ◈
                    </Text>
                </Pressable>
            </View>

            <View style={[
                styles.filterRow,
                {
                    top: insets.top + 70,
                },
            ]}>
                {[
                    'Parks',
                    'Trails',
                    'Campgrounds',
                    'Wildlife',
                ].map((filter) => (
                    <MapFilter
                        key={filter}
                        label={filter}
                        active={activeFilter === filter}
                        onPress={() => {
                            // changes the visible map category without leaving the map screen
                            setActiveFilter(filter)
                            setSelectedLocation(null)
                        }}
                    />
                ))}
            </View>

            {/* displays contextual information after a user selects any map marker */}
            {selectedLocation ? (
                <View style={styles.selectedCard}>
                    <View
                        style={[
                            styles.selectedImage,
                            selectedLocation.type !== 'park' &&
                                styles.secondarySelectedImage,
                        ]}
                    >
                        <Text style={styles.selectedIcon}>
                            {selectedLocation.type === 'park'
                                ? '🌲'
                                : selectedLocation.type === 'trail'
                                    ? '🥾'
                                    : selectedLocation.type === 'campground'
                                        ? '🏕️'
                                        : '🐾'}
                        </Text>
                    </View>

                    <View style={styles.selectedContent}>
                        <Text style={styles.selectedEyebrow}>
                            {selectedLocation.type === 'park'
                                ? 'NATIONAL PARK'
                                : selectedLocation.type === 'trail'
                                    ? 'TRAIL'
                                    : selectedLocation.type === 'campground'
                                        ? 'CAMPGROUND'
                                        : 'WILDLIFE SIGHTING'}
                        </Text>

                        <Text style={styles.selectedTitle}>
                            {selectedLocation.name}
                        </Text>

                        <Text style={styles.selectedLocation}>
                            {selectedLocation.subtitle}
                        </Text>

                        <Text
                            style={styles.selectedDescription}
                            numberOfLines={2}
                        >
                            {selectedLocation.description}
                        </Text>

                        <View style={styles.selectedActions}>
                            {selectedLocation.type !== 'wildlife' ? (
                                <Pressable
                                    style={styles.viewButton}
                                    onPress={handleViewLocation}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.viewButtonText}>
                                        {selectedLocation.type === 'park'
                                            ? 'View park'
                                            : selectedLocation.type === 'trail'
                                                ? 'View trail'
                                                : 'View campground'}
                                    </Text>
                                </Pressable>
                            ) : (
                                <Pressable
                                    style={styles.viewButton}
                                    onPress={() => {
                                        // wildlife report detail screens will be connected when the community feature is implemented
                                        console.log(
                                            'wildlife report selected'
                                        )
                                    }}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.viewButtonText}>
                                        View report
                                    </Text>
                                </Pressable>
                            )}

                            <Pressable
                                style={styles.closeButton}
                                onPress={() => setSelectedLocation(null)}
                                accessibilityRole="button"
                                accessibilityLabel="close location preview"
                            >
                                <Text style={styles.closeButtonText}>
                                    ×
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            ) : null}

            {/* provides a quick way to return the map to a useful national view */}
            <Pressable
                style={styles.locationButton}
                onPress={() => {
                    // location services will be connected after the core map experience is complete
                    console.log('location requested')
                }}
                accessibilityRole="button"
                accessibilityLabel="show my location"
            >
                <Text style={styles.locationIcon}>
                    ◎
                </Text>
            </Pressable>
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
                active && styles.activeFilter,
            ]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`filter map by ${label}`}
        >
            <Text
                style={[
                    styles.filterText,
                    active && styles.activeFilterText,
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

    searchPlaceholder: {
        color: theme.colors.earth,
        fontSize: theme.typography.bodySmall.fontSize,
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

    closeButton: {
        alignItems: 'center',
        height: 32,
        justifyContent: 'center',
        width: 32,
    },

    closeButtonText: {
        color: theme.colors.earth,
        fontSize: 24,
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