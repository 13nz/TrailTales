import {
    View,
    Text,
    Pressable,
    TextInput,
    ScrollView,
    StyleSheet,
    Keyboard,
    Modal,
    Alert
} from 'react-native'

import { useState } from 'react'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import DateTimePicker from '@react-native-community/datetimepicker'

import theme from '../constants/theme'

import { useTrips } from '../context/TripContext'

// provides editing for the basic information of an existing adventure

export default function EditTripScreen({
    route,
    navigation,
}) {
    const insets = useSafeAreaInsets()

    const { trips, updateTrip, removeTrip } = useTrips()

    const { tripId } = route.params

    const trip = trips.find(
        (item) =>
            item.id === tripId
    )

    // uses the park information already stored with the trip
    // instead of relying on mock park data
    const parkName =
        trip?.parkName ||
        trip?.park?.name ||
        'National Park'

    const [name, setName] = useState( trip?.name || '' )

    const [startDate, setStartDate] = useState(() =>
        createTripDate(
            trip?.startDate
        )
    )

    const [endDate, setEndDate] = useState(() =>
        createTripDate(
            trip?.endDate
        )
    )

    const [notes, setNotes] = useState(
        trip?.notes || ''
    )

    const [activePicker, setActivePicker] = useState(null)

    const [error, setError] = useState('')

    const openPicker = (picker) => {
        Keyboard.dismiss()

        setError('')

        setActivePicker(
            picker
        )
    }

    const closePicker = () => {
        setActivePicker(
            null
        )
    }

    const handleDateChange = (
        event,
        value
    ) => {
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

        if (
            activePicker ===
            'startDate'
        ) {
            setStartDate(
                value
            )

            // if the new start date moves past the current end date,
            // automatically move the end date with it
            if (
                value > endDate
            ) {
                setEndDate(
                    value
                )
            }
        }

        if (
            activePicker ===
            'endDate'
        ) {
            setEndDate(
                value
            )
        }
    }

    const handleSave =
        async () => {
            const trimmedName =
                name.trim()

            if (
                !trimmedName
            ) {
                setError(
                    'Please enter a trip name.'
                )

                return
            }

            if (
                endDate <
                startDate
            ) {
                setError(
                    'The end date cannot be before the start date.'
                )

                return
            }

            if (!trip) {
                setError(
                    'Trip could not be found.'
                )

                return
            }

            try {
                // saves the edited trip through the trip context
                // so supabase and local application state stay synchronized
                await updateTrip(
                    trip.id,
                    {
                        name:
                            trimmedName,

                        startDate:
                            formatDatabaseDate(
                                startDate
                            ),

                        endDate:
                            formatDatabaseDate(
                                endDate
                            ),

                        notes:
                            notes.trim(),
                    }
                )

                Keyboard.dismiss()

                navigation.goBack()
            } catch (
                saveError
            ) {
                console.error(
                    'edit trip save error:',
                    saveError
                )

                setError(
                    'Unable to save your trip changes. Please try again.'
                )
            }
        }

    const handleDelete = () => {
        Alert.alert(
            'Delete trip?',
            `Are you sure you want to delete "${trip.name}"? This will permanently remove the trip, including its trails, campsites, activities, and packing checklist.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // dismisses the keyboard before deleting the trip
                            Keyboard.dismiss()

                            // deletes the trip and all of its saved related data
                            await removeTrip(
                                trip.id
                            )

                            // returns to the trips list after the database deletion succeeds
                            navigation.popToTop()
                        } catch (error) {
                            console.error(
                                'delete trip error:',
                                error
                            )

                            setError(
                                'Unable to delete this trip. Please try again.'
                            )
                        }
                    },
                },
            ]
        )
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
                        Edit Trip
                    </Text>

                    <View
                        style={
                            styles.headerSpacer
                        }
                    />
                </View>

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
                        YOUR ADVENTURE
                    </Text>

                    <Text
                        style={
                            styles.title
                        }
                    >
                        Edit trip details
                    </Text>

                    <Text
                        style={
                            styles.description
                        }
                    >
                        Update the basic
                        details of your
                        adventure.
                    </Text>
                </View>

                {error ? (
                    <View
                        style={
                            styles.errorBox
                        }
                    >
                        <Text
                            style={
                                styles.errorBoxText
                            }
                        >
                            {error}
                        </Text>
                    </View>
                ) : null}

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
                        Trip name
                    </Text>

                    <TextInput
                        value={name}
                        onChangeText={(
                            value
                        ) => {
                            setName(
                                value
                            )

                            setError(
                                ''
                            )
                        }}
                        placeholder="e.g. Yellowstone Adventure"
                        placeholderTextColor={
                            theme.colors
                                .earth
                        }
                        style={
                            styles.input
                        }
                        returnKeyType="done"
                        accessibilityLabel="trip name"
                    />

                    <Text
                        style={[
                            styles.label,
                            styles.spacedLabel,
                        ]}
                    >
                        Park
                    </Text>

                    <View
                        style={
                            styles.lockedPark
                        }
                    >
                        <View
                            style={
                                styles.lockedParkIcon
                            }
                        >
                            <Text
                                style={
                                    styles.lockedParkEmoji
                                }
                            >
                                🏔️
                            </Text>
                        </View>

                        <View
                            style={
                                styles.lockedParkContent
                            }
                        >
                            <Text
                                style={
                                    styles.lockedParkName
                                }
                            >
                                {
                                    parkName
                                }
                            </Text>

                            <Text
                                style={
                                    styles.lockedParkDescription
                                }
                            >
                                The park
                                cannot be
                                changed
                                after a
                                trip is
                                created
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.lockIcon
                            }
                        >
                            🔒
                        </Text>
                    </View>

                    <Text
                        style={[
                            styles.label,
                            styles.spacedLabel,
                        ]}
                    >
                        Trip dates
                    </Text>

                    <View
                        style={
                            styles.dateRow
                        }
                    >
                        <View
                            style={
                                styles.dateField
                            }
                        >
                            <Text
                                style={
                                    styles.dateLabel
                                }
                            >
                                START
                            </Text>

                            <Pressable
                                style={
                                    styles.dateInput
                                }
                                onPress={() =>
                                    openPicker(
                                        'startDate'
                                    )
                                }
                                accessibilityRole="button"
                                accessibilityLabel="edit trip start date"
                            >
                                <Text
                                    style={
                                        styles.dateText
                                    }
                                >
                                    {formatDisplayDate(
                                        startDate
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
                        </View>

                        <View
                            style={
                                styles.dateField
                            }
                        >
                            <Text
                                style={
                                    styles.dateLabel
                                }
                            >
                                END
                            </Text>

                            <Pressable
                                style={
                                    styles.dateInput
                                }
                                onPress={() =>
                                    openPicker(
                                        'endDate'
                                    )
                                }
                                accessibilityRole="button"
                                accessibilityLabel="edit trip end date"
                            >
                                <Text
                                    style={
                                        styles.dateText
                                    }
                                >
                                    {formatDisplayDate(
                                        endDate
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
                        </View>
                    </View>

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
                        value={notes}
                        onChangeText={
                            setNotes
                        }
                        placeholder="Add notes about your adventure..."
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
                        accessibilityLabel="trip notes"
                    />
                </View>
            </ScrollView>

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
                    onPress={handleSave}
                    accessibilityRole="button"
                    accessibilityLabel="save trip changes"
                >
                    <Text
                        style={
                            styles.saveButtonText
                        }
                    >
                        Save changes
                    </Text>
                </Pressable>

                <Pressable
                    style={
                        styles.deleteButton
                    }
                    onPress={handleDelete}
                    accessibilityRole="button"
                    accessibilityLabel="delete trip"
                >
                    <Text
                        style={
                            styles.deleteButtonText
                        }
                    >
                        Delete trip
                    </Text>
                </Pressable>
            </View>

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
                            styles.dateModal,
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
                                    SELECT DATE
                                </Text>

                                <Text
                                    style={
                                        styles.modalTitle
                                    }
                                >
                                    {activePicker ===
                                    'startDate'
                                        ? 'Start date'
                                        : 'End date'}
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
                                accessibilityLabel="close date picker"
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
                                    key={
                                        activePicker
                                    }
                                    value={
                                        activePicker ===
                                        'startDate'
                                            ? startDate
                                            : endDate
                                    }
                                    mode="date"
                                    display="spinner"
                                    minimumDate={
                                        activePicker ===
                                        'startDate'
                                            ? new Date()
                                            : startDate
                                    }
                                    onChange={
                                        handleDateChange
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
                            accessibilityLabel="done selecting date"
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

function formatDatabaseDate(
    date
) {
    const year =
        date.getFullYear()

    const month =
        String(
            date.getMonth() +
                1
        ).padStart(2, '0')

    const day =
        String(
            date.getDate()
        ).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function formatDisplayDate(
    date
) {
    return date.toLocaleDateString(
        'en-US',
        {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }
    )
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.parchment,
        flex: 1,
    },

    content: {
        paddingBottom: 130,
        paddingHorizontal: theme.spacing.lg,
    },

    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        fontSize: 17,
        fontWeight: '700',
    },

    headerSpacer: {
        width: 42,
    },

    intro: {
        marginTop: theme.spacing.xl,
    },

    eyebrow: {
        color: theme.colors.forest,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
    },

    title: {
        color: theme.colors.ink,
        fontSize: 30,
        fontWeight: '700',
        marginTop: theme.spacing.xs,
    },

    description: {
        color: theme.colors.earth,
        fontSize: 14,
        lineHeight: 20,
        marginTop: theme.spacing.sm,
    },

    errorBox: {
        backgroundColor: theme.colors.sage,
        borderColor: theme.colors.forest,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        marginTop: theme.spacing.lg,
        padding: theme.spacing.md,
    },

    errorBoxText: {
        color: theme.colors.forest,
        fontSize: 13,
        lineHeight: 19,
    },

    form: {
        marginTop: theme.spacing.xl,
    },

    label: {
        color: theme.colors.ink,
        fontSize: 12,
        fontWeight: '700',
    },

    spacedLabel: {
        marginTop: theme.spacing.lg,
    },

    optionalText: {
        color: theme.colors.earth,
        fontSize: 10,
        fontWeight: '400',
    },

    input: {
        backgroundColor: theme.colors.canvas,
        borderColor: theme.colors.sage,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        color: theme.colors.ink,
        fontSize: 14,
        marginTop: theme.spacing.sm,
        minHeight: 50,
        paddingHorizontal: theme.spacing.md,
    },

    notesInput: {
        minHeight: 120,
        paddingTop: theme.spacing.md,
    },

    lockedPark: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        borderRadius: theme.radii.md,
        flexDirection: 'row',
        marginTop: theme.spacing.sm,
        minHeight: 72,
        padding: theme.spacing.sm,
    },

    lockedParkIcon: {
        alignItems: 'center',
        backgroundColor: theme.colors.parchment,
        borderRadius: 22,
        height: 44,
        justifyContent: 'center',
        width: 44,
    },

    lockedParkEmoji: {
        fontSize: 22,
    },

    lockedParkContent: {
        flex: 1,
        marginLeft: theme.spacing.sm,
    },

    lockedParkName: {
        color: theme.colors.ink,
        fontSize: 14,
        fontWeight: '700',
    },

    lockedParkDescription: {
        color: theme.colors.earth,
        fontSize: 10,
        lineHeight: 15,
        marginTop: 2,
    },

    lockIcon: {
        fontSize: 15,
        marginLeft: theme.spacing.sm,
    },

    dateRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },

    dateField: {
        flex: 1,
    },

    dateLabel: {
        color: theme.colors.earth,
        fontSize: 9,
        fontWeight: '700',
        marginBottom: 4,
    },

    dateInput: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderColor: theme.colors.sage,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: 50,
        paddingHorizontal: theme.spacing.sm,
    },

    dateText: {
        color: theme.colors.ink,
        flex: 1,
        fontSize: 11,
    },

    calendarIcon: {
        color: theme.colors.forest,
        fontSize: 16,
        marginLeft: 4,
    },

    bottomAction: {
        backgroundColor: theme.colors.parchment,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
    },

    saveButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.forest,
        borderRadius: theme.radii.md,
        minHeight: 54,
        justifyContent: 'center',
    },

    saveButtonText: {
        color: theme.colors.parchment,
        fontSize: 15,
        fontWeight: '700',
    },

    modalOverlay: {
        alignItems: 'center',
        backgroundColor: 'rgba(30, 40, 25, 0.45)',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
    },

    dateModal: {
        backgroundColor: theme.colors.parchment,
        borderRadius: theme.radii.lg,
        maxWidth: 420,
        overflow: 'hidden',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        width: '100%',
        ...theme.shadows
            .card,
    },

    modalHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    modalEyebrow: {
        color: theme.colors.forest,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
    },

    modalTitle: {
        color: theme.colors.ink,
        fontSize: 22,
        fontWeight: '700',
        marginTop: 2,
    },

    modalClose: {
        alignItems: 'center',
        height: 36,
        justifyContent: 'center',
        width: 36,
    },

    modalCloseText: {
        color: theme.colors.earth,
        fontSize: 28,
        fontWeight: '300',
    },

    pickerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 260,
        overflow: 'hidden',
    },

    doneButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.forest,
        borderRadius: theme.radii.md,
        minHeight: 50,
        justifyContent: 'center',
    },

    doneButtonText: {
        color: theme.colors.parchment,
        fontSize: 15,
        fontWeight: '700',
    },

    errorText: {
        color: theme.colors.earth,
        fontSize: 15,
        margin: theme.spacing.xl,
        textAlign: 'center',
    },

    deleteButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.sm,
        minHeight: 48,
    },

    deleteButtonText: {
        color: theme.colors.ember,
        fontSize: 13,
        fontWeight: '700',
    },
})