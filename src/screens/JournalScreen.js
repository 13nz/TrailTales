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

import theme from '../constants/theme'
import {
    useTrips,
} from '../context/TripContext'

// displays the trips that have their own scrapbook journals
export default function JournalScreen({
    navigation,
}) {
    const insets =
        useSafeAreaInsets()

    const { trips } =
        useTrips()

    return (
        <View style={styles.screen}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingTop:
                            insets.top +
                            theme.spacing.lg,
                    },
                ]}
                showsVerticalScrollIndicator={
                    false
                }
            >
                <View
                    style={styles.intro}
                >
                    <Text
                        style={
                            styles.eyebrow
                        }
                    >
                        YOUR MEMORIES
                    </Text>

                    <Text
                        style={styles.title}
                    >
                        Journal
                    </Text>

                    <Text
                        style={
                            styles.description
                        }
                    >
                        Turn your adventures
                        into a scrapbook.
                    </Text>
                </View>

                {trips.length === 0 ? (
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
                            📖
                        </Text>

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No adventures yet
                        </Text>

                        <Text
                            style={
                                styles.emptyDescription
                            }
                        >
                            Create a trip first,
                            then start filling its
                            scrapbook with memories.
                        </Text>
                    </View>
                ) : (
                    <View
                        style={
                            styles.tripList
                        }
                    >
                        {trips.map(
                            (trip) => {
                                const pageCount =
                                    trip.journal
                                        ?.pages
                                        ?.length ||
                                    0

                                return (
                                    <Pressable
                                        key={
                                            trip.id
                                        }
                                        style={
                                            styles.tripCard
                                        }
                                        onPress={() =>
                                            navigation.navigate(
                                                'JournalPages',
                                                {
                                                    tripId:
                                                        trip.id,
                                                }
                                            )
                                        }
                                        accessibilityRole="button"
                                        accessibilityLabel={`open journal for ${trip.name}`}
                                    >
                                        <View
                                            style={
                                                styles.book
                                            }
                                        >
                                            <View
                                                style={
                                                    styles.bookBinding
                                                }
                                            />

                                            <View
                                                style={
                                                    styles.bookContent
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.bookEyebrow
                                                    }
                                                >
                                                    TRAVEL JOURNAL
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.bookTitle
                                                    }
                                                >
                                                    {
                                                        trip.name
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.bookPages
                                                    }
                                                >
                                                    {pageCount}{' '}
                                                    {pageCount ===
                                                    1
                                                        ? 'page'
                                                        : 'pages'}
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.bookIcon
                                                    }
                                                >
                                                    🏔️
                                                </Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                )
                            }
                        )}
                    </View>
                )}
            </ScrollView>
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
            paddingBottom: 100,
            paddingHorizontal:
                theme.spacing.lg,
        },

        intro: {
            marginBottom:
                theme.spacing.xl,
        },

        eyebrow: {
            color:
                theme.colors.forest,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1.5,
        },

        title: {
            color: theme.colors.ink,
            fontSize: 34,
            fontWeight: '700',
            marginTop:
                theme.spacing.xs,
        },

        description: {
            color:
                theme.colors.earth,
            fontSize: 14,
            lineHeight: 21,
            marginTop:
                theme.spacing.sm,
        },

        tripList: {
            gap: theme.spacing.lg,
        },

        tripCard: {
            borderRadius:
                theme.radii.lg,
        },

        book: {
            backgroundColor:
                theme.colors.forest,
            borderRadius:
                theme.radii.lg,
            flexDirection: 'row',
            minHeight: 190,
            overflow: 'hidden',
            ...theme.shadows.card,
        },

        bookBinding: {
            backgroundColor:
                theme.colors.bark,
            width: 14,
        },

        bookContent: {
            flex: 1,
            padding:
                theme.spacing.lg,
            position: 'relative',
        },

        bookEyebrow: {
            color:
                theme.colors.sage,
            fontSize: 9,
            fontWeight: '700',
            letterSpacing: 1.5,
        },

        bookTitle: {
            color:
                theme.colors.parchment,
            fontSize: 25,
            fontWeight: '700',
            marginTop:
                theme.spacing.sm,
            maxWidth: '78%',
        },

        bookPages: {
            color:
                theme.colors.sage,
            fontSize: 12,
            marginTop:
                theme.spacing.md,
        },

        bookIcon: {
            bottom: 16,
            fontSize: 42,
            position: 'absolute',
            right: 18,
        },

        emptyState: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.canvas,
            borderColor:
                theme.colors.sage,
            borderRadius:
                theme.radii.lg,
            borderWidth: 1,
            padding:
                theme.spacing.xl,
        },

        emptyIcon: {
            fontSize: 48,
        },

        emptyTitle: {
            color: theme.colors.ink,
            fontSize: 20,
            fontWeight: '700',
            marginTop:
                theme.spacing.md,
        },

        emptyDescription: {
            color:
                theme.colors.earth,
            fontSize: 13,
            lineHeight: 20,
            marginTop:
                theme.spacing.xs,
            textAlign: 'center',
        },
    })