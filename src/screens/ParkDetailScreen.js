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

// displays the main information hub for a national park and provides entry points to its trails, campgrounds, and activities
export default function ParkDetailScreen({ route, navigation }) {
    const insets = useSafeAreaInsets()
    const { parkId } = route.params

    const park = mockParks.find((item) => item.id === parkId)

    // prevents the screen from crashing if a navigation route references an invalid park
    if (!park) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>
                    Park not found
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
                <View style={styles.hero}>
                    <View style={styles.heroPlaceholder}>
                        <Text style={styles.heroPlaceholderText}>
                            {park.name.toUpperCase()}
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

                    <Pressable
                        style={[
                            styles.favoriteButton,
                            {
                                top: insets.top + theme.spacing.sm,
                            },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`save ${park.name}`}
                    >
                        <Text style={styles.favoriteIcon}>
                            ♡
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.header}>
                    <Text style={styles.eyebrow}>
                        {park.designation.toUpperCase()}
                    </Text>

                    <Text style={styles.title}>
                        {park.name}
                    </Text>

                    <Text style={styles.location}>
                        {park.states.join(' · ')}
                    </Text>

                    <View style={styles.actions}>
                        <Pressable
                            style={styles.primaryAction}
                            accessibilityRole="button"
                        >
                            <Text style={styles.primaryActionText}>
                                Save
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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        About
                    </Text>

                    <Text style={styles.body}>
                        {park.longDescription}
                    </Text>
                </View>

                <View style={styles.infoGrid}>
                    <InfoCard
                        value={park.trailCount}
                        label="Trails"
                    />

                    <InfoCard
                        value={park.campgroundCount}
                        label="Campgrounds"
                    />

                    <InfoCard
                        value={park.difficulty}
                        label="Difficulty"
                    />

                    <InfoCard
                        value={park.dogsAllowed ? 'Yes' : 'No'}
                        label="Dogs allowed"
                    />
                </View>

                <View style={styles.section}>
                    <SectionHeader
                        title="Trails"
                        actionLabel="See all"
                        onActionPress={() => {
                            // opens the future trail directory filtered to this park
                            console.log('view all trails')
                        }}
                    />

                    <View style={styles.horizontalList}>
                        {park.trails.map((trail) => (
                            <TrailPreview
                                key={trail.id}
                                trail={trail}
                                onPress={() => {
                                    // opens the selected trail so hikers can review its details and add it to a trip
                                    navigation.navigate('TrailDetail', {
                                        parkId: park.id,
                                        trailId: trail.id,
                                    })
                                }}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <SectionHeader
                        title="Campgrounds"
                        actionLabel="See all"
                        onActionPress={() => {
                            // opens the future campground directory filtered to this park
                            console.log('view all campgrounds')
                        }}
                    />

                    <View style={styles.campgroundList}>
                        {park.campgrounds.map((campground) => (
                            <CampgroundPreview
                                key={campground.id}
                                campground={campground}
                                onPress={() => {
                                    // opens the selected campground so users can review its details and add it to a trip
                                    navigation.navigate('CampgroundDetail', {
                                        parkId: park.id,
                                        campgroundId: campground.id,
                                    })
                                }}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Activities
                    </Text>

                    <View style={styles.activityList}>
                        {park.activities.map((activity) => (
                            <View
                                key={activity}
                                style={styles.activityPill}
                            >
                                <Text style={styles.activityText}>
                                    {activity}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <SectionHeader
                        title="Wildlife sightings"
                        actionLabel="See all"
                        onActionPress={() => {
                            // opens the future wildlife sightings feed for this park
                            console.log('view wildlife')
                        }}
                    />

                    <View style={styles.wildlifeList}>
                        {park.wildlife.map((sighting) => (
                            <WildlifeRow
                                key={`${sighting.species}-${sighting.location}`}
                                sighting={sighting}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Plan your visit
                    </Text>

                    <View style={styles.planCard}>
                        <Text style={styles.planTitle}>
                            Make this park part of your next adventure
                        </Text>

                        <Text style={styles.planBody}>
                            Save trails, campsites, and activities to
                            build a trip around {park.name}.
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

function SectionHeader({
    title,
    actionLabel,
    onActionPress,
}) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
                {title}
            </Text>

            {actionLabel ? (
                <Pressable
                    onPress={onActionPress}
                    accessibilityRole="button"
                >
                    <Text style={styles.sectionAction}>
                        {actionLabel}
                    </Text>
                </Pressable>
            ) : null}
        </View>
    )
}

function InfoCard({ value, label }) {
    return (
        <View style={styles.infoCard}>
            <Text style={styles.infoValue}>
                {value}
            </Text>

            <Text style={styles.infoLabel}>
                {label}
            </Text>
        </View>
    )
}

function TrailPreview({ trail, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.trailCard,
                pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`view ${trail.name}`}
        >
            <View style={styles.trailImage}>
                <Text style={styles.trailImageText}>
                    TRAIL
                </Text>
            </View>

            <View style={styles.trailContent}>
                <Text style={styles.trailName}>
                    {trail.name}
                </Text>

                <Text style={styles.trailMeta}>
                    {trail.distance} · {trail.difficulty}
                </Text>

                <Text style={styles.trailElevation}>
                    {trail.elevation}
                </Text>
            </View>
        </Pressable>
    )
}

function CampgroundPreview({ campground, onPress }) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.campgroundCard,
                pressed && styles.pressed,
            ]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`view ${campground.name}`}
        >
            <View style={styles.campgroundIcon}>
                <Text style={styles.campgroundIconText}>
                    ⌂
                </Text>
            </View>

            <View style={styles.campgroundContent}>
                <Text style={styles.campgroundName}>
                    {campground.name}
                </Text>

                <Text style={styles.campgroundMeta}>
                    {campground.sites} · {campground.season}
                </Text>

                <Text
                    style={styles.campgroundDescription}
                    numberOfLines={2}
                >
                    {campground.description}
                </Text>
            </View>
        </Pressable>
    )
}

function WildlifeRow({ sighting }) {
    return (
        <View style={styles.wildlifeRow}>
            <View style={styles.wildlifeIcon}>
                <Text style={styles.wildlifeEmoji}>
                    🐾
                </Text>
            </View>

            <View style={styles.wildlifeContent}>
                <Text style={styles.wildlifeSpecies}>
                    {sighting.species}
                </Text>

                <Text style={styles.wildlifeLocation}>
                    {sighting.location} · {sighting.time}
                </Text>
            </View>
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

    heroPlaceholder: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        flex: 1,
        justifyContent: 'center',
    },

    heroPlaceholderText: {
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

    location: {
        color: theme.colors.earth,
        fontSize: theme.typography.body.fontSize,
        marginTop: theme.spacing.xs,
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

    body: {
        color: theme.colors.bark,
        fontSize: theme.typography.body.fontSize,
        lineHeight: theme.typography.body.lineHeight,
        marginTop: theme.spacing.sm,
    },

    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
    },

    infoCard: {
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.md,
        flex: 1,
        minWidth: '46%',
        padding: theme.spacing.md,
    },

    infoValue: {
        color: theme.colors.forest,
        fontSize: theme.typography.heading.fontSize,
        fontWeight: '700',
    },

    infoLabel: {
        color: theme.colors.earth,
        fontSize: theme.typography.caption.fontSize,
        marginTop: theme.spacing.xs,
    },

    horizontalList: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },

    trailCard: {
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.md,
        overflow: 'hidden',
        width: 220,
        ...theme.shadows.card,
    },

    pressed: {
        opacity: 0.85,
    },

    trailImage: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        height: 100,
        justifyContent: 'center',
    },

    trailImageText: {
        color: theme.colors.forest,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: '700',
        letterSpacing: 1,
    },

    trailContent: {
        padding: theme.spacing.md,
    },

    trailName: {
        color: theme.colors.ink,
        fontSize: theme.typography.body.fontSize,
        fontWeight: '700',
    },

    trailMeta: {
        color: theme.colors.earth,
        fontSize: theme.typography.caption.fontSize,
        marginTop: theme.spacing.xs,
    },

    trailElevation: {
        color: theme.colors.forest,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: '600',
        marginTop: theme.spacing.xs,
    },

    campgroundList: {
        gap: theme.spacing.sm,
    },

    campgroundCard: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.md,
        flexDirection: 'row',
        padding: theme.spacing.md,
        ...theme.shadows.card,
    },

    campgroundIcon: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        borderRadius: theme.radii.sm,
        height: 52,
        justifyContent: 'center',
        width: 52,
    },

    campgroundIconText: {
        color: theme.colors.forest,
        fontSize: 28,
    },

    campgroundContent: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },

    campgroundName: {
        color: theme.colors.ink,
        fontSize: theme.typography.body.fontSize,
        fontWeight: '700',
    },

    campgroundMeta: {
        color: theme.colors.forest,
        fontSize: theme.typography.caption.fontSize,
        marginTop: theme.spacing.xs,
    },

    campgroundDescription: {
        color: theme.colors.earth,
        fontSize: theme.typography.caption.fontSize,
        lineHeight: theme.typography.caption.lineHeight,
        marginTop: theme.spacing.xs,
    },

    activityList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
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

    wildlifeList: {
        gap: theme.spacing.sm,
    },

    wildlifeRow: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.md,
        flexDirection: 'row',
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

    wildlifeSpecies: {
        color: theme.colors.ink,
        fontSize: theme.typography.body.fontSize,
        fontWeight: '700',
    },

    wildlifeLocation: {
        color: theme.colors.earth,
        fontSize: theme.typography.caption.fontSize,
        marginTop: theme.spacing.xs,
    },

    planCard: {
        backgroundColor: theme.colors.forest,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.lg,
    },

    planTitle: {
        color: theme.colors.parchment,
        fontSize: theme.typography.heading.fontSize,
        fontWeight: '700',
        lineHeight: theme.typography.heading.lineHeight,
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
})