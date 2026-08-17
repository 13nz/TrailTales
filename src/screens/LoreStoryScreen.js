import React from 'react'

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

import theme from '../constants/theme'

// displays concise reference information for a lore entry
export default function LoreStoryScreen({
    route,
    navigation,
}) {
    const insets =
        useSafeAreaInsets()

    const {
        loreId,
    } = route.params

    const story =
        loreEntries.find(
            (entry) =>
                entry.id === loreId
        )

    const park =
        story
            ? loreParks.find(
                  (item) =>
                      item.id ===
                      story.parkId
              )
            : null

    if (!story || !park) {
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
                    Lore entry could not be found
                </Text>
            </View>
        )
    }

    // converts the internal category value into a readable label and icon
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

    const categoryInfo =
        getCategoryInfo(
            story.category
        )

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
                        accessibilityLabel="go back to lore"
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
                            Lore
                        </Text>
                    </Pressable>

                    <View
                        style={
                            styles.categoryBadge
                        }
                    >
                        <Ionicons
                            name={
                                categoryInfo.icon
                            }
                            size={14}
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
                </View>

                <Text
                    style={
                        styles.parkName
                    }
                >
                    {park.name}
                </Text>

                <Text
                    style={
                        styles.title
                    }
                >
                    {story.title}
                </Text>

                <Text
                    style={
                        styles.summary
                    }
                >
                    {story.summary}
                </Text>

                <View
                    style={
                        styles.divider
                    }
                />

                <View
                    style={
                        styles.infoSection
                    }
                >
                    <Text
                        style={
                            styles.sectionLabel
                        }
                    >
                        ABOUT
                    </Text>

                    <Text
                        style={
                            styles.description
                        }
                    >
                        {story.description}
                    </Text>
                </View>

                <View
                    style={
                        styles.locationCard
                    }
                >
                    <View
                        style={
                            styles.locationIcon
                        }
                    >
                        <Ionicons
                            name="location"
                            size={18}
                            color={
                                theme.colors.forest
                            }
                        />
                    </View>

                    <View
                        style={
                            styles.locationInfo
                        }
                    >
                        <Text
                            style={
                                styles.locationLabel
                            }
                        >
                            LOCATION
                        </Text>

                        <Text
                            style={
                                styles.locationText
                            }
                        >
                            {story.location}
                        </Text>
                    </View>
                </View>

                {story.source ? (
                    <View
                        style={
                            styles.sourceSection
                        }
                    >
                        <View
                            style={
                                styles.sourceHeader
                            }
                        >
                            <Ionicons
                                name="library-outline"
                                size={17}
                                color={
                                    theme.colors.forest
                                }
                            />

                            <Text
                                style={
                                    styles.sourceTitle
                                }
                            >
                                Source
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.sourceText
                            }
                        >
                            {story.source}
                        </Text>

                        {story.sourceUrl ? (
                            <Pressable
                                onPress={() => {
                                    // source links will be connected when real lore is added
                                }}
                                accessibilityRole="link"
                                accessibilityLabel="open lore source"
                            >
                                <Text
                                    style={
                                        styles.sourceLink
                                    }
                                >
                                    View source
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>
                ) : (
                    <View
                        style={
                            styles.placeholderSource
                        }
                    >
                        <Ionicons
                            name="information-circle-outline"
                            size={17}
                            color={
                                theme.colors.earth
                            }
                        />

                        <Text
                            style={
                                styles.placeholderSourceText
                            }
                        >
                            Source information will
                            appear here when real lore
                            is added.
                        </Text>
                    </View>
                )}

                {story.campfireEligible &&
                story.campfireStory ? (
                    <Pressable
                        style={
                            styles.campfireButton
                        }
                        onPress={() =>
                            navigation.navigate(
                                'CampfireStory',
                                {
                                    parkId:
                                        story.parkId,
                                    loreId:
                                        story.id,
                                }
                            )
                        }
                        accessibilityRole="button"
                        accessibilityLabel="hear this story in campfire mode"
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
                                Hear the story
                            </Text>

                            <Text
                                style={
                                    styles.campfireText
                                }
                            >
                                Enter Campfire Mode
                            </Text>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#E7C48A"
                        />
                    </Pressable>
                ) : null}
            </ScrollView>
        </View>
    )
}

const styles =
    StyleSheet.create({
        container: {
            backgroundColor:
                theme.colors.parchment,
            flex: 1,
        },

        content: {
            padding:
                theme.spacing.md,
            paddingBottom:
                theme.spacing.xl * 2,
        },

        header: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent:
                'space-between',
            marginBottom:
                theme.spacing.xl,
        },

        backButton: {
            alignItems: 'center',
            flexDirection: 'row',
        },

        backText: {
            color:
                theme.colors.forest,
            fontSize: 13,
            fontWeight: '600',
            marginLeft: 2,
        },

        categoryBadge: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.sage,
            borderRadius: 14,
            flexDirection: 'row',
            paddingHorizontal: 10,
            paddingVertical: 6,
        },

        categoryText: {
            color:
                theme.colors.forest,
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 0.6,
            marginLeft: 5,
        },

        parkName: {
            color:
                theme.colors.forest,
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
        },

        title: {
            color:
                theme.colors.ink,
            fontSize: 32,
            fontWeight: '800',
            lineHeight: 38,
            marginTop:
                theme.spacing.xs,
        },

        summary: {
            color:
                theme.colors.earth,
            fontSize: 15,
            fontStyle: 'italic',
            lineHeight: 23,
            marginTop:
                theme.spacing.md,
        },

        divider: {
            backgroundColor:
                theme.colors.sage,
            height: 1,
            marginVertical:
                theme.spacing.xl,
        },

        infoSection: {
            marginBottom:
                theme.spacing.xl,
        },

        sectionLabel: {
            color:
                theme.colors.forest,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 1.5,
            marginBottom:
                theme.spacing.sm,
        },

        description: {
            color:
                theme.colors.ink,
            fontSize: 15,
            lineHeight: 24,
        },

        locationCard: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.canvas,
            borderColor:
                theme.colors.sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            flexDirection: 'row',
            padding:
                theme.spacing.md,
        },

        locationIcon: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.sage,
            borderRadius: 20,
            height: 40,
            justifyContent:
                'center',
            width: 40,
        },

        locationInfo: {
            flex: 1,
            marginLeft:
                theme.spacing.md,
        },

        locationLabel: {
            color:
                theme.colors.earth,
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 1,
        },

        locationText: {
            color:
                theme.colors.ink,
            fontSize: 13,
            fontWeight: '600',
            marginTop: 3,
        },

        sourceSection: {
            backgroundColor:
                theme.colors.canvas,
            borderColor:
                theme.colors.sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            marginTop:
                theme.spacing.md,
            padding:
                theme.spacing.md,
        },

        sourceHeader: {
            alignItems: 'center',
            flexDirection: 'row',
        },

        sourceTitle: {
            color:
                theme.colors.ink,
            fontSize: 13,
            fontWeight: '700',
            marginLeft:
                theme.spacing.xs,
        },

        sourceText: {
            color:
                theme.colors.earth,
            fontSize: 12,
            lineHeight: 18,
            marginTop:
                theme.spacing.sm,
        },

        sourceLink: {
            color:
                theme.colors.forest,
            fontSize: 12,
            fontWeight: '700',
            marginTop:
                theme.spacing.sm,
            textDecorationLine:
                'underline',
        },

        placeholderSource: {
            alignItems: 'flex-start',
            flexDirection: 'row',
            marginTop:
                theme.spacing.xl,
        },

        placeholderSourceText: {
            color:
                theme.colors.earth,
            flex: 1,
            fontSize: 11,
            lineHeight: 17,
            marginLeft:
                theme.spacing.sm,
        },

        campfireButton: {
            alignItems: 'center',
            backgroundColor:
                '#30261E',
            borderRadius:
                theme.radii.md,
            flexDirection: 'row',
            marginTop:
                theme.spacing.xl,
            minHeight: 76,
            padding:
                theme.spacing.md,
        },

        campfireIcon: {
            alignItems: 'center',
            backgroundColor:
                '#4A3325',
            borderRadius: 22,
            height: 44,
            justifyContent:
                'center',
            width: 44,
        },

        campfireEmoji: {
            fontSize: 22,
        },

        campfireInfo: {
            flex: 1,
            marginHorizontal:
                theme.spacing.md,
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

        errorText: {
            color:
                theme.colors.earth,
            fontSize: 15,
            margin:
                theme.spacing.xl,
            textAlign: 'center',
        },
    })