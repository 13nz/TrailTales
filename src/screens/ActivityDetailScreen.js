import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
} from 'react-native'

import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

import {
    Ionicons,
} from '@expo/vector-icons'

import theme from '../constants/theme'
import mockActivities from '../data/mockActivities'

// displays the full information for a selected park activity
// the screen uses nps-style things to do fields so the mock data can be replaced by api data later
export default function ActivityDetailScreen({
    route,
    navigation,
}) {
    const insets =
        useSafeAreaInsets()

    const {
        activityId,
    } = route.params

    // finds the selected activity using the stable id stored in the mock data
    const activity =
        mockActivities.find(
            (item) =>
                item.id ===
                activityId
        )

    if (!activity) {
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
                        Back
                    </Text>
                </Pressable>

                <View
                    style={
                        styles.errorState
                    }
                >
                    <Text
                        style={
                            styles.errorTitle
                        }
                    >
                        Activity not found
                    </Text>

                    <Text
                        style={
                            styles.errorText
                        }
                    >
                        This activity is no longer
                        available.
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <View
            style={
                styles.screen
            }
        >
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingTop:
                            insets.top +
                            theme.spacing.sm,
                        paddingBottom:
                            insets.bottom +
                            theme.spacing.xxxl,
                    },
                ]}
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
                        style={
                            styles.backButton
                        }
                        onPress={() =>
                            navigation.goBack()
                        }
                        accessibilityRole="button"
                        accessibilityLabel="go back to activities"
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
                            Activities
                        </Text>
                    </Pressable>
                </View>

                <View
                    style={
                        styles.hero
                    }
                >
                    <View
                        style={
                            styles.heroIcon
                        }
                    >
                        <Ionicons
                            name="sparkles-outline"
                            size={36}
                            color={
                                theme.colors.forest
                            }
                        />
                    </View>

                    <Text
                        style={
                            styles.eyebrow
                        }
                    >
                        THINGS TO DO
                    </Text>

                    <Text
                        style={
                            styles.title
                        }
                    >
                        {
                            activity.title
                        }
                    </Text>

                    <Text
                        style={
                            styles.parkName
                        }
                    >
                        {
                            activity.parkName
                        }
                    </Text>
                </View>

                <View
                    style={
                        styles.infoGrid
                    }
                >
                    <InfoItem
                        icon="location-outline"
                        label="Location"
                        value={
                            activity.location
                        }
                    />

                    <InfoItem
                        icon="time-outline"
                        label="Duration"
                        value={
                            activity.duration
                        }
                    />

                    <InfoItem
                        icon="calendar-outline"
                        label="Season"
                        value={
                            activity.season
                        }
                    />
                </View>

                <View
                    style={
                        styles.section
                    }
                >
                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        About
                    </Text>

                    <Text
                        style={
                            styles.body
                        }
                    >
                        {
                            activity.longDescription
                        }
                    </Text>
                </View>

                <View
                    style={
                        styles.section
                    }
                >
                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Plan your visit
                    </Text>

                    <View
                        style={
                            styles.locationCard
                        }
                    >
                        <Ionicons
                            name="navigate-outline"
                            size={22}
                            color={
                                theme.colors.forest
                            }
                        />

                        <View
                            style={
                                styles.locationContent
                            }
                        >
                            <Text
                                style={
                                    styles.locationTitle
                                }
                            >
                                {
                                    activity.location
                                }
                            </Text>

                            <Text
                                style={
                                    styles.locationText
                                }
                            >
                                {
                                    activity.parkName
                                }
                            </Text>
                        </View>
                    </View>
                </View>

                {activity.url ? (
                    <View
                        style={
                            styles.sourceSection
                        }
                    >
                        <Text
                            style={
                                styles.sourceLabel
                            }
                        >
                            SOURCE
                        </Text>

                        <Text
                            style={
                                styles.sourceText
                            }
                        >
                            National Park Service
                        </Text>

                        <Text
                            style={
                                styles.sourceUrl
                            }
                            numberOfLines={
                                2
                            }
                        >
                            {
                                activity.url
                            }
                        </Text>
                    </View>
                ) : null}
            </ScrollView>
        </View>
    )
}

// keeps repeated information rows consistent throughout the detail screen
function InfoItem({
    icon,
    label,
    value,
}) {
    return (
        <View
            style={
                styles.infoItem
            }
        >
            <Ionicons
                name={icon}
                size={20}
                color={
                    theme.colors.forest
                }
            />

            <Text
                style={
                    styles.infoLabel
                }
            >
                {label}
            </Text>

            <Text
                style={
                    styles.infoValue
                }
                numberOfLines={
                    2
                }
            >
                {value}
            </Text>
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

        content: {
            paddingHorizontal:
                theme.spacing.lg,
        },

        header: {
            marginBottom:
                theme.spacing.lg,
        },

        backButton: {
            alignItems:
                'center',
            alignSelf:
                'flex-start',
            flexDirection:
                'row',
            paddingVertical:
                theme.spacing.xs,
        },

        backText: {
            color:
                theme.colors.forest,
            fontSize: 13,
            fontWeight: '600',
            marginLeft: 2,
        },

        hero: {
            alignItems:
                'center',
            paddingTop:
                theme.spacing.lg,
        },

        heroIcon: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors.sage,
            borderRadius: 42,
            height: 84,
            justifyContent:
                'center',
            width: 84,
        },

        eyebrow: {
            color:
                theme.colors.forest,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 1.5,
            marginTop:
                theme.spacing.lg,
        },

        title: {
            color:
                theme.colors.ink,
            fontSize: 30,
            fontWeight: '800',
            lineHeight: 36,
            marginTop:
                theme.spacing.xs,
            textAlign:
                'center',
        },

        parkName: {
            color:
                theme.colors.earth,
            fontSize: 14,
            marginTop:
                theme.spacing.xs,
            textAlign:
                'center',
        },

        infoGrid: {
            backgroundColor:
                theme.colors.canvas,
            borderColor:
                theme.colors.sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            marginTop:
                theme.spacing.xl,
            padding:
                theme.spacing.md,
        },

        infoItem: {
            alignItems:
                'center',
            flexDirection:
                'row',
            minHeight: 44,
        },

        infoLabel: {
            color:
                theme.colors.earth,
            fontSize: 11,
            marginLeft:
                theme.spacing.sm,
            width: 68,
        },

        infoValue: {
            color:
                theme.colors.ink,
            flex: 1,
            fontSize: 12,
            fontWeight: '600',
            marginLeft:
                theme.spacing.sm,
        },

        section: {
            marginTop:
                theme.spacing.xxl,
        },

        sectionTitle: {
            color:
                theme.colors.ink,
            fontSize: 20,
            fontWeight: '750',
            marginBottom:
                theme.spacing.sm,
        },

        body: {
            color:
                theme.colors.earth,
            fontSize: 14,
            lineHeight: 22,
        },

        locationCard: {
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
            padding:
                theme.spacing.md,
        },

        locationContent: {
            flex: 1,
            marginLeft:
                theme.spacing.md,
        },

        locationTitle: {
            color:
                theme.colors.ink,
            fontSize: 13,
            fontWeight: '700',
        },

        locationText: {
            color:
                theme.colors.earth,
            fontSize: 11,
            marginTop: 3,
        },

        sourceSection: {
            borderTopColor:
                theme.colors.sage,
            borderTopWidth: 1,
            marginTop:
                theme.spacing.xxxl,
            paddingTop:
                theme.spacing.lg,
        },

        sourceLabel: {
            color:
                theme.colors.forest,
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 1.2,
        },

        sourceText: {
            color:
                theme.colors.ink,
            fontSize: 12,
            fontWeight: '600',
            marginTop:
                theme.spacing.xs,
        },

        sourceUrl: {
            color:
                theme.colors.earth,
            fontSize: 10,
            lineHeight: 15,
            marginTop:
                theme.spacing.xs,
        },

        errorState: {
            alignItems:
                'center',
            flex: 1,
            justifyContent:
                'center',
            paddingHorizontal:
                theme.spacing.xl,
        },

        errorTitle: {
            color:
                theme.colors.ink,
            fontSize: 20,
            fontWeight: '700',
        },

        errorText: {
            color:
                theme.colors.earth,
            fontSize: 13,
            marginTop:
                theme.spacing.sm,
            textAlign:
                'center',
        },
    })