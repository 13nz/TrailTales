import {
    createContext,
    useContext,
    useMemo,
    useState,
} from 'react'

import mockWildlifeReports from '../data/mockWildlifeReports'

// provides shared user wildlife reports to the parts of the app that need them
// this keeps report storage separate from the screens so it can be replaced with supabase later
const WildlifeReportContext =
    createContext(null)

export function WildlifeReportProvider({
    children,
}) {
    // starts with mock reports so the feature has data before supabase is connected
    const [
        reports,
        setReports,
    ] = useState(
        mockWildlifeReports
    )

    const addReport = (
        report
    ) => {
        // adds the newest report to the beginning so it appears immediately in the user reports section
        setReports(
            (currentReports) => [
                report,
                ...currentReports,
            ]
        )
    }

    const getReportsForPark = (
        parkId
    ) => {
        return reports.filter(
            (report) =>
                report.parkId ===
                parkId
        )
    }

    const getReportsForTrail = (
        trailId
    ) => {
        return reports.filter(
            (report) =>
                report.trailId ===
                trailId
        )
    }

    const getReportsForCampground = (
        campgroundId
    ) => {
        return reports.filter(
            (report) =>
                report.campgroundId ===
                campgroundId
        )
    }

    const value = useMemo(
        () => ({
            reports,
            addReport,
            getReportsForPark,
            getReportsForTrail,
            getReportsForCampground,
        }),
        [reports]
    )

    return (
        <WildlifeReportContext.Provider
            value={value}
        >
            {children}
        </WildlifeReportContext.Provider>
    )
}

export function useWildlifeReports() {
    const context =
        useContext(
            WildlifeReportContext
        )

    if (!context) {
        throw new Error(
            'useWildlifeReports must be used inside WildlifeReportProvider'
        )
    }

    return context
}