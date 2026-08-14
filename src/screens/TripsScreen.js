import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import theme from '../constants/theme'
import { useTrips } from '../context/TripContext'
import mockParks from '../data/mockParks'

// provides the user's central hub for planning and revisiting outdoor adventures
export default function TripsScreen({ navigation }) {
    const insets = useSafeAreaInsets()
    const { trips } = useTrips()

    // separates upcoming and completed adventures using the shared trip store
    const upcomingTrips = trips.filter(
        (trip) => trip.status === 'upcoming'
    )

    const pastTrips = trips.filter(
        (trip) => trip.status === 'past'
    )

    return (
        <View style={styles.screen}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    {
                        // keeps the header below the device safe area
                        paddingTop: insets.top + theme.spacing.lg,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.eyebrow}>
                            YOUR ADVENTURES
                        </Text>

                        <Text style={styles.title}>
                            Trips
                        </Text>
                    </View>

                    <Pressable
                        style={styles.addButton}
                        onPress={() => {
                            // opens the trip creation flow inside the trips navigation stack
                            navigation.navigate('CreateTrip')
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="create a new trip"
                    >
                        <Text style={styles.addButtonText}>
                            +
                        </Text>
                    </Pressable>
                </View>

                {upcomingTrips.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Upcoming
                        </Text>

                        {upcomingTrips.map((trip) => (
                            <TripCard
                                key={trip.id}
                                trip={trip}
                                navigation={navigation}
                            />
                        ))}
                    </View>
                ) : (
                    <EmptyTripsCard
                        onPress={() => {
                            // starts the trip creation flow when no upcoming adventures exist
                            navigation.navigate('CreateTrip')
                        }}
                    />
                )}

                {pastTrips.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Past adventures
                        </Text>

                        {pastTrips.map((trip) => (
                            <TripCard
                                key={trip.id}
                                trip={trip}
                                navigation={navigation}
                            />
                        ))}
                    </View>
                ) : null}
            </ScrollView>

            {/* provides a prominent shortcut for creating a new adventure */}
            <Pressable
                style={[
                    styles.floatingButton,
                    {
                        // keeps the floating action button above the bottom safe area and tab navigation
                        bottom: insets.bottom + theme.spacing.lg,
                    },
                ]}
                onPress={() => {
                    // opens the trip creation flow from the primary action button
                    navigation.navigate('CreateTrip')
                }}
                accessibilityRole="button"
                accessibilityLabel="create a new trip"
            >
                <Text style={styles.floatingButtonIcon}>
                    +
                </Text>

                <Text style={styles.floatingButtonText}>
                    Create trip
                </Text>
            </Pressable>
        </View>
    )
}

function TripCard({ trip, navigation }) {
    const park = mockParks.find(
        (item) => item.id === trip.parkId
    )

    return (
        <Pressable
            style={styles.tripCard}
            onPress={() => {
                // opens the complete planning workspace for the selected adventure
                navigation.navigate('TripDetail', {
                    tripId: trip.id,
                })
            }}
            accessibilityRole="button"
            accessibilityLabel={`open ${trip.name}`}
        >
            <View style={styles.tripImage}>
                <Text style={styles.tripImageIcon}>
                    🏔️
                </Text>
            </View>

            <View style={styles.tripContent}>
                <Text style={styles.tripEyebrow}>
                    {trip.status === 'upcoming'
                        ? 'UPCOMING ADVENTURE'
                        : 'PAST ADVENTURE'}
                </Text>

                <Text style={styles.tripName}>
                    {trip.name}
                </Text>

                <Text style={styles.tripPark}>
                    {park?.name || 'National Park'}
                </Text>

                <Text style={styles.tripDates}>
                    {formatDateRange(
                        trip.startDate,
                        trip.endDate
                    )}
                </Text>

                <View style={styles.tripStats}>
                    <Text style={styles.tripStat}>
                        🥾 {trip.trails.length} trails
                    </Text>

                    <Text style={styles.tripStat}>
                        🏕️ {trip.campsites.length} campsite
                        {trip.campsites.length === 1
                            ? ''
                            : 's'}
                    </Text>
                </View>
            </View>

            <Text style={styles.arrow}>
                ›
            </Text>
        </Pressable>
    )
}

function EmptyTripsCard({ onPress }) {
    return (
        <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
                🏕️
            </Text>

            <Text style={styles.emptyTitle}>
                Start planning your next adventure
            </Text>

            <Text style={styles.emptyDescription}>
                Save parks, trails, and campsites to build your
                own outdoor itinerary.
            </Text>

            <Pressable
                style={styles.emptyButton}
                onPress={onPress}
                accessibilityRole="button"
            >
                <Text style={styles.emptyButtonText}>
                    + Create a trip
                </Text>
            </Pressable>
        </View>
    )
}

function formatDateRange(startDate, endDate) {
    const start = new Date(`${startDate}T12:00:00`)
    const end = new Date(`${endDate}T12:00:00`)

    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }

    return `${start.toLocaleDateString(
        'en-US',
        options
    )} — ${end.toLocaleDateString('en-US', options)}`
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.parchment,
        flex: 1,
    },

    content: {
        paddingBottom: 120,
        paddingHorizontal: theme.spacing.lg,
    },

    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
    },

    eyebrow: {
        color: theme.colors.forest,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
    },

    title: {
        color: theme.colors.ink,
        fontSize: 32,
        fontWeight: '700',
        marginTop: theme.spacing.xs,
    },

    addButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.forest,
        borderRadius: 22,
        height: 44,
        justifyContent: 'center',
        width: 44,
    },

    addButtonText: {
        color: theme.colors.parchment,
        fontSize: 28,
        fontWeight: '300',
        lineHeight: 30,
    },

    section: {
        marginBottom: theme.spacing.xl,
    },

    sectionTitle: {
        color: theme.colors.ink,
        fontSize: 21,
        fontWeight: '700',
        marginBottom: theme.spacing.md,
    },

    tripCard: {
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.lg,
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
        minHeight: 150,
        overflow: 'hidden',
        ...theme.shadows.card,
    },

    tripImage: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        justifyContent: 'center',
        width: 100,
    },

    tripImageIcon: {
        fontSize: 34,
    },

    tripContent: {
        flex: 1,
        padding: theme.spacing.md,
    },

    tripEyebrow: {
        color: theme.colors.forest,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },

    tripName: {
        color: theme.colors.ink,
        fontSize: 17,
        fontWeight: '700',
        marginTop: theme.spacing.xs,
    },

    tripPark: {
        color: theme.colors.earth,
        fontSize: 12,
        marginTop: 2,
    },

    tripDates: {
        color: theme.colors.bark,
        fontSize: 12,
        marginTop: theme.spacing.sm,
    },

    tripStats: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginTop: theme.spacing.sm,
    },

    tripStat: {
        color: theme.colors.earth,
        fontSize: 11,
    },

    arrow: {
        alignSelf: 'center',
        color: theme.colors.earth,
        fontSize: 30,
        marginRight: theme.spacing.md,
    },

    emptyCard: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.xl,
        ...theme.shadows.card,
    },

    emptyIcon: {
        fontSize: 44,
        marginBottom: theme.spacing.md,
    },

    emptyTitle: {
        color: theme.colors.ink,
        fontSize: 21,
        fontWeight: '700',
        textAlign: 'center',
    },

    emptyDescription: {
        color: theme.colors.earth,
        fontSize: 14,
        lineHeight: 20,
        marginTop: theme.spacing.sm,
        maxWidth: 300,
        textAlign: 'center',
    },

    emptyButton: {
        backgroundColor: theme.colors.forest,
        borderRadius: theme.radii.md,
        marginTop: theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
    },

    emptyButtonText: {
        color: theme.colors.parchment,
        fontSize: 14,
        fontWeight: '700',
    },

    floatingButton: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.forest,
        borderRadius: 28,
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        position: 'absolute',
        ...theme.shadows.card,
    },

    floatingButtonIcon: {
        color: theme.colors.parchment,
        fontSize: 24,
        marginRight: theme.spacing.sm,
    },

    floatingButtonText: {
        color: theme.colors.parchment,
        fontSize: 14,
        fontWeight: '700',
    },
})