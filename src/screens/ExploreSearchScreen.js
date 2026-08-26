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
} from '../api/npsApi'

// provides one search experience across the main explore content types
// the result structure keeps navigation separate from the search implementation
export default function ExploreSearchScreen({
    route,
    navigation,
}) {
    const insets =
        useSafeAreaInsets()

    const initialQuery =
        route.params?.query || ''

    const [
        searchQuery,
        setSearchQuery,
    ] = useState(initialQuery)

    // stores the official national parks returned by the nps api
    const [
        parks,
        setParks,
    ] = useState([])

    // controls the initial api loading state
    const [
        loadingParks,
        setLoadingParks,
    ] = useState(true)

    // stores an api error without crashing the search screen
    const [
        parkError,
        setParkError,
    ] = useState(null)

    /*
     * loads the national parks through the shared nps api function.
     *
     * getAllParks() now caches the result, so opening this screen
     * does not create another nps request when the parks are already loaded.
     */
    useEffect(() => {
        let active = true

        async function loadParks() {
            try {
                setLoadingParks(true)
                setParkError(null)

                const apiParks =
                    await getAllParks()

                if (!active) {
                    return
                }

                setParks(
                    apiParks || []
                )
            } catch (error) {
                console.error(
                    'nps explore search parks error:',
                    error
                )

                if (active) {
                    setParks([])
                    setParkError(
                        'Unable to load national parks.'
                    )
                }
            } finally {
                if (active) {
                    setLoadingParks(false)
                }
            }
        }

        loadParks()

        return () => {
            active = false
        }
    }, [])

    /*
     * creates the searchable park collection from the official
     * nps data instead of the old mock park data.
     */
    const searchItems =
        parks.map(
            (park) => ({
                id: park.id,
                type: 'park',
                title:
                    park.name ||
                    'National Park',
                subtitle:
                    park.states?.join(
                        ' · '
                    ) ||
                    'United States',
                description:
                    park.description ||
                    '',
                parkId: park.id,
            })
        )

    // searches park names, states, and descriptions locally
    const filteredResults =
        searchItems.filter(
            (item) => {
                const query =
                    searchQuery
                        .trim()
                        .toLowerCase()

                if (!query) {
                    return false
                }

                return (
                    item.title
                        .toLowerCase()
                        .includes(
                            query
                        ) ||
                    item.subtitle
                        .toLowerCase()
                        .includes(
                            query
                        ) ||
                    item.description
                        .toLowerCase()
                        .includes(
                            query
                        )
                )
            }
        )

    // sends each result to the existing nps park detail screen
    const handleResultPress = (
        item
    ) => {
        if (
            item.type ===
            'park'
        ) {
            navigation.navigate(
                'ParkDetail',
                {
                    parkId:
                        item.parkId,
                }
            )
        }
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
                    Search
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
                    placeholder="Search parks, trails, and more"
                    placeholderTextColor={
                        theme.colors.earth
                    }
                    style={
                        styles.searchInput
                    }
                    autoFocus
                    returnKeyType="search"
                    accessibilityLabel="explore search"
                />

                {searchQuery.length >
                0 ? (
                    <Pressable
                        onPress={() => {
                            // clears the search so the user can start a new query
                            setSearchQuery('')
                        }}
                        style={
                            styles.clearButton
                        }
                        accessibilityRole="button"
                        accessibilityLabel="clear explore search"
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

            {searchQuery.trim()
                .length === 0 ? (
                <View
                    style={
                        styles.initialState
                    }
                >
                    <Ionicons
                        name="search-outline"
                        size={42}
                        color={
                            theme.colors.forest
                        }
                    />

                    <Text
                        style={
                            styles.initialTitle
                        }
                    >
                        Explore TrailTales
                    </Text>

                    <Text
                        style={
                            styles.initialText
                        }
                    >
                        Search for a park, trail,
                        or campground.
                    </Text>
                </View>
            ) : loadingParks ? (
                <View
                    style={
                        styles.emptyState
                    }
                >
                    <Ionicons
                        name="leaf-outline"
                        size={42}
                        color={
                            theme.colors.forest
                        }
                    />

                    <Text
                        style={
                            styles.emptyTitle
                        }
                    >
                        Loading parks...
                    </Text>

                    <Text
                        style={
                            styles.emptyText
                        }
                    >
                        Getting national parks
                        from the National Park
                        Service.
                    </Text>
                </View>
            ) : parkError ? (
                <View
                    style={
                        styles.emptyState
                    }
                >
                    <Ionicons
                        name="alert-circle-outline"
                        size={42}
                        color={
                            theme.colors.forest
                        }
                    />

                    <Text
                        style={
                            styles.emptyTitle
                        }
                    >
                        Unable to load parks
                    </Text>

                    <Text
                        style={
                            styles.emptyText
                        }
                    >
                        {parkError}
                    </Text>
                </View>
            ) : (
                <>
                    <Text
                        style={
                            styles.resultCount
                        }
                    >
                        {filteredResults.length}{' '}
                        {filteredResults.length ===
                        1
                            ? 'result'
                            : 'results'}
                    </Text>

                    <FlatList
                        data={
                            filteredResults
                        }
                        keyExtractor={(
                            item
                        ) =>
                            `${item.type}-${item.id}`
                        }
                        contentContainerStyle={
                            styles.list
                        }
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={
                            false
                        }
                        renderItem={({
                            item,
                        }) => (
                            <SearchResult
                                item={
                                    item
                                }
                                onPress={() =>
                                    handleResultPress(
                                        item
                                    )
                                }
                            />
                        )}
                        ListEmptyComponent={
                            <View
                                style={
                                    styles.emptyState
                                }
                            >
                                <Ionicons
                                    name="leaf-outline"
                                    size={42}
                                    color={
                                        theme.colors.forest
                                    }
                                />

                                <Text
                                    style={
                                        styles.emptyTitle
                                    }
                                >
                                    Nothing found
                                </Text>

                                <Text
                                    style={
                                        styles.emptyText
                                    }
                                >
                                    Try searching for
                                    a different
                                    national park.
                                </Text>
                            </View>
                        }
                    />
                </>
            )}
        </View>
    )
}

// renders a consistent result card for every explore content type
function SearchResult({
    item,
    onPress,
}) {
    const typeInfo =
        getTypeInfo(
            item.type
        )

    return (
        <Pressable
            style={({
                pressed,
            }) => [
                styles.resultCard,
                pressed &&
                    styles.pressed,
            ]}
            onPress={
                onPress
            }
            accessibilityRole="button"
            accessibilityLabel={`open ${item.title}`}
        >
            <View
                style={
                    styles.resultIcon
                }
            >
                <Ionicons
                    name={
                        typeInfo.icon
                    }
                    size={23}
                    color={
                        theme.colors.forest
                    }
                />
            </View>

            <View
                style={
                    styles.resultContent
                }
            >
                <Text
                    style={
                        styles.resultType
                    }
                >
                    {
                        typeInfo.label
                    }
                </Text>

                <Text
                    style={
                        styles.resultTitle
                    }
                    numberOfLines={
                        2
                    }
                >
                    {
                        item.title
                    }
                </Text>

                <Text
                    style={
                        styles.resultSubtitle
                    }
                    numberOfLines={
                        1
                    }
                >
                    {
                        item.subtitle
                    }
                </Text>
            </View>

            <Ionicons
                name="chevron-forward"
                size={20}
                color={
                    theme.colors.earth
                }
            />
        </Pressable>
    )
}

// keeps the search result presentation consistent while allowing each content type to have its own icon
function getTypeInfo(
    type
) {
    if (
        type === 'park'
    ) {
        return {
            label: 'National Park',
            icon: 'image-outline',
        }
    }

    if (
        type === 'trail'
    ) {
        return {
            label: 'Trail',
            icon: 'walk-outline',
        }
    }

    if (
        type ===
        'campground'
    ) {
        return {
            label: 'Campground',
            icon: 'bonfire-outline',
        }
    }

    return {
        label: 'Activity',
        icon: 'sparkles-outline',
    }
}

const styles = StyleSheet.create({
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
        alignSelf:
            'flex-start',
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

    searchContainer: {
        alignItems:
            'center',
        backgroundColor:
            theme.colors.canvas,
        borderColor:
            theme.colors.sage,
        borderRadius:
            theme.radii.md,
        borderWidth: 1,
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

    resultCount: {
        color:
            theme.colors.earth,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginHorizontal:
            theme.spacing.lg,
        marginTop:
            theme.spacing.lg,
        textTransform:
            'uppercase',
    },

    list: {
        padding:
            theme.spacing.lg,
        paddingBottom:
            theme.spacing.xxxl,
    },

    resultCard: {
        alignItems:
            'center',
        backgroundColor:
            theme.colors.canvas,
        borderColor:
            theme.colors.sage,
        borderRadius:
            theme.radii.md,
        borderWidth: 1,
        flexDirection:
            'row',
        marginBottom:
            theme.spacing.sm,
        padding:
            theme.spacing.md,
    },

    pressed: {
        opacity: 0.8,
    },

    resultIcon: {
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

    resultContent: {
        flex: 1,
        marginHorizontal:
            theme.spacing.md,
    },

    resultType: {
        color:
            theme.colors.forest,
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.8,
        textTransform:
            'uppercase',
    },

    resultTitle: {
        color:
            theme.colors.ink,
        fontSize: 15,
        fontWeight: '700',
        marginTop: 3,
    },

    resultSubtitle: {
        color:
            theme.colors.earth,
        fontSize: 11,
        marginTop: 3,
    },

    initialState: {
        alignItems:
            'center',
        flex: 1,
        justifyContent:
            'center',
        paddingHorizontal:
            theme.spacing.xxl,
    },

    initialTitle: {
        color:
            theme.colors.ink,
        fontSize: 20,
        fontWeight: '700',
        marginTop:
            theme.spacing.md,
    },

    initialText: {
        color:
            theme.colors.earth,
        fontSize: 13,
        lineHeight: 20,
        marginTop:
            theme.spacing.xs,
        textAlign:
            'center',
    },

    emptyState: {
        alignItems:
            'center',
        paddingHorizontal:
            theme.spacing.xxl,
        paddingTop: 80,
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