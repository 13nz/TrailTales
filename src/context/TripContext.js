import { createContext, useContext, useState } from 'react'

import mockTrips from '../data/mockTrips'

// provides shared trip state to every screen that needs to read or modify adventures
const TripContext = createContext(null)

// manages the temporary local trip data before it is replaced with supabase persistence
export function TripProvider({ children }) {
    const [trips, setTrips] = useState(mockTrips)

    const addTrip = (trip) => {
        // adds the newest adventure to the beginning so it appears immediately in the trips list
        setTrips((currentTrips) => [
            trip,
            ...currentTrips,
        ])
    }

    const updateTrip = (tripId, updates) => {
        // updates only the selected adventure while preserving all other trips
        setTrips((currentTrips) =>
            currentTrips.map((trip) =>
                trip.id === tripId
                    ? {
                          ...trip,
                          ...updates,
                      }
                    : trip
            )
        )
    }

    const removeTrip = (tripId) => {
        // removes an adventure from the local trip collection
        setTrips((currentTrips) =>
            currentTrips.filter(
                (trip) => trip.id !== tripId
            )
        )
    }

    return (
        <TripContext.Provider
            value={{
                trips,
                addTrip,
                updateTrip,
                removeTrip,
            }}
        >
            {children}
        </TripContext.Provider>
    )
}

// provides a reusable hook so screens can access trip state without repeating context boilerplate
export function useTrips() {
    const context = useContext(TripContext)

    if (!context) {
        throw new Error(
            'useTrips must be used inside TripProvider'
        )
    }

    return context
}