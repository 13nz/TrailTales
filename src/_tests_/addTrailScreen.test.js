import React from 'react'

import {
    act,
} from 'react-test-renderer'

import AddTrailScreen from '../screens/AddTrailScreen'

import {
    useTrips,
} from '../context/TripContext'

import mockTrails from '../data/mockTrails'

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

describe('AddTrailScreen', () => {
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
                trails: [],
                activities: [],
                campsites: [],
            },
        ]

        updateTrip = jest.fn()

        navigation = {
            goBack: jest.fn(),
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
            renderer = require(
                'react-test-renderer'
            ).create(
                <AddTrailScreen
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

    function findTrailButton(
        renderer,
        trailName
    ) {
        const nodes =
            renderer.root.findAll(
                (node) =>
                    node.props
                        ?.accessibilityLabel ===
                    `select ${trailName}`
            )

        const button =
            nodes.find(
                (node) =>
                    typeof node.props
                        ?.onPress ===
                    'function'
            )

        if (!button) {
            throw new Error(
                `Could not find trail button for ${trailName}`
            )
        }

        return button
    }

    test('renders trails belonging to the trip park', () => {
        const renderer =
            renderScreen()

        const yellowstoneTrails =
            mockTrails.filter(
                (trail) =>
                    trail.parkId ===
                    'yellowstone'
            )

        expect(
            yellowstoneTrails.length
        ).toBeGreaterThan(0)

        yellowstoneTrails.forEach(
            (trail) => {
                expect(
                    findTrailButton(
                        renderer,
                        trail.name
                    )
                ).toBeTruthy()
            }
        )
    })

    test('filters trails using the search field', () => {
        const renderer =
            renderScreen()

        const searchInput =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'search trails',
                }
            )

        act(() => {
            searchInput.props.onChangeText(
                'nonexistent trail'
            )
        })

        const emptyState =
            renderer.root.find(
                (node) =>
                    node.props
                        ?.children ===
                    'No trails found'
            )

        expect(
            emptyState
        ).toBeTruthy()
    })

    test('selecting a trail enables the add button', () => {
        const renderer =
            renderScreen()

        const trail =
            mockTrails.find(
                (item) =>
                    item.parkId ===
                    'yellowstone'
            )

        expect(
            trail
        ).toBeTruthy()

        const trailButton =
            findTrailButton(
                renderer,
                trail.name
            )

        act(() => {
            trailButton.props.onPress()
        })

        const addButton =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'add selected trail to trip',
                }
            )

        expect(
            addButton.props.disabled
        ).toBe(false)
    })

    test('adds the selected trail with its default date and time', () => {
        const renderer =
            renderScreen()

        const trail =
            mockTrails.find(
                (item) =>
                    item.parkId ===
                    'yellowstone'
            )

        const trailButton =
            findTrailButton(
                renderer,
                trail.name
            )

        act(() => {
            trailButton.props.onPress()
        })

        const addButton =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'add selected trail to trip',
                }
            )

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
            {
                trails:
                    expect.arrayContaining([
                        {
                            id: trail.id,
                            date:
                                '2026-08-17',
                            time:
                                '08:00',
                        },
                    ]),
            }
        )

        expect(
            navigation.goBack
        ).toHaveBeenCalledTimes(1)
    })

    test('does not add a trail that is already in the trip', () => {
        const trail =
            mockTrails.find(
                (item) =>
                    item.parkId ===
                    'yellowstone'
            )

        trips[0].trails = [
            {
                id: trail.id,
                date: '2026-08-17',
                time: '08:00',
            },
        ]

        const renderer =
            renderScreen()

        const trailButton =
            findTrailButton(
                renderer,
                trail.name
            )

        expect(
            trailButton.props.disabled
        ).toBe(true)

        act(() => {
            trailButton.props.onPress()
        })

        expect(
            updateTrip
        ).not.toHaveBeenCalled()

        expect(
            navigation.goBack
        ).not.toHaveBeenCalled()
    })

    test('starts a newly selected trail at 8:00 AM', () => {
        const renderer =
            renderScreen()

        const trail =
            mockTrails.find(
                (item) =>
                    item.parkId ===
                    'yellowstone'
            )

        const trailButton =
            findTrailButton(
                renderer,
                trail.name
            )

        act(() => {
            trailButton.props.onPress()
        })

        const timeButton =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'select trail start time',
                }
            )

        expect(
            timeButton
        ).toBeTruthy()
    })
})