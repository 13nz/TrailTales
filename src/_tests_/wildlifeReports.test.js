import {
    getWildlifeReportsForPark,
    getWildlifeReportsForTrail,
    getWildlifeReportsForCampground,
    createWildlifeReport,
} from "../services/wildlifeReports"

import { supabase } from "../services/supabase"

jest.mock("../services/supabase", () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(),
    },
}))

function createQueryBuilder(result) {
    const builder = {
        select: jest.fn(),
        eq: jest.fn(),
        gte: jest.fn(),
        order: jest.fn(),
        insert: jest.fn(),
        single: jest.fn(),
    }

    builder.select.mockReturnValue(builder)
    builder.eq.mockReturnValue(builder)
    builder.gte.mockReturnValue(builder)
    builder.order.mockReturnValue(builder)
    builder.insert.mockReturnValue(builder)
    builder.single.mockResolvedValue(result)

    builder.then = (resolve, reject) => {
        return Promise.resolve(result).then(
            resolve,
            reject,
        )
    }

    return builder
}

describe("wildlife report service", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("loads recent wildlife reports for a park", async () => {
        const databaseReports = [
            {
                id: "report-1",
                park_code: "yell",
                trail_id: null,
                campground_id: null,
                species: "Black bear",
                location: "Near the lake",
                description: "Seen crossing the trail",
                reported_at:
                    "2026-09-10T12:00:00.000Z",
            },
        ]

        const builder = createQueryBuilder({
            data: databaseReports,
            error: null,
        })

        supabase.from.mockReturnValue(builder)

        const result =
            await getWildlifeReportsForPark("yell")

        expect(
            supabase.from,
        ).toHaveBeenCalledWith(
            "wildlife_reports",
        )

        expect(
            builder.select,
        ).toHaveBeenCalledWith("*")

        expect(
            builder.eq,
        ).toHaveBeenCalledWith(
            "park_code",
            "yell",
        )

        expect(
            builder.gte,
        ).toHaveBeenCalledWith(
            "reported_at",
            expect.any(String),
        )

        expect(
            builder.order,
        ).toHaveBeenCalledWith(
            "reported_at",
            {
                ascending: false,
            },
        )

        expect(result).toEqual([
            {
                id: "report-1",
                parkId: "yell",
                trailId: null,
                campgroundId: null,
                species: "Black bear",
                location: "Near the lake",
                description:
                    "Seen crossing the trail",
                reportedAt:
                    "2026-09-10T12:00:00.000Z",
                source: "user",
            },
        ])
    })

    test("loads recent wildlife reports for a trail", async () => {
        const databaseReports = [
            {
                id: "report-2",
                park_code: "yell",
                trail_id: "trail-123",
                campground_id: null,
                species: "Elk",
                location: "Upper trail",
                description: "",
                reported_at:
                    "2026-09-10T10:00:00.000Z",
            },
        ]

        const builder = createQueryBuilder({
            data: databaseReports,
            error: null,
        })

        supabase.from.mockReturnValue(builder)

        const result =
            await getWildlifeReportsForTrail(
                "trail-123",
            )

        expect(
            builder.eq,
        ).toHaveBeenCalledWith(
            "trail_id",
            "trail-123",
        )

        expect(result).toEqual([
            {
                id: "report-2",
                parkId: "yell",
                trailId: "trail-123",
                campgroundId: null,
                species: "Elk",
                location: "Upper trail",
                description: "",
                reportedAt:
                    "2026-09-10T10:00:00.000Z",
                source: "user",
            },
        ])
    })

    test("loads recent wildlife reports for a campground", async () => {
        const databaseReports = [
            {
                id: "report-3",
                park_code: "yell",
                trail_id: null,
                campground_id: "camp-456",
                species: "Fox",
                location: "Campground loop",
                description: "Seen after sunset",
                reported_at:
                    "2026-09-10T09:00:00.000Z",
            },
        ]

        const builder = createQueryBuilder({
            data: databaseReports,
            error: null,
        })

        supabase.from.mockReturnValue(builder)

        const result =
            await getWildlifeReportsForCampground(
                "camp-456",
            )

        expect(
            builder.eq,
        ).toHaveBeenCalledWith(
            "campground_id",
            "camp-456",
        )

        expect(result).toEqual([
            {
                id: "report-3",
                parkId: "yell",
                trailId: null,
                campgroundId: "camp-456",
                species: "Fox",
                location: "Campground loop",
                description:
                    "Seen after sunset",
                reportedAt:
                    "2026-09-10T09:00:00.000Z",
                source: "user",
            },
        ])
    })

    test("returns an empty array when no wildlife reports are found", async () => {
        const builder = createQueryBuilder({
            data: null,
            error: null,
        })

        supabase.from.mockReturnValue(builder)

        const result =
            await getWildlifeReportsForPark("yell")

        expect(result).toEqual([])
    })

    test("throws when loading wildlife reports fails", async () => {
        const databaseError =
            new Error(
                "wildlife report load failed",
            )

        const builder = createQueryBuilder({
            data: null,
            error: databaseError,
        })

        supabase.from.mockReturnValue(builder)

        await expect(
            getWildlifeReportsForTrail(
                "trail-123",
            ),
        ).rejects.toThrow(
            "wildlife report load failed",
        )
    })

    test("creates a wildlife report for the signed in user", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: {
                user: {
                    id: "user-123",
                },
            },
            error: null,
        })

        const savedDatabaseReport = {
            id: "report-100",
            park_code: "yell",
            trail_id: "trail-123",
            campground_id: null,
            species: "Black bear",
            location: "Near the lake",
            description:
                "Seen crossing the trail",
            reported_at:
                "2026-09-10T13:00:00.000Z",
        }

        const builder = createQueryBuilder({
            data: savedDatabaseReport,
            error: null,
        })

        supabase.from.mockReturnValue(builder)

        const result =
            await createWildlifeReport({
                parkId: "yell",
                trailId: "trail-123",
                species: "  Black bear  ",
                location: "  Near the lake  ",
                description:
                    "  Seen crossing the trail  ",
            })

        expect(
            supabase.auth.getUser,
        ).toHaveBeenCalled()

        expect(
            supabase.from,
        ).toHaveBeenCalledWith(
            "wildlife_reports",
        )

        expect(
            builder.insert,
        ).toHaveBeenCalledWith({
            user_id: "user-123",
            park_code: "yell",
            trail_id: "trail-123",
            campground_id: null,
            species: "Black bear",
            location: "Near the lake",
            description:
                "Seen crossing the trail",
        })

        expect(
            builder.select,
        ).toHaveBeenCalledWith("*")

        expect(
            builder.single,
        ).toHaveBeenCalled()

        expect(result).toEqual({
            id: "report-100",
            parkId: "yell",
            trailId: "trail-123",
            campgroundId: null,
            species: "Black bear",
            location: "Near the lake",
            description:
                "Seen crossing the trail",
            reportedAt:
                "2026-09-10T13:00:00.000Z",
            source: "user",
        })
    })

    test("creates a campground wildlife report with a null trail id", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: {
                user: {
                    id: "user-456",
                },
            },
            error: null,
        })

        const savedDatabaseReport = {
            id: "report-101",
            park_code: "grte",
            trail_id: null,
            campground_id: "camp-789",
            species: "Moose",
            location: "Campground entrance",
            description: null,
            reported_at:
                "2026-09-10T14:00:00.000Z",
        }

        const builder = createQueryBuilder({
            data: savedDatabaseReport,
            error: null,
        })

        supabase.from.mockReturnValue(builder)

        const result =
            await createWildlifeReport({
                parkId: "grte",
                campgroundId: 789,
                species: "Moose",
                location: "Campground entrance",
            })

        expect(
            builder.insert,
        ).toHaveBeenCalledWith({
            user_id: "user-456",
            park_code: "grte",
            trail_id: null,
            campground_id: "789",
            species: "Moose",
            location: "Campground entrance",
            description: null,
        })

        expect(result).toEqual({
            id: "report-101",
            parkId: "grte",
            trailId: null,
            campgroundId: "camp-789",
            species: "Moose",
            location: "Campground entrance",
            description: "",
            reportedAt:
                "2026-09-10T14:00:00.000Z",
            source: "user",
        })
    })

    test("rejects wildlife reports when the user is not signed in", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: {
                user: null,
            },
            error: null,
        })

        await expect(
            createWildlifeReport({
                parkId: "yell",
                species: "Bear",
                location: "Trail",
            }),
        ).rejects.toThrow(
            "You must be signed in to submit a wildlife report",
        )

        expect(
            supabase.from,
        ).not.toHaveBeenCalled()
    })

    test("throws when checking the signed in user fails", async () => {
        const authError =
            new Error(
                "authentication check failed",
            )

        supabase.auth.getUser.mockResolvedValue({
            data: {
                user: null,
            },
            error: authError,
        })

        await expect(
            createWildlifeReport({
                parkId: "yell",
                species: "Bear",
                location: "Trail",
            }),
        ).rejects.toThrow(
            "authentication check failed",
        )

        expect(
            supabase.from,
        ).not.toHaveBeenCalled()
    })

    test("throws when saving a wildlife report fails", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: {
                user: {
                    id: "user-123",
                },
            },
            error: null,
        })

        const databaseError =
            new Error(
                "wildlife report save failed",
            )

        const builder = createQueryBuilder({
            data: null,
            error: databaseError,
        })

        supabase.from.mockReturnValue(builder)

        await expect(
            createWildlifeReport({
                parkId: "yell",
                species: "Bear",
                location: "Trail",
            }),
        ).rejects.toThrow(
            "wildlife report save failed",
        )
    })

    test("normalizes empty descriptions to an empty string when loading reports", async () => {
        const databaseReports = [
            {
                id: "report-200",
                park_code: "yell",
                trail_id: null,
                campground_id: null,
                species: "Wolf",
                location: "Backcountry",
                description: null,
                reported_at:
                    "2026-09-10T15:00:00.000Z",
            },
        ]

        const builder = createQueryBuilder({
            data: databaseReports,
            error: null,
        })

        supabase.from.mockReturnValue(builder)

        const result =
            await getWildlifeReportsForPark(
                "yell",
            )

        expect(
            result[0].description,
        ).toBe("")
    })
})