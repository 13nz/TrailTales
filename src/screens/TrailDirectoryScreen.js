import {
    View,
    Text,
    Pressable,
    TextInput,
    FlatList,
    StyleSheet,
} from 'react-native'

import {
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

import {
    Ionicons,
} from '@expo/vector-icons'

import theme from '../constants/theme'

import {
    getAllParks,
    getTrailsByPark,
    getParkByCode
} from '../api/npsApi'

// provides a searchable directory of trails across all national parks
export default function TrailDirectoryScreen({
    navigation,
    route
}) {
    const insets = useSafeAreaInsets()

    const parkId = route.params?.parkId || null

    const [
        searchQuery,
        setSearchQuery,
    ] = useState('')

    const [
        trails,
        setTrails,
    ] = useState([])

    const [
        loadingTrails,
        setLoadingTrails,
    ] = useState(true)

    const [
        trailError,
        setTrailError,
    ] = useState(null)

    // loads trails from the nps national park list or for specific park
    useEffect(() => {
        async function loadTrails() {
            try {
                setLoadingTrails(true)
                setTrailError(null)

                if (parkId) {
                    const parkTrails =
                        await getTrailsByPark(
                            parkId
                        )

                    const park =
                        await getParkByCode(
                            parkId
                        )

                    const normalizedTrails =
                        (parkTrails || [])
                            .map(
                                (trail) => ({
                                    ...trail,
                                    parkId:
                                        park.id,
                                    parkName:
                                        park.name,
                                })
                            )
                            .sort(
                                (a, b) =>
                                    a.name.localeCompare(
                                        b.name
                                    )
                            )

                    setTrails(
                        normalizedTrails
                    )
                    return
                }

                const parks =
                    await getAllParks()

                const trailResults =
                    await Promise.all(
                        parks.map(
                            async (park) => {
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
                                    error
                                ) {
                                    console.error(
                                        `NPS trail error for ${park.name}:`,
                                        error
                                    )

                                    return []
                                }
                            }
                        )
                    )

                setTrails(
                    trailResults
                        .flat()
                        .sort(
                            (a, b) =>
                                a.name.localeCompare(
                                    b.name
                                )
                        )
                )
            } catch (error) {
                console.error(
                    'NPS trail directory error:',
                    error
                )

                setTrailError(
                    'Unable to load trails'
                )
            } finally {
                setLoadingTrails(
                    false
                )
            }
        }

        loadTrails()
    }, [parkId])

    // filters the directory using trail, park, and difficulty names
    const filteredTrails =
        useMemo(() => {
            const query =
                searchQuery
                    .trim()
                    .toLowerCase()

            if (!query) {
                return trails
            }

            return trails.filter(
                (trail) =>
                    trail.name
                        ?.toLowerCase()
                        .includes(
                            query
                        ) ||
                    trail.parkName
                        ?.toLowerCase()
                        .includes(
                            query
                        ) ||
                    trail.difficulty
                        ?.toLowerCase()
                        .includes(
                            query
                        )
            )
        }, [
            trails,
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

    if (loadingTrails) {
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
                                theme.colors
                                    .forest
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
                        Loading trails...
                    </Text>
                </View>
            </View>
        )
    }

    if (trailError) {
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
                                theme.colors
                                    .forest
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
                        Unable to load trails
                    </Text>

                    <Text
                        style={
                            styles.emptyText
                        }
                    >
                        Please try again later.
                    </Text>
                </View>
            </View>
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
                            theme.colors
                                .forest
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
                                theme.colors
                                    .earth
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
                    item,
                    index
                ) =>
                    `${item.parkId}-${item.id}-${index}`
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

                            {item.description ? (
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
                            ) : null}

                            <View
                                style={
                                    styles.metaRow
                                }
                            >
                                {item.distance ? (
                                    <>
                                        <Text
                                            style={
                                                styles.meta
                                            }
                                        >
                                            {
                                                item.distance
                                            }
                                        </Text>

                                        {item.difficulty ||
                                        item.elevation ? (
                                            <Text
                                                style={
                                                    styles.metaDot
                                                }
                                            >
                                                ·
                                            </Text>
                                        ) : null}
                                    </>
                                ) : null}

                                {item.difficulty ? (
                                    <>
                                        <Text
                                            style={
                                                styles.meta
                                            }
                                        >
                                            {
                                                item.difficulty
                                            }
                                        </Text>

                                        {item.elevation ? (
                                            <Text
                                                style={
                                                    styles.metaDot
                                                }
                                            >
                                                ·
                                            </Text>
                                        ) : null}
                                    </>
                                ) : null}

                                {item.elevation ? (
                                    <Text
                                        style={
                                            styles.meta
                                        }
                                    >
                                        {
                                            item.elevation
                                        }
                                    </Text>
                                ) : null}
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