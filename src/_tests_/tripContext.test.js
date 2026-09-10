import React from "react";

import { act, create } from "react-test-renderer";

import { TripProvider, useTrips } from "../context/TripContext";

import { supabase } from "../services/supabase";

// stores an independent query builder for each supabase table

const mockTableBuilders = {};

// creates a controlled mock for supabase.from

const mockSupabaseFrom = jest.fn();

jest.mock("../services/supabase", () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
        },

        from: jest.fn(),
    },
}));

// captures the trip context so tests can call its methods

let contextValue = null;

function ContextProbe() {
    contextValue = useTrips();

    return null;
}

// creates a supabase query builder for one database table

function createQueryBuilder(tableName) {
    const builder = {
        select: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        eq: jest.fn(),
        in: jest.fn(),
        order: jest.fn(),
        single: jest.fn(),
    };

    // stores the builder so individual tests can inspect its calls

    mockTableBuilders[tableName] = builder;

    // supabase methods return the same builder so calls can be chained

    builder.select.mockReturnValue(builder);

    builder.insert.mockReturnValue(builder);

    builder.update.mockReturnValue(builder);

    builder.delete.mockReturnValue(builder);

    builder.eq.mockReturnValue(builder);

    builder.in.mockReturnValue(builder);

    builder.order.mockReturnValue(builder);

    // returns the configured single row response

    builder.single.mockImplementation(async () => {
        return (
            tableResponses[tableName]?.single || {
                data: null,
                error: null,
            }
        );
    });

    // makes the builder awaitable like a real supabase query

    builder.then = (resolve, reject) => {
        const response =
            tableResponses[tableName]?.query || {
                data: [],
                error: null,
            };

        return Promise.resolve(response).then(
            resolve,
            reject,
        );
    };

    return builder;
}

// configures supabase.from to return the correct builder for each table

mockSupabaseFrom.mockImplementation((tableName) => {
    if (!mockTableBuilders[tableName]) {
        return createQueryBuilder(tableName);
    }

    return mockTableBuilders[tableName];
});

// replaces the real supabase.from function with our jest mock

supabase.from = mockSupabaseFrom;

const tableResponses = {};

// creates a realistic database trip

function createDatabaseTrip(overrides = {}) {
    return {
        id: "trip-1",
        user_id: "user-1",
        park_id: "yell",
        name: "Yellowstone Adventure",
        start_date: "2099-07-10",
        end_date: "2099-07-15",
        notes: "camping trip",
        created_at: "2099-01-01T10:00:00.000Z",
        ...overrides,
    };
}

// prepares the database responses used when loading trips

function setupInitialTrip(
    trip = createDatabaseTrip(),
) {
    tableResponses.trips = {
        query: {
            data: [trip],
            error: null,
        },

        single: {
            data: trip,
            error: null,
        },
    };

    tableResponses.trip_trails = {
        query: {
            data: [],
            error: null,
        },
    };

    tableResponses.trip_campsites = {
        query: {
            data: [],
            error: null,
        },
    };

    tableResponses.trip_activities = {
        query: {
            data: [],
            error: null,
        },
    };

    tableResponses.trip_packing_items = {
        query: {
            data: [],
            error: null,
        },
    };

    tableResponses.journal_pages = {
        query: {
            data: [],
            error: null,
        },
    };
}

// renders the provider and waits for its initial database load

async function renderContext() {
    contextValue = null;

    let renderer;

    await act(async () => {
        renderer = create(
            <TripProvider>
                <ContextProbe />
            </TripProvider>,
        );
    });

    return renderer;
}

describe("TripContext", () => {
    const authenticatedUser = {
        id: "user-1",
        is_anonymous: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        Object.keys(mockTableBuilders).forEach(
            (key) => {
                delete mockTableBuilders[key];
            },
        );

        Object.keys(tableResponses).forEach(
            (key) => {
                delete tableResponses[key];
            },
        );

        supabase.auth.getUser.mockResolvedValue({
            data: {
                user: authenticatedUser,
            },
            error: null,
        });

        setupInitialTrip();
    });

    test("loads the authenticated users trips from supabase", async () => {
        await renderContext();

        expect(
            supabase.auth.getUser,
        ).toHaveBeenCalled();

        expect(
            supabase.from,
        ).toHaveBeenCalledWith("trips");

        expect(
            mockTableBuilders.trips.select,
        ).toHaveBeenCalledWith("*");

        expect(
            mockTableBuilders.trips.eq,
        ).toHaveBeenCalledWith(
            "user_id",
            "user-1",
        );

        expect(
            contextValue.trips,
        ).toHaveLength(1);

        expect(
            contextValue.trips[0],
        ).toMatchObject({
            id: "trip-1",
            parkId: "yell",
            name: "Yellowstone Adventure",
            startDate: "2099-07-10",
            endDate: "2099-07-15",
            notes: "camping trip",
        });

        expect(
            contextValue.trips[0].trails,
        ).toEqual([]);

        expect(
            contextValue.trips[0].campsites,
        ).toEqual([]);

        expect(
            contextValue.trips[0].activities,
        ).toEqual([]);

        expect(
            contextValue.trips[0].packingItems,
        ).toEqual([]);
    });

    test("returns no trips for an anonymous user", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: {
                user: {
                    id: "anonymous-user",
                    is_anonymous: true,
                },
            },
            error: null,
        });

        await renderContext();

        expect(
            contextValue.trips,
        ).toEqual([]);

        expect(
            supabase.from,
        ).not.toHaveBeenCalled();
    });

    test("returns no trips when there is no authenticated user", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: {
                user: null,
            },
            error: null,
        });

        await renderContext();

        expect(
            contextValue.trips,
        ).toEqual([]);

        expect(
            supabase.from,
        ).not.toHaveBeenCalled();
    });

    test("adds a new trip through supabase", async () => {
        const insertedTrip =
            createDatabaseTrip({
                id: "trip-2",
                park_id: "grte",
                name: "Grand Teton Adventure",
                start_date: "2099-08-01",
                end_date: "2099-08-05",
                notes: "backpacking trip",
            });

        tableResponses.trips.single = {
            data: insertedTrip,
            error: null,
        };

        await renderContext();

        const newTrip = {
            parkId: "grte",
            name: "Grand Teton Adventure",
            startDate: "2099-08-01",
            endDate: "2099-08-05",
            notes: "backpacking trip",
        };

        let result;

        await act(async () => {
            result =
                await contextValue.addTrip(
                    newTrip,
                );
        });

        expect(
            mockTableBuilders.trips.insert,
        ).toHaveBeenCalledWith({
            user_id: "user-1",
            park_id: "grte",
            name: "Grand Teton Adventure",
            start_date: "2099-08-01",
            end_date: "2099-08-05",
            notes: "backpacking trip",
        });

        expect(
            mockTableBuilders.trips.select,
        ).toHaveBeenCalledWith("*");

        expect(
            mockTableBuilders.trips.single,
        ).toHaveBeenCalled();

        expect(result).toMatchObject({
            id: "trip-2",
            parkId: "grte",
            name: "Grand Teton Adventure",
        });

        expect(
            contextValue.trips,
        ).toHaveLength(2);

        expect(
            contextValue.trips[0],
        ).toMatchObject({
            id: "trip-2",
            parkId: "grte",
            name: "Grand Teton Adventure",
        });
    });

    test("does not allow an anonymous user to create a trip", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: {
                user: {
                    id: "anonymous-user",
                    is_anonymous: true,
                },
            },
            error: null,
        });

        await renderContext();

        await expect(
            contextValue.addTrip({
                parkId: "yell",
                name: "Test Trip",
                startDate: "2099-07-10",
                endDate: "2099-07-15",
            }),
        ).rejects.toThrow(
            "you must be signed in to create a trip",
        );

        expect(
            supabase.from,
        ).not.toHaveBeenCalled();
    });

    test("throws when supabase fails while creating a trip", async () => {
        const databaseError =
            new Error(
                "database insert failed",
            );

        tableResponses.trips.single = {
            data: null,
            error: databaseError,
        };

        await renderContext();

        await expect(
            contextValue.addTrip({
                parkId: "yell",
                name: "Test Trip",
                startDate: "2099-07-10",
                endDate: "2099-07-15",
            }),
        ).rejects.toThrow(
            "database insert failed",
        );
    });

    test("updates the main trip fields in supabase", async () => {
        await renderContext();

        await act(async () => {
            await contextValue.updateTrip(
                "trip-1",
                {
                    name:
                        "Updated Yellowstone Trip",
                    notes: "updated notes",
                },
            );
        });

        expect(
            mockTableBuilders.trips.update,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                name:
                    "Updated Yellowstone Trip",
                notes: "updated notes",
                updated_at:
                    expect.any(String),
            }),
        );

        expect(
            mockTableBuilders.trips.eq,
        ).toHaveBeenCalledWith(
            "id",
            "trip-1",
        );

        const updatedTrip =
            contextValue.trips.find(
                (trip) =>
                    trip.id === "trip-1",
            );

        expect(updatedTrip).toMatchObject({
            id: "trip-1",
            name:
                "Updated Yellowstone Trip",
            notes: "updated notes",
            parkId: "yell",
            startDate: "2099-07-10",
            endDate: "2099-07-15",
        });
    });

    test("synchronizes scheduled trails with supabase", async () => {
        await renderContext();

        await act(async () => {
            await contextValue.updateTrip(
                "trip-1",
                {
                    trails: [
                        {
                            id: "trail-1",
                            date: "2099-07-11",
                            time: "09:30",
                        },
                        {
                            id: "trail-2",
                            date: "2099-07-12",
                            time: "14:00",
                        },
                    ],
                },
            );
        });

        expect(
            mockTableBuilders.trip_trails
                .delete,
        ).toHaveBeenCalled();

        expect(
            mockTableBuilders.trip_trails.eq,
        ).toHaveBeenCalledWith(
            "trip_id",
            "trip-1",
        );

        expect(
            mockTableBuilders.trip_trails
                .insert,
        ).toHaveBeenCalledWith([
            {
                trip_id: "trip-1",
                trail_id: "trail-1",
                date: "2099-07-11",
                time: "09:30",
            },
            {
                trip_id: "trip-1",
                trail_id: "trail-2",
                date: "2099-07-12",
                time: "14:00",
            },
        ]);

        expect(
            contextValue.trips[0].trails,
        ).toEqual([
            {
                id: "trail-1",
                date: "2099-07-11",
                time: "09:30",
            },
            {
                id: "trail-2",
                date: "2099-07-12",
                time: "14:00",
            },
        ]);
    });

    test("synchronizes campsite reservations with supabase", async () => {
        await renderContext();

        await act(async () => {
            await contextValue.updateTrip(
                "trip-1",
                {
                    campsites: [
                        {
                            id: "camp-1",
                            campsiteNumber:
                                "A12",
                            checkIn:
                                "2099-07-10",
                            checkOut:
                                "2099-07-15",
                            notes:
                                "near the lake",
                        },
                    ],
                },
            );
        });

        expect(
            mockTableBuilders.trip_campsites
                .delete,
        ).toHaveBeenCalled();

        expect(
            mockTableBuilders.trip_campsites.eq,
        ).toHaveBeenCalledWith(
            "trip_id",
            "trip-1",
        );

        expect(
            mockTableBuilders.trip_campsites
                .insert,
        ).toHaveBeenCalledWith([
            {
                trip_id: "trip-1",
                campground_id: "camp-1",
                campsite_number: "A12",
                check_in:
                    "2099-07-10",
                check_out:
                    "2099-07-15",
                notes: "near the lake",
            },
        ]);

        expect(
            contextValue.trips[0].campsites,
        ).toEqual([
            {
                id: "camp-1",
                campsiteNumber: "A12",
                checkIn: "2099-07-10",
                checkOut: "2099-07-15",
                notes: "near the lake",
            },
        ]);
    });

    test("synchronizes activities with supabase", async () => {
        await renderContext();

        await act(async () => {
            await contextValue.updateTrip(
                "trip-1",
                {
                    activities: [
                        {
                            title:
                                "Sunrise hike",
                            date:
                                "2099-07-11",
                            time:
                                "06:30",
                            location:
                                "Yellowstone Lake",
                            notes:
                                "bring binoculars",
                        },
                    ],
                },
            );
        });

        expect(
            mockTableBuilders.trip_activities
                .delete,
        ).toHaveBeenCalled();

        expect(
            mockTableBuilders.trip_activities.eq,
        ).toHaveBeenCalledWith(
            "trip_id",
            "trip-1",
        );

        expect(
            mockTableBuilders.trip_activities
                .insert,
        ).toHaveBeenCalledWith([
            {
                trip_id: "trip-1",
                title: "Sunrise hike",
                date: "2099-07-11",
                time: "06:30",
                location:
                    "Yellowstone Lake",
                notes:
                    "bring binoculars",
            },
        ]);

        expect(
            contextValue.trips[0].activities,
        ).toEqual([
            {
                title: "Sunrise hike",
                date: "2099-07-11",
                time: "06:30",
                location: "Yellowstone Lake",
                notes: "bring binoculars",
            },
        ]);
    });

    test("synchronizes packing items with supabase", async () => {
        await renderContext();

        await act(async () => {
            await contextValue.updateTrip(
                "trip-1",
                {
                    packingItems: [
                        {
                            label: "Binoculars",
                            completed: true,
                        },
                        {
                            label:
                                "First aid kit",
                            completed: false,
                        },
                    ],
                },
            );
        });

        expect(
            mockTableBuilders
                .trip_packing_items.delete,
        ).toHaveBeenCalled();

        expect(
            mockTableBuilders
                .trip_packing_items.eq,
        ).toHaveBeenCalledWith(
            "trip_id",
            "trip-1",
        );

        expect(
            mockTableBuilders
                .trip_packing_items.insert,
        ).toHaveBeenCalledWith([
            {
                trip_id: "trip-1",
                label: "Binoculars",
                completed: true,
            },
            {
                trip_id: "trip-1",
                label:
                    "First aid kit",
                completed: false,
            },
        ]);

        expect(
            contextValue.trips[0].packingItems,
        ).toEqual([
            {
                label: "Binoculars",
                completed: true,
            },
            {
                label: "First aid kit",
                completed: false,
            },
        ]);
    });

    test("does nothing when updating a trip that does not exist", async () => {
        await renderContext();

        const tripsBefore =
            [...contextValue.trips];

        await act(async () => {
            await contextValue.updateTrip(
                "missing-trip",
                {
                    name:
                        "Should not exist",
                },
            );
        });

        expect(
            contextValue.trips,
        ).toEqual(tripsBefore);

        expect(
            mockTableBuilders.trips.update,
        ).not.toHaveBeenCalled();
    });

    test("removes a trip and all related supabase records", async () => {
        await renderContext();

        await act(async () => {
            await contextValue.removeTrip(
                "trip-1",
            );
        });

        expect(
            mockTableBuilders.trip_trails
                .delete,
        ).toHaveBeenCalled();

        expect(
            mockTableBuilders.trip_trails.eq,
        ).toHaveBeenCalledWith(
            "trip_id",
            "trip-1",
        );

        expect(
            mockTableBuilders.trip_campsites
                .delete,
        ).toHaveBeenCalled();

        expect(
            mockTableBuilders.trip_activities
                .delete,
        ).toHaveBeenCalled();

        expect(
            mockTableBuilders.trip_packing_items
                .delete,
        ).toHaveBeenCalled();

        expect(
            mockTableBuilders.trips.delete,
        ).toHaveBeenCalled();

        expect(
            mockTableBuilders.trips.eq,
        ).toHaveBeenCalledWith(
            "id",
            "trip-1",
        );

        expect(
            contextValue.trips,
        ).toEqual([]);
    });

    test("stops deleting when a related supabase record fails", async () => {
        const databaseError =
            new Error(
                "related delete failed",
            );

        await renderContext();

        // makes the related trail delete fail after the trip has loaded

        mockTableBuilders.trip_trails.then =
            (resolve, reject) => {
                return Promise.resolve({
                    data: null,
                    error: databaseError,
                }).then(
                    resolve,
                    reject,
                );
            };

        await expect(
            contextValue.removeTrip(
                "trip-1",
            ),
        ).rejects.toThrow(
            "related delete failed",
        );

        // the main trip must not be deleted after the related delete fails

        expect(
            mockTableBuilders.trips.delete,
        ).not.toHaveBeenCalled();

        expect(
            contextValue.trips,
        ).toHaveLength(1);

        expect(
            contextValue.trips[0].id,
        ).toBe("trip-1");
    });
});