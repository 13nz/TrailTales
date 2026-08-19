import {
    View,
    Text,
    Pressable,
    TextInput,
    FlatList,
    StyleSheet,
} from 'react-native'

import {
    useMemo,
    useState,
} from 'react'

import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

import {
    Ionicons,
} from '@expo/vector-icons'

import mockParks from '../data/mockParks'

import theme from '../constants/theme'

// provides a searchable directory of trails across all mock parks
export default function TrailDirectoryScreen({
    navigation,
}) {
    const insets =
        useSafeAreaInsets()

    const [
        searchQuery,
        setSearchQuery,
    ] = useState('')

    // flattens the trails stored on each park so the directory can display them together
    const allTrails =
        useMemo(() => {
            return mockParks.flatMap(
                (park) =>
                    park.trails.map(
                        (trail) => ({
                            ...trail,
                            parkId:
                                park.id,
                            parkName:
                                park.name,
                        })
                    )
            )
        }, [])

    // filters the directory using both trail and park names
    const filteredTrails =
        useMemo(() => {
            const query =
                searchQuery
                    .trim()
                    .toLowerCase()

            if (!query) {
                return allTrails
            }

            return allTrails.filter(
                (trail) =>
                    trail.name
                        .toLowerCase()
                        .includes(query) ||
                    trail.parkName
                        .toLowerCase()
                        .includes(query) ||
                    trail.difficulty
                        .toLowerCase()
                        .includes(query)
            )
        }, [
            allTrails,
            searchQuery,
        ])

    // opens the existing trail detail screen using the park and trail ids expected by that screen
    const openTrail = (
        trail
    ) => {
        navigation.navigate(
            'TrailDetail',
            {
                parkId:
                    trail.parkId,
                trailId:
                    trail.id,
            }
        )
    }

    return (
        <View
            style={[
                styles.screen,
                {
                    paddingTop:
                        insets.top,
                },
            ]}
        >
            <View
                style={
                    styles.header
                }
            >
                <Pressable
                    style={
                        styles.backButton
                    }
                    onPress={() =>
                        navigation.goBack()
                    }
                    accessibilityRole="button"
                    accessibilityLabel="go back to explore"
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
                        Explore
                    </Text>
                </Pressable>

                <Text
                    style={
                        styles.title
                    }
                >
                    Trails
                </Text>

                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Find your next path
                </Text>
            </View>

            <View
                style={
                    styles.searchContainer
                }
            >
                <Ionicons
                    name="search-outline"
                    size={19}
                    color={
                        theme.colors.earth
                    }
                />

                <TextInput
                    value={
                        searchQuery
                    }
                    onChangeText={
                        setSearchQuery
                    }
                    placeholder="Search trails or parks"
                    placeholderTextColor={
                        theme.colors.earth
                    }
                    style={
                        styles.searchInput
                    }
                    returnKeyType="search"
                    accessibilityLabel="search trails or parks"
                />

                {searchQuery.length >
                0 ? (
                    <Pressable
                        onPress={() =>
                            setSearchQuery(
                                ''
                            )
                        }
                        style={
                            styles.clearButton
                        }
                        accessibilityRole="button"
                        accessibilityLabel="clear trail search"
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

            <View
                style={
                    styles.resultHeader
                }
            >
                <Text
                    style={
                        styles.resultCount
                    }
                >
                    {filteredTrails.length}{' '}
                    {filteredTrails.length ===
                    1
                        ? 'trail'
                        : 'trails'}
                </Text>
            </View>

            <FlatList
                data={
                    filteredTrails
                }
                keyExtractor={(
                    item
                ) =>
                    `${item.parkId}-${item.id}`
                }
                contentContainerStyle={
                    styles.list
                }
                showsVerticalScrollIndicator={
                    false
                }
                keyboardShouldPersistTaps="handled"
                renderItem={({
                    item,
                }) => (
                    <Pressable
                        style={({
                            pressed,
                        }) => [
                            styles.trailCard,
                            pressed &&
                                styles.pressed,
                        ]}
                        onPress={() =>
                            openTrail(
                                item
                            )
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`open ${item.name}`}
                    >
                        <View
                            style={
                                styles.trailIcon
                            }
                        >
                            <Text
                                style={
                                    styles.trailIconText
                                }
                            >
                                🥾
                            </Text>
                        </View>

                        <View
                            style={
                                styles.trailInfo
                            }
                        >
                            <Text
                                style={
                                    styles.parkName
                                }
                            >
                                {
                                    item.parkName
                                }
                            </Text>

                            <Text
                                style={
                                    styles.trailName
                                }
                            >
                                {item.name}
                            </Text>

                            <Text
                                style={
                                    styles.description
                                }
                                numberOfLines={
                                    2
                                }
                            >
                                {
                                    item.description
                                }
                            </Text>

                            <View
                                style={
                                    styles.metaRow
                                }
                            >
                                <Text
                                    style={
                                        styles.meta
                                    }
                                >
                                    {
                                        item.distance
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.metaDot
                                    }
                                >
                                    ·
                                </Text>

                                <Text
                                    style={
                                        styles.meta
                                    }
                                >
                                    {
                                        item.difficulty
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.metaDot
                                    }
                                >
                                    ·
                                </Text>

                                <Text
                                    style={
                                        styles.meta
                                    }
                                >
                                    {
                                        item.elevation
                                    }
                                </Text>
                            </View>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={
                                theme.colors.earth
                            }
                        />
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View
                        style={
                            styles.emptyState
                        }
                    >
                        <Text
                            style={
                                styles.emptyIcon
                            }
                        >
                            🥾
                        </Text>

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No trails found
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            Try searching for a
                            different trail or park.
                        </Text>
                    </View>
                }
            />
        </View>
    )
}

const styles =
    StyleSheet.create({
        screen: {
            backgroundColor:
                theme.colors.parchment,
            flex: 1,
        },

        header: {
            paddingHorizontal:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.sm,
        },

        backButton: {
            alignItems:
                'center',
            flexDirection:
                'row',
            marginBottom:
                theme.spacing.lg,
        },

        backText: {
            color:
                theme.colors.forest,
            fontSize: 13,
            fontWeight: '600',
            marginLeft: 2,
        },

        title: {
            color:
                theme.colors.ink,
            fontSize: 32,
            fontWeight: '800',
        },

        subtitle: {
            color:
                theme.colors.earth,
            fontSize: 14,
            marginTop:
                theme.spacing.xs,
        },

        searchContainer: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors.canvas,
            borderRadius:
                theme.radii.md,
            flexDirection:
                'row',
            marginHorizontal:
                theme.spacing.lg,
            marginTop:
                theme.spacing.lg,
            minHeight: 50,
            paddingHorizontal:
                theme.spacing.md,
        },

        searchInput: {
            color:
                theme.colors.ink,
            flex: 1,
            fontSize: 14,
            marginLeft:
                theme.spacing.sm,
            minHeight: 48,
        },

        clearButton: {
            alignItems:
                'center',
            justifyContent:
                'center',
            padding: 5,
        },

        resultHeader: {
            paddingHorizontal:
                theme.spacing.lg,
            paddingVertical:
                theme.spacing.md,
        },

        resultCount: {
            color:
                theme.colors.earth,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.5,
            textTransform:
                'uppercase',
        },

        list: {
            paddingHorizontal:
                theme.spacing.lg,
            paddingBottom:
                theme.spacing.xxxl,
        },

        trailCard: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors.canvas,
            borderRadius:
                theme.radii.md,
            flexDirection:
                'row',
            marginBottom:
                theme.spacing.sm,
            padding:
                theme.spacing.md,
            ...theme.shadows.card,
        },

        pressed: {
            opacity: 0.8,
        },

        trailIcon: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors.sage,
            borderRadius: 24,
            height: 48,
            justifyContent:
                'center',
            width: 48,
        },

        trailIconText: {
            fontSize: 22,
        },

        trailInfo: {
            flex: 1,
            marginHorizontal:
                theme.spacing.md,
        },

        parkName: {
            color:
                theme.colors.forest,
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 0.8,
            textTransform:
                'uppercase',
        },

        trailName: {
            color:
                theme.colors.ink,
            fontSize: 16,
            fontWeight: '750',
            marginTop: 3,
        },

        description: {
            color:
                theme.colors.earth,
            fontSize: 11,
            lineHeight: 16,
            marginTop: 4,
        },

        metaRow: {
            alignItems:
                'center',
            flexDirection:
                'row',
            marginTop:
                theme.spacing.sm,
        },

        meta: {
            color:
                theme.colors.forest,
            fontSize: 10,
            fontWeight: '700',
        },

        metaDot: {
            color:
                theme.colors.earth,
            fontSize: 10,
            marginHorizontal: 5,
        },

        emptyState: {
            alignItems:
                'center',
            paddingHorizontal:
                theme.spacing.xl,
            paddingTop: 80,
        },

        emptyIcon: {
            fontSize: 42,
        },

        emptyTitle: {
            color:
                theme.colors.ink,
            fontSize: 18,
            fontWeight: '700',
            marginTop:
                theme.spacing.md,
        },

        emptyText: {
            color:
                theme.colors.earth,
            fontSize: 12,
            lineHeight: 18,
            marginTop:
                theme.spacing.xs,
            textAlign:
                'center',
        },
    })