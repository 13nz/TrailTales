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
    useTrips,
} from '../context/TripContext'

import {
    getParkByCode,
    getTrailsByPark,
} from '../api/npsApi'

// provides a searchable trail selection experience for adding trails to an adventure
export default function AddTrailScreen({
    route,
    navigation,
}) {
    const insets =
        useSafeAreaInsets()

    const {
        trips,
        updateTrip,
    } = useTrips()

    const {
        tripId,
    } = route.params

    const trip =
        trips.find(
            (item) =>
                item.id === tripId
        )

    const [
        searchQuery,
        setSearchQuery,
    ] = useState('')

    const [
        selectedTrail,
        setSelectedTrail,
    ] = useState(null)

    const [
        selectedDate,
        setSelectedDate,
    ] = useState(() =>
        createTripDate(
            trip?.startDate
        )
    )

    // stores time separately from the calendar date so date and time can never overwrite each other
    const [
        selectedTime,
        setSelectedTime,
    ] = useState({
        hour: 8,
        minute: 0,
    })

    const [
        activePicker,
        setActivePicker,
    ] = useState(null)

    /*
     * stores the value shown inside the native picker.
     *
     * keeping this separate prevents the ios picker
     * from reopening with an old value.
     */
    const [
        pickerValue,
        setPickerValue,
    ] = useState(
        new Date()
    )

    /*
     * forces the native picker to be recreated
     * whenever the user opens it.
     *
     * this helps keep the ios picker responsive
     * when switching between date and time.
     */
    const [
        pickerKey,
        setPickerKey,
    ] = useState(0)

    const [
        park,
        setPark,
    ] = useState(null)

    const [
        trails,
        setTrails,
    ] = useState([])

    const [
        loadingPark,
        setLoadingPark,
    ] = useState(true)

    const [
        loadingTrails,
        setLoadingTrails,
    ] = useState(true)

    const [
        trailError,
        setTrailError,
    ] = useState(null)

    useEffect(() => {
        loadParkAndTrails()
    }, [])

    useEffect(() => {
        if (
            trip?.startDate
        ) {
            setSelectedDate(
                createTripDate(
                    trip.startDate
                )
            )
        }
    }, [
        trip?.startDate,
    ])

    async function loadParkAndTrails() {
        try {
            setLoadingPark(true)
            setLoadingTrails(true)
            setTrailError(null)

            if (
                !trip?.parkId
            ) {
                setTrailError(
                    'No park selected for this trip.'
                )

                return
            }

            const parkData =
                await getParkByCode(
                    trip.parkId
                )

            setPark(
                parkData
            )

            const trailData =
                await getTrailsByPark(
                    trip.parkId
                )

            setTrails(
                trailData
            )
        } catch (
            error
        ) {
            console.error(
                'nps add trail error:',
                error
            )

            setTrailError(
                error?.message ||
                'Unable to load trails.'
            )
        } finally {
            setLoadingPark(false)
            setLoadingTrails(false)
        }
    }

    const filteredTrails =
        trails.filter(
            (trail) =>
                trail.name
                    ?.toLowerCase()
                    .includes(
                        searchQuery
                            .toLowerCase()
                    )
        )

    function handleSelectTrail(
        trail
    ) {
        setSelectedTrail(
            trail
        )
    }

    function handleOpenDatePicker() {
        const currentDate =
            selectedDate ||
            new Date()

        setPickerValue(
            new Date(
                currentDate
            )
        )

        setPickerKey(
            (value) =>
                value + 1
        )

        setActivePicker(
            'date'
        )
    }

    function handleOpenTimePicker() {
        const currentDate =
            new Date()

        currentDate.setHours(
            selectedTime.hour
        )

        currentDate.setMinutes(
            selectedTime.minute
        )

        setPickerValue(
            currentDate
        )

        setPickerKey(
            (value) =>
                value + 1
        )

        setActivePicker(
            'time'
        )
    }

    function handlePickerChange(
        event,
        value
    ) {
        if (
            event?.type ===
            'dismissed'
        ) {
            setActivePicker(
                null
            )

            return
        }

        if (!value) {
            return
        }

        if (
            activePicker ===
            'date'
        ) {
            setSelectedDate(
                value
            )
        }

        if (
            activePicker ===
            'time'
        ) {
            setSelectedTime(
                {
                    hour:
                        value.getHours(),
                    minute:
                        value.getMinutes(),
                }
            )
        }

        setActivePicker(
            null
        )
    }

    async function handleAddTrail() {
        if (
            !selectedTrail ||
            !trip
        ) {
            return
        }

        const alreadyAdded =
            trip.trails.some(
                (item) => {
                    if (
                        typeof item ===
                        'string'
                    ) {
                        return (
                            item ===
                            selectedTrail.id
                        )
                    }

                    return (
                        item.id ===
                        selectedTrail.id
                    )
                }
            )

        if (
            alreadyAdded
        ) {
            return
        }

        const trailToSave = {
            ...selectedTrail,
            date:
                formatDateForStorage(
                    selectedDate
                ),
            time:
                formatTimeForStorage(
                    selectedTime
                ),
        }

        const updatedTrip = {
            ...trip,
            trails: [
                ...trip.trails,
                trailToSave,
            ],
        }

        await updateTrip(
            trip.id,
            updatedTrip
        )

        navigation.goBack()
    }

    if (!trip) {
        return (
            <View
                style={
                    styles.centered
                }
            >
                <Text
                    style={
                        styles.errorText
                    }
                >
                    Trip not found.
                </Text>
            </View>
        )
    }

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
            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    {
                        paddingBottom:
                            insets.bottom +
                            theme.spacing.xl,
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
                        onPress={() =>
                            navigation.goBack()
                        }
                        style={
                            styles.backButton
                        }
                    >
                        <Text
                            style={
                                styles.backText
                            }
                        >
                            ‹
                        </Text>
                    </Pressable>

                    <View
                        style={
                            styles.headerText
                        }
                    >
                        <Text
                            style={
                                styles.title
                            }
                        >
                            Add a trail
                        </Text>

                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Choose a trail for your trip
                        </Text>
                    </View>
                </View>

                {loadingPark ? (
                    <View
                        style={
                            styles.loadingContainer
                        }
                    >
                        <Text
                            style={
                                styles.loadingText
                            }
                        >
                            Loading park...
                        </Text>
                    </View>
                ) : park ? (
                    <View
                        style={
                            styles.parkCard
                        }
                    >
                        <View
                            style={
                                styles.parkIcon
                            }
                        >
                            <Text
                                style={
                                    styles.parkEmoji
                                }
                            >
                                🏞️
                            </Text>
                        </View>

                        <View
                            style={
                                styles.parkContent
                            }
                        >
                            <Text
                                style={
                                    styles.parkLabel
                                }
                            >
                                PARK
                            </Text>

                            <Text
                                style={
                                    styles.parkName
                                }
                                numberOfLines={
                                    2
                                }
                            >
                                {
                                    park.name
                                }
                            </Text>
                        </View>
                    </View>
                ) : null}

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
                            searchQuery
                        }
                        onChangeText={
                            setSearchQuery
                        }
                        placeholder="Search trails..."
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
                    />

                    {searchQuery.length >
                    0 ? (
                        <Pressable
                            onPress={() =>
                                setSearchQuery(
                                    ''
                                )
                            }
                            style={
                                styles.clearButton
                            }
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

                {!loadingTrails &&
                !trailError ? (
                    <Text
                        style={
                            styles.resultLabel
                        }
                    >
                        {filteredTrails.length}{' '}
                        {filteredTrails.length ===
                        1
                            ? 'trail'
                            : 'trails'}
                    </Text>
                ) : null}

                {loadingTrails ? (
                    <View
                        style={
                            styles.loadingContainer
                        }
                    >
                        <Text
                            style={
                                styles.loadingText
                            }
                        >
                            Loading trails...
                        </Text>
                    </View>
                ) : null}

                {trailError ? (
                    <View
                        style={
                            styles.errorContainer
                        }
                    >
                        <Text
                            style={
                                styles.errorIcon
                            }
                        >
                            ⚠️
                        </Text>

                        <Text
                            style={
                                styles.errorTitle
                            }
                        >
                            Unable to load
                            trails
                        </Text>

                        <Text
                            style={
                                styles.errorDescription
                            }
                        >
                            Please try again.
                        </Text>
                    </View>
                ) : null}

                {/* trail results */}

                {!loadingTrails &&
                !trailError ? (
                    <ScrollView
                        style={
                            styles.trailList
                        }
                        contentContainerStyle={
                            styles.trailListContent
                        }
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={
                            true
                        }
                    >
                        {filteredTrails.map(
                            (trail) => {
                                const selected =
                                    selectedTrail?.id ===
                                    trail.id

                                const alreadyAdded =
                                    trip.trails.some(
                                        (
                                            item
                                        ) => {
                                            if (
                                                typeof item ===
                                                'string'
                                            ) {
                                                return (
                                                    item ===
                                                    trail.id
                                                )
                                            }

                                            return (
                                                item.id ===
                                                trail.id
                                            )
                                        }
                                    )

                                return (
                                    <Pressable
                                        key={
                                            String(
                                                trail.id
                                            )
                                        }
                                        style={[
                                            styles.trailCard,
                                            selected &&
                                                styles.selectedTrailCard,
                                            alreadyAdded &&
                                                styles.disabledTrailCard,
                                        ]}
                                        onPress={() => {
                                            if (
                                                !alreadyAdded
                                            ) {
                                                handleSelectTrail(
                                                    trail
                                                )
                                            }
                                        }}
                                        disabled={
                                            alreadyAdded
                                        }
                                        accessibilityRole="button"
                                        accessibilityLabel={`select ${trail.name}`}
                                    >
                                        <View
                                            style={
                                                styles.trailIcon
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.trailEmoji
                                                }
                                            >
                                                🥾
                                            </Text>
                                        </View>

                                        <View
                                            style={
                                                styles.trailContent
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.trailName
                                                }
                                            >
                                                {
                                                    trail.name
                                                }
                                            </Text>

                                            <Text
                                                style={
                                                    styles.trailDescription
                                                }
                                                numberOfLines={
                                                    2
                                                }
                                            >
                                                {
                                                    trail.description
                                                }
                                            </Text>

                                            <View
                                                style={
                                                    styles.trailFacts
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.trailFact
                                                    }
                                                >
                                                    {
                                                        trail.distance
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.trailFactDivider
                                                    }
                                                >
                                                    ·
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.trailFact
                                                    }
                                                >
                                                    {
                                                        trail.difficulty
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.trailFactDivider
                                                    }
                                                >
                                                    ·
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.trailFact
                                                    }
                                                >
                                                    {
                                                        trail.duration
                                                    }
                                                </Text>
                                            </View>

                                            <View
                                                style={
                                                    styles.dogRow
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.dogIcon
                                                    }
                                                >
                                                    🐕
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.dogText
                                                    }
                                                >
                                                    {trail.dogsAllowed
                                                        ? 'dogs allowed'
                                                        : 'dogs not allowed'}
                                                </Text>
                                            </View>
                                        </View>

                                        <View
                                            style={[
                                                styles.selectionIndicator,
                                                selected &&
                                                    styles.selectedIndicator,
                                                alreadyAdded &&
                                                    styles.alreadyAddedIndicator,
                                            ]}
                                        >
                                            {alreadyAdded ? (
                                                <Text
                                                    style={
                                                        styles.alreadyAddedText
                                                    }
                                                >
                                                    ✓
                                                </Text>
                                            ) : selected ? (
                                                <View
                                                    style={
                                                        styles.selectionDot
                                                    }
                                                />
                                            ) : null}
                                        </View>
                                    </Pressable>
                                )
                            }
                        )}
                    </ScrollView>
                ) : null}

                {/* empty search state */}

                {!loadingTrails &&
                !trailError &&
                filteredTrails.length ===
                    0 ? (
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
                            🌲
                        </Text>

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No trails found
                        </Text>

                        <Text
                            style={
                                styles.emptyDescription
                            }
                        >
                            Try a different search.
                        </Text>
                    </View>
                ) : null}

                {/* selected trail */}

                {selectedTrail ? (
                    <View
                        style={
                            styles.selectedSection
                        }
                    >
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Selected trail
                        </Text>

                        <View
                            style={
                                styles.selectedCard
                            }
                        >
                            <View
                                style={
                                    styles.selectedIcon
                                }
                            >
                                <Text
                                    style={
                                        styles.selectedEmoji
                                    }
                                >
                                    🥾
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.selectedContent
                                }
                            >
                                <Text
                                    style={
                                        styles.selectedName
                                    }
                                    numberOfLines={
                                        2
                                    }
                                >
                                    {
                                        selectedTrail.name
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.selectedDescription
                                    }
                                    numberOfLines={
                                        2
                                    }
                                >
                                    {
                                        selectedTrail.description
                                    }
                                </Text>
                            </View>
                        </View>

                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            When are you hiking?
                        </Text>

                        <View
                            style={
                                styles.dateTimeRow
                            }
                        >
                            <Pressable
                                onPress={
                                    handleOpenDatePicker
                                }
                                style={
                                    styles.dateTimeButton
                                }
                            >
                                <Text
                                    style={
                                        styles.dateTimeLabel
                                    }
                                >
                                    DATE
                                </Text>

                                <Text
                                    style={
                                        styles.dateTimeValue
                                    }
                                >
                                    {formatDisplayDate(
                                        selectedDate
                                    )}
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={
                                    handleOpenTimePicker
                                }
                                style={
                                    styles.dateTimeButton
                                }
                            >
                                <Text
                                    style={
                                        styles.dateTimeLabel
                                    }
                                >
                                    START TIME
                                </Text>

                                <Text
                                    style={
                                        styles.dateTimeValue
                                    }
                                >
                                    {formatDisplayTime(
                                        selectedTime
                                    )}
                                </Text>
                            </Pressable>
                        </View>

                        {activePicker ? (
                            <Modal
                                transparent
                                animationType="fade"
                                visible={
                                    true
                                }
                                onRequestClose={() =>
                                    setActivePicker(
                                        null
                                    )
                                }
                            >
                                <View
                                    style={
                                        styles.pickerOverlay
                                    }
                                >
                                    <View
                                        style={
                                            styles.pickerCard
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.pickerTitle
                                            }
                                        >
                                            {activePicker ===
                                            'date'
                                                ? 'Choose date'
                                                : 'Choose start time'}
                                        </Text>

                                        <DateTimePicker
                                            key={
                                                pickerKey
                                            }
                                            value={
                                                pickerValue
                                            }
                                            mode={
                                                activePicker
                                            }
                                            display="spinner"
                                            onChange={
                                                handlePickerChange
                                            }
                                            minimumDate={
                                                activePicker ===
                                                'date'
                                                    ? new Date()
                                                    : undefined
                                            }
                                            themeVariant="light"
                                        />

                                        <Pressable
                                            onPress={() =>
                                                setActivePicker(
                                                    null
                                                )
                                            }
                                            style={
                                                styles.pickerDoneButton
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.pickerDoneText
                                                }
                                            >
                                                Done
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </Modal>
                        ) : null}
                    </View>
                ) : null}
            </ScrollView>

            <View
                style={[
                    styles.bottomBar,
                    {
                        paddingBottom:
                            insets.bottom +
                            theme.spacing.sm,
                    },
                ]}
            >
                <Pressable
                    style={[
                        styles.addButton,
                        !selectedTrail &&
                            styles.disabledAddButton,
                    ]}
                    onPress={
                        handleAddTrail
                    }
                    disabled={
                        !selectedTrail
                    }
                >
                    <Text
                        style={
                            styles.addButtonText
                        }
                    >
                        Add to trip
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

function createTripDate(
    dateString
) {
    if (!dateString) {
        return new Date()
    }

    const date =
        new Date(
            `${dateString}T12:00:00`
        )

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return new Date()
    }

    return date
}

function formatDateForStorage(
    date
) {
    if (!date) {
        return null
    }

    const year =
        date.getFullYear()

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, '0')

    const day =
        String(
            date.getDate()
        ).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function formatTimeForStorage(
    time
) {
    if (!time) {
        return null
    }

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
    if (!date) {
        return 'Select date'
    }

    return date.toLocaleDateString(
        'en-US',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }
    )
}

function formatDisplayTime(
    time
) {
    if (!time) {
        return 'Select time'
    }

    const date =
        new Date()

    date.setHours(
        time.hour
    )

    date.setMinutes(
        time.minute
    )

    return date.toLocaleTimeString(
        'en-US',
        {
            hour: 'numeric',
            minute: '2-digit',
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

        container: {
            padding:
                theme.spacing.md,
        },

        centered: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .parchment,
            flex: 1,
            justifyContent:
                'center',
            padding:
                theme.spacing.lg,
        },

        header: {
            alignItems:
                'center',
            flexDirection:
                'row',
            marginBottom:
                theme.spacing.lg,
        },

        backButton: {
            alignItems:
                'center',
            height: 42,
            justifyContent:
                'center',
            marginRight:
                theme.spacing.sm,
            width: 42,
        },

        backText: {
            color:
                theme.colors
                    .forest,
            fontSize: 36,
            lineHeight: 36,
        },

        headerText: {
            flex: 1,
        },

        title: {
            color:
                theme.colors
                    .ink,
            fontFamily:
                theme.typography
                    .headingFont,
            fontSize:
                theme.typography
                    .headingSize,
            fontWeight:
                '700',
        },

        subtitle: {
            color:
                theme.colors
                    .earth,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize:
                theme.typography
                    .bodySize,
            marginTop:
                theme.spacing.xs,
        },

        loadingContainer: {
            alignItems:
                'center',
            padding:
                theme.spacing.xl,
        },

        loadingText: {
            color:
                theme.colors
                    .earth,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize:
                theme.typography
                    .bodySize,
        },

        parkCard: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .canvas,
            borderColor:
                theme.colors
                    .sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            flexDirection:
                'row',
            marginBottom:
                theme.spacing.md,
            padding:
                theme.spacing.md,
        },

        parkIcon: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .sage,
            borderRadius:
                theme.radii.sm,
            height: 44,
            justifyContent:
                'center',
            marginRight:
                theme.spacing.sm,
            width: 44,
        },

        parkEmoji: {
            fontSize: 22,
        },

        parkContent: {
            flex: 1,
        },

        parkLabel: {
            color:
                theme.colors
                    .earth,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize: 10,
            fontWeight:
                '700',
            letterSpacing: 1,
        },

        parkName: {
            color:
                theme.colors
                    .forest,
            fontFamily:
                theme.typography
                    .headingFont,
            fontSize: 17,
            fontWeight:
                '700',
            marginTop:
                theme.spacing.xs,
        },

        searchContainer: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .white,
            borderColor:
                theme.colors
                    .sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            flexDirection:
                'row',
            minHeight: 50,
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
                theme.colors
                    .ink,
            flex: 1,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize:
                theme.typography
                    .bodySize,
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
                theme.colors
                    .earth,
            fontSize: 22,
        },

        resultLabel: {
            color:
                theme.colors
                    .earth,
            fontSize: 11,
            marginTop:
                theme.spacing.md,
        },

        trailList: {
            height: 300,
            marginTop:
                theme.spacing.sm,
        },

        trailListContent: {
            gap: theme.spacing.sm,
            paddingBottom:
                theme.spacing.xs,
        },

        trailCard: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .canvas,
            borderColor:
                theme.colors
                    .sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            flexDirection:
                'row',
            padding:
                theme.spacing.sm,
        },

        selectedTrailCard: {
            borderColor:
                theme.colors
                    .forest,
            borderWidth: 2,
        },

        disabledTrailCard: {
            opacity: 0.55,
        },

        trailIcon: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .sage,
            borderRadius:
                theme.radii.sm,
            height: 44,
            justifyContent:
                'center',
            marginRight:
                theme.spacing.sm,
            width: 44,
        },

        trailEmoji: {
            fontSize: 21,
        },

        trailContent: {
            flex: 1,
        },

        trailName: {
            color:
                theme.colors
                    .forest,
            fontFamily:
                theme.typography
                    .headingFont,
            fontSize: 15,
            fontWeight:
                '700',
        },

        trailDescription: {
            color:
                theme.colors
                    .earth,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize: 12,
            lineHeight: 17,
            marginTop:
                theme.spacing.xs,
        },

        trailFacts: {
            alignItems:
                'center',
            flexDirection:
                'row',
            flexWrap:
                'wrap',
            marginTop:
                theme.spacing.xs,
        },

        trailFact: {
            color:
                theme.colors
                    .ink,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize: 11,
            fontWeight:
                '600',
        },

        trailFactDivider: {
            color:
                theme.colors
                    .earth,
            fontSize: 11,
            marginHorizontal:
                4,
        },

        dogRow: {
            alignItems:
                'center',
            flexDirection:
                'row',
            marginTop:
                theme.spacing.xs,
        },

        dogIcon: {
            fontSize: 12,
            marginRight: 4,
        },

        dogText: {
            color:
                theme.colors
                    .earth,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize: 10,
        },

        selectionIndicator: {
            alignItems:
                'center',
            borderColor:
                theme.colors
                    .sage,
            borderRadius:
                12,
            borderWidth: 1,
            height: 22,
            justifyContent:
                'center',
            marginLeft:
                theme.spacing.sm,
            width: 22,
        },

        selectedIndicator: {
            borderColor:
                theme.colors
                    .forest,
        },

        alreadyAddedIndicator: {
            backgroundColor:
                theme.colors
                    .sage,
            borderColor:
                theme.colors
                    .sage,
        },

        selectionDot: {
            backgroundColor:
                theme.colors
                    .forest,
            borderRadius:
                6,
            height: 10,
            width: 10,
        },

        alreadyAddedText: {
            color:
                theme.colors
                    .white,
            fontSize: 14,
            fontWeight:
                '700',
        },

        emptyState: {
            alignItems:
                'center',
            padding:
                theme.spacing.xl,
        },

        emptyIcon: {
            fontSize: 32,
            marginBottom:
                theme.spacing.sm,
        },

        emptyTitle: {
            color:
                theme.colors
                    .forest,
            fontFamily:
                theme.typography
                    .headingFont,
            fontSize: 17,
            fontWeight:
                '700',
        },

        emptyDescription: {
            color:
                theme.colors
                    .earth,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize: 13,
            marginTop:
                theme.spacing.xs,
            textAlign:
                'center',
        },

        errorContainer: {
            alignItems:
                'center',
            padding:
                theme.spacing.xl,
        },

        errorIcon: {
            fontSize: 30,
            marginBottom:
                theme.spacing.sm,
        },

        errorTitle: {
            color:
                theme.colors
                    .forest,
            fontFamily:
                theme.typography
                    .headingFont,
            fontSize: 17,
            fontWeight:
                '700',
        },

        errorDescription: {
            color:
                theme.colors
                    .earth,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize: 13,
            marginTop:
                theme.spacing.xs,
        },

        errorText: {
            color:
                theme.colors
                    .earth,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize: 16,
        },

        selectedSection: {
            marginTop:
                theme.spacing.lg,
        },

        sectionTitle: {
            color:
                theme.colors
                    .forest,
            fontFamily:
                theme.typography
                    .headingFont,
            fontSize: 16,
            fontWeight:
                '700',
            marginBottom:
                theme.spacing.sm,
        },

        selectedCard: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .canvas,
            borderColor:
                theme.colors
                    .forest,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            flexDirection:
                'row',
            marginBottom:
                theme.spacing.lg,
            padding:
                theme.spacing.sm,
        },

        selectedIcon: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .sage,
            borderRadius:
                theme.radii.sm,
            height: 44,
            justifyContent:
                'center',
            marginRight:
                theme.spacing.sm,
            width: 44,
        },

        selectedEmoji: {
            fontSize: 21,
        },

        selectedContent: {
            flex: 1,
        },

        selectedName: {
            color:
                theme.colors
                    .forest,
            fontFamily:
                theme.typography
                    .headingFont,
            fontSize: 15,
            fontWeight:
                '700',
        },

        selectedDescription: {
            color:
                theme.colors
                    .earth,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize: 12,
            lineHeight: 17,
            marginTop:
                theme.spacing.xs,
        },

        dateTimeRow: {
            flexDirection:
                'row',
            gap:
                theme.spacing.sm,
        },

        dateTimeButton: {
            backgroundColor:
                theme.colors
                    .canvas,
            borderColor:
                theme.colors
                    .sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            flex: 1,
            padding:
                theme.spacing.sm,
        },

        dateTimeLabel: {
            color:
                theme.colors
                    .earth,
            fontSize: 9,
            fontWeight:
                '700',
            letterSpacing: 0.8,
        },

        dateTimeValue: {
            color:
                theme.colors
                    .forest,
            fontFamily:
                theme.typography
                    .headingFont,
            fontSize: 14,
            fontWeight:
                '700',
            marginTop:
                theme.spacing.xs,
        },

        pickerOverlay: {
            alignItems:
                'center',
            backgroundColor:
                'rgba(0, 0, 0, 0.35)',
            flex: 1,
            justifyContent:
                'center',
            padding:
                theme.spacing.lg,
        },

        pickerCard: {
            backgroundColor:
                theme.colors
                    .parchment,
            borderRadius:
                theme.radii.lg,
            padding:
                theme.spacing.lg,
            width: '100%',
        },

        pickerTitle: {
            color:
                theme.colors
                    .forest,
            fontFamily:
                theme.typography
                    .headingFont,
            fontSize: 18,
            fontWeight:
                '700',
            marginBottom:
                theme.spacing.sm,
            textAlign:
                'center',
        },

        pickerDoneButton: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .forest,
            borderRadius:
                theme.radii.md,
            marginTop:
                theme.spacing.sm,
            padding:
                theme.spacing.sm,
        },

        pickerDoneText: {
            color:
                theme.colors
                    .white,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize: 14,
            fontWeight:
                '700',
        },

        bottomBar: {
            backgroundColor:
                theme.colors
                    .parchment,
            paddingHorizontal:
                theme.spacing.md,
            paddingTop:
                theme.spacing.sm,
        },

        addButton: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors
                    .forest,
            borderRadius:
                theme.radii.md,
            padding:
                theme.spacing.md,
        },

        disabledAddButton: {
            opacity: 0.45,
        },

        addButtonText: {
            color:
                theme.colors
                    .white,
            fontFamily:
                theme.typography
                    .bodyFont,
            fontSize: 15,
            fontWeight:
                '700',
        },
    })