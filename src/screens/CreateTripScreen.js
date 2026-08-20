import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    StyleSheet,
    Platform,
    Keyboard,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'

import theme from '../constants/theme'
import mockParks from '../data/mockParks'

import { useTrips } from '../context/TripContext'

// provides the form used to create a new outdoor adventure
export default function CreateTripScreen({ navigation }) {
    const insets = useSafeAreaInsets()

    const { addTrip } = useTrips()

    const [tripName, setTripName] = useState('')
    const [selectedPark, setSelectedPark] = useState(null)

    // stores actual date objects so the native date picker can manage the values
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)

    // tracks which date field is currently being edited inside the modal
    const [activeDateField, setActiveDateField] = useState(null)

    const [isCreating, setIsCreating] = useState(false)

    const canCreateTrip =
        tripName.trim().length > 0 &&
        selectedPark !== null &&
        startDate !== null &&
        endDate !== null

    const openDatePicker = (field) => {
        // closes the keyboard before opening the date selection modal
        Keyboard.dismiss()

        setActiveDateField(field)
    }

    const closeDatePicker = () => {
        // clears the active field so the modal closes cleanly
        setActiveDateField(null)
    }

    const handleDateChange = (event, selectedDate) => {
        // android reports a dismissal event when the user closes the native picker
        if (event?.type === 'dismissed') {
            closeDatePicker()
            return
        }

        if (!selectedDate) {
            return
        }

        if (activeDateField === 'start') {
            setStartDate(selectedDate)

            // keeps the end date from becoming earlier than the new start date
            if (endDate && selectedDate > endDate) {
                setEndDate(selectedDate)
            }
        }

        if (activeDateField === 'end') {
            setEndDate(selectedDate)
        }

        // closes the modal after the user selects a date
        closeDatePicker()
    }

    const handleCreateTrip = () => {
        if (
            !canCreateTrip ||
            isCreating
        ) {
            return
        }

        setIsCreating(true)

        const newTrip = {
            id: `${tripName
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')}-${Date.now()}`,

            name: tripName.trim(),

            parkId: selectedPark.id,

            startDate:
                formatDatabaseDate(
                    startDate
                ),

            endDate:
                formatDatabaseDate(
                    endDate
                ),

            status:
                startDate >= new Date()
                    ? 'upcoming'
                    : 'past',

            trails: [],

            campsites: [],

            activities: [],

            notes: '',

            packingItems: [],

            itinerary: [],
        }

        addTrip(newTrip)

        Keyboard.dismiss()

        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'Main',
                    params: {
                        screen: 'Trips',
                        params: {
                            screen: 'TripsHome',
                        },
                    },
                },
            ],
        })
    }

    const getPickerValue = () => {
        if (activeDateField === 'end') {
            return endDate || startDate || new Date()
        }

        return startDate || new Date()
    }

    const getPickerMinimumDate = () => {
        if (activeDateField === 'end') {
            return startDate || new Date()
        }

        return new Date()
    }

    return (
        <TouchableWithoutFeedback
            onPress={() => {
                // dismisses the keyboard when the user taps outside the text input
                Keyboard.dismiss()
            }}
        >
            <View style={styles.screen}>
                <ScrollView
                    contentContainerStyle={[
                        styles.content,
                        {
                            // keeps the header below the device safe area
                            paddingTop:
                                insets.top + theme.spacing.md,
                        },
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Pressable
                            style={styles.backButton}
                            onPress={() => {
                                // dismisses the keyboard before leaving the form
                                Keyboard.dismiss()
                                navigation.goBack()
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="go back"
                        >
                            <Text style={styles.backButtonText}>
                                ‹
                            </Text>
                        </Pressable>

                        <Text style={styles.headerTitle}>
                            Create Trip
                        </Text>

                        <View style={styles.headerSpacer} />
                    </View>

                    <View style={styles.intro}>
                        <Text style={styles.eyebrow}>
                            PLAN YOUR ADVENTURE
                        </Text>

                        <Text style={styles.title}>
                            Where are you headed?
                        </Text>

                        <Text style={styles.description}>
                            Start with the basics. You can add
                            trails, campsites, activities, and
                            notes afterward.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.field}>
                            <Text style={styles.label}>
                                Trip name
                            </Text>

                            <TextInput
                                value={tripName}
                                onChangeText={setTripName}
                                placeholder="e.g. Yellowstone Adventure"
                                placeholderTextColor={
                                    theme.colors.earth
                                }
                                style={styles.input}
                                returnKeyType="done"
                                onSubmitEditing={() =>
                                    Keyboard.dismiss()
                                }
                                accessibilityLabel="trip name"
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>
                                National park
                            </Text>

                            <View style={styles.parkList}>
                                {mockParks.map((park) => {
                                    const selected =
                                        selectedPark?.id ===
                                        park.id

                                    return (
                                        <Pressable
                                            key={park.id}
                                            style={[
                                                styles.parkOption,
                                                selected &&
                                                    styles.selectedParkOption,
                                            ]}
                                            onPress={() => {
                                                // dismisses the keyboard before changing form selections
                                                Keyboard.dismiss()

                                                // stores the selected park locally until the trip is saved
                                                setSelectedPark(park)
                                            }}
                                            accessibilityRole="button"
                                            accessibilityLabel={`select ${park.name}`}
                                        >
                                            <View
                                                style={[
                                                    styles.parkIcon,
                                                    selected &&
                                                        styles.selectedParkIcon,
                                                ]}
                                            >
                                                <Text>
                                                    🌲
                                                </Text>
                                            </View>

                                            <View
                                                style={
                                                    styles.parkOptionContent
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.parkName,
                                                        selected &&
                                                            styles.selectedParkName,
                                                    ]}
                                                >
                                                    {park.name}
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.parkLocation
                                                    }
                                                >
                                                    {park.states.join(
                                                        ' · '
                                                    )}
                                                </Text>
                                            </View>

                                            <View
                                                style={[
                                                    styles.radio,
                                                    selected &&
                                                        styles.selectedRadio,
                                                ]}
                                            >
                                                {selected ? (
                                                    <View
                                                        style={
                                                            styles.radioDot
                                                        }
                                                    />
                                                ) : null}
                                            </View>
                                        </Pressable>
                                    )
                                })}
                            </View>
                        </View>

                        <View style={styles.dateRow}>
                            <View
                                style={[
                                    styles.field,
                                    styles.dateField,
                                ]}
                            >
                                <Text style={styles.label}>
                                    Start date
                                </Text>

                                <Pressable
                                    style={styles.dateInput}
                                    onPress={() =>
                                        openDatePicker('start')
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel="select trip start date"
                                >
                                    <Text
                                        style={[
                                            styles.dateText,
                                            !startDate &&
                                                styles.placeholderText,
                                        ]}
                                    >
                                        {startDate
                                            ? formatDate(
                                                  startDate
                                              )
                                            : 'Select date'}
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
                                style={[
                                    styles.field,
                                    styles.dateField,
                                ]}
                            >
                                <Text style={styles.label}>
                                    End date
                                </Text>

                                <Pressable
                                    style={styles.dateInput}
                                    onPress={() =>
                                        openDatePicker('end')
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel="select trip end date"
                                >
                                    <Text
                                        style={[
                                            styles.dateText,
                                            !endDate &&
                                                styles.placeholderText,
                                        ]}
                                    >
                                        {endDate
                                            ? formatDate(endDate)
                                            : 'Select date'}
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
                    </View>
                </ScrollView>

                <View
                    style={[
                        styles.bottomAction,
                        {
                            // keeps the primary action above the device safe area
                            paddingBottom:
                                insets.bottom + theme.spacing.sm,
                        },
                    ]}
                >
                    <Pressable
                        style={[
                            styles.createButton,
                            !canCreateTrip &&
                                styles.disabledCreateButton,
                        ]}
                        onPress={handleCreateTrip}
                        disabled={!canCreateTrip || isCreating}
                        accessibilityRole="button"
                        accessibilityLabel="create trip"
                    >
                        <Text
                            style={[
                                styles.createButtonText,
                                !canCreateTrip &&
                                    styles.disabledCreateButtonText,
                            ]}
                        >
                            Create trip
                        </Text>
                    </Pressable>
                </View>

                {/* presents the native date picker inside a controlled modal so it cannot interfere with the form layout */}
                <Modal
                    visible={activeDateField !== null}
                    transparent
                    animationType="fade"
                    onRequestClose={closeDatePicker}
                >
                    <View style={styles.modalOverlay}>
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
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={styles.modalEyebrow}>
                                        SELECT DATE
                                    </Text>

                                    <Text style={styles.modalTitle}>
                                        {activeDateField ===
                                        'start'
                                            ? 'Start date'
                                            : 'End date'}
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={closeDatePicker}
                                    style={styles.modalClose}
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

                            <View style={styles.pickerContainer}>
                                {activeDateField !== null ? (
                                    <DateTimePicker
                                        value={getPickerValue()}
                                        mode="date"
                                        display={
                                            Platform.OS === 'ios'
                                                ? 'inline'
                                                : 'calendar'
                                        }
                                        minimumDate={getPickerMinimumDate()}
                                        onChange={handleDateChange}
                                        themeVariant="light"
                                    />
                                ) : null}
                            </View>

                            <Pressable
                                style={styles.doneButton}
                                onPress={closeDatePicker}
                                accessibilityRole="button"
                                accessibilityLabel="done selecting date"
                            >
                                <Text
                                    style={styles.doneButtonText}
                                >
                                    Done
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    )
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

// stores dates in a predictable yyyy-mm-dd format that works with supabase 
function formatDatabaseDate(date) {
    return date.toISOString().split('T')[0]
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.parchment,
        flex: 1,
    },

    content: {
        paddingBottom: 120,
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
        fontSize: 11,
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
        lineHeight: 21,
        marginTop: theme.spacing.sm,
    },

    form: {
        marginTop: theme.spacing.xl,
    },

    field: {
        marginBottom: theme.spacing.lg,
    },

    label: {
        color: theme.colors.ink,
        fontSize: 13,
        fontWeight: '700',
        marginBottom: theme.spacing.sm,
    },

    input: {
        backgroundColor: theme.colors.canvas,
        borderColor: theme.colors.sage,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        color: theme.colors.ink,
        fontSize: 14,
        minHeight: 52,
        paddingHorizontal: theme.spacing.md,
    },

    parkList: {
        gap: theme.spacing.sm,
    },

    parkOption: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderColor: theme.colors.sage,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        flexDirection: 'row',
        minHeight: 70,
        padding: theme.spacing.sm,
    },

    selectedParkOption: {
        backgroundColor: theme.colors.sage,
        borderColor: theme.colors.forest,
    },

    parkIcon: {
        alignItems: 'center',
        backgroundColor: theme.colors.parchment,
        borderRadius: 22,
        height: 44,
        justifyContent: 'center',
        width: 44,
    },

    selectedParkIcon: {
        backgroundColor: theme.colors.parchment,
    },

    parkOptionContent: {
        flex: 1,
        marginLeft: theme.spacing.sm,
    },

    parkName: {
        color: theme.colors.ink,
        fontSize: 14,
        fontWeight: '700',
    },

    selectedParkName: {
        color: theme.colors.forest,
    },

    parkLocation: {
        color: theme.colors.earth,
        fontSize: 11,
        marginTop: 2,
    },

    radio: {
        alignItems: 'center',
        borderColor: theme.colors.earth,
        borderRadius: 10,
        borderWidth: 1.5,
        height: 20,
        justifyContent: 'center',
        marginLeft: theme.spacing.sm,
        width: 20,
    },

    selectedRadio: {
        borderColor: theme.colors.forest,
    },

    radioDot: {
        backgroundColor: theme.colors.forest,
        borderRadius: 5,
        height: 10,
        width: 10,
    },

    dateRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },

    dateField: {
        flex: 1,
    },

    dateInput: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderColor: theme.colors.sage,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: 52,
        paddingHorizontal: theme.spacing.md,
    },

    dateText: {
        color: theme.colors.ink,
        flex: 1,
        fontSize: 14,
    },

    placeholderText: {
        color: theme.colors.earth,
    },

    calendarIcon: {
        color: theme.colors.forest,
        fontSize: 18,
        marginLeft: theme.spacing.sm,
    },

    bottomAction: {
        backgroundColor: theme.colors.parchment,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
    },

    createButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.forest,
        borderRadius: theme.radii.md,
        minHeight: 54,
        justifyContent: 'center',
    },

    disabledCreateButton: {
        backgroundColor: theme.colors.sage,
    },

    createButtonText: {
        color: theme.colors.parchment,
        fontSize: 15,
        fontWeight: '700',
    },

    disabledCreateButtonText: {
        color: theme.colors.earth,
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
        ...theme.shadows.card,
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
        minHeight: 320,
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
})