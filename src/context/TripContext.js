import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react'

import { supabase } from '../services/supabase'

const TripContext = createContext(null)

// determines whether a trip is upcoming or already completed based on its end date
function getTripStatus(endDate) {
    if (!endDate) {
        return 'upcoming'
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tripEnd = new Date(
        `${endDate}T12:00:00`
    )

    return tripEnd >= today
        ? 'upcoming'
        : 'past'
}

// converts a database trip and its child records into the shape used by the existing screens
function normalizeTrip(
    trip,
    trails = [],
    campsites = [],
    activities = [],
    packingItems = []
) {
    return {
        id: trip.id,
        parkId: trip.park_id,
        name: trip.name,
        startDate: trip.start_date,
        endDate: trip.end_date,
        status: getTripStatus(trip.end_date),
        notes: trip.notes || '',

        trails: trails.map((item) => ({
            id: item.trail_id,
            date: item.date,
            time: item.time
                ? item.time.slice(0, 5)
                : null,
        })),

        campsites: campsites.map((item) => ({
            id: item.campground_id,
            campsiteNumber:
                item.campsite_number,
            checkIn: item.check_in,
            checkOut: item.check_out,
            notes: item.notes || '',
        })),

        activities: activities.map((item) => ({
            id: item.id,
            title: item.title,
            date: item.date,
            time: item.time
                ? item.time.slice(0, 5)
                : null,
            location: item.location || '',
            notes: item.notes || '',
        })),

        packingItems: packingItems.map((item) => ({
            id: item.id,
            label: item.label,
            completed: item.completed,
        })),
    }
}

// loads all trips owned by the current user and their related planning data
async function loadTripsFromSupabase() {
    const {
        data: userData,
        error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
        throw userError
    }

    const user = userData.user

    if (!user || user.is_anonymous) {
        return []
    }

    const {
        data: tripsData,
        error: tripsError,
    } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {
            ascending: false,
        })

    if (tripsError) {
        throw tripsError
    }

    if (!tripsData || tripsData.length === 0) {
        return []
    }

    const tripIds = tripsData.map(
        (trip) => trip.id
    )

    const [
        trailsResult,
        campsitesResult,
        activitiesResult,
        packingResult,
    ] = await Promise.all([
        supabase
            .from('trip_trails')
            .select('*')
            .in('trip_id', tripIds),

        supabase
            .from('trip_campsites')
            .select('*')
            .in('trip_id', tripIds),

        supabase
            .from('trip_activities')
            .select('*')
            .in('trip_id', tripIds),

        supabase
            .from('trip_packing_items')
            .select('*')
            .in('trip_id', tripIds),
    ])

    if (trailsResult.error) {
        throw trailsResult.error
    }

    if (campsitesResult.error) {
        throw campsitesResult.error
    }

    if (activitiesResult.error) {
        throw activitiesResult.error
    }

    if (packingResult.error) {
        throw packingResult.error
    }

    return tripsData.map((trip) =>
        normalizeTrip(
            trip,
            trailsResult.data.filter(
                (item) =>
                    item.trip_id ===
                    trip.id
            ),
            campsitesResult.data.filter(
                (item) =>
                    item.trip_id ===
                    trip.id
            ),
            activitiesResult.data.filter(
                (item) =>
                    item.trip_id ===
                    trip.id
            ),
            packingResult.data.filter(
                (item) =>
                    item.trip_id ===
                    trip.id
            )
        )
    )
}

// provides shared trip state backed by supabase
export function TripProvider({ children }) {
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        const loadTrips = async () => {
            try {
                const loadedTrips =
                    await loadTripsFromSupabase()

                if (active) {
                    setTrips(loadedTrips)
                }
            } catch (error) {
                console.error(
                    'supabase trip load error:',
                    error
                )
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadTrips()

        return () => {
            active = false
        }
    }, [])

    const addTrip = async (trip) => {
        const {
            data: userData,
            error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
            throw userError
        }

        const user = userData.user

        if (!user || user.is_anonymous) {
            throw new Error(
                'you must be signed in to create a trip'
            )
        }

        const {
            data,
            error,
        } = await supabase
            .from('trips')
            .insert({
                user_id: user.id,
                park_id: trip.parkId,
                name: trip.name,
                start_date:
                    trip.startDate,
                end_date:
                    trip.endDate,
                notes:
                    trip.notes || null,
            })
            .select()
            .single()

        if (error) {
            throw error
        }

        const newTrip = normalizeTrip(data)

        // adds the newly created trip immediately so the existing ui behaves the same
        setTrips((currentTrips) => [
            newTrip,
            ...currentTrips,
        ])

        return newTrip
    }

    const updateTrip = async (
        tripId,
        updates
    ) => {
        const currentTrip =
            trips.find(
                (trip) =>
                    trip.id === tripId
            )

        if (!currentTrip) {
            return
        }

        const nextTrip = {
            ...currentTrip,
            ...updates,
        }

        // updates the main trip record when its fields changed
        const tripUpdates = {}

        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                'parkId'
            )
        ) {
            tripUpdates.park_id =
                updates.parkId
        }

        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                'name'
            )
        ) {
            tripUpdates.name =
                updates.name
        }

        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                'startDate'
            )
        ) {
            tripUpdates.start_date =
                updates.startDate
        }

        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                'endDate'
            )
        ) {
            tripUpdates.end_date =
                updates.endDate
        }

        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                'notes'
            )
        ) {
            tripUpdates.notes =
                updates.notes || null
        }

        if (
            Object.keys(tripUpdates)
                .length > 0
        ) {
            const {
                error,
            } = await supabase
                .from('trips')
                .update({
                    ...tripUpdates,
                    updated_at:
                        new Date().toISOString(),
                })
                .eq(
                    'id',
                    tripId
                )

            if (error) {
                throw error
            }
        }

        // synchronizes scheduled trails with supabase
        if (
            updates.trails !==
            undefined
        ) {
            const {
                error: deleteTrailsError,
            } = await supabase
                .from('trip_trails')
                .delete()
                .eq(
                    'trip_id',
                    tripId
                )

            if (
                deleteTrailsError
            ) {
                console.error(
                    'supabase trail delete error:',
                    deleteTrailsError
                )

                throw deleteTrailsError
            }

            const trailRows =
                updates.trails
                    .filter(
                        (trail) =>
                            typeof trail ===
                            'object'
                    )
                    .map(
                        (trail) => ({
                            trip_id:
                                tripId,

                            trail_id:
                                trail.id,

                            date:
                                trail.date ||
                                null,

                            time:
                                trail.time ||
                                null,
                        })
                    )

            if (
                trailRows.length >
                0
            ) {
                const {
                    error: insertTrailsError,
                } = await supabase
                    .from('trip_trails')
                    .insert(
                        trailRows
                    )

                if (
                    insertTrailsError
                ) {
                    console.error(
                        'supabase trail insert error:',
                        insertTrailsError
                    )

                    throw insertTrailsError
                }
            }
        }

        // synchronizes campsite reservations with supabase
        if (
            updates.campsites !==
            undefined
        ) {
            // removes the existing campsite rows for this trip
            const {
                error: deleteCampsitesError,
            } = await supabase
                .from('trip_campsites')
                .delete()
                .eq(
                    'trip_id',
                    tripId
                )

            if (
                deleteCampsitesError
            ) {
                console.error(
                    'supabase campsite delete error:',
                    deleteCampsitesError
                )

                throw deleteCampsitesError
            }

            // inserts the current campsite reservations back into the database
            if (
                updates.campsites.length >
                0
            ) {
                const campsiteRows =
                    updates.campsites.map(
                        (
                            campsite
                        ) => ({
                            trip_id:
                                tripId,

                            campground_id:
                                campsite.id,

                            campsite_number:
                                campsite.campsiteNumber ||
                                null,

                            check_in:
                                campsite.checkIn ||
                                null,

                            check_out:
                                campsite.checkOut ||
                                null,

                            notes:
                                campsite.notes ||
                                null,
                        })
                    )

                const {
                    error: insertCampsitesError,
                } = await supabase
                    .from('trip_campsites')
                    .insert(
                        campsiteRows
                    )

                if (
                    insertCampsitesError
                ) {
                    console.error(
                        'supabase campsite insert error:',
                        insertCampsitesError
                    )

                    throw insertCampsitesError
                }
            }
        }

        // synchronizes custom activities with supabase
        if (
            updates.activities !==
            undefined
        ) {
            const {
                error: deleteActivitiesError,
            } = await supabase
                .from('trip_activities')
                .delete()
                .eq(
                    'trip_id',
                    tripId
                )

            if (
                deleteActivitiesError
            ) {
                console.error(
                    'supabase activity delete error:',
                    deleteActivitiesError
                )

                throw deleteActivitiesError
            }

            const activityRows =
                updates.activities
                    .filter(
                        (activity) =>
                            typeof activity ===
                            'object'
                    )
                    .map(
                        (activity) => ({
                            trip_id:
                                tripId,

                            title:
                                activity.title ||
                                '',

                            date:
                                activity.date ||
                                null,

                            time:
                                activity.time ||
                                null,

                            location:
                                activity.location ||
                                null,

                            notes:
                                activity.notes ||
                                null,
                        })
                    )

            if (
                activityRows.length >
                0
            ) {
                const {
                    error: insertActivitiesError,
                } = await supabase
                    .from('trip_activities')
                    .insert(
                        activityRows
                    )

                if (
                    insertActivitiesError
                ) {
                    console.error(
                        'supabase activity insert error:',
                        insertActivitiesError
                    )

                    throw insertActivitiesError
                }
            }
        }

        // updates the local trip immediately after all database changes succeed
        setTrips((currentTrips) =>
            currentTrips.map((trip) =>
                trip.id === tripId
                    ? {
                          ...nextTrip,
                          status: getTripStatus(
                              nextTrip.endDate
                          ),
                      }
                    : trip
            )
        )
    }

    const removeTrip = async (
        tripId
    ) => {
        const {
            error,
        } = await supabase
            .from('trips')
            .delete()
            .eq(
                'id',
                tripId
            )

        if (error) {
            throw error
        }

        // removes the trip immediately after the database confirms deletion
        setTrips((currentTrips) =>
            currentTrips.filter(
                (trip) =>
                    trip.id !== tripId
            )
        )
    }

    return (
        <TripContext.Provider
            value={{
                trips,
                loading,
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
    const context =
        useContext(TripContext)

    if (!context) {
        throw new Error(
            'useTrips must be used inside TripProvider'
        )
    }

    return context
}