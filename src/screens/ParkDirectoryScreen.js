import {
    ScrollView,
    View,
    Text,
    Pressable,
    TextInput,
    StyleSheet,
} from 'react-native'
import { useState } from 'react'

import theme from '../constants/theme'
import mockParks from '../data/mockParks'

// displays the searchable collection of national parks while the real nps data source is being developed
export default function ParkDirectoryScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('')

    // filters the mock park collection locally so the search experience can be built before api integration
    const filteredParks = mockParks.filter((park) => {
        const query = searchQuery.toLowerCase().trim()

        if (!query) {
            return true
        }

        return (
            park.name.toLowerCase().includes(query) ||
            park.states.some((state) =>
                state.toLowerCase().includes(query)
            )
        )
    })

    return (
        <View style={styles.screen}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* provides a clear way back to the main explore screen */}
                <Pressable
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                >
                    <Text style={styles.backButton}>‹ Explore</Text>
                </Pressable>

                <Text style={styles.eyebrow}>
                    DISCOVER
                </Text>

                <Text style={styles.title}>
                    National Parks
                </Text>

                <Text style={styles.description}>
                    Find a park to explore, save for later, or add to
                    your next adventure.
                </Text>

                {/* allows users to search parks by name or state */}
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>
                        ⌕
                    </Text>

                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search parks or states"
                        placeholderTextColor={theme.colors.earth}
                        style={styles.searchInput}
                        autoCapitalize="none"
                        returnKeyType="search"
                    />
                </View>

                <View style={styles.resultsHeader}>
                    <Text style={styles.resultCount}>
                        {filteredParks.length} parks
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                    >
                        <Text style={styles.filterText}>
                            Filter
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.list}>
                    {filteredParks.map((park) => (
                        <ParkListCard
                            key={park.id}
                            park={park}
                            onPress={() =>
                                navigation.navigate(
                                    'ParkDetail',
                                    {
                                        parkId: park.id,
                                    }
                                )
                            }
                        />
                    ))}
                </View>

                {/* communicates that the current search returned no matching parks */}
                {filteredParks.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>
                            No parks found
                        </Text>

                        <Text style={styles.emptyDescription}>
                            Try searching for another park or state.
                        </Text>
                    </View>
                ) : null}
            </ScrollView>
        </View>
    )
}

function ParkListCard({ park, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`view ${park.name}`}
        >
            {/* this placeholder will eventually display an image supplied by the nps api */}
            <View style={styles.imagePlaceholder}>
                <Text style={styles.imageText}>
                    {park.name.toUpperCase()}
                </Text>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.cardTitleRow}>
                    <View style={styles.cardTitleContainer}>
                        <Text style={styles.cardEyebrow}>
                            NATIONAL PARK
                        </Text>

                        <Text style={styles.cardTitle}>
                            {park.name}
                        </Text>
                    </View>

                    {/* the favorite control will later persist the user's choice through supabase */}
                    <Text style={styles.favorite}>
                        ♡
                    </Text>
                </View>

                <Text style={styles.location}>
                    {park.states.join(' · ')}
                </Text>

                <Text
                    style={styles.cardDescription}
                    numberOfLines={2}
                >
                    {park.description}
                </Text>

                <View style={styles.metadata}>
                    <Text style={styles.metadataText}>
                        {park.trailCount} trails
                    </Text>

                    <Text style={styles.metadataDivider}>
                        ·
                    </Text>

                    <Text style={styles.metadataText}>
                        {park.campgroundCount} campgrounds
                    </Text>
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.parchment,
    },

    content: {
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xxl,
        paddingBottom: 120,
    },

    backButton: {
        color: theme.colors.forest,
        fontSize: theme.typography.body.fontSize,
        fontWeight: '600',
        marginBottom: theme.spacing.xl,
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
        marginTop: theme.spacing.sm,
    },

    description: {
        color: theme.colors.earth,
        fontSize: theme.typography.body.fontSize,
        lineHeight: theme.typography.body.lineHeight,
        marginTop: theme.spacing.sm,
    },

    searchBar: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.md,
        flexDirection: 'row',
        marginTop: theme.spacing.lg,
        minHeight: 52,
        paddingHorizontal: theme.spacing.md,
    },

    searchIcon: {
        color: theme.colors.forest,
        fontSize: 24,
        marginRight: theme.spacing.sm,
    },

    searchInput: {
        color: theme.colors.ink,
        flex: 1,
        fontSize: theme.typography.body.fontSize,
    },

    resultsHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.md,
    },

    resultCount: {
        color: theme.colors.ink,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '600',
    },

    filterText: {
        color: theme.colors.forest,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '700',
    },

    list: {
        gap: theme.spacing.md,
    },

    card: {
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.lg,
        overflow: 'hidden',
        ...theme.shadows.card,
    },

    cardPressed: {
        opacity: 0.85,
    },

    imagePlaceholder: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        height: 120,
        justifyContent: 'center',
    },

    imageText: {
        color: theme.colors.forest,
        fontSize: theme.typography.label.fontSize,
        fontWeight: '700',
        letterSpacing: 1,
    },

    cardContent: {
        padding: theme.spacing.md,
    },

    cardTitleRow: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    cardTitleContainer: {
        flex: 1,
        paddingRight: theme.spacing.md,
    },

    cardEyebrow: {
        color: theme.colors.forest,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: '700',
        letterSpacing: 1,
    },

    cardTitle: {
        color: theme.colors.ink,
        fontSize: theme.typography.heading.fontSize,
        fontWeight: theme.typography.heading.fontWeight,
        lineHeight: theme.typography.heading.lineHeight,
        marginTop: theme.spacing.xs,
    },

    favorite: {
        color: theme.colors.earth,
        fontSize: 28,
    },

    location: {
        color: theme.colors.earth,
        fontSize: theme.typography.bodySmall.fontSize,
        marginTop: theme.spacing.xs,
    },

    cardDescription: {
        color: theme.colors.bark,
        fontSize: theme.typography.bodySmall.fontSize,
        lineHeight: theme.typography.bodySmall.lineHeight,
        marginTop: theme.spacing.sm,
    },

    metadata: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: theme.spacing.md,
    },

    metadataText: {
        color: theme.colors.forest,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: '600',
    },

    metadataDivider: {
        color: theme.colors.earth,
        marginHorizontal: theme.spacing.sm,
    },

    emptyState: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xxxl,
    },

    emptyTitle: {
        color: theme.colors.ink,
        fontSize: theme.typography.heading.fontSize,
        fontWeight: theme.typography.heading.fontWeight,
    },

    emptyDescription: {
        color: theme.colors.earth,
        fontSize: theme.typography.bodySmall.fontSize,
        marginTop: theme.spacing.sm,
        textAlign: 'center',
    },
})