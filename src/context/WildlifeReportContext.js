import { createContext, useContext, useMemo, useState } from "react";

import {
	getWildlifeReportsForPark,
	getWildlifeReportsForTrail,
	getWildlifeReportsForCampground,
	createWildlifeReport,
} from "../services/wildlifeReports";

// provides shared supabase wildlife reports to the screens that display them
const WildlifeReportContext = createContext(null);

export function WildlifeReportProvider({ children }) {
	const [reports, setReports] = useState([]);

	/*
	 * loads recent reports for a park and stores them locally
	 * so the detail screen can render them immediately.
	 */
	const loadReportsForPark = async (parkId) => {
		const parkReports = await getWildlifeReportsForPark(parkId);

		setReports((currentReports) => {
			const remainingReports = currentReports.filter(
				(report) => report.parkId !== parkId,
			);

			return [...remainingReports, ...parkReports];
		});

		return parkReports;
	};

	/*
	 * loads recent reports for a trail.
	 */
	const loadReportsForTrail = async (trailId) => {
		const trailReports = await getWildlifeReportsForTrail(trailId);

		setReports((currentReports) => {
			const remainingReports = currentReports.filter(
				(report) => report.trailId !== String(trailId),
			);

			return [...remainingReports, ...trailReports];
		});

		return trailReports;
	};

	/*
	 * loads recent reports for a campground.
	 */
	const loadReportsForCampground = async (campgroundId) => {
		const campgroundReports =
			await getWildlifeReportsForCampground(campgroundId);

		setReports((currentReports) => {
			const remainingReports = currentReports.filter(
				(report) => report.campgroundId !== String(campgroundId),
			);

			return [...remainingReports, ...campgroundReports];
		});

		return campgroundReports;
	};

	/*
	 * creates a report in supabase and adds the returned
	 * database record to local state.
	 */
	const addReport = async (report) => {
		const savedReport = await createWildlifeReport(report);

		setReports((currentReports) => [savedReport, ...currentReports]);

		return savedReport;
	};

	/*
	 * returns reports already loaded for a park.
	 */
	const getReportsForPark = (parkId) => {
		return reports.filter((report) => report.parkId === parkId);
	};

	/*
	 * returns reports already loaded for a trail.
	 */
	const getReportsForTrail = (trailId) => {
		return reports.filter((report) => report.trailId === String(trailId));
	};

	/*
	 * returns reports already loaded for a campground.
	 */
	const getReportsForCampground = (campgroundId) => {
		return reports.filter(
			(report) => report.campgroundId === String(campgroundId),
		);
	};

	const value = useMemo(
		() => ({
			reports,
			addReport,
			loadReportsForPark,
			loadReportsForTrail,
			loadReportsForCampground,
			getReportsForPark,
			getReportsForTrail,
			getReportsForCampground,
		}),
		[reports],
	);

	return (
		<WildlifeReportContext.Provider value={value}>
			{children}
		</WildlifeReportContext.Provider>
	);
}

export function useWildlifeReports() {
	const context = useContext(WildlifeReportContext);

	if (!context) {
		throw new Error(
			"useWildlifeReports must be used inside WildlifeReportProvider",
		);
	}

	return context;
}
