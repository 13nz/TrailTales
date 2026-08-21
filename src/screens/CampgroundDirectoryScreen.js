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
    useEffect,
} from 'react'

import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

import {
    Ionicons,
} from '@expo/vector-icons'

import theme from '../constants/theme'

import {
    getCampgrounds,
    getCampgroundsByPark,
} from '../api/npsApi'

// provides a searchable directory of national park campgrounds
// displays all campgrounds from explore or only one park when opened from park details
export default function CampgroundDirectoryScreen({
    route,
    navigation,
}) {
    const insets =
        useSafeAreaInsets()

    const parkId =
        route?.params?.parkId || null

    const [
        searchQuery,
        setSearchQuery,
    ] = useState('')

    const [
        campgrounds,
        setCampgrounds,
    ] = useState([])

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        error,
        setError,
    ] = useState(null)

    // loads all campgrounds from explore or only the selected park from park details
    useEffect(() => {
        let active = true

        async function loadCampgrounds() {
            try {
                setLoading(true)
                setError(null)

                if (parkId) {
                    const parkCampgrounds =
                        await getCampgroundsByPark(
                            parkId
                        )

                    if (active) {
                        setCampgrounds(
                            parkCampgrounds || []
                        )
                    }

                    return
                }

                const allCampgrounds =
                    await getCampgrounds()

                if (active) {
                    setCampgrounds(
                        allCampgrounds || []
                    )
                }
            } catch (loadError) {
                console.error(
                    'NPS campground directory error:',
                    loadError
                )

                if (active) {
                    setError(
                        'Unable to load campgrounds'
                    )
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadCampgrounds()

        return () => {
            active = false
        }
    }, [parkId])

    // adds the park name to campgrounds when the directory is opened for a single park
    const campgroundsWithPark =
        useMemo(() => {
            if (!parkId) {
                return campgrounds
            }

            return campgrounds.map(
                (campground) => ({
                    ...campground,
                    parkId:
                        campground.parkId ||
                        parkId,
                    parkName:
                        campground.parkName ||
                        '',
                })
            )
        }, [
            campgrounds,
            parkId,
        ])

    // searches campground names, park names, and descriptions
    const filteredCampgrounds =
        useMemo(() => {
            const query =
                searchQuery
                    .trim()
                    .toLowerCase()

            const sorted =
                [...campgroundsWithPark].sort(
                    (a, b) =>
                        (a.name || '').localeCompare(
                            b.name || ''
                        )
                )

            if (!query) {
                return sorted
            }

            return sorted.filter(
                (campground) =>
                    (campground.name || '')
                        .toLowerCase()
                        .includes(query) ||
                    (campground.parkName || '')
                        .toLowerCase()
                        .includes(query) ||
                    (campground.description || '')
                        .toLowerCase()
                        .includes(query)
            )
        }, [
            campgroundsWithPark,
            searchQuery,
        ])

    // opens the campground detail screen using the park and campground ids
    const openCampground = (
        campground
    ) => {
        navigation.navigate(
            'CampgroundDetail',
            {
                parkId:
                    campground.parkCode ||
                    campground.parkId,
                campgroundId:
                    campground.id,
            }
        )
    }

    if (loading) {
        return (
            <View
                style={
                    styles.loadingContainer
                }
            >
                <Text
                    style={
                        styles.loadingTitle
                    }
                >
                    Loading campgrounds...
                </Text>
            </View>
        )
    }

    if (error) {
        return (
            <View
                style={
                    styles.loadingContainer
                }
            >
                <Text
                    style={
                        styles.loadingTitle
                    }
                >
                    {error}
                </Text>

                <Pressable
                    onPress={() =>
                        navigation.goBack()
                    }
                    accessibilityRole="button"
                >
                    <Text
                        style={
                            styles.backButton
                        }
                    >
                        Go back
                    </Text>
                </Pressable>
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
                    accessibilityLabel="go back"
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
                        {parkId
                            ? 'Park'
                            : 'Explore'}
                    </Text>
                </Pressable>

                <Text
                    style={
                        styles.title
                    }
                >
                    Campgrounds
                </Text>

                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Find a place to stay
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
                    placeholder="Search campgrounds or parks"
                    placeholderTextColor={
                        theme.colors.earth
                    }
                    style={
                        styles.searchInput
                    }
                    returnKeyType="search"
                    accessibilityLabel="search campgrounds or parks"
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
                        accessibilityLabel="clear campground search"
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
                    {
                        filteredCampgrounds.length
                    }{' '}
                    {filteredCampgrounds.length ===
                    1
                        ? 'campground'
                        : 'campgrounds'}
                </Text>
            </View>

            <FlatList
                data={
                    filteredCampgrounds
                }
                keyExtractor={(
                    item,
                    index
                ) =>
                    `${item.parkCode || item.parkId || 'park'}-${item.id || index}`
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
                            styles.campgroundCard,
                            pressed &&
                                styles.pressed,
                        ]}
                        onPress={() =>
                            openCampground(
                                item
                            )
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`open ${item.name}`}
                    >
                        <View
                            style={
                                styles.campgroundIcon
                            }
                        >
                            <Text
                                style={
                                    styles.campgroundEmoji
                                }
                            >
                                🏕️
                            </Text>
                        </View>

                        <View
                            style={
                                styles.campgroundInfo
                            }
                        >
                            {!parkId &&
                                item.parkName ? (
                                <Text
                                    style={
                                        styles.parkName
                                    }
                                >
                                    {
                                        item.parkName
                                    }
                                </Text>
                            ) : null}

                            <Text
                                style={
                                    styles.campgroundName
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
                                {item.totalSites !==
                                    null &&
                                    item.totalSites !==
                                        undefined ? (
                                    <>
                                        <Text
                                            style={
                                                styles.meta
                                            }
                                        >
                                            {
                                                item.totalSites
                                            }{' '}
                                            sites
                                        </Text>

                                        <Text
                                            style={
                                                styles.metaDot
                                            }
                                        >
                                            ·
                                        </Text>
                                    </>
                                ) : null}

                                {item.rvOnly !==
                                    null &&
                                    item.rvOnly !==
                                        undefined &&
                                    Number(
                                        item.rvOnly
                                    ) >
                                        0 ? (
                                    <>
                                        <Text
                                            style={
                                                styles.meta
                                            }
                                        >
                                            RV
                                        </Text>

                                        <Text
                                            style={
                                                styles.metaDot
                                            }
                                        >
                                            ·
                                        </Text>
                                    </>
                                ) : null}

                                {item.tentOnly !==
                                    null &&
                                    item.tentOnly !==
                                        undefined &&
                                    Number(
                                        item.tentOnly
                                    ) >
                                        0 ? (
                                    <Text
                                        style={
                                            styles.meta
                                        }
                                    >
                                        tent
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
                            🏕️
                        </Text>

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No campgrounds found
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            Try searching for a
                            different campground
                            or park.
                        </Text>
                    </View>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.parchment,
        flex: 1,
    },

    loadingContainer: {
        alignItems: 'center',
        backgroundColor: theme.colors.parchment,
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },

    loadingTitle: {
        color: theme.colors.ink,
        fontSize: 18,
        fontWeight: '700',
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

    header: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
    },

    title: {
        color: theme.colors.ink,
        fontSize: 32,
        fontWeight: '800',
    },

    subtitle: {
        color: theme.colors.earth,
        fontSize: 14,
        marginTop: theme.spacing.xs,
    },

    searchContainer: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.md,
        flexDirection: 'row',
        marginHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.lg,
        minHeight: 50,
        paddingHorizontal: theme.spacing.md,
    },

    searchInput: {
        color: theme.colors.ink,
        flex: 1,
        fontSize: 14,
        marginLeft: theme.spacing.sm,
        minHeight: 48,
    },

    clearButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
    },

    resultHeader: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
    },

    resultCount: {
        color: theme.colors.earth,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },

    list: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xxxl,
    },

    campgroundCard: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.md,
        flexDirection: 'row',
        marginBottom: theme.spacing.sm,
        padding: theme.spacing.md,
        ...theme.shadows.card,
    },

    pressed: {
        opacity: 0.8,
    },

    campgroundIcon: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        borderRadius: 24,
        height: 48,
        justifyContent: 'center',
        width: 48,
    },

    campgroundEmoji: {
        fontSize: 22,
    },

    campgroundInfo: {
        flex: 1,
        marginHorizontal: theme.spacing.md,
    },

    parkName: {
        color: theme.colors.forest,
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },

    campgroundName: {
        color: theme.colors.ink,
        fontSize: 16,
        fontWeight: '750',
        marginTop: 3,
    },

    description: {
        color: theme.colors.earth,
        fontSize: 11,
        lineHeight: 16,
        marginTop: 4,
    },

    metaRow: {
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: theme.spacing.sm,
    },

    meta: {
        color: theme.colors.forest,
        fontSize: 10,
        fontWeight: '700',
    },

    metaDot: {
        color: theme.colors.earth,
        fontSize: 10,
        marginHorizontal: 5,
    },

    emptyState: {
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingTop: 80,
    },

    emptyIcon: {
        fontSize: 42,
    },

    emptyTitle: {
        color: theme.colors.ink,
        fontSize: 18,
        fontWeight: '700',
        marginTop: theme.spacing.md,
    },

    emptyText: {
        color: theme.colors.earth,
        fontSize: 12,
        lineHeight: 18,
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },
})