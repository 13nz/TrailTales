import {
    View,
    Text,
    Pressable,
    TextInput,
    FlatList,
    StyleSheet,
} from 'react-native'

import { useMemo, useState } from 'react'

import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

import { Ionicons } from '@expo/vector-icons'

import theme from '../constants/theme'
import mockActivities from '../data/mockActivities'

// provides a searchable directory of park activities
// the mock data follows the structure we will use when connecting to the nps things to do endpoint
export default function ActivityDirectoryScreen({
    navigation,
}) {
    const insets =
        useSafeAreaInsets()

    const [
        searchQuery,
        setSearchQuery,
    ] = useState('')

    // filters activities using the same fields that will be useful when nps data is connected
    const filteredActivities =
        useMemo(() => {
            const query =
                searchQuery
                    .trim()
                    .toLowerCase()

            if (!query) {
                return mockActivities
            }

            return mockActivities.filter(
                (activity) => {
                    return (
                        activity.title
                            .toLowerCase()
                            .includes(query) ||
                        activity.parkName
                            .toLowerCase()
                            .includes(query) ||
                        activity.location
                            .toLowerCase()
                            .includes(query) ||
                        activity.shortDescription
                            .toLowerCase()
                            .includes(query)
                    )
                }
            )
        }, [searchQuery])

    // opens the activity detail screen for the selected activity
    const handleActivityPress = (
        activity
    ) => {
        navigation.navigate(
            'ActivityDetail',
            {
                activityId:
                    activity.id,
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
                    Activities
                </Text>

                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Things to do in national parks
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
                    placeholder="Search activities or parks"
                    placeholderTextColor={
                        theme.colors.earth
                    }
                    style={
                        styles.searchInput
                    }
                    returnKeyType="search"
                    accessibilityLabel="search activities or parks"
                />

                {searchQuery.length >
                0 ? (
                    <Pressable
                        onPress={() => {
                            // clears the current activity search
                            setSearchQuery('')
                        }}
                        style={
                            styles.clearButton
                        }
                        accessibilityRole="button"
                        accessibilityLabel="clear activity search"
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

            <Text
                style={
                    styles.resultCount
                }
            >
                {filteredActivities.length}{' '}
                {filteredActivities.length ===
                1
                    ? 'activity'
                    : 'activities'}
            </Text>

            <FlatList
                data={
                    filteredActivities
                }
                keyExtractor={(
                    item
                ) =>
                    item.id
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
                    <Pressable
                        style={({
                            pressed,
                        }) => [
                            styles.activityCard,
                            pressed &&
                                styles.pressed,
                        ]}
                        onPress={() =>
                            handleActivityPress(
                                item
                            )
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`open ${item.title}`}
                    >
                        <View
                            style={
                                styles.activityIcon
                            }
                        >
                            <Ionicons
                                name="sparkles-outline"
                                size={24}
                                color={
                                    theme.colors.forest
                                }
                            />
                        </View>

                        <View
                            style={
                                styles.activityContent
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
                                    styles.activityTitle
                                }
                            >
                                {
                                    item.title
                                }
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
                                    item.shortDescription
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
                                        item.duration
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.metaDivider
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
                        <Ionicons
                            name="sparkles-outline"
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
                            No activities found
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            Try searching for a
                            different activity or
                            park.
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
                theme.spacing.md,
            textTransform:
                'uppercase',
        },

        list: {
            padding:
                theme.spacing.lg,
            paddingBottom:
                theme.spacing.xxxl,
        },

        activityCard: {
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

        activityIcon: {
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

        activityContent: {
            flex: 1,
            marginHorizontal:
                theme.spacing.md,
        },

        parkName: {
            color:
                theme.colors.forest,
            fontSize: 9,
            fontWeight: '700',
            letterSpacing: 0.8,
            textTransform:
                'uppercase',
        },

        activityTitle: {
            color:
                theme.colors.ink,
            fontSize: 16,
            fontWeight: '700',
            marginTop: 3,
        },

        description: {
            color:
                theme.colors.earth,
            fontSize: 11,
            lineHeight: 17,
            marginTop: 5,
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

        metaDivider: {
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