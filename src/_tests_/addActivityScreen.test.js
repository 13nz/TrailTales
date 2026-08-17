import React from 'react'

import {
    Text,
    Pressable,
    TextInput,
} from 'react-native'

import {
    act,
    create,
} from 'react-test-renderer'

import AddActivityScreen from '../screens/AddActivityScreen'
import {
    useTrips,
} from '../context/TripContext'

jest.mock(
    '@react-native-community/datetimepicker',
    () => {
        return function DateTimePicker() {
            return null
        }
    }
)

jest.mock(
    'react-native-safe-area-context',
    () => ({
        useSafeAreaInsets: () => ({
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        }),
    })
)

jest.mock(
    '../context/TripContext',
    () => ({
        useTrips: jest.fn(),
    })
)

describe('AddActivityScreen', () => {
    let trips
    let updateTrip
    let navigation

    beforeEach(() => {
        trips = [
            {
                id: 'test-trip',
                name: 'Yellowstone Adventure',
                parkId: 'yellowstone',
                startDate: '2026-08-17',
                endDate: '2026-08-20',
                activities: [],
                trails: [],
                campsites: [],
            },
        ]

        updateTrip =
            jest.fn()

        navigation = {
            goBack:
                jest.fn(),
        }

        useTrips.mockReturnValue({
            trips,
            updateTrip,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    function renderScreen() {
        let renderer

        act(() => {
            renderer = create(
                <AddActivityScreen
                    route={{
                        params: {
                            tripId:
                                'test-trip',
                        },
                    }}
                    navigation={
                        navigation
                    }
                />
            )
        })

        return renderer
    }

    function findByProps(
        renderer,
        props
    ) {
        return renderer.root.findByProps(
            props
        )
    }

    test('renders the add activity form', () => {
        const renderer =
            renderScreen()

        expect(
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'activity name',
                }
            )
        ).toBeTruthy()

        expect(
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'activity location',
                }
            )
        ).toBeTruthy()

        expect(
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'activity notes',
                }
            )
        ).toBeTruthy()

        expect(
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'add activity',
                }
            )
        ).toBeTruthy()
    })

    test('keeps the add button disabled when no activity name is entered', () => {
        const renderer =
            renderScreen()

        const addButton =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'add activity',
                }
            )

        expect(
            addButton.props.disabled
        ).toBe(true)
    })

    test('adds an activity with all entered information', () => {
        const renderer =
            renderScreen()

        const titleInput =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'activity name',
                }
            )

        const locationInput =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'activity location',
                }
            )

        const notesInput =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'activity notes',
                }
            )

        act(() => {
            titleInput.props.onChangeText(
                'Wildlife watching'
            )

            locationInput.props.onChangeText(
                'Lamar Valley'
            )

            notesInput.props.onChangeText(
                'Bring binoculars'
            )
        })

        const addButton =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'add activity',
                }
            )

        expect(
            addButton.props.disabled
        ).toBe(false)

        act(() => {
            addButton.props.onPress()
        })

        expect(
            updateTrip
        ).toHaveBeenCalledTimes(1)

        expect(
            updateTrip
        ).toHaveBeenCalledWith(
            'test-trip',
            expect.objectContaining({
                activities:
                    expect.arrayContaining([
                        expect.objectContaining({
                            title:
                                'Wildlife watching',
                            location:
                                'Lamar Valley',
                            notes:
                                'Bring binoculars',
                            date:
                                '2026-08-17',
                            time:
                                '12:00',
                        }),
                    ]),
            })
        )

        expect(
            navigation.goBack
        ).toHaveBeenCalledTimes(1)
    })

    test('trims whitespace from activity fields', () => {
        const renderer =
            renderScreen()

        const titleInput =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'activity name',
                }
            )

        const locationInput =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'activity location',
                }
            )

        const notesInput =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'activity notes',
                }
            )

        act(() => {
            titleInput.props.onChangeText(
                '  Wildlife watching  '
            )

            locationInput.props.onChangeText(
                '  Lamar Valley  '
            )

            notesInput.props.onChangeText(
                '  Bring binoculars  '
            )
        })

        const addButton =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'add activity',
                }
            )

        act(() => {
            addButton.props.onPress()
        })

        const update =
            updateTrip.mock
                .calls[0][1]

        const activity =
            update.activities[
                update.activities.length -
                    1
            ]

        expect(
            activity.title
        ).toBe(
            'Wildlife watching'
        )

        expect(
            activity.location
        ).toBe(
            'Lamar Valley'
        )

        expect(
            activity.notes
        ).toBe(
            'Bring binoculars'
        )
    })

    test('does not add an activity when the title is empty', () => {
        const renderer =
            renderScreen()

        const titleInput =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'activity name',
                }
            )

        act(() => {
            titleInput.props.onChangeText(
                '   '
            )
        })

        const addButton =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'add activity',
                }
            )

        expect(
            addButton.props.disabled
        ).toBe(true)

        expect(
            updateTrip
        ).not.toHaveBeenCalled()

        expect(
            navigation.goBack
        ).not.toHaveBeenCalled()
    })
})