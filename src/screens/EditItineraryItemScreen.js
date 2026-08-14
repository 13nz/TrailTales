import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    Modal,
    Keyboard,
} from 'react-native'

import { useState, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DateTimePicker from '@react-native-community/datetimepicker'

import theme from '../constants/theme'
import mockTrails from '../data/mockTrails'
import { useTrips } from '../context/TripContext'

// edits the scheduled date and time of an itinerary trail or activity
export default function EditItineraryItemScreen({
    route,
    navigation,
}) {
    const insets = useSafeAreaInsets()
    const { trips, updateTrip } = useTrips()

    const {
        tripId,
        itemType,
        itemId,
    } = route.params

    const trip = trips.find(
        (item) => item.id === tripId
    )

    /*
     * finds the actual saved itinerary item
     */
    const itineraryItem = trip
        ? findItineraryItem(
              trip,
              itemType,
              itemId
          )
        : null

    /*
     * null = no picker
     * date = date picker
     * time = time picker
     */
    const [activePicker, setActivePicker] =
        useState(null)

    /*
     * forces the native picker to be recreated
     * every time it opens
     *
     * this is the same implementation that
     * fixed the iOS picker problem in the
     * add activity and add trail screens
     */
    const [pickerInstance, setPickerInstance] =
        useState(0)

    const [selectedDate, setSelectedDate] =
        useState(() =>
            createSafeDate(
                itineraryItem?.date ||
                    trip?.startDate
            )
        )

    /*
     * stores time separately from the date
     */
    const [selectedTime, setSelectedTime] =
        useState(() =>
            parseStoredTime(
                itineraryItem?.time
            )
        )

    /*
     * refreshes the local schedule when
     * the itinerary item changes
     */
    useEffect(() => {
        setSelectedDate(
            createSafeDate(
                itineraryItem?.date ||
                    trip?.startDate
            )
        )

        setSelectedTime(
            parseStoredTime(
                itineraryItem?.time
            )
        )

        setActivePicker(null)
    }, [
        itemId,
        itineraryItem?.date,
        itineraryItem?.time,
        trip?.startDate,
    ])

    if (!trip) {
        return (
            <View
                style={
                    styles.screen
                }
            >
                <Text
                    style={
                        styles.errorText
                    }
                >
                    Trip could not be
                    found.
                </Text>
            </View>
        )
    }

    if (!itineraryItem) {
        return (
            <View
                style={
                    styles.screen
                }
            >
                <Text
                    style={
                        styles.errorText
                    }
                >
                    Itinerary item could not
                    be found.
                </Text>
            </View>
        )
    }

    const trail =
        itemType === 'trail'
            ? mockTrails.find(
                  (item) =>
                      item.id === itemId
              )
            : null

    const title =
        itemType === 'trail'
            ? trail?.name ||
              'Trail'
            : itineraryItem.title ||
              'Activity'

    const subtitle =
        itemType === 'trail'
            ? trail
                ? `${trail.distance} · ${trail.difficulty}`
                : 'Trail'
            : itineraryItem.location ||
              'Activity'

    const tripStartDate =
        createSafeDate(
            trip.startDate
        )

    const tripEndDate =
        createSafeDate(
            trip.endDate
        )

    const isOutsideTripDates =
        selectedDate <
            tripStartDate ||
        selectedDate >
            tripEndDate

    /*
     * opens the requested picker
     *
     * incrementing pickerInstance forces
     * React to create a completely new
     * native DateTimePicker
     */
    const openPicker = (
        picker
    ) => {
        // dismisses the keyboard before opening the picker
        Keyboard.dismiss()

        // forces a fresh native picker instance every time it opens
        setPickerInstance(
            (current) => current + 1
        )

        setActivePicker(picker)
    }

    /*
     * closes the picker
     */
    const closePicker = () => {
        // closes the date or time picker
        setActivePicker(null)
    }

    /*
     * handles both date and time pickers
     */
    const handlePickerChange = (
        event,
        value
    ) => {
        /*
         * native picker was dismissed
         */
        if (
            event?.type ===
            'dismissed'
        ) {
            closePicker()
            return
        }

        if (!value) {
            return
        }

        /*
         * only update the date when
         * the date picker is active
         */
        if (
            activePicker ===
            'date'
        ) {
            setSelectedDate(
                value
            )
        }

        /*
         * only update the time when
         * the time picker is active
         */
        if (
            activePicker ===
            'time'
        ) {
            setSelectedTime({
                hour:
                    value.getHours(),
                minute:
                    value.getMinutes(),
            })
        }
    }

    /*
     * saves the edited date and time
     */
    const handleSave = () => {
        const newDate =
            formatDatabaseDate(
                selectedDate
            )

        const newTime =
            formatDatabaseTime(
                selectedTime
            )

        /*
         * update a trail reservation
         */
        if (
            itemType ===
            'trail'
        ) {
            const updatedTrails =
                (
                    trip.trails ||
                    []
                ).map(
                    (
                        trailReservation
                    ) => {
                        const reservationId =
                            typeof trailReservation ===
                            'string'
                                ? trailReservation
                                : trailReservation.id

                        if (
                            reservationId !==
                            itemId
                        ) {
                            return trailReservation
                        }

                        return {
                            id:
                                itemId,
                            date:
                                newDate,
                            time:
                                newTime,
                        }
                    }
                )

            updateTrip(
                trip.id,
                {
                    trails:
                        updatedTrails,
                }
            )
        }

        /*
         * update a custom activity
         */
        if (
            itemType ===
            'activity'
        ) {
            const updatedActivities =
                (
                    trip.activities ||
                    []
                ).map(
                    (activity) => {
                        /*
                         * preserve older string activities
                         */
                        if (
                            typeof activity ===
                            'string'
                        ) {
                            return activity
                        }

                        /*
                         * leave all other activities untouched
                         */
                        if (
                            activity.id !==
                            itemId
                        ) {
                            return activity
                        }

                        /*
                         * preserve the activity's
                         * existing title, location,
                         * notes, and other properties
                         */
                        return {
                            ...activity,
                            date:
                                newDate,
                            time:
                                newTime,
                        }
                    }
                )

            updateTrip(
                trip.id,
                {
                    activities:
                        updatedActivities,
                }
            )
        }

        Keyboard.dismiss()
        navigation.goBack()
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
                    },
                ]}
                showsVerticalScrollIndicator={
                    false
                }
            >
                {/* header */}

                <View
                    style={
                        styles.header
                    }
                >
                    <Pressable
                        style={
                            styles.backButton
                        }
                        onPress={() => {
                            // dismisses the keyboard before leaving the screen
                            Keyboard.dismiss()
                            navigation.goBack()
                        }}
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
                    >
                        Edit schedule
                    </Text>

                    <View
                        style={
                            styles.headerSpacer
                        }
                    />
                </View>

                {/* item information */}

                <View
                    style={
                        styles.intro
                    }
                >
                    <Text
                        style={
                            styles.eyebrow
                        }
                    >
                        {itemType ===
                        'trail'
                            ? 'TRAIL'
                            : 'ACTIVITY'}
                    </Text>

                    <Text
                        style={
                            styles.title
                        }
                    >
                        {title}
                    </Text>

                    <Text
                        style={
                            styles.description
                        }
                    >
                        {subtitle}
                    </Text>
                </View>

                {/* schedule */}

                <View
                    style={
                        styles.scheduleCard
                    }
                >
                    <Text
                        style={
                            styles.scheduleHeading
                        }
                    >
                        Schedule
                    </Text>

                    <Text
                        style={
                            styles.scheduleDescription
                        }
                    >
                        Choose when you plan to
                        do this during your trip.
                    </Text>

                    {/* date */}

                    <Text
                        style={[
                            styles.label,
                            styles.firstLabel,
                        ]}
                    >
                        Date
                    </Text>

                    <Pressable
                        style={
                            styles.dateInput
                        }
                        onPress={() =>
                            openPicker(
                                'date'
                            )
                        }
                        accessibilityRole="button"
                        accessibilityLabel="edit itinerary date"
                    >
                        <Text
                            style={
                                styles.dateText
                            }
                        >
                            {formatDisplayDate(
                                selectedDate
                            )}
                        </Text>

                        <Text
                            style={
                                styles.icon
                            }
                        >
                            ▣
                        </Text>
                    </Pressable>

                    {/* time */}

                    <Text
                        style={[
                            styles.label,
                            styles.timeLabel,
                        ]}
                    >
                        Time
                    </Text>

                    <Pressable
                        style={
                            styles.dateInput
                        }
                        onPress={() =>
                            openPicker(
                                'time'
                            )
                        }
                        accessibilityRole="button"
                        accessibilityLabel="edit itinerary time"
                    >
                        <Text
                            style={
                                styles.dateText
                            }
                        >
                            {formatDisplayTime(
                                selectedTime
                            )}
                        </Text>

                        <Text
                            style={
                                styles.icon
                            }
                        >
                            ◷
                        </Text>
                    </Pressable>
                </View>

                {/* warning */}

                {isOutsideTripDates ? (
                    <View
                        style={
                            styles.warningCard
                        }
                    >
                        <Text
                            style={
                                styles.warningIcon
                            }
                        >
                            ⚠
                        </Text>

                        <View
                            style={
                                styles.warningContent
                            }
                        >
                            <Text
                                style={
                                    styles.warningTitle
                                }
                            >
                                Outside trip dates
                            </Text>

                            <Text
                                style={
                                    styles.warningText
                                }
                            >
                                Choose a date between{' '}
                                {formatDisplayDate(
                                    tripStartDate
                                )}{' '}
                                and{' '}
                                {formatDisplayDate(
                                    tripEndDate
                                )}
                                .
                            </Text>
                        </View>
                    </View>
                ) : null}
            </ScrollView>

            {/* save */}

            <View
                style={[
                    styles.bottomAction,
                    {
                        paddingBottom:
                            insets.bottom +
                            theme.spacing.sm,
                    },
                ]}
            >
                <Pressable
                    style={
                        styles.saveButton
                    }
                    onPress={
                        handleSave
                    }
                    accessibilityRole="button"
                    accessibilityLabel="save itinerary changes"
                >
                    <Text
                        style={
                            styles.saveButtonText
                        }
                    >
                        Save changes
                    </Text>
                </Pressable>
            </View>

            {/* native date/time picker */}

            <Modal
                visible={
                    activePicker !==
                    null
                }
                transparent
                animationType="fade"
                onRequestClose={
                    closePicker
                }
            >
                <View
                    style={
                        styles.modalOverlay
                    }
                >
                    <View
                        style={[
                            styles.modal,
                            {
                                paddingBottom:
                                    insets.bottom +
                                    theme.spacing.md,
                            },
                        ]}
                    >
                        <View
                            style={
                                styles.modalHeader
                            }
                        >
                            <View>
                                <Text
                                    style={
                                        styles.modalEyebrow
                                    }
                                >
                                    SELECT
                                </Text>

                                <Text
                                    style={
                                        styles.modalTitle
                                    }
                                >
                                    {activePicker ===
                                    'date'
                                        ? 'Date'
                                        : 'Start time'}
                                </Text>
                            </View>

                            <Pressable
                                style={
                                    styles.modalClose
                                }
                                onPress={
                                    closePicker
                                }
                                accessibilityRole="button"
                                accessibilityLabel="close picker"
                            >
                                <Text
                                    style={
                                        styles.modalCloseText
                                    }
                                >
                                    ×
                                </Text>
                            </Pressable>
                        </View>

                        <View
                            style={
                                styles.pickerContainer
                            }
                        >
                            {activePicker ? (
                                <DateTimePicker
                                    /*
                                     * this is the important iOS fix
                                     *
                                     * every time the user opens the
                                     * date or time picker, React gets
                                     * a completely new native picker
                                     */
                                    key={`${pickerInstance}-${activePicker}`}
                                    value={
                                        activePicker ===
                                        'date'
                                            ? selectedDate
                                            : createPickerTime(
                                                  selectedTime
                                              )
                                    }
                                    mode={
                                        activePicker ===
                                        'date'
                                            ? 'date'
                                            : 'time'
                                    }
                                    display="spinner"
                                    minimumDate={
                                        activePicker ===
                                        'date'
                                            ? tripStartDate
                                            : undefined
                                    }
                                    maximumDate={
                                        activePicker ===
                                        'date'
                                            ? tripEndDate
                                            : undefined
                                    }
                                    onChange={
                                        handlePickerChange
                                    }
                                    themeVariant="light"
                                />
                            ) : null}
                        </View>

                        <Pressable
                            style={
                                styles.doneButton
                            }
                            onPress={
                                closePicker
                            }
                            accessibilityRole="button"
                            accessibilityLabel="done selecting"
                        >
                            <Text
                                style={
                                    styles.doneButtonText
                            }
                            >
                                Done
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

/*
 * finds the actual saved item inside the trip
 */
function findItineraryItem(
    trip,
    itemType,
    itemId
) {
    if (
        itemType ===
        'trail'
    ) {
        const reservation =
            (
                trip.trails ||
                []
            ).find(
                (item) => {
                    if (
                        typeof item ===
                        'string'
                    ) {
                        return (
                            item ===
                            itemId
                        )
                    }

                    return (
                        item.id ===
                        itemId
                    )
                }
            )

        if (!reservation) {
            return null
        }

        /*
         * supports older trips where
         * trails were stored as plain ids
         */
        if (
            typeof reservation ===
            'string'
        ) {
            return {
                id:
                    itemId,
                date:
                    trip.startDate,
                time:
                    '08:00',
            }
        }

        return reservation
    }

    if (
        itemType ===
        'activity'
    ) {
        return (
            (
                trip.activities ||
                []
            ).find(
                (item) =>
                    typeof item !==
                        'string' &&
                    item.id ===
                        itemId
            ) || null
        )
    }

    return null
}

/*
 * safely converts YYYY-MM-DD into
 * a local Date
 *
 * this avoids the UTC parsing problem
 * caused by new Date('YYYY-MM-DD')
 */
function createSafeDate(
    dateString
) {
    if (!dateString) {
        return new Date()
    }

    const parts =
        String(
            dateString
        )
            .slice(0, 10)
            .split('-')

    if (
        parts.length !==
        3
    ) {
        return new Date()
    }

    const year =
        Number(parts[0])

    const month =
        Number(parts[1])

    const day =
        Number(parts[2])

    if (
        !Number.isFinite(
            year
        ) ||
        !Number.isFinite(
            month
        ) ||
        !Number.isFinite(
            day
        )
    ) {
        return new Date()
    }

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

/*
 * converts the saved HH:mm value
 * into separate hour/minute state
 */
function parseStoredTime(
    timeString
) {
    if (!timeString) {
        return {
            hour: 8,
            minute: 0,
        }
    }

    const parts =
        String(
            timeString
        )
            .slice(0, 5)
            .split(':')

    const hour =
        Number(parts[0])

    const minute =
        Number(parts[1])

    if (
        !Number.isFinite(
            hour
        ) ||
        !Number.isFinite(
            minute
        )
    ) {
        return {
            hour: 8,
            minute: 0,
        }
    }

    return {
        hour,
        minute,
    }
}

/*
 * creates the Date object used by
 * the native time picker
 *
 * the calendar date is deliberately
 * unrelated to the itinerary date
 */
function createPickerTime(
    time
) {
    return new Date(
        2000,
        0,
        1,
        time.hour,
        time.minute,
        0,
        0
    )
}

function formatDatabaseDate(
    date
) {
    const year =
        date.getFullYear()

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            '0'
        )

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            '0'
        )

    return `${year}-${month}-${day}`
}

function formatDatabaseTime(
    time
) {
    return `${String(
        time.hour
    ).padStart(
        2,
        '0'
    )}:${String(
        time.minute
    ).padStart(
        2,
        '0'
    )}`
}

function formatDisplayDate(
    date
) {
    return date.toLocaleDateString(
        'en-US',
        {
            weekday:
                'short',
            month:
                'short',
            day:
                'numeric',
            year:
                'numeric',
        }
    )
}

function formatDisplayTime(
    time
) {
    return createPickerTime(
        time
    ).toLocaleTimeString(
        'en-US',
        {
            hour:
                'numeric',
            minute:
                '2-digit',
        }
    )
}

const styles =
    StyleSheet.create({
        screen: {
            backgroundColor:
                theme.colors
                    .parchment,
            flex: 1,
        },

        content: {
            paddingBottom: 120,
            paddingHorizontal:
                theme.spacing.lg,
        },

        header: {
            alignItems:
                'center',
            flexDirection:
                'row',
            justifyContent:
                'space-between',
        },

        backButton: {
            alignItems:
                'center',
            height: 42,
            justifyContent:
                'center',
            width: 42,
        },

        backButtonText: {
            color:
                theme.colors
                    .forest,
            fontSize: 36,
            fontWeight:
                '300',
            lineHeight: 38,
        },

        headerTitle: {
            color:
                theme.colors
                    .ink,
            fontSize: 17,
            fontWeight:
                '700',
        },

        headerSpacer: {
            width: 42,
        },

        intro: {
            marginTop:
                theme.spacing.xl,
        },

        eyebrow: {
            color:
                theme.colors
                    .forest,
            fontSize: 10,
            fontWeight:
                '700',
            letterSpacing: 1.5,
        },

        title: {
            color:
                theme.colors
                    .ink,
            fontSize: 28,
            fontWeight:
                '700',
            marginTop:
                theme.spacing.xs,
        },

        description: {
            color:
                theme.colors
                    .earth,
            fontSize: 14,
            marginTop:
                theme.spacing.xs,
        },

        scheduleCard: {
            backgroundColor:
                theme.colors
                    .canvas,
            borderColor:
                theme.colors
                    .sage,
            borderRadius:
                theme.radii.lg,
            borderWidth: 1,
            marginTop:
                theme.spacing.xl,
            padding:
                theme.spacing.lg,
        },

        scheduleHeading: {
            color:
                theme.colors
                    .ink,
            fontSize: 18,
            fontWeight:
                '700',
        },

        scheduleDescription: {
            color:
                theme.colors
                    .earth,
            fontSize: 12,
            lineHeight: 18,
            marginTop:
                theme.spacing.xs,
        },

        label: {
            color:
                theme.colors
                    .ink,
            fontSize: 11,
            fontWeight:
                '700',
        },

        firstLabel: {
            marginTop:
                theme.spacing.lg,
        },

        timeLabel: {
            marginTop:
                theme.spacing.lg,
        },

        dateInput: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .parchment,
            borderColor:
                theme.colors
                    .sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            marginTop:
                theme.spacing.sm,
            minHeight: 52,
            paddingHorizontal:
                theme.spacing.md,
        },

        dateText: {
            color:
                theme.colors
                    .ink,
            fontSize: 14,
        },

        icon: {
            color:
                theme.colors
                    .forest,
            fontSize: 17,
        },

        warningCard: {
            alignItems:
                'flex-start',
            backgroundColor:
                '#F4E7C8',
            borderColor:
                '#C0392B',
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            flexDirection:
                'row',
            marginTop:
                theme.spacing.md,
            padding:
                theme.spacing.md,
        },

        warningIcon: {
            color:
                '#C0392B',
            fontSize: 18,
        },

        warningContent: {
            flex: 1,
            marginLeft:
                theme.spacing.sm,
        },

        warningTitle: {
            color:
                '#C0392B',
            fontSize: 13,
            fontWeight:
                '700',
        },

        warningText: {
            color:
                theme.colors
                    .earth,
            fontSize: 11,
            lineHeight: 17,
            marginTop: 3,
        },

        bottomAction: {
            backgroundColor:
                theme.colors
                    .parchment,
            paddingHorizontal:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.sm,
        },

        saveButton: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .forest,
            borderRadius:
                theme.radii.md,
            minHeight: 54,
            justifyContent:
                'center',
        },

        saveButtonText: {
            color:
                theme.colors
                    .parchment,
            fontSize: 15,
            fontWeight:
                '700',
        },

        modalOverlay: {
            alignItems:
                'center',
            backgroundColor:
                'rgba(30, 40, 25, 0.45)',
            flex: 1,
            justifyContent:
                'center',
            paddingHorizontal:
                theme.spacing.lg,
        },

        modal: {
            backgroundColor:
                theme.colors
                    .parchment,
            borderRadius:
                theme.radii.lg,
            maxWidth: 420,
            overflow:
                'hidden',
            paddingHorizontal:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.lg,
            width: '100%',
            ...theme.shadows.card,
        },

        modalHeader: {
            alignItems:
                'center',
            flexDirection:
                'row',
            justifyContent:
                'space-between',
        },

        modalEyebrow: {
            color:
                theme.colors
                    .forest,
            fontSize: 10,
            fontWeight:
                '700',
            letterSpacing: 1.5,
        },

        modalTitle: {
            color:
                theme.colors
                    .ink,
            fontSize: 22,
            fontWeight:
                '700',
            marginTop: 2,
        },

        modalClose: {
            alignItems:
                'center',
            height: 36,
            justifyContent:
                'center',
            width: 36,
        },

        modalCloseText: {
            color:
                theme.colors
                    .earth,
            fontSize: 28,
            fontWeight:
                '300',
        },

        pickerContainer: {
            alignItems:
                'center',
            justifyContent:
                'center',
            minHeight: 260,
            overflow:
                'hidden',
        },

        doneButton: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .forest,
            borderRadius:
                theme.radii.md,
            minHeight: 50,
            justifyContent:
                'center',
        },

        doneButtonText: {
            color:
                theme.colors
                    .parchment,
            fontSize: 15,
            fontWeight:
                '700',
        },

        errorText: {
            color:
                theme.colors
                    .earth,
            fontSize: 15,
            margin:
                theme.spacing.xl,
            textAlign:
                'center',
        },
    })