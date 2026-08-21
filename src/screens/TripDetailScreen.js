import {
    View,
    Text,
    Pressable,
    ScrollView,
    TextInput,
    StyleSheet,
    Keyboard,
    Modal,
} from 'react-native'

import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import theme from '../constants/theme'
import { useTrips } from '../context/TripContext'
import mockParks from '../data/mockParks'
import mockTrails from '../data/mockTrails'
import mockCampsites from '../data/mockCampsites'

// displays the complete planning workspace for a single outdoor adventure
export default function TripDetailScreen({
    route,
    navigation,
}) {
    const insets = useSafeAreaInsets()

    const { tripId } = route.params
    const { trips, updateTrip } = useTrips()

    // finds the selected adventure from the shared trip store
    const trip = trips.find((item) => item.id === tripId) ||ctrips[0]

    // finds the national park associated with the selected trip
    const park = mockParks.find((item) => item.id === trip?.parkId)

    if (!trip) {
        return (
            <View style={styles.screen}>
                <Text style={styles.errorText}>
                    Trip could not be found.
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.screen}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingTop:
                            insets.top +
                            theme.spacing.sm,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() =>
                            navigation.goBack()
                        }
                        accessibilityRole="button"
                        accessibilityLabel="go back"
                    >
                        <Text
                            style={
                                styles.backButtonText
                            }
                        >
                            ‹
                        </Text>
                    </Pressable>

                    <Text
                        style={
                            styles.headerTitle
                        }
                        numberOfLines={1}
                    >
                        {trip.name}
                    </Text>

                    <Pressable
                        style={styles.favoriteButton}
                        onPress={() => {
                            navigation.navigate(
                                'EditTrip',
                                {
                                    tripId: trip.id,
                                }
                            )
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="edit trip"
                    >
                        <Text style={styles.favoriteIcon}>
                            ✎
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <Text
                            style={
                                styles.heroEmoji
                            }
                        >
                            🏔️
                        </Text>
                    </View>

                    <Text style={styles.eyebrow}>
                        YOUR ADVENTURE
                    </Text>

                    <Text style={styles.title}>
                        {trip.name}
                    </Text>

                    <Text style={styles.parkName}>
                        {park?.name ||
                            'National Park'}
                    </Text>

                    <Text style={styles.dates}>
                        {formatDateRange(
                            trip.startDate,
                            trip.endDate
                        )}
                    </Text>
                </View>

                <TripStats trip={trip} />

                {/* trails */}

                <SectionHeader
                    title="Trails"
                    icon="🥾"
                />

                {trip.trails?.length > 0 ? (
                    trip.trails.map(
                        (trailReservation, index) => {
                            const trailId =
                                typeof trailReservation ===
                                'string'
                                    ? trailReservation
                                    : trailReservation.id

                            const trail =
                                mockTrails.find(
                                    (item) =>
                                        item.id ===
                                        trailId
                                )

                            if (!trail) {
                                return null
                            }

                            const trailTime =
                                typeof trailReservation ===
                                'object'
                                    ? trailReservation.time
                                    : null

                            const trailDate =
                                typeof trailReservation ===
                                'object'
                                    ? trailReservation.date
                                    : null

                            return (
                                <SavedItem
                                // identify reservation instead of just trail id to allow multiple entries
                                    key={`trail-${trail.id}-${index}`}
                                    title={
                                        trail.name
                                    }
                                    subtitle={[
                                        trail.distance,
                                        trail.difficulty,
                                        trailDate
                                            ? formatTripDate(
                                                  trailDate
                                              )
                                            : null,
                                        trailTime
                                            ? formatTime(
                                                  trailTime
                                              )
                                            : null,
                                    ]
                                        .filter(Boolean)
                                        .join(
                                            ' · '
                                        )}
                                    icon="🥾"
                                    onPress={() => {
                                        navigation.navigate(
                                            'TrailDetail',
                                            {
                                                parkId:
                                                    trip.parkId,
                                                trailId:
                                                    trail.id,
                                            }
                                        )
                                    }}
                                    onRemove={() => {
                                        updateTrip(
                                            trip.id,
                                            {
                                                trails:
                                                    trip.trails.filter(
                                                        (
                                                            item,
                                                            itemIndex
                                                        ) =>
                                                            itemIndex !==
                                                            index
                                                    ),
                                            }
                                        )
                                    }}
                                />
                            )
                        }
                    )
                ) : (
                    <EmptySection text="No trails added yet" />
                )}

                <AddButton
                    label="Add a trail"
                    onPress={() => {
                        navigation.navigate(
                            'AddTrail',
                            {
                                tripId: trip.id,
                            }
                        )
                    }}
                />

                {/* campsites */}

                <SectionHeader
                    title="Campsites"
                    icon="🏕️"
                />

                {trip.campsites?.length > 0 ? (
                    trip.campsites.map(
                        (
                            campsiteReservation,
                            index
                        ) => {
                            const campsiteId =
                                typeof campsiteReservation ===
                                'string'
                                    ? campsiteReservation
                                    : campsiteReservation.id

                            const campsite =
                                mockCampsites.find(
                                    (item) =>
                                        item.id ===
                                        campsiteId
                                )

                            if (!campsite) {
                                return null
                            }

                            const checkIn =
                                typeof campsiteReservation ===
                                'object'
                                    ? campsiteReservation.checkIn
                                    : null

                            const checkOut =
                                typeof campsiteReservation ===
                                'object'
                                    ? campsiteReservation.checkOut
                                    : null

                            const campsiteNumber =
                                typeof campsiteReservation ===
                                'object'
                                    ? campsiteReservation.campsiteNumber
                                    : null

                            const notes =
                                typeof campsiteReservation ===
                                'object'
                                    ? campsiteReservation.notes
                                    : null

                            return (
                                <Pressable
                                    key={`${campsiteId}-${index}`}
                                    style={
                                        styles.campsiteCard
                                    }
                                    onPress={() => {
                                        navigation.navigate(
                                            'CampgroundDetail',
                                            {
                                                parkId:
                                                    trip.parkId,
                                                campgroundId:
                                                    campsite.id,
                                            }
                                        )
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`view ${campsite.name}`}
                                >
                                    <View
                                        style={
                                            styles.campsiteHeader
                                        }
                                    >
                                        <View
                                            style={
                                                styles.campsiteIcon
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.campsiteEmoji
                                                }
                                            >
                                                🏕️
                                            </Text>
                                        </View>

                                        <View
                                            style={
                                                styles.campsiteTitleContainer
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.savedItemTitle
                                                }
                                            >
                                                {
                                                    campsite.name
                                                }
                                            </Text>

                                            <Text
                                                style={
                                                    styles.savedItemSubtitle
                                                }
                                            >
                                                {
                                                    campsite.price
                                                }{' '}
                                                ·{' '}
                                                {
                                                    campsite.sites
                                                }{' '}
                                                sites
                                            </Text>
                                        </View>

                                        <Pressable
                                            onPress={(
                                                event
                                            ) => {
                                                event?.stopPropagation?.()

                                                updateTrip(
                                                    trip.id,
                                                    {
                                                        campsites:
                                                            trip.campsites.filter(
                                                                (
                                                                    _,
                                                                    reservationIndex
                                                                ) =>
                                                                    reservationIndex !==
                                                                    index
                                                            ),
                                                    }
                                                )
                                            }}
                                            style={
                                                styles.removeButton
                                            }
                                            accessibilityRole="button"
                                            accessibilityLabel={`remove ${campsite.name}`}
                                            hitSlop={8}
                                        >
                                            <Text
                                                style={
                                                    styles.removeText
                                                }
                                            >
                                                ×
                                            </Text>
                                        </Pressable>
                                    </View>

                                    {campsiteNumber ? (
                                        <DetailRow
                                            label="SITE"
                                            value={
                                                campsiteNumber
                                            }
                                        />
                                    ) : null}

                                    {checkIn ||
                                    checkOut ? (
                                        <DetailRow
                                            label="DATES"
                                            value={`${formatTripDate(
                                                checkIn
                                            )} – ${formatTripDate(
                                                checkOut
                                            )}`}
                                        />
                                    ) : null}

                                    {notes ? (
                                        <View
                                            style={
                                                styles.notesContainer
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.detailLabel
                                                }
                                            >
                                                NOTES
                                            </Text>

                                            <Text
                                                style={
                                                    styles.notesText
                                                }
                                            >
                                                {notes}
                                            </Text>
                                        </View>
                                    ) : null}
                                </Pressable>
                            )
                        }
                    )
                ) : (
                    <EmptySection text="No campsite added yet" />
                )}

                <AddButton
                    label="Add a campsite"
                    onPress={() => {
                        navigation.navigate(
                            'AddCampsite',
                            {
                                tripId: trip.id,
                            }
                        )
                    }}
                />

                {/* activities */}

                <SectionHeader
                    title="Activities"
                    icon="⭐"
                />

                {trip.activities?.length > 0 ? (
                    trip.activities.map(
                        (activity) => {
                            const activityId =
                                typeof activity ===
                                'string'
                                    ? activity
                                    : activity.id

                            const activityTitle =
                                typeof activity ===
                                'string'
                                    ? capitalize(
                                          activity
                                      )
                                    : activity.title

                            const activitySubtitle =
                                typeof activity ===
                                'string'
                                    ? 'Activity'
                                    : [
                                          activity.date
                                              ? formatTripDate(
                                                    activity.date
                                                )
                                              : null,
                                          activity.time
                                              ? formatTime(
                                                    activity.time
                                                )
                                              : null,
                                          activity.location ||
                                              null,
                                      ]
                                          .filter(
                                              Boolean
                                          )
                                          .join(
                                              ' · '
                                          ) ||
                                      'Activity'

                            return (
                                <SavedItem
                                    key={
                                        activityId
                                    }
                                    title={
                                        activityTitle
                                    }
                                    subtitle={
                                        activitySubtitle
                                    }
                                    icon="⭐"
                                    onRemove={() => {
                                        updateTrip(
                                            trip.id,
                                            {
                                                activities:
                                                    trip.activities.filter(
                                                        (
                                                            item
                                                        ) =>
                                                            typeof item ===
                                                            'string'
                                                                ? item !==
                                                                  activity
                                                                : item.id !==
                                                                  activity.id
                                                    ),
                                            }
                                        )
                                    }}
                                />
                            )
                        }
                    )
                ) : (
                    <EmptySection text="No activities added yet" />
                )}

                <AddButton
                    label="Add an activity"
                    onPress={() => {
                        navigation.navigate(
                            'AddActivity',
                            {
                                tripId: trip.id,
                            }
                        )
                    }}
                />

                {/* notes */}

                <SectionHeader
                    title="Notes"
                    icon="📝"
                />

                <View
                    style={styles.notesCard}
                >
                    <TextInput
                        value={trip.notes || ''}
                        multiline
                        placeholder="Add notes about your adventure..."
                        placeholderTextColor={
                            theme.colors.earth
                        }
                        style={
                            styles.notesInput
                        }
                        textAlignVertical="top"
                        onChangeText={(
                            text
                        ) => {
                            updateTrip(
                                trip.id,
                                {
                                    notes: text,
                                }
                            )
                        }}
                        onSubmitEditing={() => {
                            Keyboard.dismiss()
                        }}
                        blurOnSubmit
                    />
                </View>

                {/* packing checklist */}

                <SectionHeader
                    title="Packing checklist"
                    icon="🎒"
                />

                {(
                    trip.packingItems || []
                ).length > 0 ? (
                    trip.packingItems.map(
                        (item) => (
                            <ChecklistItem
                                key={item.id}
                                label={
                                    item.label
                                }
                                completed={
                                    item.completed
                                }
                                onToggle={() => {
                                    updateTrip(
                                        trip.id,
                                        {
                                            packingItems:
                                                trip.packingItems.map(
                                                    (
                                                        packingItem
                                                    ) =>
                                                        packingItem.id ===
                                                        item.id
                                                            ? {
                                                                  ...packingItem,
                                                                  completed:
                                                                      !packingItem.completed,
                                                              }
                                                            : packingItem
                                                ),
                                        }
                                    )
                                }}
                                onRemove={() => {
                                    updateTrip(
                                        trip.id,
                                        {
                                            packingItems:
                                                trip.packingItems.filter(
                                                    (
                                                        packingItem
                                                    ) =>
                                                        packingItem.id !==
                                                        item.id
                                                ),
                                        }
                                    )
                                }}
                            />
                        )
                    )
                ) : (
                    <EmptySection text="Nothing on your packing list yet" />
                )}

                <AddPackingItemButton
                    onAdd={(label) => {
                        updateTrip(
                            trip.id,
                            {
                                packingItems: [
                                    ...(trip.packingItems ||
                                        []),
                                    {
                                        id: `packing-${Date.now()}`,
                                        label,
                                        completed:
                                            false,
                                    },
                                ],
                            }
                        )
                    }}
                />

                {/* itinerary */}

                <View style={styles.divider} />

                <View
                    style={
                        styles.itineraryHeader
                    }
                >
                    <View
                        style={
                            styles.itineraryTitleRow
                        }
                    >
                        <Text
                            style={
                                styles.itineraryIcon
                            }
                        >
                            📅
                        </Text>

                        <View>
                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Itinerary
                            </Text>

                            <Text
                                style={
                                    styles.itinerarySubtitle
                                }
                            >
                                Your planned adventure
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        style={
                            styles.addItineraryButton
                        }
                        onPress={() => {
                            navigation.navigate(
                                'AddActivity',
                                {
                                    tripId: trip.id,
                                }
                            )
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="add itinerary item"
                    >
                        <Text
                            style={
                                styles.addItineraryText
                            }
                        >
                            +
                        </Text>
                    </Pressable>
                </View>

                <DynamicItinerary
                    trip={trip}
                    trails={mockTrails}
                    onRemoveTrail={(trailId) => {
                        // removes the selected trail reservation from the trip
                        updateTrip(trip.id, {
                            trails: (
                                trip.trails || []
                            ).filter((trail) => {
                                if (
                                    typeof trail ===
                                    'string'
                                ) {
                                    return trail !==
                                        trailId
                                }

                                return trail.id !==
                                    trailId
                            }),
                        })
                    }}
                    onRemoveActivity={(activityId) => {
                        // removes the selected activity from the trip
                        updateTrip(trip.id, {
                            activities: (
                                trip.activities || []
                            ).filter((activity) => {
                                if (
                                    typeof activity ===
                                    'string'
                                ) {
                                    return true
                                }

                                return activity.id !==
                                    activityId
                            }),
                        })
                    }}
                    onEditEvent={(event) => {
                        navigation.navigate(
                            'EditItineraryItem',
                            {
                                tripId: trip.id,
                                itemType: event.type,
                                itemId: event.sourceId,
                            }
                        )
                    }}
                />

                <View
                    style={styles.bottomSpacer}
                />
            </ScrollView>
        </View>
    )
}

function SectionHeader({
    title,
    icon,
}) {
    return (
        <View style={styles.sectionHeader}>
            <Text
                style={styles.sectionIcon}
            >
                {icon}
            </Text>

            <Text
                style={styles.sectionTitle}
            >
                {title}
            </Text>
        </View>
    )
}

function SavedItem({
    title,
    subtitle,
    icon,
    onPress,
    onRemove,
}) {
    return (
        <Pressable
            style={styles.savedItem}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`view ${title}`}
        >
            <View
                style={
                    styles.savedItemIcon
                }
            >
                <Text
                    style={
                        styles.savedItemEmoji
                    }
                >
                    {icon}
                </Text>
            </View>

            <View
                style={
                    styles.savedItemContent
                }
            >
                <Text
                    style={
                        styles.savedItemTitle
                    }
                >
                    {title}
                </Text>

                <Text
                    style={
                        styles.savedItemSubtitle
                    }
                >
                    {subtitle}
                </Text>
            </View>

            <Pressable
                onPress={(event) => {
                    event?.stopPropagation?.()
                    onRemove()
                }}
                style={
                    styles.removeButton
                }
                accessibilityRole="button"
                accessibilityLabel={`remove ${title}`}
                hitSlop={8}
            >
                <Text
                    style={
                        styles.removeText
                    }
                >
                    ×
                </Text>
            </Pressable>
        </Pressable>
    )
}

function DetailRow({
    label,
    value,
}) {
    return (
        <View style={styles.detailRow}>
            <Text
                style={
                    styles.detailLabel
                }
            >
                {label}
            </Text>

            <Text
                style={
                    styles.detailValue
                }
            >
                {value}
            </Text>
        </View>
    )
}

function EmptySection({ text }) {
    return (
        <View
            style={
                styles.emptySection
            }
        >
            <Text
                style={
                    styles.emptySectionText
                }
            >
                {text}
            </Text>
        </View>
    )
}

function AddButton({
    label,
    onPress,
}) {
    return (
        <Pressable
            style={styles.addButton}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <Text
                style={
                    styles.addButtonText
                }
            >
                +
            </Text>

            <Text
                style={
                    styles.addButtonLabel
                }
            >
                {label}
            </Text>
        </Pressable>
    )
}

function ChecklistItem({
    label,
    completed = false,
    onToggle,
    onRemove,
}) {
    return (
        <View
            style={
                styles.checklistItem
            }
        >
            <Pressable
                style={
                    styles.checklistMain
                }
                onPress={onToggle}
                accessibilityRole="checkbox"
                accessibilityState={{
                    checked: completed,
                }}
            >
                <View
                    style={[
                        styles.checkbox,
                        completed &&
                            styles.completedCheckbox,
                    ]}
                >
                    {completed ? (
                        <Text
                            style={
                                styles.checkmark
                            }
                        >
                            ✓
                        </Text>
                    ) : null}
                </View>

                <Text
                    style={[
                        styles.checklistLabel,
                        completed &&
                            styles.completedChecklistLabel,
                    ]}
                >
                    {label}
                </Text>
            </Pressable>

            <Pressable
                onPress={onRemove}
                style={
                    styles.checklistRemove
                }
                accessibilityRole="button"
                accessibilityLabel={`remove ${label}`}
                hitSlop={8}
            >
                <Text
                    style={
                        styles.removeText
                    }
                >
                    ×
                </Text>
            </Pressable>
        </View>
    )
}

function AddPackingItemButton({
    onAdd,
}) {
    const [visible, setVisible] =
        useState(false)

    const [value, setValue] =
        useState('')

    const handleAdd = () => {
        if (!value.trim()) {
            return
        }

        onAdd(value.trim())

        setValue('')
        setVisible(false)

        Keyboard.dismiss()
    }

    return (
        <>
            <AddButton
                label="Add packing item"
                onPress={() => {
                    setVisible(true)
                }}
            />

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setVisible(false)
                }}
            >
                <View
                    style={
                        styles.modalOverlay
                    }
                >
                    <View
                        style={
                            styles.packingModal
                        }
                    >
                        <Text
                            style={
                                styles.modalTitle
                            }
                        >
                            Add packing item
                        </Text>

                        <TextInput
                            value={value}
                            onChangeText={
                                setValue
                            }
                            placeholder="e.g. sunscreen"
                            placeholderTextColor={
                                theme.colors.earth
                            }
                            style={
                                styles.packingInput
                            }
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={
                                handleAdd
                            }
                        />

                        <View
                            style={
                                styles.modalActions
                            }
                        >
                            <Pressable
                                style={
                                    styles.cancelButton
                                }
                                onPress={() => {
                                    setValue(
                                        ''
                                    )
                                    setVisible(
                                        false
                                    )
                                    Keyboard.dismiss()
                                }}
                            >
                                <Text
                                    style={
                                        styles.cancelButtonText
                                    }
                                >
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                style={
                                    styles.savePackingButton
                                }
                                onPress={
                                    handleAdd
                                }
                                disabled={
                                    !value.trim()
                                }
                            >
                                <Text
                                    style={
                                        styles.savePackingText
                                    }
                                >
                                    Add
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    )
}

function ItineraryDay({
    date,
    events,
    onRemoveTrail,
    onRemoveActivity,
    onEditEvent,
}) {
    return (
        <View style={styles.itineraryDay}>
            {date ? (
                <Text
                    style={
                        styles.itineraryDate
                    }
                >
                    {date}
                </Text>
            ) : null}

            <View style={styles.timeline}>
                {events.map((event, index) => (
                    <View
                        key={event.id}
                        style={
                            styles.timelineEvent
                        }
                    >
                        <View
                            style={
                                styles.timelineTime
                            }
                        >
                            <Text
                                style={
                                    styles.eventTime
                                }
                            >
                                {event.time
                                    ? formatTime(
                                          event.time
                                      )
                                    : '—'}
                            </Text>
                        </View>

                        <View
                            style={
                                styles.timelineLineContainer
                            }
                        >
                            <View
                                style={
                                    styles.timelineDot
                                }
                            >
                                <Text
                                    style={
                                        styles.timelineEmoji
                                    }
                                >
                                    {event.icon}
                                </Text>
                            </View>

                            {index <
                            events.length - 1 ? (
                                <View
                                    style={
                                        styles.timelineLine
                                    }
                                />
                            ) : null}
                        </View>

                        <Pressable
                            style={
                                styles.eventContent
                            }
                            onPress={() => {
                                onEditEvent(event)
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`edit ${event.title}`}
                        >
                            <Text
                                style={
                                    styles.eventTitle
                                }
                            >
                                {event.title}
                            </Text>

                            <Text
                                style={
                                    styles.eventSubtitle
                                }
                            >
                                {event.subtitle}
                            </Text>

                            {event.outsideTripDates ? (
                                <Text
                                    style={
                                        styles.eventWarning
                                    }
                                >
                                    ⚠ outside trip dates, tap to edit
                                </Text>
                            ) : null}
                        </Pressable>

                        <Pressable
                            style={
                                styles.eventRemove
                            }
                            onPress={() => {
                                if (
                                    event.type ===
                                    'trail'
                                ) {
                                    onRemoveTrail(
                                        event.sourceId
                                    )
                                }

                                if (
                                    event.type ===
                                    'activity'
                                ) {
                                    onRemoveActivity(
                                        event.sourceId
                                    )
                                }
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`remove ${event.title}`}
                            hitSlop={8}
                        >
                            <Text
                                style={
                                    styles.removeText
                                }
                            >
                                ×
                            </Text>
                        </Pressable>
                    </View>
                ))}
            </View>
        </View>
    )
}

function DynamicItinerary({
    trip,
    trails,
    onRemoveTrail,
    onRemoveActivity,
    onEditEvent,
}) {
    const trailEvents = (
        trip.trails || []
    )
        .map((trailReservation, index) => {
            const trailId =
                typeof trailReservation ===
                'string'
                    ? trailReservation
                    : trailReservation.id

            const trail = trails.find(
                (item) =>
                    item.id === trailId
            )

            if (!trail) {
                return null
            }

            return {
                // reservation to allow multiple entries
                id: `trail-${trail.id}-${index}`,
                sourceId: trail.id,
                date:
                    typeof trailReservation ===
                    'object'
                        ? trailReservation.date
                        : null,
                time:
                    typeof trailReservation ===
                    'object'
                        ? trailReservation.time
                        : null,
                icon: '🥾',
                title: trail.name,
                subtitle: `${trail.distance} · ${trail.difficulty}`,
                type: 'trail',
                outsideTripDates:
                    Boolean(
                        typeof trailReservation ===
                            'object' &&
                        trailReservation.date &&
                        (
                            trailReservation.date <
                                trip.startDate ||
                            trailReservation.date >
                                trip.endDate
                        )
                    ),
            }
        })
        .filter(Boolean)

    const activityEvents = (
        trip.activities || []
    )
        .filter(
            (activity) =>
                typeof activity !==
                'string'
        )
        .map((activity) => ({
            id: `activity-${activity.id}`,
            sourceId: activity.id,
            date: activity.date,
            time: activity.time,
            icon: '⭐',
            title: activity.title,
            subtitle:
                activity.location ||
                'Activity',
            type: 'activity',
            outsideTripDates:
                Boolean(
                    activity.date &&
                    (
                        activity.date <
                            trip.startDate ||
                        activity.date >
                            trip.endDate
                    )
                ),
        }))

    const allEvents = [
        ...trailEvents,
        ...activityEvents,
    ]

    const scheduledEvents =
        allEvents
            .filter(
                (event) =>
                    event.date &&
                    event.time
            )
            .sort((a, b) => {
                const first =
                    `${a.date}|${a.time}`

                const second =
                    `${b.date}|${b.time}`

                return first.localeCompare(
                    second
                )
            })

    const dateOnlyEvents =
        allEvents
            .filter(
                (event) =>
                    event.date &&
                    !event.time
            )
            .sort((a, b) =>
                a.date.localeCompare(
                    b.date
                )
            )

    const unscheduledEvents =
        allEvents.filter(
            (event) =>
                !event.date
        )

    const datedEvents = [
        ...scheduledEvents,
        ...dateOnlyEvents,
    ].sort((a, b) => {
        const first =
            `${a.date}|${
                a.time || '00:00'
            }`

        const second =
            `${b.date}|${
                b.time || '00:00'
            }`

        return first.localeCompare(
            second
        )
    })

    const grouped =
        datedEvents.reduce(
            (groups, event) => {
                if (!groups[event.date]) {
                    groups[event.date] =
                        []
                }

                groups[event.date].push(
                    event
                )

                return groups
            },
            {}
        )

    const dates =
        Object.keys(grouped).sort()

    return (
        <View>
            {dates.length === 0 &&
            unscheduledEvents.length ===
                0 ? (
                <EmptySection
                    text="No activities planned yet"
                />
            ) : null}

            {dates.map((date) => (
                <ItineraryDay
                    key={date}
                    date={formatItineraryDate(
                        date
                    )}
                    events={
                        grouped[date]
                    }
                    onRemoveTrail={
                        onRemoveTrail
                    }
                    onRemoveActivity={
                        onRemoveActivity
                    }
                    onEditEvent={
                        onEditEvent
                    }
                />
            ))}

            {unscheduledEvents.length >
            0 ? (
                <View
                    style={
                        styles.unscheduledSection
                    }
                >
                    <Text
                        style={
                            styles.unscheduledTitle
                        }
                    >
                        Needs scheduling
                    </Text>

                    <ItineraryDay
                        events={
                            unscheduledEvents
                        }
                        onRemoveTrail={
                            onRemoveTrail
                        }
                        onRemoveActivity={
                            onRemoveActivity
                        }
                        onEditEvent={
                            onEditEvent
                        }
                    />
                </View>
            ) : null}
        </View>
    )
}

// STATS component
function TripStats({ trip }) {
    const duration = calculateTripDuration(
        trip.startDate,
        trip.endDate
    )

    const trailCount =
        (trip.trails || []).length

    const campsiteCount =
        (trip.campsites || []).length

    const activityCount =
        (trip.activities || []).length

    return (
        <View style={styles.statsContainer}>
            <TripStat
                value={duration}
                label="days"
            />

            <TripStat
                value={trailCount}
                label="trails"
            />

            <TripStat
                value={campsiteCount}
                label="campsites"
            />

            <TripStat
                value={activityCount}
                label="activities"
            />
        </View>
    )
}

function TripStat({
    value,
    label,
}) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statValue}>
                {value}
            </Text>

            <Text style={styles.statLabel}>
                {label}
            </Text>
        </View>
    )
}

function formatDateRange(
    startDate,
    endDate
) {
    const start = new Date(
        `${startDate}T12:00:00`
    )

    const end = new Date(
        `${endDate}T12:00:00`
    )

    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }

    return `${start.toLocaleDateString(
        'en-US',
        options
    )} — ${end.toLocaleDateString(
        'en-US',
        options
    )}`
}

function formatTripDate(
    dateString
) {
    if (!dateString) {
        return ''
    }

    const date = new Date(
        `${dateString}T12:00:00`
    )

    return date.toLocaleDateString(
        'en-US',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }
    )
}

function formatItineraryDate(
    dateString
) {
    const date = new Date(
        `${dateString}T12:00:00`
    )

    return date.toLocaleDateString(
        'en-US',
        {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        }
    )
}

function formatTime(timeString) {
    if (!timeString) {
        return ''
    }

    const parts =
        timeString.split(':')

    const hours =
        Number(parts[0]) || 0

    const minutes =
        Number(parts[1]) || 0

    const date = new Date()

    date.setHours(
        hours,
        minutes,
        0,
        0
    )

    return date.toLocaleTimeString(
        'en-US',
        {
            hour: 'numeric',
            minute: '2-digit',
        }
    )
}

// Duration helper
function calculateTripDuration(
    startDate,
    endDate
) {
    if (!startDate || !endDate) {
        return 0
    }

    const start = createTripDate(
        startDate
    )

    const end = createTripDate(
        endDate
    )

    const millisecondsPerDay =
        1000 * 60 * 60 * 24

    return (
        Math.round(
            (end.getTime() -
                start.getTime()) /
                millisecondsPerDay
        ) + 1
    )
}

function createTripDate(dateString) {
    if (!dateString) {
        return new Date()
    }

    const [year, month, day] =
        dateString
            .split('-')
            .map(Number)

    return new Date(
        year,
        month - 1,
        day,
        12,
        0,
        0,
        0
    )
}

function capitalize(value) {
    if (!value) {
        return ''
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    )
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor:
            theme.colors.parchment,
        flex: 1,
    },

    content: {
        paddingBottom: 40,
        paddingHorizontal:
            theme.spacing.lg,
    },

    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent:
            'space-between',
    },

    backButton: {
        alignItems: 'center',
        height: 42,
        justifyContent: 'center',
        width: 42,
    },

    backButtonText: {
        color: theme.colors.forest,
        fontSize: 36,
        fontWeight: '300',
        lineHeight: 38,
    },

    headerTitle: {
        color: theme.colors.ink,
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        marginHorizontal:
            theme.spacing.sm,
        textAlign: 'center',
    },

    favoriteButton: {
        alignItems: 'center',
        height: 42,
        justifyContent: 'center',
        width: 42,
    },

    favoriteIcon: {
        color: theme.colors.forest,
        fontSize: 28,
    },

    hero: {
        alignItems: 'center',
        paddingBottom:
            theme.spacing.xl,
        paddingTop:
            theme.spacing.xl,
    },

    heroIcon: {
        alignItems: 'center',
        backgroundColor:
            theme.colors.sage,
        borderRadius: 42,
        height: 84,
        justifyContent: 'center',
        marginBottom:
            theme.spacing.md,
        width: 84,
    },

    heroEmoji: {
        fontSize: 40,
    },

    eyebrow: {
        color: theme.colors.forest,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
    },

    title: {
        color: theme.colors.ink,
        fontSize: 28,
        fontWeight: '700',
        marginTop:
            theme.spacing.xs,
        textAlign: 'center',
    },

    parkName: {
        color: theme.colors.earth,
        fontSize: 14,
        marginTop:
            theme.spacing.xs,
        textAlign: 'center',
    },

    dates: {
        color: theme.colors.bark,
        fontSize: 13,
        marginTop:
            theme.spacing.sm,
    },

    sectionHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom:
            theme.spacing.sm,
        marginTop:
            theme.spacing.lg,
    },

    sectionIcon: {
        fontSize: 20,
        marginRight:
            theme.spacing.sm,
    },

    sectionTitle: {
        color: theme.colors.ink,
        fontSize: 20,
        fontWeight: '700',
    },

    savedItem: {
        alignItems: 'center',
        backgroundColor:
            theme.colors.canvas,
        borderRadius:
            theme.radii.md,
        flexDirection: 'row',
        marginBottom:
            theme.spacing.sm,
        minHeight: 68,
        padding:
            theme.spacing.sm,
        ...theme.shadows.card,
    },

    savedItemIcon: {
        alignItems: 'center',
        backgroundColor:
            theme.colors.sage,
        borderRadius: 20,
        height: 40,
        justifyContent: 'center',
        width: 40,
    },

    savedItemEmoji: {
        fontSize: 20,
    },

    savedItemContent: {
        flex: 1,
        marginLeft:
            theme.spacing.sm,
    },

    savedItemTitle: {
        color: theme.colors.ink,
        fontSize: 14,
        fontWeight: '700',
    },

    savedItemSubtitle: {
        color: theme.colors.earth,
        fontSize: 11,
        marginTop: 2,
    },

    removeButton: {
        alignItems: 'center',
        height: 34,
        justifyContent: 'center',
        width: 34,
    },

    removeText: {
        color: theme.colors.earth,
        fontSize: 22,
        fontWeight: '300',
    },

    campsiteCard: {
        backgroundColor:
            theme.colors.canvas,
        borderRadius:
            theme.radii.md,
        marginBottom:
            theme.spacing.sm,
        padding:
            theme.spacing.sm,
        ...theme.shadows.card,
    },

    campsiteHeader: {
        alignItems: 'center',
        flexDirection: 'row',
    },

    campsiteIcon: {
        alignItems: 'center',
        backgroundColor:
            theme.colors.sage,
        borderRadius: 20,
        height: 40,
        justifyContent: 'center',
        width: 40,
    },

    campsiteEmoji: {
        fontSize: 20,
    },

    campsiteTitleContainer: {
        flex: 1,
        marginLeft:
            theme.spacing.sm,
    },

    detailRow: {
        alignItems: 'center',
        borderTopColor:
            theme.colors.sage,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent:
            'space-between',
        marginTop:
            theme.spacing.sm,
        paddingTop:
            theme.spacing.sm,
    },

    detailLabel: {
        color: theme.colors.earth,
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
    },

    detailValue: {
        color: theme.colors.forest,
        fontSize: 12,
        fontWeight: '700',
    },

    notesContainer: {
        borderTopColor:
            theme.colors.sage,
        borderTopWidth: 1,
        marginTop:
            theme.spacing.sm,
        paddingTop:
            theme.spacing.sm,
    },

    notesText: {
        color: theme.colors.bark,
        fontSize: 11,
        lineHeight: 17,
        marginTop: 4,
    },

    emptySection: {
        backgroundColor:
            theme.colors.canvas,
        borderColor:
            theme.colors.sage,
        borderRadius:
            theme.radii.md,
        borderWidth: 1,
        marginBottom:
            theme.spacing.sm,
        padding:
            theme.spacing.md,
    },

    emptySectionText: {
        color: theme.colors.earth,
        fontSize: 13,
        textAlign: 'center',
    },

    addButton: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom:
            theme.spacing.sm,
        paddingVertical:
            theme.spacing.xs,
    },

    addButtonText: {
        color: theme.colors.forest,
        fontSize: 20,
        fontWeight: '400',
        marginRight:
            theme.spacing.xs,
    },

    addButtonLabel: {
        color: theme.colors.forest,
        fontSize: 13,
        fontWeight: '700',
    },

    notesCard: {
        backgroundColor:
            theme.colors.canvas,
        borderColor:
            theme.colors.sage,
        borderRadius:
            theme.radii.md,
        borderWidth: 1,
        minHeight: 120,
        padding:
            theme.spacing.md,
    },

    notesInput: {
        color: theme.colors.ink,
        fontSize: 14,
        lineHeight: 21,
        minHeight: 90,
    },

    checklistItem: {
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 46,
    },

    checklistMain: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
    },

    checkbox: {
        alignItems: 'center',
        borderColor:
            theme.colors.earth,
        borderRadius: 5,
        borderWidth: 1.5,
        height: 22,
        justifyContent: 'center',
        width: 22,
    },

    completedCheckbox: {
        backgroundColor:
            theme.colors.forest,
        borderColor:
            theme.colors.forest,
    },

    checkmark: {
        color:
            theme.colors.parchment,
        fontSize: 14,
        fontWeight: '700',
    },

    checklistLabel: {
        color: theme.colors.ink,
        fontSize: 14,
        marginLeft:
            theme.spacing.sm,
    },

    completedChecklistLabel: {
        color: theme.colors.earth,
        textDecorationLine:
            'line-through',
    },

    checklistRemove: {
        alignItems: 'center',
        height: 34,
        justifyContent: 'center',
        width: 34,
    },

    divider: {
        backgroundColor:
            theme.colors.sage,
        height: 1,
        marginTop:
            theme.spacing.xl,
    },

    itineraryHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent:
            'space-between',
        marginTop:
            theme.spacing.xl,
    },

    itineraryTitleRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },

    itineraryIcon: {
        fontSize: 24,
        marginRight:
            theme.spacing.sm,
    },

    itinerarySubtitle: {
        color: theme.colors.earth,
        fontSize: 11,
        marginTop: 2,
    },

    addItineraryButton: {
        alignItems: 'center',
        backgroundColor:
            theme.colors.forest,
        borderRadius: 18,
        height: 36,
        justifyContent: 'center',
        width: 36,
    },

    addItineraryText: {
        color:
            theme.colors.parchment,
        fontSize: 23,
        fontWeight: '300',
    },

    itineraryDay: {
        marginTop:
            theme.spacing.xl,
    },

    itineraryDate: {
        color: theme.colors.forest,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom:
            theme.spacing.md,
        textTransform:
            'uppercase',
    },

    timeline: {
        paddingLeft: 2,
    },

    timelineEvent: {
        flexDirection: 'row',
        minHeight: 76,
    },

    timelineTime: {
        paddingTop: 4,
        width: 62,
    },

    eventTime: {
        color: theme.colors.earth,
        fontSize: 11,
        fontWeight: '600',
    },

    timelineLineContainer: {
        alignItems: 'center',
        marginRight:
            theme.spacing.md,
        width: 28,
    },

    timelineDot: {
        alignItems: 'center',
        backgroundColor:
            theme.colors.sage,
        borderRadius: 18,
        height: 36,
        justifyContent: 'center',
        width: 36,
        zIndex: 1,
    },

    timelineEmoji: {
        fontSize: 17,
    },

    timelineLine: {
        backgroundColor:
            theme.colors.sage,
        bottom: -2,
        position: 'absolute',
        top: 34,
        width: 2,
    },

    eventContent: {
        flex: 1,
        paddingTop: 3,
    },

    eventTitle: {
        color: theme.colors.ink,
        fontSize: 14,
        fontWeight: '700',
    },

    eventSubtitle: {
        color: theme.colors.earth,
        fontSize: 11,
        marginTop: 3,
    },

    eventRemove: {
        alignItems: 'center',
        height: 32,
        justifyContent: 'center',
        width: 32,
    },

    unscheduledSection: {
        marginTop:
            theme.spacing.xl,
    },

    unscheduledTitle: {
        color: theme.colors.forest,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom:
            theme.spacing.sm,
        textTransform:
            'uppercase',
    },

    bottomSpacer: {
        height: 40,
    },

    errorText: {
        color: theme.colors.earth,
        fontSize: 15,
        margin:
            theme.spacing.xl,
        textAlign: 'center',
    },

    modalOverlay: {
        alignItems: 'center',
        backgroundColor:
            'rgba(30, 40, 25, 0.45)',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal:
            theme.spacing.lg,
    },

    packingModal: {
        backgroundColor:
            theme.colors.parchment,
        borderRadius:
            theme.radii.lg,
        maxWidth: 420,
        padding:
            theme.spacing.lg,
        width: '100%',
        ...theme.shadows.card,
    },

    modalTitle: {
        color: theme.colors.ink,
        fontSize: 20,
        fontWeight: '700',
    },

    packingInput: {
        backgroundColor:
            theme.colors.canvas,
        borderColor:
            theme.colors.sage,
        borderRadius:
            theme.radii.md,
        borderWidth: 1,
        color: theme.colors.ink,
        fontSize: 14,
        marginTop:
            theme.spacing.md,
        minHeight: 50,
        paddingHorizontal:
            theme.spacing.md,
    },

    modalActions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop:
            theme.spacing.lg,
    },

    cancelButton: {
        alignItems: 'center',
        borderColor:
            theme.colors.sage,
        borderRadius:
            theme.radii.md,
        borderWidth: 1,
        flex: 1,
        minHeight: 48,
        justifyContent: 'center',
    },

    cancelButtonText: {
        color: theme.colors.earth,
        fontSize: 14,
        fontWeight: '600',
    },

    savePackingButton: {
        alignItems: 'center',
        backgroundColor:
            theme.colors.forest,
        borderRadius:
            theme.radii.md,
        flex: 1,
        minHeight: 48,
        justifyContent: 'center',
    },

    savePackingText: {
        color:
            theme.colors.parchment,
        fontSize: 14,
        fontWeight: '700',
    },

    eventWarning: {
        color: '#a2382c',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },

        statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.lg,
    },

    statCard: {
        backgroundColor:
            theme.colors.canvas,
        borderColor:
            theme.colors.sage,
        borderRadius:
            theme.radii.md,
        borderWidth: 1,
        minHeight: 82,
        padding:
            theme.spacing.md,
        width: '48%',
    },

    statValue: {
        color: theme.colors.forest,
        fontSize: 24,
        fontWeight: '700',
    },

    statLabel: {
        color: theme.colors.earth,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: 3,
        textTransform: 'uppercase',
    },
})