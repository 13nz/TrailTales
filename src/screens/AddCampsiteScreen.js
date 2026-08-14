import {
    View,
    Text,
    Pressable,
    TextInput,
    ScrollView,
    StyleSheet,
    Keyboard,
    Modal,
    Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'

import theme from '../constants/theme'
import mockCampsites from '../data/mockCampsites'
import mockParks from '../data/mockParks'
import { useTrips } from '../context/TripContext'

// provides campground search, reservation details, and trip assignment functionality
export default function AddCampsiteScreen({
    route,
    navigation,
}) {
    const insets = useSafeAreaInsets()
    const { trips, updateTrip } = useTrips()

    const { tripId } = route.params

    const trip = trips.find((item) => item.id === tripId)

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCampsite, setSelectedCampsite] =
        useState(null)

    const [checkIn, setCheckIn] = useState(
        trip
            ? new Date(`${trip.startDate}T12:00:00`)
            : null
    )

    const [checkOut, setCheckOut] = useState(
        trip
            ? new Date(`${trip.endDate}T12:00:00`)
            : null
    )

    const [campsiteNumber, setCampsiteNumber] =
        useState('')

    const [reservationNotes, setReservationNotes] =
        useState('')

    const [activeDateField, setActiveDateField] =
        useState(null)

    const park = mockParks.find(
        (item) => item.id === trip?.parkId
    )

    // only displays campgrounds belonging to the park associated with this trip
    const parkCampsites = mockCampsites.filter(
        (campsite) => campsite.parkId === trip?.parkId
    )

    // filters campgrounds as the user searches
    const filteredCampsites = parkCampsites.filter(
        (campsite) =>
            campsite.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    )

    const openDatePicker = (field) => {
        // dismisses the keyboard before opening the date picker
        Keyboard.dismiss()

        setActiveDateField(field)
    }

    const closeDatePicker = () => {
        // clears the active date field so the modal closes
        setActiveDateField(null)
    }

    const handleDateChange = (event, selectedDate) => {
        if (event?.type === 'dismissed') {
            closeDatePicker()
            return
        }

        if (!selectedDate) {
            return
        }

        if (activeDateField === 'checkIn') {
            setCheckIn(selectedDate)

            // keeps the checkout date from being earlier than check-in
            if (checkOut && selectedDate > checkOut) {
                setCheckOut(selectedDate)
            }
        }

        if (activeDateField === 'checkOut') {
            setCheckOut(selectedDate)
        }

        closeDatePicker()
    }

    const handleSelectCampsite = (campsite) => {
        // dismisses the keyboard before selecting a campground
        Keyboard.dismiss()

        setSelectedCampsite(campsite)
    }

    const handleAddCampsite = () => {
        if (!selectedCampsite || !trip) {
            return
        }

        // creates a separate campsite stay so the same campground can be visited multiple times
        const campsiteReservation = {
            id: selectedCampsite.id,
            checkIn: formatDatabaseDate(checkIn),
            checkOut: formatDatabaseDate(checkOut),
            campsiteNumber:
                campsiteNumber.trim() || null,
            notes: reservationNotes.trim() || '',
        }

        // adds the new campground stay while preserving all existing reservations
        updateTrip(trip.id, {
            campsites: [
                ...trip.campsites,
                campsiteReservation,
            ],
        })

        Keyboard.dismiss()

        navigation.goBack()
    }

    const getPickerValue = () => {
        if (activeDateField === 'checkOut') {
            return checkOut || checkIn || new Date()
        }

        return checkIn || new Date()
    }

    const getPickerMinimumDate = () => {
        if (activeDateField === 'checkOut') {
            return checkIn || new Date()
        }

        return new Date()
    }

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
                        // keeps the screen content below the device safe area
                        paddingTop:
                            insets.top + theme.spacing.sm,
                    },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => {
                            // dismisses the keyboard before returning to the trip
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
                        Add Campsite
                    </Text>

                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.intro}>
                    <Text style={styles.eyebrow}>
                        ADD TO YOUR ADVENTURE
                    </Text>

                    <Text style={styles.title}>
                        Choose a campsite
                    </Text>

                    <Text style={styles.parkName}>
                        {park?.name || 'National Park'}
                    </Text>
                </View>

                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>
                        ⌕
                    </Text>

                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search campgrounds..."
                        placeholderTextColor={
                            theme.colors.earth
                        }
                        style={styles.searchInput}
                        returnKeyType="search"
                        accessibilityLabel="search campgrounds"
                    />

                    {searchQuery.length > 0 ? (
                        <Pressable
                            onPress={() => {
                                // clears the current campground search
                                setSearchQuery('')
                            }}
                            style={styles.clearButton}
                            accessibilityRole="button"
                            accessibilityLabel="clear campground search"
                        >
                            <Text style={styles.clearText}>
                                ×
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                <Text style={styles.resultLabel}>
                    {filteredCampsites.length}{' '}
                    {filteredCampsites.length === 1
                        ? 'campground'
                        : 'campgrounds'}
                </Text>

                <View style={styles.campsiteList}>
                    {filteredCampsites.map((campsite) => {
                        const selected =
                            selectedCampsite?.id ===
                            campsite.id

                        return (
                            <Pressable
                                key={campsite.id}
                                style={[
                                    styles.campsiteCard,
                                    selected &&
                                        styles.selectedCampsiteCard,
                                ]}
                                onPress={() =>
                                    handleSelectCampsite(
                                        campsite
                                    )
                                }
                                accessibilityRole="button"
                                accessibilityLabel={`select ${campsite.name}`}
                            >
                                <View style={styles.campsiteIcon}>
                                    <Text
                                        style={
                                            styles.campsiteEmoji
                                        }
                                    >
                                        🏕️
                                    </Text>
                                </View>

                                <View style={styles.campsiteContent}>
                                    <Text
                                        style={
                                            styles.campsiteName
                                        }
                                    >
                                        {campsite.name}
                                    </Text>

                                    <Text
                                        style={
                                            styles.campsiteDescription
                                        }
                                        numberOfLines={2}
                                    >
                                        {campsite.description}
                                    </Text>

                                    <View
                                        style={
                                            styles.campsiteFacts
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.campsiteFact
                                            }
                                        >
                                            {campsite.price}
                                        </Text>

                                        <Text
                                            style={
                                                styles.factDivider
                                            }
                                        >
                                            ·
                                        </Text>

                                        <Text
                                            style={
                                                styles.campsiteFact
                                            }
                                        >
                                            {campsite.sites}{' '}
                                            sites
                                        </Text>
                                    </View>

                                    <View
                                        style={styles.petRow}
                                    >
                                        <Text
                                            style={
                                                styles.petIcon
                                            }
                                        >
                                            🐕
                                        </Text>

                                        <Text
                                            style={styles.petText}
                                        >
                                            {campsite.petsAllowed
                                                ? 'pets allowed'
                                                : 'pets not allowed'}
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={[
                                        styles.selectionIndicator,
                                        selected &&
                                            styles.selectedIndicator,
                                    ]}
                                >
                                    {selected ? (
                                        <View
                                            style={
                                                styles.selectionDot
                                            }
                                        />
                                    ) : null}
                                </View>
                            </Pressable>
                        )
                    })}
                </View>

                {filteredCampsites.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>
                            🏕️
                        </Text>

                        <Text style={styles.emptyTitle}>
                            No campgrounds found
                        </Text>

                        <Text
                            style={
                                styles.emptyDescription
                            }
                        >
                            Try a different search term.
                        </Text>
                    </View>
                ) : null}

                {selectedCampsite ? (
                    <View style={styles.previewCard}>
                        <View style={styles.previewHeader}>
                            <View style={styles.previewHeaderContent}>
                                <Text style={styles.previewEyebrow}>
                                    SELECTED CAMPGROUND
                                </Text>

                                <Text
                                    style={
                                        styles.previewTitle
                                    }
                                >
                                    {selectedCampsite.name}
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => {
                                    // clears the current campground selection and its temporary reservation details
                                    setSelectedCampsite(null)
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="clear selected campground"
                            >
                                <Text
                                    style={
                                        styles.previewClose
                                    }
                                >
                                    ×
                                </Text>
                            </Pressable>
                        </View>

                        <View style={styles.previewFacts}>
                            <Fact
                                label="Price"
                                value={
                                    selectedCampsite.price
                                }
                            />

                            <Fact
                                label="Sites"
                                value={selectedCampsite.sites.toString()}
                            />

                            <Fact
                                label="Pets"
                                value={
                                    selectedCampsite.petsAllowed
                                        ? 'Allowed'
                                        : 'Not allowed'
                                }
                            />
                        </View>

                        <Text
                            style={
                                styles.reservationText
                            }
                        >
                            {selectedCampsite.reservations}
                        </Text>

                        <Text
                            style={
                                styles.amenitiesText
                            }
                        >
                            {selectedCampsite.amenities.join(
                                ' · '
                            )}
                        </Text>

                        <Text
                            style={
                                styles.previewDescription
                            }
                        >
                            {selectedCampsite.description}
                        </Text>

                        <Text style={styles.dateSectionTitle}>
                            Camping dates
                        </Text>

                        <View style={styles.dateRow}>
                            <View style={styles.dateField}>
                                <Text style={styles.dateLabel}>
                                    Check-in
                                </Text>

                                <Pressable
                                    style={styles.dateInput}
                                    onPress={() =>
                                        openDatePicker(
                                            'checkIn'
                                        )
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel="select campsite check-in date"
                                >
                                    <Text
                                        style={
                                            styles.dateText
                                        }
                                    >
                                        {checkIn
                                            ? formatDate(
                                                  checkIn
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

                            <View style={styles.dateField}>
                                <Text style={styles.dateLabel}>
                                    Check-out
                                </Text>

                                <Pressable
                                    style={styles.dateInput}
                                    onPress={() =>
                                        openDatePicker(
                                            'checkOut'
                                        )
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel="select campsite check-out date"
                                >
                                    <Text
                                        style={
                                            styles.dateText
                                        }
                                    >
                                        {checkOut
                                            ? formatDate(
                                                  checkOut
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
                        </View>

                        <Text style={styles.inputSectionTitle}>
                            Campsite number
                            <Text style={styles.optionalText}>
                                {' '}
                                optional
                            </Text>
                        </Text>

                        <TextInput
                            value={campsiteNumber}
                            onChangeText={setCampsiteNumber}
                            placeholder="e.g. 42"
                            placeholderTextColor={
                                theme.colors.earth
                            }
                            style={styles.textInput}
                            keyboardType="default"
                            returnKeyType="done"
                            accessibilityLabel="campsite number"
                        />

                        <Text style={styles.inputSectionTitle}>
                            Reservation notes
                            <Text style={styles.optionalText}>
                                {' '}
                                optional
                            </Text>
                        </Text>

                        <TextInput
                            value={reservationNotes}
                            onChangeText={setReservationNotes}
                            placeholder="e.g. loop B, near the lake..."
                            placeholderTextColor={
                                theme.colors.earth
                            }
                            style={[
                                styles.textInput,
                                styles.notesInput,
                            ]}
                            multiline
                            textAlignVertical="top"
                            returnKeyType="default"
                            accessibilityLabel="reservation notes"
                        />
                    </View>
                ) : null}
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
                        styles.addCampsiteButton,
                        !selectedCampsite &&
                            styles.disabledAddButton,
                    ]}
                    onPress={handleAddCampsite}
                    disabled={!selectedCampsite}
                    accessibilityRole="button"
                    accessibilityLabel="add selected campsite to trip"
                >
                    <Text
                        style={[
                            styles.addCampsiteButtonText,
                            !selectedCampsite &&
                                styles.disabledAddButtonText,
                        ]}
                    >
                        Add to trip
                    </Text>
                </Pressable>
            </View>

            {/* presents the date picker as a controlled popup instead of placing it inside the page layout */}
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
                                <Text
                                    style={
                                        styles.modalEyebrow
                                    }
                                >
                                    SELECT DATE
                                </Text>

                                <Text
                                    style={styles.modalTitle}
                                >
                                    {activeDateField ===
                                    'checkIn'
                                        ? 'Check-in date'
                                        : 'Check-out date'}
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
    )
}

function Fact({ label, value }) {
    return (
        <View style={styles.fact}>
            <Text style={styles.factLabel}>
                {label}
            </Text>

            <Text style={styles.factValue}>
                {value}
            </Text>
        </View>
    )
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function formatDatabaseDate(date) {
    // converts a javascript date into a format that can be stored consistently in supabase
    if (!date) {
        return null
    }

    return date.toISOString().split('T')[0]
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.parchment,
        flex: 1,
    },

    content: {
        paddingBottom: 150,
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

    parkName: {
        color: theme.colors.earth,
        fontSize: 14,
        marginTop: theme.spacing.xs,
    },

    searchContainer: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderColor: theme.colors.sage,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        flexDirection: 'row',
        marginTop: theme.spacing.xl,
        minHeight: 52,
        paddingHorizontal: theme.spacing.md,
    },

    searchIcon: {
        color: theme.colors.earth,
        fontSize: 24,
        marginRight: theme.spacing.sm,
    },

    searchInput: {
        color: theme.colors.ink,
        flex: 1,
        fontSize: 14,
        minHeight: 50,
    },

    clearButton: {
        alignItems: 'center',
        height: 30,
        justifyContent: 'center',
        width: 30,
    },

    clearText: {
        color: theme.colors.earth,
        fontSize: 22,
    },

    resultLabel: {
        color: theme.colors.earth,
        fontSize: 11,
        marginTop: theme.spacing.md,
    },

    campsiteList: {
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },

    campsiteCard: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderColor: theme.colors.sage,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        flexDirection: 'row',
        padding: theme.spacing.sm,
    },

    selectedCampsiteCard: {
        backgroundColor: theme.colors.sage,
        borderColor: theme.colors.forest,
    },

    campsiteIcon: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        borderRadius: 24,
        height: 48,
        justifyContent: 'center',
        width: 48,
    },

    campsiteEmoji: {
        fontSize: 23,
    },

    campsiteContent: {
        flex: 1,
        marginLeft: theme.spacing.sm,
    },

    campsiteName: {
        color: theme.colors.ink,
        fontSize: 14,
        fontWeight: '700',
    },

    campsiteDescription: {
        color: theme.colors.earth,
        fontSize: 11,
        lineHeight: 16,
        marginTop: 3,
    },

    campsiteFacts: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: theme.spacing.sm,
    },

    campsiteFact: {
        color: theme.colors.forest,
        fontSize: 11,
        fontWeight: '600',
    },

    factDivider: {
        color: theme.colors.earth,
        fontSize: 11,
        marginHorizontal: 5,
    },

    petRow: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 4,
    },

    petIcon: {
        fontSize: 11,
    },

    petText: {
        color: theme.colors.earth,
        fontSize: 10,
        marginLeft: 4,
    },

    selectionIndicator: {
        alignItems: 'center',
        borderColor: theme.colors.earth,
        borderRadius: 10,
        borderWidth: 1.5,
        height: 20,
        justifyContent: 'center',
        marginLeft: theme.spacing.sm,
        width: 20,
    },

    selectedIndicator: {
        borderColor: theme.colors.forest,
    },

    selectionDot: {
        backgroundColor: theme.colors.forest,
        borderRadius: 5,
        height: 10,
        width: 10,
    },

    emptyState: {
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xxl,
    },

    emptyIcon: {
        fontSize: 42,
    },

    emptyTitle: {
        color: theme.colors.ink,
        fontSize: 19,
        fontWeight: '700',
        marginTop: theme.spacing.md,
    },

    emptyDescription: {
        color: theme.colors.earth,
        fontSize: 13,
        marginTop: theme.spacing.xs,
    },

    previewCard: {
        backgroundColor: theme.colors.sage,
        borderRadius: theme.radii.lg,
        marginTop: theme.spacing.lg,
        padding: theme.spacing.md,
    },

    previewHeader: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    previewHeaderContent: {
        flex: 1,
    },

    previewEyebrow: {
        color: theme.colors.forest,
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1.3,
    },

    previewTitle: {
        color: theme.colors.ink,
        fontSize: 18,
        fontWeight: '700',
        marginTop: 3,
    },

    previewClose: {
        color: theme.colors.earth,
        fontSize: 25,
    },

    previewFacts: {
        flexDirection: 'row',
        marginTop: theme.spacing.md,
    },

    fact: {
        flex: 1,
    },

    factLabel: {
        color: theme.colors.earth,
        fontSize: 9,
        fontWeight: '600',
        textTransform: 'uppercase',
    },

    factValue: {
        color: theme.colors.ink,
        fontSize: 13,
        fontWeight: '700',
        marginTop: 2,
    },

    reservationText: {
        color: theme.colors.forest,
        fontSize: 11,
        fontWeight: '700',
        marginTop: theme.spacing.md,
        textTransform: 'capitalize',
    },

    amenitiesText: {
        color: theme.colors.earth,
        fontSize: 10,
        marginTop: 4,
        textTransform: 'capitalize',
    },

    previewDescription: {
        color: theme.colors.bark,
        fontSize: 12,
        lineHeight: 18,
        marginTop: theme.spacing.md,
    },

    dateSectionTitle: {
        color: theme.colors.ink,
        fontSize: 14,
        fontWeight: '700',
        marginTop: theme.spacing.lg,
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
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 4,
    },

    dateInput: {
        alignItems: 'center',
        backgroundColor: theme.colors.parchment,
        borderColor: theme.colors.sage,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: 46,
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

    inputSectionTitle: {
        color: theme.colors.ink,
        fontSize: 14,
        fontWeight: '700',
        marginTop: theme.spacing.lg,
    },

    optionalText: {
        color: theme.colors.earth,
        fontSize: 10,
        fontWeight: '400',
    },

    textInput: {
        backgroundColor: theme.colors.parchment,
        borderColor: theme.colors.sage,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        color: theme.colors.ink,
        fontSize: 13,
        marginTop: theme.spacing.sm,
        minHeight: 46,
        paddingHorizontal: theme.spacing.sm,
    },

    notesInput: {
        minHeight: 80,
        paddingTop: theme.spacing.sm,
    },

    bottomAction: {
        backgroundColor: theme.colors.parchment,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
    },

    addCampsiteButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.forest,
        borderRadius: theme.radii.md,
        minHeight: 54,
        justifyContent: 'center',
    },

    disabledAddButton: {
        backgroundColor: theme.colors.sage,
    },

    addCampsiteButtonText: {
        color: theme.colors.parchment,
        fontSize: 15,
        fontWeight: '700',
    },

    disabledAddButtonText: {
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

    errorText: {
        color: theme.colors.earth,
        fontSize: 15,
        margin: theme.spacing.xl,
        textAlign: 'center',
    },
})