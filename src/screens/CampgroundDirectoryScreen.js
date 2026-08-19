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

import theme from '../constants/theme'
import mockParks from '../data/mockParks'

// provides a searchable directory of campgrounds across all mock parks
export default function CampgroundDirectoryScreen({
    navigation,
}) {
    const insets =
        useSafeAreaInsets()

    const [
        searchQuery,
        setSearchQuery,
    ] = useState('')

    // flattens the campground data stored inside each park
    // this keeps the directory compatible with the existing campground detail screen
    const allCampgrounds =
        useMemo(() => {
            return mockParks.flatMap(
                (park) =>
                    (park.campgrounds ||
                        []).map(
                        (campground) => ({
                            ...campground,
                            parkId:
                                park.id,
                            parkName:
                                park.name,
                        })
                    )
            )
        }, [])

    // searches campground names, park names, and campground descriptions
    const filteredCampgrounds =
        useMemo(() => {
            const query =
                searchQuery
                    .trim()
                    .toLowerCase()

            if (!query) {
                return allCampgrounds
            }

            return allCampgrounds.filter(
                (campground) =>
                    campground.name
                        .toLowerCase()
                        .includes(query) ||
                    campground.parkName
                        .toLowerCase()
                        .includes(query) ||
                    campground.description
                        .toLowerCase()
                        .includes(query)
            )
        }, [
            allCampgrounds,
            searchQuery,
        ])

    // opens the existing campground detail screen using the nested park data structure
    const openCampground = (
        campground
    ) => {
        navigation.navigate(
            'CampgroundDetail',
            {
                parkId:
                    campground.parkId,
                campgroundId:
                    campground.id,
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
                                <Text
                                    style={
                                        styles.meta
                                    }
                                >
                                    {
                                        item.sites
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
                                        item.season
                                    }
                                </Text>

                                {item
                                    .dogsAllowed ? (
                                    <>
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
                                            dogs
                                            allowed
                                        </Text>
                                    </>
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

        campgroundCard: {
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

        campgroundIcon: {
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

        campgroundEmoji: {
            fontSize: 22,
        },

        campgroundInfo: {
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

        campgroundName: {
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
            flexWrap:
                'wrap',
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