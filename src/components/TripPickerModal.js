import {
    View,
    Text,
    Pressable,
    Modal,
    StyleSheet,
    ScrollView,
} from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import theme from '../constants/theme'

// provides a reusable way to choose an existing trip for a park
export default function TripPickerModal({
    visible,
    trips,
    park,
    onSelectTrip,
    onCreateTrip,
    onClose,
}) {
    const insets = useSafeAreaInsets()

    // only shows trips belonging to the selected park
    const parkTrips =
        trips.filter(
            (trip) =>
                trip.parkId ===
                park?.id
        )

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={
                onClose
            }
        >
            <View
                style={
                    styles.overlay
                }
            >
                <View
                    style={[
                        styles.sheet,
                        {
                            paddingBottom:
                                insets.bottom +
                                theme.spacing.md,
                        },
                    ]}
                >
                    <View
                        style={
                            styles.handle
                        }
                    />

                    <View
                        style={
                            styles.header
                        }
                    >
                        <View
                            style={
                                styles.headerContent
                            }
                        >
                            <Text
                                style={
                                    styles.eyebrow
                                }
                            >
                                ADD TO TRIP
                            </Text>

                            <Text
                                style={
                                    styles.title
                                }
                            >
                                Choose a trip
                            </Text>

                            <Text
                                style={
                                    styles.subtitle
                                }
                            >
                                {park?.name ||
                                    'National Park'}
                            </Text>
                        </View>

                        <Pressable
                            style={
                                styles.closeButton
                            }
                            onPress={
                                onClose
                            }
                            accessibilityRole="button"
                            accessibilityLabel="close trip picker"
                        >
                            <Text
                                style={
                                    styles.closeText
                                }
                            >
                                ×
                            </Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        style={
                            styles.list
                        }
                        showsVerticalScrollIndicator={
                            false
                        }
                    >
                        {parkTrips.length >
                        0 ? (
                            <>
                                <Text
                                    style={
                                        styles.sectionLabel
                                    }
                                >
                                    YOUR TRIPS
                                </Text>

                                {parkTrips.map(
                                    (
                                        trip
                                    ) => (
                                        <Pressable
                                            key={
                                                trip.id
                                            }
                                            style={({ pressed }) => [
                                                styles.tripCard,
                                                pressed &&
                                                    styles.pressed,
                                            ]}
                                            onPress={() =>
                                                onSelectTrip(
                                                    trip
                                                )
                                            }
                                            accessibilityRole="button"
                                            accessibilityLabel={`add to ${trip.name}`}
                                        >
                                            <View
                                                style={
                                                    styles.tripIcon
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.tripIconText
                                                    }
                                                >
                                                    ↗
                                                </Text>
                                            </View>

                                            <View
                                                style={
                                                    styles.tripContent
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.tripName
                                                    }
                                                    numberOfLines={
                                                        1
                                                    }
                                                >
                                                    {
                                                        trip.name
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.tripDates
                                                    }
                                                >
                                                    {formatDateRange(
                                                        trip.startDate,
                                                        trip.endDate
                                                    )}
                                                </Text>
                                            </View>

                                            <Text
                                                style={
                                                    styles.chevron
                                                }
                                            >
                                                ›
                                            </Text>
                                        </Pressable>
                                    )
                                )}
                            </>
                        ) : (
                            <View
                                style={
                                    styles.emptyCard
                                }
                            >
                                <Text
                                    style={
                                        styles.emptyTitle
                                    }
                                >
                                    No trips for this park
                                </Text>

                                <Text
                                    style={
                                        styles.emptyText
                                    }
                                >
                                    Create a trip for this
                                    park to add this item
                                    to your plans.
                                </Text>
                            </View>
                        )}

                        <Pressable
                            style={({ pressed }) => [
                                styles.createButton,
                                pressed &&
                                    styles.pressed,
                            ]}
                            onPress={
                                onCreateTrip
                            }
                            accessibilityRole="button"
                            accessibilityLabel="create a new trip"
                        >
                            <Text
                                style={
                                    styles.createIcon
                                }
                            >
                                +
                            </Text>

                            <View
                                style={
                                    styles.createContent
                                }
                            >
                                <Text
                                    style={
                                        styles.createTitle
                                    }
                                >
                                    Create a new trip
                                </Text>

                                <Text
                                    style={
                                        styles.createSubtitle
                                    }
                                >
                                    Start a new adventure
                                    in {park?.name}
                                </Text>
                            </View>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

function formatDateRange(
    startDate,
    endDate
) {
    if (
        !startDate ||
        !endDate
    ) {
        return 'Dates not set'
    }

    return `${formatDate(startDate)} – ${formatDate(endDate)}`
}

function formatDate(
    dateString
) {
    const date = new Date(
        `${dateString}T12:00:00`
    )

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return dateString
    }

    return date.toLocaleDateString(
        undefined,
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }
    )
}

const styles =
    StyleSheet.create({
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            flex: 1,
            justifyContent: 'flex-end',
        },

        sheet: {
            backgroundColor: theme.colors.parchment,
            borderTopLeftRadius: theme.radii.lg,
            borderTopRightRadius: theme.radii.lg,
            maxHeight: '80%',
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.sm,
        },

        handle: {
            alignSelf: 'center',
            backgroundColor: theme.colors.sage,
            borderRadius: 4,
            height: 4,
            marginBottom: theme.spacing.lg,
            width: 40,
        },

        header: {
            alignItems: 'flex-start',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },

        headerContent: {
            flex: 1,
        },

        eyebrow: {
            color: theme.colors.forest,
            fontSize: theme.typography.label.fontSize,
            fontWeight: '700',
            letterSpacing: 1.2,
        },

        title: {
            color: theme.colors.ink,
            fontSize:theme.typography.heading.fontSize,
            fontWeight: theme.typography.heading.fontWeight,
            marginTop: theme.spacing.xs,
        },

        subtitle: {
            color: theme.colors.earth,
            fontSize:  theme.typography.bodySmall.fontSize,
            marginTop: theme.spacing.xs,
        },

        closeButton: {
            alignItems: 'center',
            height: 40,
            justifyContent: 'center',
            width: 40,
        },

        closeText: {
            color: theme.colors.earth,
            fontSize: 28,
        },

        list: {
            marginTop: theme.spacing.lg,
        },

        sectionLabel: {
            color: theme.colors.earth,
            fontSize: theme.typography.caption.fontSize,
            fontWeight: '700',
            letterSpacing: 1,
            marginBottom: theme.spacing.sm,
        },

        tripCard: {
            alignItems: 'center',
            backgroundColor: theme.colors.canvas,
            borderRadius: theme.radii.md,
            flexDirection: 'row',
            marginBottom: theme.spacing.sm,
            padding: theme.spacing.md,
        },

        tripIcon: {
            alignItems: 'center',
            backgroundColor: theme.colors.sage,
            borderRadius: 22,
            height: 44,
            justifyContent: 'center',
            width: 44,
        },

        tripIconText: {
            color: theme.colors.forest,
            fontSize: 20,
            fontWeight: '700',
        },

        tripContent: {
            flex: 1,
            marginLeft: theme.spacing.md,
        },

        tripName: {
            color: theme.colors.ink,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
        },

        tripDates: {
            color: theme.colors.earth,
            fontSize: theme.typography.caption.fontSize,
            marginTop: theme.spacing.xs,
        },

        chevron: {
            color: theme.colors.earth,
            fontSize: 24,
            marginLeft: theme.spacing.sm,
        },

        emptyCard: {
            backgroundColor: theme.colors.canvas,
            borderRadius: theme.radii.md,
            marginBottom: theme.spacing.md,
            padding: theme.spacing.lg,
        },

        emptyTitle: {
            color: theme.colors.ink,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
        },

        emptyText: {
            color: theme.colors.earth,
            fontSize: theme.typography.caption.fontSize,
            lineHeight: theme.typography.caption.lineHeight,
            marginTop:  theme.spacing.xs,
        },

        createButton: {
            alignItems: 'center',
            borderColor: theme.colors.forest,
            borderRadius: theme.radii.md,
            borderWidth: 1,
            flexDirection: 'row',
            marginBottom: theme.spacing.lg,
            marginTop: theme.spacing.sm,
            padding: theme.spacing.md,
        },

        createIcon: {
            color: theme.colors.forest,
            fontSize: 24,
            fontWeight: '400',
            width: 44,
        },

        createContent: {
            flex: 1,
        },

        createTitle: {
            color: theme.colors.forest,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
        },

        createSubtitle: {
            color: theme.colors.earth,
            fontSize: theme.typography.caption.fontSize,
            marginTop: theme.spacing.xs,
        },

        pressed: {
            opacity: 0.75,
        },
    })