import {
    ScrollView,
    View,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import theme from '../constants/theme'
import mockParks from '../data/mockParks'

// displays detailed information about an individual trail and provides actions for saving and trip planning
export default function TrailDetailScreen({ route, navigation }) {
    const insets = useSafeAreaInsets()

    const { parkId, trailId } = route.params

    const park = mockParks.find((item) => item.id === parkId)
    const trail = park?.trails.find((item) => item.id === trailId)

    // prevents the screen from crashing when a trail cannot be found
    if (!park || !trail) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>
                    Trail not found
                </Text>

                <Pressable
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                >
                    <Text style={styles.backButton}>
                        Go back
                    </Text>
                </Pressable>
            </View>
        )
    }

    return (
        <View style={styles.screen}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* provides quick navigation back to the park page */}
                <View style={styles.hero}>
                    <View style={styles.heroImage}>
                        <Text style={styles.heroImageText}>
                            TRAIL PHOTO
                        </Text>
                    </View>

                    <Pressable
                        style={[
                            styles.backButtonContainer,
                            {
                                top: insets.top + theme.spacing.sm,
                            },
                        ]}
                        onPress={() => navigation.goBack()}
                        accessibilityRole="button"
                    >
                        <Text style={styles.heroButton}>
                            ‹
                        </Text>
                    </Pressable>

                    {/* this will eventually save the trail through the user's favorites */}
                    <Pressable
                        style={[
                            styles.favoriteButton,
                            {
                                top: insets.top + theme.spacing.sm,
                            },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`save ${trail.name}`}
                    >
                        <Text style={styles.favoriteIcon}>
                            ♡
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.header}>
                    <Text style={styles.eyebrow}>
                        {park.name.toUpperCase()}
                    </Text>

                    <Text style={styles.title}>
                        {trail.name}
                    </Text>

                    <Text style={styles.description}>
                        {trail.description}
                    </Text>

                    <View style={styles.actions}>
                        <Pressable
                            style={styles.primaryAction}
                            accessibilityRole="button"
                        >
                            <Text style={styles.primaryActionText}>
                                Save trail
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.secondaryAction}
                            accessibilityRole="button"
                        >
                            <Text style={styles.secondaryActionText}>
                                + Trip
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* presents the most important hiking information at a glance */}
                <View style={styles.stats}>
                    <View style={styles.statsRow}>
                        <TrailStat
                            value={trail.distance}
                            label="Distance"
                        />

                        <TrailStat
                            value={trail.difficulty}
                            label="Difficulty"
                        />

                        <TrailStat
                            value={trail.elevation}
                            label="Elevation"
                        />
                    </View>

                    <View style={styles.petStat}>
                        <Text style={styles.petIcon}>
                            🐕
                        </Text>

                        <View>
                            <Text style={styles.petLabel}>
                                Dogs
                            </Text>

                            <Text style={styles.petValue}>
                                {park.dogsAllowed ? 'Allowed' : 'Not allowed'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Trail details
                    </Text>

                    <View style={styles.detailList}>
                        <DetailRow
                            label="Distance"
                            value={trail.distance}
                        />

                        <DetailRow
                            label="Difficulty"
                            value={trail.difficulty}
                        />

                        <DetailRow
                            label="Elevation gain"
                            value={trail.elevation}
                        />

                        <DetailRow
                            label="Dogs"
                            value={
                                park.dogsAllowed
                                    ? 'Allowed'
                                    : 'Not allowed'
                            }
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        What to expect
                    </Text>

                    <Text style={styles.body}>
                        {trail.description}
                    </Text>

                    <Text style={styles.body}>
                        Trail conditions can change throughout the
                        year. Check current park alerts and conditions
                        before beginning your hike.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Activities
                    </Text>

                    <View style={styles.activityList}>
                        <ActivityPill label="Hiking" />
                        <ActivityPill label="Photography" />
                        <ActivityPill label="Wildlife Watching" />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Wildlife sightings
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                        >
                            <Text style={styles.sectionAction}>
                                Report sighting
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.wildlifeCard}>
                        <View style={styles.wildlifeIcon}>
                            <Text style={styles.wildlifeEmoji}>
                                🐾
                            </Text>
                        </View>

                        <View style={styles.wildlifeContent}>
                            <Text style={styles.wildlifeTitle}>
                                What have hikers seen?
                            </Text>

                            <Text style={styles.wildlifeBody}>
                                Community wildlife reports will appear
                                here once Trail Tales has its community
                                features enabled.
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Hiker photos
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                        >
                            <Text style={styles.sectionAction}>
                                See all
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.photoGrid}>
                        <PhotoPlaceholder />
                        <PhotoPlaceholder />
                        <PhotoPlaceholder />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.planCard}>
                        <Text style={styles.planEyebrow}>
                            PLAN YOUR HIKE
                        </Text>

                        <Text style={styles.planTitle}>
                            Add {trail.name} to a trip
                        </Text>

                        <Text style={styles.planBody}>
                            Keep your favorite trails, campsites, and
                            activities together in one adventure.
                        </Text>

                        <Pressable
                            style={styles.planButton}
                            accessibilityRole="button"
                        >
                            <Text style={styles.planButtonText}>
                                Add to trip
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

function TrailStat({ value, label }) {
    return (
        <View style={styles.stat}>
            <Text style={styles.statValue}>
                {value}
            </Text>

            <Text style={styles.statLabel}>
                {label}
            </Text>
        </View>
    )
}

function DetailRow({ label, value }) {
    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
                {label}
            </Text>

            <Text style={styles.detailValue}>
                {value}
            </Text>
        </View>
    )
}

function ActivityPill({ label }) {
    return (
        <View style={styles.activityPill}>
            <Text style={styles.activityText}>
                {label}
            </Text>
        </View>
    )
}

function PhotoPlaceholder() {
    return (
        <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>
                PHOTO
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.parchment,
    },

    content: {
        paddingBottom: 120,
    },

    hero: {
        height: 280,
        position: 'relative',
    },

    heroImage: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        flex: 1,
        justifyContent: 'center',
    },

    heroImageText: {
        color: theme.colors.forest,
        fontSize: theme.typography.label.fontSize,
        fontWeight: '700',
        letterSpacing: 1.5,
    },

    backButtonContainer: {
        alignItems: 'center',
        backgroundColor: theme.colors.parchment,
        borderRadius: 22,
        height: 44,
        justifyContent: 'center',
        left: theme.spacing.lg,
        position: 'absolute',
        width: 44,
    },

    heroButton: {
        color: theme.colors.ink,
        fontSize: 30,
        lineHeight: 32,
    },

    favoriteButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.parchment,
        borderRadius: 22,
        height: 44,
        justifyContent: 'center',
        position: 'absolute',
        right: theme.spacing.lg,
        width: 44,
    },

    favoriteIcon: {
        color: theme.colors.earth,
        fontSize: 26,
    },

    header: {
        padding: theme.spacing.lg,
    },

    eyebrow: {
        color: theme.colors.forest,
        fontSize: theme.typography.label.fontSize,
        fontWeight: '700',
        letterSpacing: 1.5,
    },

    title: {
        color: theme.colors.ink,
        fontSize: theme.typography.display.fontSize,
        fontWeight: theme.typography.display.fontWeight,
        lineHeight: theme.typography.display.lineHeight,
        marginTop: theme.spacing.xs,
    },

    description: {
        color: theme.colors.bark,
        fontSize: theme.typography.body.fontSize,
        lineHeight: theme.typography.body.lineHeight,
        marginTop: theme.spacing.sm,
    },

    actions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.lg,
    },

    primaryAction: {
        backgroundColor: theme.colors.forest,
        borderRadius: theme.radii.sm,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
    },

    primaryActionText: {
        color: theme.colors.parchment,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '700',
    },

    secondaryAction: {
        borderColor: theme.colors.earth,
        borderRadius: theme.radii.sm,
        borderWidth: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
    },

    secondaryActionText: {
        color: theme.colors.earth,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '700',
    },

    stats: {
        backgroundColor: theme.colors.canvas,
        borderBottomColor: theme.colors.parchment,
        borderBottomWidth: 1,
        borderTopColor: theme.colors.parchment,
        borderTopWidth: 1,
        paddingVertical: theme.spacing.md,
    },

    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.md,
    },

    stat: {
        flex: 1,
        paddingHorizontal: theme.spacing.xs,
    },

    statValue: {
        color: theme.colors.forest,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '700',
    },

    statLabel: {
        color: theme.colors.earth,
        fontSize: theme.typography.caption.fontSize,
        marginTop: theme.spacing.xs,
    },

    petStat: {
        alignItems: 'center',
        borderTopColor: theme.colors.parchment,
        borderTopWidth: 1,
        flexDirection: 'row',
        marginTop: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
    },

    petIcon: {
        fontSize: 22,
        marginRight: theme.spacing.sm,
    },

    petLabel: {
        color: theme.colors.earth,
        fontSize: theme.typography.caption.fontSize,
    },

    petValue: {
        color: theme.colors.ink,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '700',
        marginTop: 2,
    },

    section: {
        marginTop: theme.spacing.xl,
        paddingHorizontal: theme.spacing.lg,
    },

    sectionHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },

    sectionTitle: {
        color: theme.colors.ink,
        fontSize: theme.typography.heading.fontSize,
        fontWeight: theme.typography.heading.fontWeight,
        lineHeight: theme.typography.heading.lineHeight,
    },

    sectionAction: {
        color: theme.colors.forest,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '700',
    },

    detailList: {
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.md,
        marginTop: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
    },

    detailRow: {
        alignItems: 'center',
        borderBottomColor: theme.colors.parchment,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
    },

    detailLabel: {
        color: theme.colors.earth,
        fontSize: theme.typography.bodySmall.fontSize,
    },

    detailValue: {
        color: theme.colors.ink,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '600',
    },

    body: {
        color: theme.colors.bark,
        fontSize: theme.typography.body.fontSize,
        lineHeight: theme.typography.body.lineHeight,
        marginTop: theme.spacing.md,
    },

    activityList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },

    activityPill: {
        backgroundColor: theme.colors.canvas,
        borderRadius: 20,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },

    activityText: {
        color: theme.colors.forest,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: '600',
    },

    wildlifeCard: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.md,
        flexDirection: 'row',
        marginTop: theme.spacing.md,
        padding: theme.spacing.md,
    },

    wildlifeIcon: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        borderRadius: 24,
        height: 48,
        justifyContent: 'center',
        width: 48,
    },

    wildlifeEmoji: {
        fontSize: 22,
    },

    wildlifeContent: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },

    wildlifeTitle: {
        color: theme.colors.ink,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '700',
    },

    wildlifeBody: {
        color: theme.colors.earth,
        fontSize: theme.typography.caption.fontSize,
        lineHeight: theme.typography.caption.lineHeight,
        marginTop: theme.spacing.xs,
    },

    photoGrid: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },

    photoPlaceholder: {
        backgroundColor: theme.colors.sage,
        borderRadius: theme.radii.sm,
        flex: 1,
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
    },

    photoPlaceholderText: {
        color: theme.colors.forest,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: '700',
    },

    planCard: {
        backgroundColor: theme.colors.forest,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.lg,
    },

    planEyebrow: {
        color: theme.colors.sage,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: '700',
        letterSpacing: 1.2,
    },

    planTitle: {
        color: theme.colors.parchment,
        fontSize: theme.typography.heading.fontSize,
        fontWeight: '700',
        lineHeight: theme.typography.heading.lineHeight,
        marginTop: theme.spacing.xs,
    },

    planBody: {
        color: theme.colors.canvas,
        fontSize: theme.typography.bodySmall.fontSize,
        lineHeight: theme.typography.bodySmall.lineHeight,
        marginTop: theme.spacing.sm,
    },

    planButton: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.parchment,
        borderRadius: theme.radii.sm,
        marginTop: theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },

    planButtonText: {
        color: theme.colors.forest,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '700',
    },

    errorContainer: {
        alignItems: 'center',
        backgroundColor: theme.colors.parchment,
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },

    errorTitle: {
        color: theme.colors.ink,
        fontSize: theme.typography.heading.fontSize,
        fontWeight: '700',
    },

    backButton: {
        color: theme.colors.forest,
        fontSize: theme.typography.body.fontSize,
        fontWeight: '600',
        marginTop: theme.spacing.md,
    },
})