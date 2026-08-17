import React, {
    useMemo,
    useState,
} from 'react'

import {
    View,
    Text,
    Pressable,
    ScrollView,
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

// displays lore as an immersive nighttime storytelling experience
export default function CampfireScreen({
    route,
    navigation,
}) {
    const insets =
        useSafeAreaInsets()

    const {
        parkId,
        initialLoreId,
    } = route.params

    const [
        currentIndex,
        setCurrentIndex,
    ] = useState(() => {
        const initialIndex =
            loreEntries.findIndex(
                (entry) =>
                    entry.id ===
                    initialLoreId
            )

        return initialIndex >= 0
            ? initialIndex
            : 0
    })

    const park =
        loreParks.find(
            (item) =>
                item.id === parkId
        )

    // only stories belonging to the selected park and marked for campfire mode are shown
    const campfireEntries =
        useMemo(() => {
            return loreEntries.filter(
                (entry) =>
                    entry.parkId ===
                        parkId &&
                    entry.campfireEligible &&
                    entry.campfireStory
            )
        }, [parkId])

    const currentEntry =
        campfireEntries[
            currentIndex
        ]

    if (
        !park ||
        !currentEntry ||
        !currentEntry.campfireStory
    ) {
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
                <Pressable
                    style={
                        styles.closeButton
                    }
                    onPress={() =>
                        navigation.goBack()
                    }
                    accessibilityRole="button"
                    accessibilityLabel="exit campfire mode"
                >
                    <Ionicons
                        name="close"
                        size={24}
                        color="#E8DCCB"
                    />
                </Pressable>

                <Text
                    style={
                        styles.errorText
                    }
                >
                    No campfire stories are available
                    for this park yet
                </Text>
            </View>
        )
    }

    const hasPrevious =
        currentIndex > 0

    const hasNext =
        currentIndex <
        campfireEntries.length - 1

    // moves to the previous campfire story without leaving campfire mode
    const showPrevious = () => {
        if (!hasPrevious) {
            return
        }

        setCurrentIndex(
            (index) =>
                index - 1
        )
    }

    // moves to the next campfire story without leaving campfire mode
    const showNext = () => {
        if (!hasNext) {
            return
        }

        setCurrentIndex(
            (index) =>
                index + 1
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
            <ScrollView
                contentContainerStyle={
                    styles.content
                }
                showsVerticalScrollIndicator={
                    false
                }
            >
                <View
                    style={
                        styles.topBar
                    }
                >
                    <Pressable
                        style={
                            styles.exitButton
                        }
                        onPress={() =>
                            navigation.goBack()
                        }
                        accessibilityRole="button"
                        accessibilityLabel="exit campfire mode"
                    >
                        <Ionicons
                            name="close"
                            size={22}
                            color="#E8DCCB"
                        />

                        <Text
                            style={
                                styles.exitText
                            }
                        >
                            Exit
                        </Text>
                    </Pressable>

                    <View
                        style={
                            styles.modeLabel
                        }
                    >
                        <Text
                            style={
                                styles.modeEmoji
                            }
                        >
                            🔥
                        </Text>

                        <Text
                            style={
                                styles.modeText
                            }
                        >
                            CAMPFIRE MODE
                        </Text>
                    </View>
                </View>

                <View
                    style={
                        styles.campfireArea
                    }
                >
                    <View
                        style={
                            styles.moon
                        }
                    />

                    <View
                        style={
                            styles.stars
                        }
                    >
                        <Text
                            style={[
                                styles.star,
                                styles.starOne,
                            ]}
                        >
                            ·
                        </Text>

                        <Text
                            style={[
                                styles.star,
                                styles.starTwo,
                            ]}
                        >
                            ·
                        </Text>

                        <Text
                            style={[
                                styles.star,
                                styles.starThree,
                            ]}
                        >
                            ·
                        </Text>

                        <Text
                            style={[
                                styles.star,
                                styles.starFour,
                            ]}
                        >
                            ·
                        </Text>
                    </View>

                    <View
                        style={
                            styles.fireGlow
                        }
                    />

                    <Text
                        style={
                            styles.fire
                        }
                    >
                        🔥
                    </Text>

                    <Text
                        style={
                            styles.parkLabel
                        }
                    >
                        {park.name.toUpperCase()}
                    </Text>
                </View>

                <View
                    style={
                        styles.storyHeader
                    }
                >
                    <Text
                        style={
                            styles.category
                        }
                    >
                        {currentEntry.category.toUpperCase()}
                    </Text>

                    <Text
                        style={
                            styles.title
                        }
                    >
                        {
                            currentEntry
                                .campfireStory
                                .title
                        }
                    </Text>
                </View>

                <View
                    style={
                        styles.storyDivider
                    }
                />

                <Text
                    style={
                        styles.storyText
                    }
                >
                    {
                        currentEntry
                            .campfireStory
                            .content
                    }
                </Text>

                <View
                    style={
                        styles.navigationArea
                    }
                >
                    <Text
                        style={
                            styles.progress
                        }
                    >
                        {currentIndex + 1}{' '}
                        /{' '}
                        {
                            campfireEntries.length
                        }
                    </Text>

                    <View
                        style={
                            styles.navigationButtons
                        }
                    >
                        <Pressable
                            style={[
                                styles.storyButton,
                                !hasPrevious &&
                                    styles.storyButtonDisabled,
                            ]}
                            onPress={
                                showPrevious
                            }
                            disabled={
                                !hasPrevious
                            }
                            accessibilityRole="button"
                            accessibilityLabel="previous campfire story"
                        >
                            <Ionicons
                                name="chevron-back"
                                size={20}
                                color={
                                    hasPrevious
                                        ? '#E8DCCB'
                                        : '#655B51'
                                }
                            />

                            <Text
                                style={[
                                    styles.storyButtonText,
                                    !hasPrevious &&
                                        styles.storyButtonTextDisabled,
                                ]}
                            >
                                Previous
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.storyButton,
                                !hasNext &&
                                    styles.storyButtonDisabled,
                            ]}
                            onPress={
                                showNext
                            }
                            disabled={
                                !hasNext
                            }
                            accessibilityRole="button"
                            accessibilityLabel="next campfire story"
                        >
                            <Text
                                style={[
                                    styles.storyButtonText,
                                    !hasNext &&
                                        styles.storyButtonTextDisabled,
                                ]}
                            >
                                Next
                            </Text>

                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={
                                    hasNext
                                        ? '#E8DCCB'
                                        : '#655B51'
                                }
                            />
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

const styles =
    StyleSheet.create({
        container: {
            backgroundColor:
                '#11100E',
            flex: 1,
        },

        content: {
            minHeight:
                '100%',
            paddingHorizontal: 20,
            paddingBottom: 50,
        },

        topBar: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent:
                'space-between',
            paddingVertical: 14,
        },

        exitButton: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingVertical: 8,
        },

        exitText: {
            color: '#C8BBAA',
            fontSize: 12,
            fontWeight: '600',
            marginLeft: 4,
        },

        modeLabel: {
            alignItems: 'center',
            flexDirection: 'row',
        },

        modeEmoji: {
            fontSize: 14,
        },

        modeText: {
            color: '#8F8375',
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 1.3,
            marginLeft: 5,
        },

        campfireArea: {
            alignItems: 'center',
            height: 245,
            justifyContent:
                'flex-end',
            overflow: 'hidden',
            position: 'relative',
        },

        moon: {
            backgroundColor:
                '#D8D0BA',
            borderRadius: 35,
            height: 52,
            opacity: 0.75,
            position: 'absolute',
            right: 30,
            top: 20,
            width: 52,
        },

        stars: {
            height: 150,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
        },

        star: {
            color: '#C8BBAA',
            fontSize: 30,
            opacity: 0.6,
            position: 'absolute',
        },

        starOne: {
            left: '12%',
            top: 35,
        },

        starTwo: {
            left: '34%',
            top: 70,
        },

        starThree: {
            right: '28%',
            top: 40,
        },

        starFour: {
            right: '10%',
            top: 95,
        },

        fireGlow: {
            backgroundColor:
                '#B85F2C',
            borderRadius: 100,
            bottom: 5,
            height: 130,
            opacity: 0.16,
            position: 'absolute',
            width: 170,
        },

        fire: {
            fontSize: 82,
            marginBottom: 10,
            textShadowColor:
                '#C15F28',
            textShadowOffset: {
                width: 0,
                height: 0,
            },
            textShadowRadius: 25,
        },

        parkLabel: {
            bottom: 0,
            color: '#8F8375',
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 2,
            position: 'absolute',
        },

        storyHeader: {
            alignItems: 'center',
            marginTop: 20,
        },

        category: {
            color: '#B87942',
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 1.5,
        },

        title: {
            color: '#F1E7D8',
            fontSize: 29,
            fontWeight: '800',
            lineHeight: 35,
            marginTop: 7,
            textAlign: 'center',
        },

        storyDivider: {
            backgroundColor:
                '#3A342D',
            height: 1,
            marginHorizontal: 45,
            marginVertical: 25,
        },

        storyText: {
            color: '#D4C8B9',
            fontSize: 16,
            lineHeight: 27,
            textAlign: 'left',
        },

        navigationArea: {
            marginTop: 35,
        },

        progress: {
            color: '#766C61',
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1,
            textAlign: 'center',
        },

        navigationButtons: {
            flexDirection: 'row',
            gap: 10,
            marginTop: 15,
        },

        storyButton: {
            alignItems: 'center',
            borderColor: '#4A423A',
            borderRadius: 12,
            borderWidth: 1,
            flex: 1,
            flexDirection: 'row',
            justifyContent:
                'center',
            minHeight: 48,
            paddingHorizontal: 10,
        },

        storyButtonDisabled: {
            borderColor: '#292621',
        },

        storyButtonText: {
            color: '#D8CCBD',
            fontSize: 12,
            fontWeight: '700',
            marginHorizontal: 4,
        },

        storyButtonTextDisabled: {
            color: '#655B51',
        },

        errorText: {
            color: '#C8BBAA',
            fontSize: 15,
            lineHeight: 22,
            marginHorizontal: 30,
            marginTop: 100,
            textAlign: 'center',
        },

        closeButton: {
            alignSelf: 'flex-end',
            padding: 15,
        },
    })