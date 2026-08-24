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

import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

import DateTimePicker from '@react-native-community/datetimepicker'

import {
    useState,
    useEffect,
} from 'react'

import theme from '../constants/theme'

import {
    getAllParks,
} from '../api/npsApi'

import {
    useTrips,
} from '../context/TripContext'

// provides the form used to create a new outdoor adventure
export default function CreateTripScreen({
    navigation,
    route,
}) {
    const insets =
        useSafeAreaInsets()

    const {
        addTrip,
    } = useTrips()

    const [
        tripName,
        setTripName,
    ] = useState('')

    const [
        selectedPark,
        setSelectedPark,
    ] = useState(null)

    // filters the api park list without changing the selected park
    const [
        parkSearchQuery,
        setParkSearchQuery,
    ] = useState('')

    // stores actual date objects so the native date picker can manage the values
    const [
        startDate,
        setStartDate,
    ] = useState(null)

    const [
        endDate,
        setEndDate,
    ] = useState(null)

    // tracks which date field is currently being edited inside the modal
    const [
        activeDateField,
        setActiveDateField,
    ] = useState(null)

    const [
        isCreating,
        setIsCreating,
    ] = useState(false)

    // stores the real national parks returned by the nps api
    const [
        parks,
        setParks,
    ] = useState([])

    // controls the initial api loading state
    const [
        loadingParks,
        setLoadingParks,
    ] = useState(true)

    // stores an api error without crashing the screen
    const [
        parkError,
        setParkError,
    ] = useState(null)

    /*
     * loads the official national parks from the nps api.
     *
     * getAllParks() already normalizes each park so its id
     * is the actual nps park code.
     */
    useEffect(() => {
        let active = true

        async function loadParks() {
            try {
                setLoadingParks(
                    true
                )

                setParkError(
                    null
                )

                const apiParks =
                    await getAllParks()

                if (!active) {
                    return
                }

                setParks(
                    apiParks || []
                )
            } catch (error) {
                console.error(
                    'nps create trip parks error:',
                    error
                )

                if (active) {
                    setParks(
                        []
                    )

                    setParkError(
                        'Unable to load national parks.'
                    )
                }
            } finally {
                if (active) {
                    setLoadingParks(
                        false
                    )
                }
            }
        }

        loadParks()

        return () => {
            active = false
        }
    }, [])

    /*
     * if this screen was opened from a park detail screen,
     * automatically select that park.
     *
     * because the detail screen now passes the nps park code,
     * this will select the correct api park.
     */
    useEffect(() => {
        const parkId =
            route?.params?.parkId

        if (
            !parkId ||
            parks.length === 0
        ) {
            return
        }

        const matchingPark =
            parks.find(
                (park) =>
                    park.id ===
                    parkId
            )

        if (matchingPark) {
            setSelectedPark(
                matchingPark
            )
        }
    }, [
        route?.params?.parkId,
        parks,
    ])

    // filters the api parks as the user searches
    const filteredParks =
        parks.filter(
            (park) =>
                park.name
                    ?.toLowerCase()
                    .includes(
                        parkSearchQuery
                            .toLowerCase()
                    )
        )

    const canCreateTrip =
        tripName.trim().length >
            0 &&
        selectedPark !== null &&
        startDate !== null &&
        endDate !== null

    const openDatePicker = (
        field
    ) => {
        // closes the keyboard before opening the date selection modal
        Keyboard.dismiss()

        setActiveDateField(
            field
        )
    }

    const closeDatePicker = () => {
        // clears the active field so the modal closes cleanly
        setActiveDateField(
            null
        )
    }

    const handleDateChange = (
        event,
        selectedDate
    ) => {
        // android reports a dismissal event when the user closes the native picker
        if (
            event?.type ===
            'dismissed'
        ) {
            closeDatePicker()
            return
        }

        if (!selectedDate) {
            return
        }

        if (
            activeDateField ===
            'start'
        ) {
            setStartDate(
                selectedDate
            )

            // keeps the end date from becoming earlier than the new start date
            if (
                endDate &&
                selectedDate >
                    endDate
            ) {
                setEndDate(
                    selectedDate
                )
            }
        }

        if (
            activeDateField ===
            'end'
        ) {
            setEndDate(
                selectedDate
            )
        }

        // closes the modal after the user selects a date
        closeDatePicker()
    }

    const handleCreateTrip =
        async () => {
            if (
                !canCreateTrip ||
                isCreating
            ) {
                return
            }

            setIsCreating(
                true
            )

            /*
             * selectedPark.id is now the actual nps park code.
             *
             * for example:
             *
             * selectedPark.id === "grsm"
             *
             * instead of the old mock value:
             *
             * "great-smoky-mountains"
             */
            const newTrip = {
                id: `${tripName
                    .trim()
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9]+/g,
                        '-'
                    )
                    .replace(
                        /^-|-$/g,
                        ''
                    )}-${Date.now()}`,

                name:
                    tripName.trim(),

                parkId:
                    selectedPark.id,

                startDate:
                    formatDatabaseDate(
                        startDate
                    ),

                endDate:
                    formatDatabaseDate(
                        endDate
                    ),

                status:
                    startDate >=
                    new Date()
                        ? 'upcoming'
                        : 'past',

                trails: [],

                campsites: [],

                activities: [],

                notes: '',

                packingItems: [],

                itinerary: [],
            }

            try {
                /*
                 * saves the trip through the existing trip context.
                 *
                 * the park id saved here is the nps park code.
                 */
                await addTrip(
                    newTrip
                )

                Keyboard.dismiss()

                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'Main',
                            params: {
                                screen:
                                    'Trips',
                                params: {
                                    screen:
                                        'TripsHome',
                                },
                            },
                        },
                    ],
                })
            } catch (error) {
                console.error(
                    'create trip error:',
                    error
                )

                setIsCreating(
                    false
                )
            }
        }

    const getPickerValue =
        () => {
            if (
                activeDateField ===
                'end'
            ) {
                return (
                    endDate ||
                    startDate ||
                    new Date()
                )
            }

            return (
                startDate ||
                new Date()
            )
        }

    const getPickerMinimumDate =
        () => {
            if (
                activeDateField ===
                'end'
            ) {
                return (
                    startDate ||
                    new Date()
                )
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
            <View
                style={
                    styles.screen
                }
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.content,
                        {
                            // keeps the header below the device safe area
                            paddingTop:
                                insets.top +
                                theme.spacing.md,
                        },
                    ]}
                    showsVerticalScrollIndicator={
                        false
                    }
                    keyboardShouldPersistTaps="handled"
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
                            Create Trip
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
                            PLAN YOUR ADVENTURE
                        </Text>

                        <Text
                            style={
                                styles.title
                            }
                        >
                            Where are you headed?
                        </Text>

                        <Text
                            style={
                                styles.description
                            }
                        >
                            Start with the basics.
                            You can add trails,
                            campsites, activities,
                            and notes afterward.
                        </Text>
                    </View>

                    <View
                        style={
                            styles.form
                        }
                    >
                        <View
                            style={
                                styles.field
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
                                value={
                                    tripName
                                }
                                onChangeText={
                                    setTripName
                                }
                                placeholder="e.g. Yellowstone Adventure"
                                placeholderTextColor={
                                    theme.colors
                                        .earth
                                }
                                style={
                                    styles.input
                                }
                                returnKeyType="done"
                                onSubmitEditing={() =>
                                    Keyboard.dismiss()
                                }
                                accessibilityLabel="trip name"
                            />
                        </View>

                        <View
                            style={
                                styles.field
                            }
                        >
                            <Text
                                style={
                                    styles.label
                                }
                            >
                                National park
                            </Text>

                            {loadingParks ? (
                                <View
                                    style={
                                        styles.statusCard
                                    }
                                >
                                    <Text
                                        style={
                                            styles.statusText
                                        }
                                    >
                                        Loading national
                                        parks...
                                    </Text>
                                </View>
                            ) : null}

                            {!loadingParks &&
                            parkError ? (
                                <View
                                    style={
                                        styles.statusCard
                                    }
                                >
                                    <Text
                                        style={
                                            styles.statusText
                                        }
                                    >
                                        {
                                            parkError
                                        }
                                    </Text>
                                </View>
                            ) : null}

                            {!loadingParks &&
                            !parkError &&
                            parks.length >
                                0 ? (
                                <View>
                                    <View
                                        style={
                                            styles.searchContainer
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.searchIcon
                                            }
                                        >
                                            🔎
                                        </Text>

                                        <TextInput
                                            value={
                                                parkSearchQuery
                                            }
                                            onChangeText={
                                                setParkSearchQuery
                                            }
                                            placeholder="Search national parks..."
                                            placeholderTextColor={
                                                theme.colors
                                                    .earth
                                            }
                                            style={
                                                styles.searchInput
                                            }
                                            returnKeyType="search"
                                            onSubmitEditing={() =>
                                                Keyboard.dismiss()
                                            }
                                            accessibilityLabel="search national parks"
                                        />

                                        {parkSearchQuery.length >
                                        0 ? (
                                            <Pressable
                                                onPress={() =>
                                                    setParkSearchQuery(
                                                        ''
                                                    )
                                                }
                                                style={
                                                    styles.clearButton
                                                }
                                                accessibilityRole="button"
                                                accessibilityLabel="clear park search"
                                            >
                                                <Text
                                                    style={
                                                        styles.clearText
                                                    }
                                                >
                                                    ×
                                                </Text>
                                            </Pressable>
                                        ) : null}
                                    </View>

                                    <Text
                                        style={
                                            styles.resultLabel
                                        }
                                    >
                                        {filteredParks.length}{' '}
                                        {filteredParks.length ===
                                        1
                                            ? 'park'
                                            : 'parks'}
                                    </Text>

                                    {/* keeps the large api result set inside a small independently scrollable area */}
                                    <ScrollView
                                        style={
                                            styles.parkList
                                        }
                                        contentContainerStyle={
                                            styles.parkListContent
                                        }
                                        nestedScrollEnabled
                                        keyboardShouldPersistTaps="handled"
                                        showsVerticalScrollIndicator={
                                            true
                                        }
                                    >
                                        {filteredParks.map(
                                            (
                                                park
                                            ) => {
                                                const selected =
                                                    selectedPark?.id ===
                                                    park.id

                                                return (
                                                    <Pressable
                                                        key={
                                                            park.id
                                                        }
                                                        style={[
                                                            styles.parkOption,
                                                            selected &&
                                                                styles.selectedParkOption,
                                                        ]}
                                                        onPress={() => {
                                                            // dismisses the keyboard before changing form selections
                                                            Keyboard.dismiss()

                                                            // stores the selected nps park until the trip is saved
                                                            setSelectedPark(
                                                                park
                                                            )
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
                                                                {
                                                                    park.name
                                                                }
                                                            </Text>

                                                            <Text
                                                                style={
                                                                    styles.parkLocation
                                                                }
                                                            >
                                                                {park.states?.join(
                                                                    ' · '
                                                                ) ||
                                                                    'United States'}
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
                                            }
                                        )}
                                    </ScrollView>

                                    {filteredParks.length ===
                                    0 ? (
                                        <View
                                            style={
                                                styles.noResults
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.noResultsText
                                                }
                                            >
                                                No parks found.
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                            ) : null}
                        </View>

                        <View
                            style={
                                styles.dateRow
                            }
                        >
                            <View
                                style={[
                                    styles.field,
                                    styles.dateField,
                                ]}
                            >
                                <Text
                                    style={
                                        styles.label
                                    }
                                >
                                    Start date
                                </Text>

                                <Pressable
                                    style={
                                        styles.dateInput
                                    }
                                    onPress={() =>
                                        openDatePicker(
                                            'start'
                                        )
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
                                <Text
                                    style={
                                        styles.label
                                    }
                                >
                                    End date
                                </Text>

                                <Pressable
                                    style={
                                        styles.dateInput
                                    }
                                    onPress={() =>
                                        openDatePicker(
                                            'end'
                                        )
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
                                            ? formatDate(
                                                  endDate
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
                    </View>
                </ScrollView>

                <View
                    style={[
                        styles.bottomAction,
                        {
                            // keeps the primary action above the device safe area
                            paddingBottom:
                                insets.bottom +
                                theme.spacing.sm,
                        },
                    ]}
                >
                    <Pressable
                        style={[
                            styles.createButton,
                            !canCreateTrip &&
                                styles.disabledCreateButton,
                        ]}
                        onPress={
                            handleCreateTrip
                        }
                        disabled={
                            !canCreateTrip ||
                            isCreating
                        }
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
                            {isCreating
                                ? 'Creating...'
                                : 'Create trip'}
                        </Text>
                    </Pressable>
                </View>

                {/* presents the native date picker inside a controlled modal so it cannot interfere with the form layout */}
                <Modal
                    visible={
                        activeDateField !==
                        null
                    }
                    transparent
                    animationType="fade"
                    onRequestClose={
                        closeDatePicker
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
                                        {activeDateField ===
                                        'start'
                                            ? 'Start date'
                                            : 'End date'}
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={
                                        closeDatePicker
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
                                {activeDateField !==
                                null ? (
                                    <DateTimePicker
                                        value={
                                            getPickerValue()
                                        }
                                        mode="date"
                                        display={
                                            Platform.OS ===
                                            'ios'
                                                ? 'inline'
                                                : 'calendar'
                                        }
                                        minimumDate={getPickerMinimumDate()}
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
                                    closeDatePicker
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
        </TouchableWithoutFeedback>
    )
}

function formatDate(
    date
) {
    return date.toLocaleDateString(
        'en-US',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }
    )
}

// stores dates in a predictable yyyy-mm-dd format that works with supabase
function formatDatabaseDate(
    date
) {
    return date
        .toISOString()
        .split('T')[0]
}

const styles =
    StyleSheet.create({
        screen: {
            backgroundColor:
                theme.colors.parchment,
            flex: 1,
        },

        content: {
            paddingBottom:
                120,
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
            fontSize: 11,
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
            lineHeight: 21,
            marginTop:
                theme.spacing.sm,
        },

        form: {
            marginTop:
                theme.spacing.xl,
        },

        field: {
            marginBottom:
                theme.spacing.lg,
        },

        label: {
            color:
                theme.colors.ink,
            fontSize: 13,
            fontWeight:
                '700',
            marginBottom:
                theme.spacing.sm,
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
            minHeight: 52,
            paddingHorizontal:
                theme.spacing.md,
        },

        statusCard: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors.canvas,
            borderColor:
                theme.colors.sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            minHeight: 70,
            justifyContent:
                'center',
            padding:
                theme.spacing.md,
        },

        statusText: {
            color:
                theme.colors.earth,
            fontSize: 13,
            textAlign:
                'center',
        },

        // keeps the large park api result set inside a compact scrolling area
        parkList: {
            height: 300,
            marginTop:
                theme.spacing.sm,
        },

        parkListContent: {
            gap:
                theme.spacing.sm,
            paddingBottom:
                theme.spacing.xs,
        },

        searchContainer: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors.white,
            borderColor:
                theme.colors.sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            flexDirection:
                'row',
            minHeight: 50,
            marginTop:
                theme.spacing.sm,
            paddingHorizontal:
                theme.spacing.sm,
        },

        searchIcon: {
            fontSize: 17,
            marginRight:
                theme.spacing.xs,
        },

        searchInput: {
            color:
                theme.colors.ink,
            flex: 1,
            fontSize: 14,
            paddingVertical:
                theme.spacing.sm,
        },

        clearButton: {
            alignItems:
                'center',
            height: 30,
            justifyContent:
                'center',
            width: 30,
        },

        clearText: {
            color:
                theme.colors.earth,
            fontSize: 22,
        },

        resultLabel: {
            color:
                theme.colors.earth,
            fontSize: 11,
            marginTop:
                theme.spacing.sm,
        },

        noResults: {
            alignItems:
                'center',
            padding:
                theme.spacing.md,
        },

        noResultsText: {
            color:
                theme.colors.earth,
            fontSize: 13,
        },

        parkOption: {
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
            minHeight: 70,
            padding:
                theme.spacing.sm,
        },

        selectedParkOption: {
            backgroundColor:
                theme.colors.sage,
            borderColor:
                theme.colors.forest,
        },

        parkIcon: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors.parchment,
            borderRadius:
                22,
            height: 44,
            justifyContent:
                'center',
            width: 44,
        },

        selectedParkIcon: {
            backgroundColor:
                theme.colors.parchment,
        },

        parkOptionContent: {
            flex: 1,
            marginLeft:
                theme.spacing.sm,
        },

        parkName: {
            color:
                theme.colors.ink,
            fontSize: 14,
            fontWeight:
                '700',
        },

        selectedParkName: {
            color:
                theme.colors.forest,
        },

        parkLocation: {
            color:
                theme.colors.earth,
            fontSize: 11,
            marginTop: 2,
        },

        radio: {
            alignItems:
                'center',
            borderColor:
                theme.colors.earth,
            borderRadius:
                10,
            borderWidth:
                1.5,
            height: 20,
            justifyContent:
                'center',
            marginLeft:
                theme.spacing.sm,
            width: 20,
        },

        selectedRadio: {
            borderColor:
                theme.colors.forest,
        },

        radioDot: {
            backgroundColor:
                theme.colors.forest,
            borderRadius:
                5,
            height: 10,
            width: 10,
        },

        dateRow: {
            flexDirection:
                'row',
            gap:
                theme.spacing.md,
        },

        dateField: {
            flex: 1,
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
            minHeight: 52,
            paddingHorizontal:
                theme.spacing.md,
        },

        dateText: {
            color:
                theme.colors.ink,
            flex: 1,
            fontSize: 14,
        },

        placeholderText: {
            color:
                theme.colors.earth,
        },

        calendarIcon: {
            color:
                theme.colors.forest,
            fontSize: 18,
            marginLeft:
                theme.spacing.sm,
        },

        bottomAction: {
            backgroundColor:
                theme.colors.parchment,
            paddingHorizontal:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.sm,
        },

        createButton: {
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

        disabledCreateButton: {
            backgroundColor:
                theme.colors.sage,
        },

        createButtonText: {
            color:
                theme.colors.parchment,
            fontSize: 15,
            fontWeight:
                '700',
        },

        disabledCreateButtonText: {
            color:
                theme.colors.canvas,
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

        dateModal: {
            backgroundColor:
                theme.colors.parchment,
            borderRadius:
                theme.radii.lg,
            maxWidth:
                420,
            overflow:
                'hidden',
            paddingHorizontal:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.lg,
            width:
                '100%',
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
    })