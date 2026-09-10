import React from "react"
import TestRenderer, {
    act,
} from "react-test-renderer"

import {
    WildlifeReportProvider,
    useWildlifeReports,
} from "../context/WildlifeReportContext"

import {
    getWildlifeReportsForPark,
    getWildlifeReportsForTrail,
    getWildlifeReportsForCampground,
    createWildlifeReport,
} from "../services/wildlifeReports"

jest.mock("../services/wildlifeReports", () => ({
    getWildlifeReportsForPark: jest.fn(),
    getWildlifeReportsForTrail: jest.fn(),
    getWildlifeReportsForCampground: jest.fn(),
    createWildlifeReport: jest.fn(),
}))

let contextValue

function ContextProbe() {
    contextValue = useWildlifeReports()

    return null
}

async function renderContext() {
    await act(async () => {
        TestRenderer.create(
            <WildlifeReportProvider>
                <ContextProbe />
            </WildlifeReportProvider>,
        )
    })
}

describe("WildlifeReportContext", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        contextValue = null

        getWildlifeReportsForPark.mockResolvedValue([])
        getWildlifeReportsForTrail.mockResolvedValue([])
        getWildlifeReportsForCampground.mockResolvedValue([])
        createWildlifeReport.mockResolvedValue(null)
    })

    test("starts with no wildlife reports", async () => {
        await renderContext()

        expect(
            contextValue.reports,
        ).toEqual([])
    })

    test("loads reports for a park and stores them locally", async () => {
        const parkReports = [
            {
                id: "park-report-1",
                parkId: "yell",
                trailId: null,
                campgroundId: null,
                species: "Black bear",
                location: "Yellowstone Lake",
                description: "Seen near the water",
                reportedAt:
                    "2026-09-10T10:00:00.000Z",
                source: "user",
            },
        ]

        getWildlifeReportsForPark.mockResolvedValue(
            parkReports,
        )

        await renderContext()

        let result

        await act(async () => {
            result =
                await contextValue.loadReportsForPark(
                    "yell",
                )
        })

        expect(
            getWildlifeReportsForPark,
        ).toHaveBeenCalledWith(
            "yell",
        )

        expect(result).toEqual(
            parkReports,
        )

        expect(
            contextValue.reports,
        ).toEqual(parkReports)
    })

    test("replaces existing reports for the same park when loading again", async () => {
        const firstReports = [
            {
                id: "old-report",
                parkId: "yell",
                trailId: null,
                campgroundId: null,
                species: "Elk",
                location: "Old location",
                description: "Old report",
                reportedAt:
                    "2026-09-08T10:00:00.000Z",
                source: "user",
            },
        ]

        const secondReports = [
            {
                id: "new-report",
                parkId: "yell",
                trailId: null,
                campgroundId: null,
                species: "Wolf",
                location: "New location",
                description: "New report",
                reportedAt:
                    "2026-09-10T10:00:00.000Z",
                source: "user",
            },
        ]

        getWildlifeReportsForPark
            .mockResolvedValueOnce(firstReports)
            .mockResolvedValueOnce(secondReports)

        await renderContext()

        await act(async () => {
            await contextValue.loadReportsForPark(
                "yell",
            )
        })

        await act(async () => {
            await contextValue.loadReportsForPark(
                "yell",
            )
        })

        expect(
            contextValue.reports,
        ).toEqual(secondReports)
    })

    test("preserves reports from other parks when loading a park", async () => {
        const yellowstoneReport = {
            id: "yell-report",
            parkId: "yell",
            trailId: null,
            campgroundId: null,
            species: "Bear",
            location: "Yellowstone",
            description: "",
            reportedAt:
                "2026-09-10T10:00:00.000Z",
            source: "user",
        }

        const grandTetonReport = {
            id: "grte-report",
            parkId: "grte",
            trailId: null,
            campgroundId: null,
            species: "Moose",
            location: "Grand Teton",
            description: "",
            reportedAt:
                "2026-09-10T11:00:00.000Z",
            source: "user",
        }

        getWildlifeReportsForPark.mockResolvedValue(
            [yellowstoneReport],
        )

        await renderContext()

        await act(async () => {
            await contextValue.loadReportsForPark(
                "yell",
            )
        })

        getWildlifeReportsForPark.mockResolvedValue([
            {
                ...yellowstoneReport,
                id: "new-yell-report",
            },
        ])

        await act(async () => {
            await contextValue.loadReportsForPark(
                "yell",
            )
        })

        await act(async () => {
            contextValue.addReport
        })

        expect(
            contextValue.getReportsForPark("yell"),
        ).toHaveLength(1)

        expect(
            contextValue.getReportsForPark("grte"),
        ).toHaveLength(0)

        expect(
            contextValue.reports,
        ).toHaveLength(1)

        expect(
            contextValue.reports[0].id,
        ).toBe("new-yell-report")

        void grandTetonReport
    })

    test("loads reports for a trail", async () => {
        const trailReports = [
            {
                id: "trail-report-1",
                parkId: "yell",
                trailId: "123",
                campgroundId: null,
                species: "Elk",
                location: "Trail junction",
                description: "Small herd",
                reportedAt:
                    "2026-09-10T12:00:00.000Z",
                source: "user",
            },
        ]

        getWildlifeReportsForTrail.mockResolvedValue(
            trailReports,
        )

        await renderContext()

        let result

        await act(async () => {
            result =
                await contextValue.loadReportsForTrail(
                    123,
                )
        })

        expect(
            getWildlifeReportsForTrail,
        ).toHaveBeenCalledWith(
            123,
        )

        expect(result).toEqual(
            trailReports,
        )

        expect(
            contextValue.getReportsForTrail(123),
        ).toEqual(trailReports)
    })

    test("loads reports for a campground", async () => {
        const campgroundReports = [
            {
                id: "camp-report-1",
                parkId: "yell",
                trailId: null,
                campgroundId: "456",
                species: "Fox",
                location: "Campsite area",
                description: "Seen after sunset",
                reportedAt:
                    "2026-09-10T13:00:00.000Z",
                source: "user",
            },
        ]

        getWildlifeReportsForCampground.mockResolvedValue(
            campgroundReports,
        )

        await renderContext()

        let result

        await act(async () => {
            result =
                await contextValue.loadReportsForCampground(
                    456,
                )
        })

        expect(
            getWildlifeReportsForCampground,
        ).toHaveBeenCalledWith(
            456,
        )

        expect(result).toEqual(
            campgroundReports,
        )

        expect(
            contextValue.getReportsForCampground(
                456,
            ),
        ).toEqual(campgroundReports)
    })

    test("filters already loaded reports by park", async () => {
        const yellowstoneReport = {
            id: "park-1",
            parkId: "yell",
            trailId: null,
            campgroundId: null,
            species: "Bear",
        }

        const grandTetonReport = {
            id: "park-2",
            parkId: "grte",
            trailId: null,
            campgroundId: null,
            species: "Moose",
        }

        createWildlifeReport
            .mockResolvedValueOnce(yellowstoneReport)
            .mockResolvedValueOnce(grandTetonReport)

        await renderContext()

        await act(async () => {
            await contextValue.addReport({
                parkId: "yell",
                species: "Bear",
                location: "Yellowstone",
            })
        })

        await act(async () => {
            await contextValue.addReport({
                parkId: "grte",
                species: "Moose",
                location: "Grand Teton",
            })
        })

        expect(
            contextValue.getReportsForPark("yell"),
        ).toEqual([yellowstoneReport])

        expect(
            contextValue.getReportsForPark("grte"),
        ).toEqual([grandTetonReport])
    })

    test("filters already loaded reports by trail", async () => {
        const firstTrailReport = {
            id: "trail-1",
            parkId: "yell",
            trailId: "123",
            campgroundId: null,
            species: "Elk",
        }

        const secondTrailReport = {
            id: "trail-2",
            parkId: "yell",
            trailId: "456",
            campgroundId: null,
            species: "Wolf",
        }

        createWildlifeReport
            .mockResolvedValueOnce(firstTrailReport)
            .mockResolvedValueOnce(secondTrailReport)

        await renderContext()

        await act(async () => {
            await contextValue.addReport({
                parkId: "yell",
                trailId: 123,
                species: "Elk",
                location: "Trail 123",
            })
        })

        await act(async () => {
            await contextValue.addReport({
                parkId: "yell",
                trailId: 456,
                species: "Wolf",
                location: "Trail 456",
            })
        })

        expect(
            contextValue.getReportsForTrail(123),
        ).toEqual([firstTrailReport])

        expect(
            contextValue.getReportsForTrail(456),
        ).toEqual([secondTrailReport])
    })

    test("filters already loaded reports by campground", async () => {
        const firstCampgroundReport = {
            id: "camp-1",
            parkId: "yell",
            trailId: null,
            campgroundId: "123",
            species: "Fox",
        }

        const secondCampgroundReport = {
            id: "camp-2",
            parkId: "yell",
            trailId: null,
            campgroundId: "456",
            species: "Coyote",
        }

        createWildlifeReport
            .mockResolvedValueOnce(
                firstCampgroundReport,
            )
            .mockResolvedValueOnce(
                secondCampgroundReport,
            )

        await renderContext()

        await act(async () => {
            await contextValue.addReport({
                parkId: "yell",
                campgroundId: 123,
                species: "Fox",
                location: "Campground 123",
            })
        })

        await act(async () => {
            await contextValue.addReport({
                parkId: "yell",
                campgroundId: 456,
                species: "Coyote",
                location: "Campground 456",
            })
        })

        expect(
            contextValue.getReportsForCampground(123),
        ).toEqual([firstCampgroundReport])

        expect(
            contextValue.getReportsForCampground(456),
        ).toEqual([secondCampgroundReport])
    })

    test("adds a new wildlife report to local state", async () => {
        const savedReport = {
            id: "new-report",
            parkId: "yell",
            trailId: "123",
            campgroundId: null,
            species: "Black bear",
            location: "Near trail",
            description: "Crossed the path",
            reportedAt:
                "2026-09-10T14:00:00.000Z",
            source: "user",
        }

        createWildlifeReport.mockResolvedValue(
            savedReport,
        )

        await renderContext()

        let result

        await act(async () => {
            result = await contextValue.addReport({
                parkId: "yell",
                trailId: 123,
                species: "Black bear",
                location: "Near trail",
                description:
                    "Crossed the path",
            })
        })

        expect(
            createWildlifeReport,
        ).toHaveBeenCalledWith({
            parkId: "yell",
            trailId: 123,
            species: "Black bear",
            location: "Near trail",
            description:
                "Crossed the path",
        })

        expect(result).toEqual(
            savedReport,
        )

        expect(
            contextValue.reports,
        ).toEqual([savedReport])
    })

    test("adds new reports before existing reports", async () => {
        const existingReport = {
            id: "existing-report",
            parkId: "yell",
            trailId: "123",
            campgroundId: null,
            species: "Elk",
        }

        const savedReport = {
            id: "new-report",
            parkId: "yell",
            trailId: "123",
            campgroundId: null,
            species: "Bear",
        }

        getWildlifeReportsForTrail.mockResolvedValue([
            existingReport,
        ])

        createWildlifeReport.mockResolvedValue(
            savedReport,
        )

        await renderContext()

        await act(async () => {
            await contextValue.loadReportsForTrail(
                123,
            )
        })

        await act(async () => {
            await contextValue.addReport({
                parkId: "yell",
                trailId: 123,
                species: "Bear",
                location: "Trail",
            })
        })

        expect(
            contextValue.reports,
        ).toEqual([
            savedReport,
            existingReport,
        ])
    })

    test("returns an empty array when loading returns no reports", async () => {
        getWildlifeReportsForPark.mockResolvedValue(
            [],
        )

        await renderContext()

        const result = await act(async () => {
            return contextValue.loadReportsForPark(
                "yell",
            )
        })

        expect(result).toEqual([])

        expect(
            contextValue.reports,
        ).toEqual([])
    })

    test("propagates errors when loading park reports fails", async () => {
        const databaseError =
            new Error(
                "park report loading failed",
            )

        getWildlifeReportsForPark.mockRejectedValue(
            databaseError,
        )

        await renderContext()

        await expect(
            contextValue.loadReportsForPark(
                "yell",
            ),
        ).rejects.toThrow(
            "park report loading failed",
        )

        expect(
            contextValue.reports,
        ).toEqual([])
    })

    test("propagates errors when adding a wildlife report fails", async () => {
        const databaseError =
            new Error(
                "report creation failed",
            )

        createWildlifeReport.mockRejectedValue(
            databaseError,
        )

        await renderContext()

        await expect(
            contextValue.addReport({
                parkId: "yell",
                trailId: 123,
                species: "Bear",
                location: "Trail",
            }),
        ).rejects.toThrow(
            "report creation failed",
        )

        expect(
            contextValue.reports,
        ).toEqual([])
    })

    
})