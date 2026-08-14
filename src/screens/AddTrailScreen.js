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
import mockTrails from '../data/mockTrails'
import mockParks from '../data/mockParks'
import { useTrips } from '../context/TripContext'

// provides a searchable trail selection experience for adding trails to an adventure
export default function AddTrailScreen({
    route,
    navigation,
}) {
    const insets = useSafeAreaInsets()
    const { trips, updateTrip } = useTrips()

    const { tripId } = route.params

    const trip = trips.find(
        (item) => item.id === tripId
    )

    const [searchQuery, setSearchQuery] =
        useState('')

    const [selectedTrail, setSelectedTrail] =
        useState(null)

    const [selectedDate, setSelectedDate] =
        useState(() =>
            createTripDate(
                trip?.startDate
            )
        )

    // stores time separately from the calendar date so date and time can never overwrite each other
    const [selectedTime, setSelectedTime] =
        useState({
            hour: 8,
            minute: 0,
        })

    const [activePicker, setActivePicker] =
        useState(null)

    /*
     * forces the native picker to be recreated
     * whenever the user opens it
     *
     * this is the implementation that fixed
     * the iOS time picker problem
     */
    const [pickerInstance, setPickerInstance] =
        useState(0)

    const park = mockParks.find(
        (item) => item.id === trip?.parkId
    )

    // only displays trails belonging to the park associated with this trip
    const parkTrails = mockTrails.filter(
        (trail) =>
            trail.parkId === trip?.parkId
    )

    // filters the park's trails as the user searches
    const filteredTrails = parkTrails.filter(
        (trail) =>
            trail.name
                .toLowerCase()
                .includes(
                    searchQuery.toLowerCase()
                )
    )

    const handleSelectTrail = (trail) => {
        // dismisses the keyboard before displaying the trail preview
        Keyboard.dismiss()

        setSelectedTrail(trail)

        // starts each newly selected trail with the trip's first day
        setSelectedDate(
            createTripDate(
                trip?.startDate
            )
        )

        // starts each newly selected trail at 8:00 AM
        setSelectedTime({
            hour: 8,
            minute: 0,
        })
    }

    const openPicker = (picker) => {
        // dismisses the keyboard before opening the picker
        Keyboard.dismiss()

        /*
         * forces a completely fresh native picker
         * every time the picker is opened
         */
        setPickerInstance(
            (current) => current + 1
        )

        setActivePicker(picker)
    }

    const closePicker = () => {
        // closes the custom picker popup
        setActivePicker(null)
    }

    const handlePickerChange = (
        event,
        value
    ) => {
        // only closes when the native picker is actually dismissed
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

        // updates the date while keeping the popup open
        if (
            activePicker ===
            'date'
        ) {
            setSelectedDate(value)
        }

        // extracts only the hour and minute from the native time picker
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

    const handleAddTrail = () => {
        if (
            !selectedTrail ||
            !trip
        ) {
            return
        }

        /*
         * prevents the same trail from being added
         * to a trip more than once
         */
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

        if (alreadyAdded) {
            navigation.goBack()
            return
        }

        const trailReservation = {
            id:
                selectedTrail.id,

            date:
                formatDatabaseDate(
                    selectedDate
                ),

            time:
                formatDatabaseTime(
                    selectedTime
                ),
        }

        /*
         * stores the trail together with its
         * planned date and start time
         */
        updateTrip(trip.id, {
            trails: [
                ...trip.trails,
                trailReservation,
            ],
        })

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
                        // keeps the screen content below the device safe area
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
                            // dismisses the keyboard before returning to the trip
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
                        Add Trail
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
                        Choose a trail
                    </Text>

                    <Text
                        style={
                            styles.parkName
                        }
                    >
                        {park?.name ||
                            'National Park'}
                    </Text>
                </View>

                {/* search */}

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
                        ⌕
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
                        accessibilityLabel="search trails"
                    />

                    {searchQuery.length >
                    0 ? (
                        <Pressable
                            onPress={() => {
                                // clears the current search so all trails are visible again
                                setSearchQuery(
                                    ''
                                )
                            }}
                            style={
                                styles.clearButton
                            }
                            accessibilityRole="button"
                            accessibilityLabel="clear trail search"
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
                    {
                        filteredTrails.length
                    }{' '}
                    {filteredTrails.length ===
                    1
                        ? 'trail'
                        : 'trails'}
                </Text>

                {/* trail results */}

                <View
                    style={
                        styles.trailList
                    }
                >
                    {filteredTrails.map(
                        (trail) => {
                            const selected =
                                selectedTrail?.id ===
                                trail.id

                            const alreadyAdded =
                                trip.trails.some(
                                    (item) => {
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
                                        trail.id
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
                </View>

                {filteredTrails.length ===
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
                            Try a different search
                            term.
                        </Text>
                    </View>
                ) : null}

                {/* selected trail preview */}

                {selectedTrail ? (
                    <View
                        style={
                            styles.previewCard
                        }
                    >
                        <View
                            style={
                                styles.previewHeader
                            }
                        >
                            <View
                                style={
                                    styles.previewHeaderContent
                                }
                            >
                                <Text
                                    style={
                                        styles.previewEyebrow
                                    }
                                >
                                    SELECTED TRAIL
                                </Text>

                                <Text
                                    style={
                                        styles.previewTitle
                                    }
                                >
                                    {
                                        selectedTrail.name
                                    }
                                </Text>
                            </View>

                            <Pressable
                                onPress={() =>
                                    setSelectedTrail(
                                        null
                                    )
                                }
                                accessibilityRole="button"
                                accessibilityLabel="clear selected trail"
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

                        <View
                            style={
                                styles.previewFacts
                            }
                        >
                            <Fact
                                label="Distance"
                                value={
                                    selectedTrail.distance
                                }
                            />

                            <Fact
                                label="Difficulty"
                                value={
                                    selectedTrail.difficulty
                                }
                            />

                            <Fact
                                label="Elevation"
                                value={
                                    selectedTrail.elevation
                                }
                            />
                        </View>

                        <Text
                            style={
                                styles.previewDescription
                            }
                        >
                            {
                                selectedTrail.description
                            }
                        </Text>

                        <Text
                            style={
                                styles.scheduleTitle
                            }
                        >
                            When are you hiking?
                        </Text>

                        <View
                            style={
                                styles.scheduleRow
                            }
                        >
                            {/* date */}

                            <View
                                style={
                                    styles.scheduleField
                                }
                            >
                                <Text
                                    style={
                                        styles.scheduleLabel
                                    }
                                >
                                    Date
                                </Text>

                                <Pressable
                                    style={
                                        styles.scheduleInput
                                    }
                                    onPress={() =>
                                        openPicker(
                                            'date'
                                        )
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel="select trail date"
                                >
                                    <Text
                                        style={
                                            styles.scheduleText
                                        }
                                    >
                                        {formatDisplayDate(
                                            selectedDate
                                        )}
                                    </Text>

                                    <Text
                                        style={
                                            styles.scheduleIcon
                                        }
                                    >
                                        ▣
                                    </Text>
                                </Pressable>
                            </View>

                            {/* time */}

                            <View
                                style={
                                    styles.scheduleField
                                }
                            >
                                <Text
                                    style={
                                        styles.scheduleLabel
                                    }
                                >
                                    Start time
                                </Text>

                                <Pressable
                                    style={
                                        styles.scheduleInput
                                    }
                                    onPress={() =>
                                        openPicker(
                                            'time'
                                        )
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel="select trail start time"
                                >
                                    <Text
                                        style={
                                            styles.scheduleText
                                        }
                                    >
                                        {formatDisplayTime(
                                            selectedTime
                                        )}
                                    </Text>

                                    <Text
                                        style={
                                            styles.scheduleIcon
                                        }
                                    >
                                        ◷
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                ) : null}
            </ScrollView>

            {/* bottom action */}

            <View
                style={[
                    styles.bottomAction,
                    {
                        // keeps the add button above the device safe area
                        paddingBottom:
                            insets.bottom +
                            theme.spacing.sm,
                    },
                ]}
            >
                <Pressable
                    style={[
                        styles.addTrailButton,
                        !selectedTrail &&
                            styles.disabledAddButton,
                    ]}
                    onPress={
                        handleAddTrail
                    }
                    disabled={
                        !selectedTrail
                    }
                    accessibilityRole="button"
                    accessibilityLabel="add selected trail to trip"
                >
                    <Text
                        style={[
                            styles.addTrailButtonText,
                            !selectedTrail &&
                                styles.disabledAddButtonText,
                        ]}
                    >
                        Add to trip
                    </Text>
                </Pressable>
            </View>

            {/* native date/time picker */}

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
                                    SELECT
                                </Text>

                                <Text
                                    style={
                                        styles.modalTitle
                                    }
                                >
                                    {activePicker ===
                                    'date'
                                        ? 'Trail date'
                                        : 'Trail start time'}
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
                                    /*
                                     * this is the critical fix
                                     *
                                     * the picker is recreated every
                                     * time it opens
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

function Fact({
    label,
    value,
}) {
    return (
        <View
            style={
                styles.fact
            }
        >
            <Text
                style={
                    styles.factLabel
                }
            >
                {label}
            </Text>

            <Text
                style={
                    styles.factValue
                }
            >
                {value}
            </Text>
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
    const date =
        createPickerTime(
            time
        )

    return date.toLocaleTimeString(
        'en-US',
        {
            hour:
                'numeric',
            minute:
                '2-digit',
        }
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

        parkName: {
            color:
                theme.colors.earth,
            fontSize: 14,
            marginTop:
                theme.spacing.xs,
        },

        searchContainer: {
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
            marginTop:
                theme.spacing.xl,
            minHeight: 52,
            paddingHorizontal:
                theme.spacing.md,
        },

        searchIcon: {
            color:
                theme.colors.earth,
            fontSize: 24,
            marginRight:
                theme.spacing.sm,
        },

        searchInput: {
            color:
                theme.colors.ink,
            flex: 1,
            fontSize: 14,
            minHeight: 50,
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
                theme.spacing.md,
        },

        trailList: {
            gap:
                theme.spacing.sm,
            marginTop:
                theme.spacing.sm,
        },

        trailCard: {
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
            padding:
                theme.spacing.sm,
        },

        selectedTrailCard: {
            backgroundColor:
                theme.colors.sage,
            borderColor:
                theme.colors.forest,
        },

        disabledTrailCard: {
            opacity: 0.6,
        },

        trailIcon: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors.sage,
            borderRadius: 24,
            height: 48,
            justifyContent:
                'center',
            width: 48,
        },

        trailEmoji: {
            fontSize: 23,
        },

        trailContent: {
            flex: 1,
            marginLeft:
                theme.spacing.sm,
        },

        trailName: {
            color:
                theme.colors.ink,
            fontSize: 14,
            fontWeight:
                '700',
        },

        trailDescription: {
            color:
                theme.colors.earth,
            fontSize: 11,
            lineHeight: 16,
            marginTop: 3,
        },

        trailFacts: {
            alignItems:
                'center',
            flexDirection:
                'row',
            marginTop:
                theme.spacing.sm,
        },

        trailFact: {
            color:
                theme.colors.forest,
            fontSize: 11,
            fontWeight:
                '600',
        },

        trailFactDivider: {
            color:
                theme.colors.earth,
            fontSize: 11,
            marginHorizontal: 5,
        },

        dogRow: {
            alignItems:
                'center',
            flexDirection:
                'row',
            marginTop: 4,
        },

        dogIcon: {
            fontSize: 11,
        },

        dogText: {
            color:
                theme.colors.earth,
            fontSize: 10,
            marginLeft: 4,
        },

        selectionIndicator: {
            alignItems:
                'center',
            borderColor:
                theme.colors.earth,
            borderRadius: 10,
            borderWidth: 1.5,
            height: 20,
            justifyContent:
                'center',
            marginLeft:
                theme.spacing.sm,
            width: 20,
        },

        selectedIndicator: {
            borderColor:
                theme.colors.forest,
        },

        selectionDot: {
            backgroundColor:
                theme.colors.forest,
            borderRadius: 5,
            height: 10,
            width: 10,
        },

        alreadyAddedIndicator: {
            backgroundColor:
                theme.colors.forest,
            borderColor:
                theme.colors.forest,
        },

        alreadyAddedText: {
            color:
                theme.colors.parchment,
            fontSize: 13,
            fontWeight:
                '700',
        },

        emptyState: {
            alignItems:
                'center',
            paddingHorizontal:
                theme.spacing.xl,
            paddingVertical:
                theme.spacing.xxl,
        },

        emptyIcon: {
            fontSize: 42,
        },

        emptyTitle: {
            color:
                theme.colors.ink,
            fontSize: 19,
            fontWeight:
                '700',
            marginTop:
                theme.spacing.md,
        },

        emptyDescription: {
            color:
                theme.colors.earth,
            fontSize: 13,
            marginTop:
                theme.spacing.xs,
        },

        previewCard: {
            backgroundColor:
                theme.colors.sage,
            borderRadius:
                theme.radii.lg,
            marginTop:
                theme.spacing.lg,
            padding:
                theme.spacing.md,
        },

        previewHeader: {
            alignItems:
                'flex-start',
            flexDirection:
                'row',
            justifyContent:
                'space-between',
        },

        previewHeaderContent: {
            flex: 1,
        },

        previewEyebrow: {
            color:
                theme.colors.forest,
            fontSize: 9,
            fontWeight:
                '700',
            letterSpacing: 1.3,
        },

        previewTitle: {
            color:
                theme.colors.ink,
            fontSize: 18,
            fontWeight:
                '700',
            marginTop: 3,
        },

        previewClose: {
            color:
                theme.colors.earth,
            fontSize: 25,
        },

        previewFacts: {
            flexDirection:
                'row',
            marginTop:
                theme.spacing.md,
        },

        fact: {
            flex: 1,
        },

        factLabel: {
            color:
                theme.colors.earth,
            fontSize: 9,
            fontWeight:
                '600',
            textTransform:
                'uppercase',
        },

        factValue: {
            color:
                theme.colors.ink,
            fontSize: 13,
            fontWeight:
                '700',
            marginTop: 2,
        },

        previewDescription: {
            color:
                theme.colors.bark,
            fontSize: 12,
            lineHeight: 18,
            marginTop:
                theme.spacing.md,
        },

        scheduleTitle: {
            color:
                theme.colors.ink,
            fontSize: 14,
            fontWeight:
                '700',
            marginTop:
                theme.spacing.lg,
        },

        scheduleRow: {
            flexDirection:
                'row',
            gap:
                theme.spacing.sm,
            marginTop:
                theme.spacing.sm,
        },

        scheduleField: {
            flex: 1,
        },

        scheduleLabel: {
            color:
                theme.colors.earth,
            fontSize: 10,
            fontWeight:
                '700',
            marginBottom: 4,
        },

        scheduleInput: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors.parchment,
            borderColor:
                theme.colors.sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            flexDirection:
                'row',
            justifyContent:
                'space-between',
            minHeight: 46,
            paddingHorizontal:
                theme.spacing.sm,
        },

        scheduleText: {
            color:
                theme.colors.ink,
            flex: 1,
            fontSize: 11,
        },

        scheduleIcon: {
            color:
                theme.colors.forest,
            fontSize: 16,
            marginLeft: 4,
        },

        bottomAction: {
            backgroundColor:
                theme.colors.parchment,
            paddingHorizontal:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.sm,
        },

        addTrailButton: {
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

        disabledAddButton: {
            backgroundColor:
                theme.colors.sage,
        },

        addTrailButtonText: {
            color:
                theme.colors.parchment,
            fontSize: 15,
            fontWeight:
                '700',
        },

        disabledAddButtonText: {
            color:
                theme.colors.earth,
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