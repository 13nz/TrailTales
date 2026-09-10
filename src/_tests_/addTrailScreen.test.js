import React from 'react'

import {
    act,
} from 'react-test-renderer'

import AddTrailScreen from '../screens/AddTrailScreen'

import {
    useTrips,
} from '../context/TripContext'

import {
    getParkByCode,
    getTrailsByPark,
} from '../api/npsApi'

const apiTrails = [
    {
        id: 'yellowstone-trail-1',
        parkId: 'yellowstone',
        name: 'Mystery Trail',
        description:
            'A scenic trail through Yellowstone National Park.',
        distance: '3.2 mi',
        difficulty: 'Moderate',
        duration: '2 hr',
        dogsAllowed: false,
    },
    {
        id: 'yellowstone-trail-2',
        parkId: 'yellowstone',
        name: 'Canyon Trail',
        description:
            'A trail with views of the Yellowstone canyon.',
        distance: '4.5 mi',
        difficulty: 'Moderate',
        duration: '3 hr',
        dogsAllowed: false,
    },
    {
        id: 'other-park-trail',
        parkId: 'other-park',
        name: 'Other Park Trail',
        description:
            'A trail from another national park.',
        distance: '2.0 mi',
        difficulty: 'Easy',
        duration: '1 hr',
        dogsAllowed: true,
    },
]

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

jest.mock(
    '../api/npsApi',
    () => ({
        getParkByCode: jest.fn(),
        getTrailsByPark: jest.fn(),
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

        getParkByCode.mockResolvedValue({
            id: 'yellowstone',
            name: 'Yellowstone National Park',
        })

        getTrailsByPark.mockResolvedValue(
            apiTrails.filter(
                (trail) =>
                    trail.parkId ===
                    'yellowstone'
            )
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    async function renderScreen() {
        let renderer

        await act(async () => {
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

    function findTextInput(
        renderer
    ) {
        return renderer.root.find(
            (node) =>
                node.type ===
                    'TextInput' &&
                node.props
                    ?.placeholder ===
                    'Search trails...'
        )
    }

    function findPressableByText(
        renderer,
        text
    ) {
        const nodes =
            renderer.root.findAll(
                (node) =>
                    typeof node.props
                        ?.onPress ===
                    'function'
            )

        const button =
            nodes.find(
                (node) => {
                    const children =
                        node.props
                            ?.children

                    if (
                        typeof children ===
                        'string'
                    ) {
                        return (
                            children ===
                            text
                        )
                    }

                    if (
                        Array.isArray(
                            children
                        )
                    ) {
                        return children.some(
                            (child) =>
                                typeof child ===
                                    'object' &&
                                child?.props
                                    ?.children ===
                                    text
                        )
                    }

                    return (
                        children?.props
                            ?.children ===
                        text
                    )
                }
            )

        if (!button) {
            throw new Error(
                `Could not find pressable containing ${text}`
            )
        }

        return button
    }

    test('renders trails belonging to the trip park', async () => {
        const renderer =
            await renderScreen()

        const yellowstoneTrails =
            apiTrails.filter(
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

    test('filters trails using the search field', async () => {
        const renderer =
            await renderScreen()

        const searchInput =
            findTextInput(
                renderer
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

    test('selecting a trail enables the add button', async () => {
        const renderer =
            await renderScreen()

        const trail =
            apiTrails.find(
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
            findPressableByText(
                renderer,
                'Add to trip'
            )

        expect(
            addButton.props.disabled
        ).toBe(false)
    })

    test('adds the selected trail with its default date and time', async () => {
        const renderer =
            await renderScreen()

        const trail =
            apiTrails.find(
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
            findPressableByText(
                renderer,
                'Add to trip'
            )

        await act(async () => {
            await addButton.props.onPress()
        })

        expect(
            updateTrip
        ).toHaveBeenCalledTimes(1)

        expect(
            updateTrip
        ).toHaveBeenCalledWith(
            'test-trip',
            expect.objectContaining({
                trails:
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: trail.id,
                            date:
                                '2026-08-17',
                            time:
                                '08:00',
                        }),
                    ]),
            })
        )

        expect(
            navigation.goBack
        ).toHaveBeenCalledTimes(1)
    })

    test('does not add a trail that is already in the trip', async () => {
        const trail =
            apiTrails.find(
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
            await renderScreen()

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

    test('starts a newly selected trail at 8:00 AM', async () => {
        const renderer =
            await renderScreen()

        const trail =
            apiTrails.find(
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

        const timeText =
            renderer.root.findAll(
                (node) =>
                    node.props?.children ===
                    '8:00 AM'
            )

        expect(
            timeText.length
        ).toBeGreaterThan(0)
    })
})