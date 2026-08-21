import React, {
    useMemo,
} from 'react'

import {
    View,
    Text,
    Pressable,
    FlatList,
    StyleSheet,
} from 'react-native'

import {
    Ionicons,
} from '@expo/vector-icons'

import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

import {
    loreParks,
    loreEntries,
} from '../data/mockLore'

// displays all available campfire stories for the selected park
export default function CampfireSelectionScreen({
    route,
    navigation,
}) {
    const insets =
        useSafeAreaInsets()

    const {
        parkId,
    } = route.params

    const park =
        loreParks.find(
            (item) =>
                item.id === parkId
        )

    // only stories that can actually be experienced in campfire mode are shown
    const campfireStories =
        useMemo(() => {
            return loreEntries.filter(
                (entry) =>
                    entry.parkId ===
                        parkId &&
                    entry.campfireEligible &&
                    entry.campfireStory
            )
        }, [parkId])

    // opens the selected story inside the immersive campfire experience
    const openStory = (
        storyId
    ) => {
        navigation.navigate(
            'CampfireStory',
            {
                parkId,
                loreId: storyId,
            }
        )
    }

    if (!park) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        paddingTop:
                            insets.top,
                    },
                ]}
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

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop:
                        insets.top,
                },
            ]}
        >
            <FlatList
                data={
                    campfireStories
                }
                keyExtractor={(
                    item
                ) => item.id}
                contentContainerStyle={
                    styles.content
                }
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
                                accessibilityLabel="leave campfire story selection"
                            >
                                <Ionicons
                                    name="chevron-back"
                                    size={22}
                                    color="#E7D8C5"
                                />

                                <Text
                                    style={
                                        styles.backText
                                    }
                                >
                                    {park.name}
                                </Text>
                            </Pressable>

                            <Text
                                style={
                                    styles.fire
                                }
                            >
                                🔥
                            </Text>

                            <Text
                                style={
                                    styles.title
                                }
                            >
                                Campfire
                            </Text>

                            <Text
                                style={
                                    styles.subtitle
                                }
                            >
                                Stories from{' '}
                                {park.name}
                            </Text>
                        </View>

                        <View
                            style={
                                styles.divider
                            }
                        />

                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Choose a story
                        </Text>
                    </>
                }
                renderItem={({
                    item,
                }) => (
                    <Pressable
                        style={
                            styles.storyCard
                        }
                        onPress={() =>
                            openStory(
                                item.id
                            )
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`hear ${item.campfireStory.title}`}
                    >
                        <View
                            style={
                                styles.cardContent
                            }
                        >
                            <Text
                                style={
                                    styles.category
                                }
                            >
                                {item.category.toUpperCase()}
                            </Text>

                            <Text
                                style={
                                    styles.storyTitle
                                }
                            >
                                {
                                    item
                                        .campfireStory
                                        .title
                                }
                            </Text>

                            <Text
                                style={
                                    styles.summary
                                }
                            >
                                {item.summary}
                            </Text>
                        </View>

                        <View
                            style={
                                styles.arrow
                            }
                        >
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#C09A67"
                            />
                        </View>
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
                                styles.emptyFire
                            }
                        >
                            🔥
                        </Text>

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No stories yet
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            More campfire stories
                            will appear here as
                            they are added.
                        </Text>
                    </View>
                }
            />
        </View>
    )
}

const styles =
    StyleSheet.create({
        container: {
            backgroundColor: '#11100E',
            flex: 1,
        },

        content: {
            paddingHorizontal: 20,
            paddingBottom: 50,
        },

        header: {
            paddingTop: 10,
        },

        backButton: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingVertical: 8,
        },

        backText: {
            color: '#C8BBAA',
            fontSize: 13,
            fontWeight: '600',
            marginLeft: 2,
        },

        fire: {
            fontSize: 42,
            marginTop: 28,
        },

        title: {
            color: '#F1E7D8',
            fontSize: 34,
            fontWeight: '800',
            marginTop: 5,
        },

        subtitle: {
            color: '#8F8375',
            fontSize: 13,
            marginTop: 4,
        },

        divider: {
            backgroundColor: '#39332D',
            height: 1,
            marginVertical: 24,
        },

        sectionTitle: {
            color: '#C8BBAA',
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 1,
            marginBottom: 12,
            textTransform: 'uppercase',
        },

        storyCard: {
            alignItems: 'center',
            backgroundColor: '#1B1916',
            borderColor: '#38322C',
            borderRadius: 14,
            borderWidth: 1,
            flexDirection: 'row',
            marginBottom: 10,
            minHeight: 115,
            padding: 16,
        },

        cardContent: {
            flex: 1,
        },

        category: {
            color: '#B87942',
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 1.2,
        },

        storyTitle: {
            color: '#E9DED0',
            fontSize: 17,
            fontWeight: '750',
            lineHeight: 22,
            marginTop: 5,
        },

        summary: {
            color: '#8F8375',
            fontSize: 11,
            lineHeight: 17,
            marginTop: 5,
        },

        arrow: {
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 10,
        },

        emptyState: {
            alignItems: 'center',
            paddingVertical: 80,
        },

        emptyFire: {
            fontSize: 42,
        },

        emptyTitle: {
            color: '#E9DED0',
            fontSize: 17,
            fontWeight: '700',
            marginTop: 15,
        },

        emptyText: {
            color: '#8F8375',
            fontSize: 12,
            lineHeight: 18,
            marginTop: 6,
            maxWidth: 260,
            textAlign: 'center',
        },

        errorText: {
            color: '#C8BBAA',
            fontSize: 15,
            margin: 30,
            textAlign: 'center',
        },
    })