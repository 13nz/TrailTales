import {
    View,
    Text,
    Pressable,
    TextInput,
    ScrollView,
    StyleSheet,
    Keyboard,
    Modal,
} from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'

import theme from '../constants/theme'
import { useTrips } from '../context/TripContext'

// provides a form for adding a custom activity to a trip
export default function AddActivityScreen({
    route,
    navigation,
}) {
    const insets = useSafeAreaInsets()
    const { trips, updateTrip } = useTrips()

    const { tripId } = route.params

    const trip = trips.find(
        (item) => item.id === tripId
    )

    const [title, setTitle] = useState('')

    const [location, setLocation] = useState('')

    const [notes, setNotes] = useState('')

    /*
     * calendar date is stored separately from time
     */
    const [selectedDate, setSelectedDate] =
        useState(() =>
            createTripDate(
                trip?.startDate
            )
        )

    // stores time separately from the calendar date so date and time can never overwrite each other
    const [selectedTime, setSelectedTime] =
        useState({
            hour: 12,
            minute: 0,
        })

    const [activePicker, setActivePicker] = useState(null)
    const [pickerValue, setPickerValue] = useState(new Date())

    const [pickerInstance, setPickerInstance] = useState(0)

    const openPicker = (picker) => {
        Keyboard.dismiss()

        const value =
            picker === 'date'
                ? new Date(selectedDate)
                : createPickerTime(
                    selectedTime
                )

        setPickerValue(value)
        setActivePicker(picker)
    }

    const closePicker = () => {
        // closes the date or time modal
        setActivePicker(null)
    }

    const handlePickerChange = (
        event,
        value
    ) => {
        if (event?.type === 'dismissed') {
            closePicker()
            return
        }

        if (!value) {
            return
        }

        setPickerValue(value)

        if (activePicker === 'date') {
            setSelectedDate(value)
        }

        if (activePicker === 'time') {
            setSelectedTime({
                hour: value.getHours(),
                minute: value.getMinutes(),
            })
        }
    }

    const handleAddActivity = () => {
        if (
            !trip ||
            !title.trim()
        ) {
            return
        }

        const activity = {
            id:
                `activity-${Date.now()}`,

            title:
                title.trim(),

            /*
             * date and time remain separate strings
             */
            date:
                formatDatabaseDate(
                    selectedDate
                ),

            time:
                formatDatabaseTime(
                    selectedTime
                ),

            location:
                location.trim(),

            notes:
                notes.trim(),
        }

        // adds the new activity while preserving all existing activities
        updateTrip(trip.id, {
            activities: [
                ...(trip.activities ||
                    []),
                activity,
            ],
        })

        Keyboard.dismiss()
        navigation.goBack()
    }

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
                        // keeps the form below the device safe area
                        paddingTop:
                            insets.top +
                            theme.spacing.sm,
                    },
                ]}
                keyboardShouldPersistTaps="handled"
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
                            // dismisses the keyboard before leaving the form
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
                        Add Activity
                    </Text>

                    <View
                        style={
                            styles.headerSpacer
                        }
                    />
                </View>

                {/* introduction */}

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
                        ADD TO YOUR ADVENTURE
                    </Text>

                    <Text
                        style={
                            styles.title
                        }
                    >
                        Plan an activity
                    </Text>

                    <Text
                        style={
                            styles.description
                        }
                    >
                        Add something you want to
                        do during your trip.
                    </Text>
                </View>

                {/* form */}

                <View
                    style={
                        styles.form
                    }
                >
                    <Text
                        style={
                            styles.label
                        }
                    >
                        Activity
                    </Text>

                    <TextInput
                        value={
                            title
                        }
                        onChangeText={
                            setTitle
                        }
                        placeholder="e.g. Wildlife watching"
                        placeholderTextColor={
                            theme.colors
                                .earth
                        }
                        style={
                            styles.input
                        }
                        accessibilityLabel="activity name"
                    />

                    <Text
                        style={[
                            styles.label,
                            styles.spacedLabel,
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
                        accessibilityLabel="select activity date"
                    >
                        <Text
                            style={
                                styles.dateInputText
                            }
                        >
                            {formatDisplayDate(
                                selectedDate
                            )}
                        </Text>

                        <Text
                            style={
                                styles.calendarIcon
                            }
                        >
                            ▣
                        </Text>
                    </Pressable>

                    <Text
                        style={[
                            styles.label,
                            styles.spacedLabel,
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
                        accessibilityLabel="select activity time"
                    >
                        <Text
                            style={
                                styles.dateInputText
                            }
                        >
                            {formatDisplayTime(
                                selectedTime
                            )}
                        </Text>

                        <Text
                            style={
                                styles.calendarIcon
                            }
                        >
                            ◷
                        </Text>
                    </Pressable>

                    <Text
                        style={[
                            styles.label,
                            styles.spacedLabel,
                        ]}
                    >
                        Location
                        <Text
                            style={
                                styles.optionalText
                            }
                        >
                            {' '}
                            optional
                        </Text>
                    </Text>

                    <TextInput
                        value={
                            location
                        }
                        onChangeText={
                            setLocation
                        }
                        placeholder="e.g. Lamar Valley"
                        placeholderTextColor={
                            theme.colors
                                .earth
                        }
                        style={
                            styles.input
                        }
                        accessibilityLabel="activity location"
                    />

                    <Text
                        style={[
                            styles.label,
                            styles.spacedLabel,
                        ]}
                    >
                        Notes
                        <Text
                            style={
                                styles.optionalText
                            }
                        >
                            {' '}
                            optional
                        </Text>
                    </Text>

                    <TextInput
                        value={
                            notes
                        }
                        onChangeText={
                            setNotes
                        }
                        placeholder="Anything else to remember..."
                        placeholderTextColor={
                            theme.colors
                                .earth
                        }
                        style={[
                            styles.input,
                            styles.notesInput,
                        ]}
                        multiline
                        textAlignVertical="top"
                        accessibilityLabel="activity notes"
                    />
                </View>
            </ScrollView>

            <View
                style={[
                    styles.bottomAction,
                    {
                        // keeps the action button above the device safe area
                        paddingBottom:
                            insets.bottom +
                            theme.spacing.sm,
                    },
                ]}
            >
                <Pressable
                    style={[
                        styles.addButton,
                        !title.trim() &&
                            styles.disabledButton,
                    ]}
                    onPress={
                        handleAddActivity
                    }
                    disabled={
                        !title.trim()
                    }
                    accessibilityRole="button"
                    accessibilityLabel="add activity"
                >
                    <Text
                        style={
                            styles.addButtonText
                        }
                    >
                        Add activity
                    </Text>
                </Pressable>
            </View>

            <Modal
                visible={
                    activePicker !== null
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
                                        ? 'Activity date'
                                        : 'Activity time'}
                                </Text>
                            </View>

                            <Pressable
                                onPress={
                                    closePicker
                                }
                                style={
                                    styles.modalClose
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
                                    key={activePicker}
                                    value={pickerValue}
                                    mode={
                                        activePicker ===
                                        'date'
                                            ? 'date'
                                            : 'time'
                                    }
                                    display="spinner"
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
 * creates the initial calendar date from the
 * stored YYYY-MM-DD trip date
 *
 * noon is intentional to avoid timezone rollover
 */
function createTripDate(
    dateString
) {
    if (!dateString) {
        return new Date()
    }

    const [
        year,
        month,
        day,
    ] =
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

/*
 * creates the Date supplied to the native TIME picker
 *
 * the calendar date is fixed because only the time
 * portion matters
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
    const hour =
        time.hour

    const minute =
        String(
            time.minute
        ).padStart(
            2,
            '0'
        )

    const suffix =
        hour >= 12
            ? 'PM'
            : 'AM'

    const displayHour =
        hour % 12 || 12

    return `${displayHour}:${minute} ${suffix}`
}

const styles =
    StyleSheet.create({
        screen: {
            backgroundColor:
                theme.colors.parchment,
            flex: 1,
        },

        content: {
            paddingBottom: 130,
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
                theme.colors.forest,
            fontSize: 36,
            fontWeight:
                '300',
            lineHeight: 38,
        },

        headerTitle: {
            color:
                theme.colors.ink,
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
                theme.colors.forest,
            fontSize: 10,
            fontWeight:
                '700',
            letterSpacing: 1.5,
        },

        title: {
            color:
                theme.colors.ink,
            fontSize: 30,
            fontWeight:
                '700',
            marginTop:
                theme.spacing.xs,
        },

        description: {
            color:
                theme.colors.earth,
            fontSize: 14,
            lineHeight: 20,
            marginTop:
                theme.spacing.sm,
        },

        form: {
            marginTop:
                theme.spacing.xl,
        },

        label: {
            color:
                theme.colors.ink,
            fontSize: 12,
            fontWeight:
                '700',
        },

        spacedLabel: {
            marginTop:
                theme.spacing.lg,
        },

        optionalText: {
            color:
                theme.colors.earth,
            fontSize: 10,
            fontWeight:
                '400',
        },

        input: {
            backgroundColor:
                theme.colors.canvas,
            borderColor:
                theme.colors.sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            color:
                theme.colors.ink,
            fontSize: 14,
            marginTop:
                theme.spacing.sm,
            minHeight: 50,
            paddingHorizontal:
                theme.spacing.md,
        },

        notesInput: {
            minHeight: 100,
            paddingTop:
                theme.spacing.md,
        },

        dateInput: {
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
            justifyContent:
                'space-between',
            marginTop:
                theme.spacing.sm,
            minHeight: 50,
            paddingHorizontal:
                theme.spacing.md,
        },

        dateInputText: {
            color:
                theme.colors.ink,
            fontSize: 14,
        },

        calendarIcon: {
            color:
                theme.colors.forest,
            fontSize: 17,
        },

        bottomAction: {
            backgroundColor:
                theme.colors.parchment,
            paddingHorizontal:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.sm,
        },

        addButton: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors.forest,
            borderRadius:
                theme.radii.md,
            minHeight: 54,
            justifyContent:
                'center',
        },

        disabledButton: {
            backgroundColor:
                theme.colors.sage,
        },

        addButtonText: {
            color:
                theme.colors.parchment,
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
                theme.colors.parchment,
            borderRadius:
                theme.radii.lg,
            maxWidth: 420,
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
                theme.colors.forest,
            fontSize: 10,
            fontWeight:
                '700',
            letterSpacing: 1.5,
        },

        modalTitle: {
            color:
                theme.colors.ink,
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
                theme.colors.earth,
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
                theme.colors.forest,
            borderRadius:
                theme.radii.md,
            minHeight: 50,
            justifyContent:
                'center',
        },

        doneButtonText: {
            color:
                theme.colors.parchment,
            fontSize: 15,
            fontWeight:
                '700',
        },

        errorText: {
            color:
                theme.colors.earth,
            fontSize: 15,
            margin:
                theme.spacing.xl,
            textAlign:
                'center',
        },
    })