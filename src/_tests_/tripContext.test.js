import React from 'react'

import {
    act,
    create,
} from 'react-test-renderer'

import {
    TripProvider,
    useTrips,
} from '../context/TripContext'

let contextValue = null

function ContextProbe() {
    contextValue = useTrips()

    return null
}

function renderContext() {
    contextValue = null

    let renderer

    act(() => {
        renderer = create(
            <TripProvider>
                <ContextProbe />
            </TripProvider>
        )
    })

    return renderer
}

describe('TripContext', () => {
    test('provides the initial trips', () => {
        renderContext()

        expect(
            contextValue
        ).not.toBeNull()

        expect(
            Array.isArray(
                contextValue.trips
            )
        ).toBe(true)

        expect(
            contextValue.trips.length
        ).toBeGreaterThan(0)
    })

    test('adds a new trip to the beginning', () => {
        renderContext()

        const trip = {
            id: 'test-trip',
            name: 'Test Trip',
        }

        const countBefore =
            contextValue.trips.length

        act(() => {
            contextValue.addTrip(
                trip
            )
        })

        expect(
            contextValue.trips.length
        ).toBe(
            countBefore + 1
        )

        expect(
            contextValue.trips[0]
        ).toEqual(trip)
    })

    test('updates only the selected trip', () => {
        renderContext()

        const originalTrips =
            contextValue.trips

        const tripId =
            originalTrips[0].id

        const otherTrip =
            originalTrips[1]

        act(() => {
            contextValue.updateTrip(
                tripId,
                {
                    name:
                        'Updated Trip',
                }
            )
        })

        expect(
            contextValue.trips[0].name
        ).toBe(
            'Updated Trip'
        )

        expect(
            contextValue.trips[1]
        ).toEqual(
            otherTrip
        )
    })

    test('removes only the selected trip', () => {
        renderContext()

        const originalTrips =
            contextValue.trips

        const tripToRemove =
            originalTrips[0]

        const countBefore =
            originalTrips.length

        act(() => {
            contextValue.removeTrip(
                tripToRemove.id
            )
        })

        expect(
            contextValue.trips.length
        ).toBe(
            countBefore - 1
        )

        expect(
            contextValue.trips.some(
                (trip) =>
                    trip.id ===
                    tripToRemove.id
            )
        ).toBe(false)
    })

    test('preserves existing trip data when updating', () => {
        renderContext()

        const originalTrip =
            contextValue.trips[0]

        act(() => {
            contextValue.updateTrip(
                originalTrip.id,
                {
                    name:
                        'New Name',
                }
            )
        })

        const updatedTrip =
            contextValue.trips.find(
                (trip) =>
                    trip.id ===
                    originalTrip.id
            )

        expect(
            updatedTrip.name
        ).toBe(
            'New Name'
        )

        expect(
            updatedTrip.parkId
        ).toBe(
            originalTrip.parkId
        )

        expect(
            updatedTrip.startDate
        ).toBe(
            originalTrip.startDate
        )

        expect(
            updatedTrip.endDate
        ).toBe(
            originalTrip.endDate
        )
    })
})