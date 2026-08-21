import React, {
    useMemo,
    useState,
} from 'react'

import {
    View,
    Text,
    TextInput,
    Pressable,
    FlatList,
    StyleSheet,
} from 'react-native'

import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

import {
    Ionicons,
} from '@expo/vector-icons'

import {
    loreParks,
    loreEntries,
} from '../data/mockLore'

import theme from '../constants/theme'

const categories = [
    {
        id: 'all',
        label: 'All',
    },
    {
        id: 'legend',
        label: 'Legends',
    },
    {
        id: 'folklore',
        label: 'Folklore',
    },
    {
        id: 'cryptid',
        label: 'Cryptids',
    },
]

// displays lore associated with one selected park and provides category filtering
export default function LoreParkScreen({
    route,
    navigation,
}) {

    const insets = useSafeAreaInsets()

    const {
        parkId,
    } = route.params

    const [
        searchText,
        setSearchText,
    ] = useState('')

    const [
        selectedCategory,
        setSelectedCategory,
    ] = useState('all')

    const park =
        loreParks.find(
            (item) =>
                item.id === parkId
        )

    const filteredEntries =
        useMemo(() => {
            const normalizedSearch =
                searchText
                    .trim()
                    .toLowerCase()

            return loreEntries.filter(
                (entry) => {
                    if (
                        entry.parkId !==
                        parkId
                    ) {
                        return false
                    }

                    if (
                        selectedCategory !==
                            'all' &&
                        entry.category !==
                            selectedCategory
                    ) {
                        return false
                    }

                    if (
                        !normalizedSearch
                    ) {
                        return true
                    }

                    return (
                        entry.title
                            .toLowerCase()
                            .includes(
                                normalizedSearch
                            ) ||
                        entry.summary
                            .toLowerCase()
                            .includes(
                                normalizedSearch
                            )
                    )
                }
            )
        }, [
            parkId,
            searchText,
            selectedCategory,
        ])

    if (!park) {
        return (
            <View
                style={
                    styles.container
                }
            >
                <Text
                    style={
                        styles.errorText
                    }
                >
                    Park could not be found
                </Text>
            </View>
        )
    }

    // returns a readable label and icon for each lore category
    const getCategoryInfo = (
        category
    ) => {
        switch (category) {
            case 'cryptid':
                return {
                    label: 'CRYPTID',
                    icon: 'paw',
                }

            case 'folklore':
                return {
                    label: 'FOLKLORE',
                    icon: 'leaf',
                }

            case 'legend':
                return {
                    label: 'LEGEND',
                    icon: 'sparkles',
                }

            default:
                return {
                    label: 'LORE',
                    icon: 'book',
                }
        }
    }

    const renderLoreCard = ({
        item,
    }) => {
        const categoryInfo =
            getCategoryInfo(
                item.category
            )

        return (
            <Pressable
                style={
                    styles.storyCard
                }
                onPress={() =>
                    navigation.navigate(
                        'LoreStory',
                        {
                            loreId:
                                item.id,
                        }
                    )
                }
                accessibilityRole="button"
                accessibilityLabel={`read ${item.title}`}
            >
                <View
                    style={
                        styles.storyTopRow
                    }
                >
                    <View
                        style={
                            styles.categoryBadge
                        }
                    >
                        <Ionicons
                            name={
                                categoryInfo.icon
                            }
                            size={13}
                            color={
                                theme.colors.forest
                            }
                        />

                        <Text
                            style={
                                styles.categoryText
                            }
                        >
                            {
                                categoryInfo.label
                            }
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={
                            theme.colors.earth
                        }
                    />
                </View>

                <Text
                    style={
                        styles.storyTitle
                    }
                >
                    {item.title}
                </Text>

                <Text
                    style={
                        styles.storySummary
                    }
                >
                    {item.summary}
                </Text>
            </Pressable>
        )
    }

    return (
        <View
            style={
                [
                    styles.container,
                    {
                        paddingTop:
                            insets.top,
                    },
                ]
            }
        >
            <FlatList
                data={
                    filteredEntries
                }
                keyExtractor={(
                    item
                ) => item.id}
                renderItem={
                    renderLoreCard
                }
                contentContainerStyle={
                    styles.content
                }
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={
                    false
                }
                ListHeaderComponent={
                    <>
                        <View
                            style={
                                styles.header
                            }
                        >
                            <Pressable
                                onPress={() =>
                                    navigation.goBack()
                                }
                                style={
                                    styles.backButton
                                }
                                accessibilityRole="button"
                                accessibilityLabel="go back to parks"
                            >
                                <Ionicons
                                    name="chevron-back"
                                    size={22}
                                    color={
                                        theme.colors.forest
                                    }
                                />

                                <Text
                                    style={
                                        styles.backText
                                    }
                                >
                                    Parks
                                </Text>
                            </Pressable>

                            <Text
                                style={
                                    styles.title
                                }
                            >
                                {park.name}
                            </Text>

                            <Text
                                style={
                                    styles.subtitle
                                }
                            >
                                {park.subtitle}
                                {' · '}
                                {park.region}
                            </Text>
                        </View>

                        <Pressable
                            style={
                                styles.campfireButton
                            }
                            onPress={() =>
                                // opens the park's campfire story selection instead of immediately starting a story
                                navigation.navigate(
                                    'CampfireSelection',
                                    {
                                        parkId,
                                    }
                                )
                            }
                            accessibilityRole="button"
                            accessibilityLabel={`enter campfire mode for ${park.name}`}
                        >
                            <View
                                style={
                                    styles.campfireIcon
                                }
                            >
                                <Text
                                    style={
                                        styles.campfireEmoji
                                    }
                                >
                                    🔥
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.campfireInfo
                                }
                            >
                                <Text
                                    style={
                                        styles.campfireTitle
                                    }
                                >
                                    Campfire Mode
                                </Text>

                                <Text
                                    style={
                                        styles.campfireText
                                    }
                                >
                                    Settle in for stories
                                    from after dark
                                </Text>
                            </View>

                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#E7C48A"
                            />
                        </Pressable>

                        <View
                            style={
                                styles.searchContainer
                            }
                        >
                            <Ionicons
                                name="search"
                                size={19}
                                color={
                                    theme.colors.earth
                                }
                            />

                            <TextInput
                                value={
                                    searchText
                                }
                                onChangeText={
                                    setSearchText
                                }
                                placeholder={`search ${park.name.toLowerCase()} lore...`}
                                placeholderTextColor={
                                    theme.colors.earth
                                }
                                style={
                                    styles.searchInput
                                }
                                accessibilityLabel="search park lore"
                            />

                            {searchText.length >
                            0 ? (
                                <Pressable
                                    onPress={() =>
                                        setSearchText(
                                            ''
                                        )
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel="clear lore search"
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={19}
                                        color={
                                            theme.colors.earth
                                        }
                                    />
                                </Pressable>
                            ) : null}
                        </View>

                        <FlatList
                            data={
                                categories
                            }
                            horizontal
                            keyExtractor={(
                                item
                            ) =>
                                item.id
                            }
                            showsHorizontalScrollIndicator={
                                false
                            }
                            contentContainerStyle={
                                styles.categoryList
                            }
                            renderItem={({
                                item,
                            }) => {
                                const active =
                                    selectedCategory ===
                                    item.id

                                return (
                                    <Pressable
                                        onPress={() =>
                                            setSelectedCategory(
                                                item.id
                                            )
                                        }
                                        style={[
                                            styles.categoryChip,
                                            active &&
                                                styles.categoryChipActive,
                                        ]}
                                        accessibilityRole="button"
                                        accessibilityState={{
                                            selected:
                                                active,
                                        }}
                                        accessibilityLabel={`show ${item.label.toLowerCase()}`}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryChipText,
                                                active &&
                                                    styles.categoryChipTextActive,
                                            ]}
                                        >
                                            {
                                                item.label
                                            }
                                        </Text>
                                    </Pressable>
                                )
                            }}
                        />

                        <View
                            style={
                                styles.resultsHeader
                            }
                        >
                            <Text
                                style={
                                    styles.resultsTitle
                                }
                            >
                                Stories
                            </Text>

                            <Text
                                style={
                                    styles.resultsCount
                                }
                            >
                                {
                                    filteredEntries.length
                                }
                            </Text>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <View
                        style={
                            styles.emptyState
                        }
                    >
                        <Ionicons
                            name="book-outline"
                            size={38}
                            color={
                                theme.colors.earth
                            }
                        />

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No stories found
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            Try another search or
                            category
                        </Text>
                    </View>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.parchment,
        flex: 1,
    },

    content: {
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xl * 2,
    },

    header: {
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.md,
    },

    backButton: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: theme.spacing.lg,
    },

    backText: {
        color: theme.colors.forest,
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 2,
    },

    title: {
        color: theme.colors.ink,
        fontSize: 32,
        fontWeight: '800',
    },

    subtitle: {
        color: theme.colors.earth,
        fontSize: 12,
        marginTop: theme.spacing.xs,
    },

    campfireButton: {
        alignItems: 'center',
        backgroundColor: '#30261E',
        borderRadius: theme.radii.md,
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
        minHeight: 76,
        padding: theme.spacing.md,
    },

    campfireIcon: {
        alignItems: 'center',
        backgroundColor: '#4A3325',
        borderRadius: 22,
        height: 44,
        justifyContent: 'center',
        width: 44,
    },

    campfireEmoji: {
        fontSize: 22,
    },

    campfireInfo: {
        flex: 1,
        marginHorizontal: theme.spacing.md,
    },

    campfireTitle: {
        color: '#F4D6A3',
        fontSize: 15,
        fontWeight: '800',
    },

    campfireText: {
        color: '#C8B49B',
        fontSize: 11,
        marginTop: 3,
    },

    searchContainer: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderColor: theme.colors.sage,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        flexDirection: 'row',
        minHeight: 48,
        paddingHorizontal: theme.spacing.md,
    },

    searchInput: {
        color: theme.colors.ink,
        flex: 1,
        fontSize: 13,
        marginLeft: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
    },

    categoryList: {
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.md,
    },

    categoryChip: {
        backgroundColor: theme.colors.canvas,
        borderColor: theme.colors.sage,
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },

    categoryChipActive: {
        backgroundColor: theme.colors.forest,
        borderColor: theme.colors.forest,
    },

    categoryChipText: {
        color: theme.colors.earth,
        fontSize: 11,
        fontWeight: '700',
    },

    categoryChipTextActive: {
        color: theme.colors.parchment,
    },

    resultsHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: theme.spacing.sm,
    },

    resultsTitle: {
        color: theme.colors.ink,
        fontSize: 18,
        fontWeight: '700',
    },

    resultsCount: {
        color: theme.colors.earth,
        fontSize: 11,
        marginLeft: theme.spacing.sm,
    },

    storyCard: {
        backgroundColor: theme.colors.canvas,
        borderColor: theme.colors.sage,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        marginBottom: theme.spacing.sm,
        padding: theme.spacing.md,
    },

    storyTopRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    categoryBadge: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        borderRadius: 12,
        flexDirection: 'row',
        paddingHorizontal: 9,
        paddingVertical: 5,
    },

    categoryText: {
        color: theme.colors.forest,
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.6,
        marginLeft: 5,
    },

    storyTitle: {
        color: theme.colors.ink,
        fontSize: 17,
        fontWeight: '750',
        marginTop: theme.spacing.md,
    },

    storySummary: {
        color: theme.colors.earth,
        fontSize: 12,
        lineHeight: 18,
        marginTop: theme.spacing.xs,
    },

    emptyState: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl * 2,
    },

    emptyTitle: {
        color: theme.colors.ink,
        fontSize: 16,
        fontWeight: '700',
        marginTop: theme.spacing.md,
    },

    emptyText: {
        color: theme.colors.earth,
        fontSize: 12,
        marginTop: theme.spacing.xs,
    },

    errorText: {
        color: theme.colors.earth,
        fontSize: 15,
        margin: theme.spacing.xl,
        textAlign: 'center',
    },
})