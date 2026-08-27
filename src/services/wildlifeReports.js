import { supabase } from "./supabase";

/*
 * converts a database wildlife report into the
 * structure already used by the TrailTales screens.
 */
function normalizeWildlifeReport(report) {
	return {
		id: report.id,
		parkId: report.park_code,
		trailId: report.trail_id || null,
		campgroundId: report.campground_id || null,
		species: report.species,
		location: report.location,
		description: report.description || "",
		reportedAt: report.reported_at,
		source: "user",
	};
}

/*
 * loads recent wildlife reports for one park.
 *
 * the database query only returns reports from the
 * previous seven days.
 */
export async function getWildlifeReportsForPark(parkCode) {
	const { data, error } = await supabase
		.from("wildlife_reports")
		.select("*")
		.eq("park_code", parkCode)
		.gte(
			"reported_at",
			new Date(
				Date.now() - 7 * 24 * 60 * 60 * 1000,
			).toISOString(),
		)
		.order("reported_at", {
			ascending: false,
		});

	if (error) {
		throw error;
	}

	return (data || []).map(normalizeWildlifeReport);
}

/*
 * loads recent wildlife reports for one trail.
 */
export async function getWildlifeReportsForTrail(trailId) {
	const { data, error } = await supabase
		.from("wildlife_reports")
		.select("*")
		.eq("trail_id", String(trailId))
		.gte(
			"reported_at",
			new Date(
				Date.now() - 7 * 24 * 60 * 60 * 1000,
			).toISOString(),
		)
		.order("reported_at", {
			ascending: false,
		});

	if (error) {
		throw error;
	}

	return (data || []).map(normalizeWildlifeReport);
}

/*
 * loads recent wildlife reports for one campground.
 */
export async function getWildlifeReportsForCampground(
	campgroundId,
) {
	const { data, error } = await supabase
		.from("wildlife_reports")
		.select("*")
		.eq("campground_id", String(campgroundId))
		.gte(
			"reported_at",
			new Date(
				Date.now() - 7 * 24 * 60 * 60 * 1000,
			).toISOString(),
		)
		.order("reported_at", {
			ascending: false,
		});

	if (error) {
		throw error;
	}

	return (data || []).map(normalizeWildlifeReport);
}

/*
 * saves a new wildlife report for the currently
 * authenticated TrailTales user.
 */
export async function createWildlifeReport({
	parkId,
	trailId = null,
	campgroundId = null,
	species,
	location,
	description = "",
}) {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError) {
		throw userError;
	}

	if (!user) {
		throw new Error("You must be signed in to submit a wildlife report");
	}

	const { data, error } = await supabase
		.from("wildlife_reports")
		.insert({
			user_id: user.id,
			park_code: parkId,
			trail_id: trailId
				? String(trailId)
				: null,
			campground_id: campgroundId
				? String(campgroundId)
				: null,
			species: species.trim(),
			location: location.trim(),
			description: description.trim() || null,
		})
		.select("*")
		.single();

	if (error) {
		throw error;
	}

	return normalizeWildlifeReport(data);
}