import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../services/supabase";

const TripContext = createContext(null);

// determines whether a trip is upcoming or already completed based on its end date
function getTripStatus(endDate) {
	if (!endDate) {
		return "upcoming";
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const tripEnd = new Date(`${endDate}T12:00:00`);

	return tripEnd >= today ? "upcoming" : "past";
}

// converts journal database records into the shape used by the journal screens
function normalizeJournal(pages = [], elements = []) {
	return {
		pages: pages
			.sort((a, b) => a.page_number - b.page_number)
			.map((page) => ({
				id: page.id,

				pageNumber: page.page_number,

				title: page.title || "Scrapbook Page",

				elements: elements
					.filter((element) => element.page_id === page.id)
					.map((element) => ({
						id: element.id,

						type: element.type,

						x: element.x,

						y: element.y,

						width: element.width,

						height: element.height,

						rotation: element.rotation || 0,

						zIndex: element.z_index ?? 0,

						content: element.content || "",

						fontSize: element.font_size,

						imageUrl: element.image_url,

						stickerValue: element.sticker_value,
					})),
			})),
	};
}

// converts a database trip and its child records into the shape used by the existing screens
function normalizeTrip(
	trip,
	trails = [],
	campsites = [],
	activities = [],
	packingItems = [],
	journalPages = [],
	journalElements = [],
) {
	return {
		id: trip.id,

		parkId: trip.park_id,

		name: trip.name,

		startDate: trip.start_date,

		endDate: trip.end_date,

		status: getTripStatus(trip.end_date),

		notes: trip.notes || "",

		trails: trails.map((item) => ({
			id: item.trail_id,

			date: item.date,

			time: item.time ? item.time.slice(0, 5) : null,
		})),

		campsites: campsites.map((item) => ({
			id: item.campground_id,

			campsiteNumber: item.campsite_number,

			checkIn: item.check_in,

			checkOut: item.check_out,

			notes: item.notes || "",
		})),

		activities: activities.map((item) => ({
			id: item.id,

			title: item.title,

			date: item.date,

			time: item.time ? item.time.slice(0, 5) : null,

			location: item.location || "",

			notes: item.notes || "",
		})),

		packingItems: packingItems.map((item) => ({
			id: item.id,

			label: item.label,

			completed: item.completed,
		})),

		// keeps the existing journal screen data shape while the database becomes the source of truth
		journal: normalizeJournal(journalPages, journalElements),
	};
}

// loads all trips owned by the current user and their related planning data
async function loadTripsFromSupabase() {
	const { data: userData, error: userError } = await supabase.auth.getUser();

	if (userError) {
		throw userError;
	}

	const user = userData.user;

	if (!user || user.is_anonymous) {
		return [];
	}

	const { data: tripsData, error: tripsError } = await supabase
		.from("trips")
		.select("*")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	if (tripsError) {
		throw tripsError;
	}

	if (!tripsData || tripsData.length === 0) {
		return [];
	}

	const tripIds = tripsData.map((trip) => trip.id);

	const [
		trailsResult,
		campsitesResult,
		activitiesResult,
		packingResult,
		journalPagesResult,
	] = await Promise.all([
		supabase.from("trip_trails").select("*").in("trip_id", tripIds),

		supabase.from("trip_campsites").select("*").in("trip_id", tripIds),

		supabase.from("trip_activities").select("*").in("trip_id", tripIds),

		supabase.from("trip_packing_items").select("*").in("trip_id", tripIds),

		supabase
			.from("journal_pages")
			.select("*")
			.in("trip_id", tripIds)
			.order("page_number", { ascending: true }),
	]);

	if (trailsResult.error) {
		throw trailsResult.error;
	}

	if (campsitesResult.error) {
		throw campsitesResult.error;
	}

	if (activitiesResult.error) {
		throw activitiesResult.error;
	}

	if (packingResult.error) {
		throw packingResult.error;
	}

	if (journalPagesResult.error) {
		throw journalPagesResult.error;
	}

	const journalPages = journalPagesResult.data || [];

	const journalPageIds = journalPages.map((page) => page.id);

	let journalElements = [];

	if (journalPageIds.length > 0) {
		const { data, error } = await supabase
			.from("journal_elements")
			.select("*")
			.in("page_id", journalPageIds);

		if (error) {
			throw error;
		}

		journalElements = data || [];
	}

	return tripsData.map((trip) =>
		normalizeTrip(
			trip,

			trailsResult.data.filter((item) => item.trip_id === trip.id),

			campsitesResult.data.filter((item) => item.trip_id === trip.id),

			activitiesResult.data.filter((item) => item.trip_id === trip.id),

			packingResult.data.filter((item) => item.trip_id === trip.id),

			journalPages.filter((page) => page.trip_id === trip.id),

			journalElements,
		),
	);
}

// provides shared trip state backed by supabase
export function TripProvider({ children }) {
	const [trips, setTrips] = useState([]);

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;

		const loadTrips = async () => {
			try {
				const loadedTrips = await loadTripsFromSupabase();

				if (active) {
					setTrips(loadedTrips);
				}
			} catch (error) {
				console.error("supabase trip load error:", error);
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		loadTrips();

		return () => {
			active = false;
		};
	}, []);

	const addTrip = async (trip) => {
		const { data: userData, error: userError } =
			await supabase.auth.getUser();

		if (userError) {
			throw userError;
		}

		const user = userData.user;

		if (!user || user.is_anonymous) {
			throw new Error("you must be signed in to create a trip");
		}

		const { data, error } = await supabase
			.from("trips")
			.insert({
				user_id: user.id,

				park_id: trip.parkId,

				name: trip.name,

				start_date: trip.startDate,

				end_date: trip.endDate,

				notes: trip.notes || null,
			})
			.select()
			.single();

		if (error) {
			throw error;
		}

		const newTrip = normalizeTrip(data);

		// adds the newly created trip immediately so the existing ui behaves the same
		setTrips((currentTrips) => [newTrip, ...currentTrips]);

		return newTrip;
	};

	const updateTrip = async (tripId, updates) => {
		const currentTrip = trips.find((trip) => trip.id === tripId);

		if (!currentTrip) {
			return;
		}

		const nextTrip = { ...currentTrip, ...updates };

		// updates the main trip record when its fields changed
		const tripUpdates = {};

		if (Object.prototype.hasOwnProperty.call(updates, "parkId")) {
			tripUpdates.park_id = updates.parkId;
		}

		if (Object.prototype.hasOwnProperty.call(updates, "name")) {
			tripUpdates.name = updates.name;
		}

		if (Object.prototype.hasOwnProperty.call(updates, "startDate")) {
			tripUpdates.start_date = updates.startDate;
		}

		if (Object.prototype.hasOwnProperty.call(updates, "endDate")) {
			tripUpdates.end_date = updates.endDate;
		}

		if (Object.prototype.hasOwnProperty.call(updates, "notes")) {
			tripUpdates.notes = updates.notes || null;
		}

		if (Object.keys(tripUpdates).length > 0) {
			const { error } = await supabase
				.from("trips")
				.update({
					...tripUpdates,

					updated_at: new Date().toISOString(),
				})
				.eq("id", tripId);

			if (error) {
				throw error;
			}
		}

		// synchronizes scheduled trails with supabase
		if (updates.trails !== undefined) {
			const { error: deleteTrailsError } = await supabase
				.from("trip_trails")
				.delete()
				.eq("trip_id", tripId);

			if (deleteTrailsError) {
				console.error(
					"supabase trail delete error:",
					deleteTrailsError,
				);

				throw deleteTrailsError;
			}

			const trailRows = updates.trails
				.filter((trail) => typeof trail === "object")
				.map((trail) => ({
					trip_id: tripId,

					trail_id: trail.id,

					date: trail.date || null,

					time: trail.time || null,
				}));

			if (trailRows.length > 0) {
				const { error: insertTrailsError } = await supabase
					.from("trip_trails")
					.insert(trailRows);

				if (insertTrailsError) {
					console.error(
						"supabase trail insert error:",
						insertTrailsError,
					);

					throw insertTrailsError;
				}
			}
		}

		// synchronizes campsite reservations with supabase
		if (updates.campsites !== undefined) {
			const { error: deleteCampsitesError } = await supabase
				.from("trip_campsites")
				.delete()
				.eq("trip_id", tripId);

			if (deleteCampsitesError) {
				console.error(
					"supabase campsite delete error:",
					deleteCampsitesError,
				);

				throw deleteCampsitesError;
			}

			if (updates.campsites.length > 0) {
				const campsiteRows = updates.campsites.map((campsite) => ({
					trip_id: tripId,

					campground_id: campsite.id,

					campsite_number: campsite.campsiteNumber || null,

					check_in: campsite.checkIn || null,

					check_out: campsite.checkOut || null,

					notes: campsite.notes || null,
				}));

				const { error: insertCampsitesError } = await supabase
					.from("trip_campsites")
					.insert(campsiteRows);

				if (insertCampsitesError) {
					console.error(
						"supabase campsite insert error:",
						insertCampsitesError,
					);

					throw insertCampsitesError;
				}
			}
		}

		// synchronizes custom activities with supabase
		if (updates.activities !== undefined) {
			const { error: deleteActivitiesError } = await supabase
				.from("trip_activities")
				.delete()
				.eq("trip_id", tripId);

			if (deleteActivitiesError) {
				console.error(
					"supabase activity delete error:",
					deleteActivitiesError,
				);

				throw deleteActivitiesError;
			}

			const activityRows = updates.activities
				.filter((activity) => typeof activity === "object")
				.map((activity) => ({
					trip_id: tripId,

					title: activity.title || "",

					date: activity.date || null,

					time: activity.time || null,

					location: activity.location || null,

					notes: activity.notes || null,
				}));

			if (activityRows.length > 0) {
				const { error: insertActivitiesError } = await supabase
					.from("trip_activities")
					.insert(activityRows);

				if (insertActivitiesError) {
					console.error(
						"supabase activity insert error:",
						insertActivitiesError,
					);

					throw insertActivitiesError;
				}
			}
		}

		// synchronizes packing checklist items with supabase
		if (updates.packingItems !== undefined) {
			const { error: deletePackingError } = await supabase
				.from("trip_packing_items")
				.delete()
				.eq("trip_id", tripId);

			if (deletePackingError) {
				console.error(
					"supabase packing delete error:",
					deletePackingError,
				);

				throw deletePackingError;
			}

			const packingRows = updates.packingItems.map((item) => ({
				trip_id: tripId,

				label: item.label,

				completed: Boolean(item.completed),
			}));

			if (packingRows.length > 0) {
				const { error: insertPackingError } = await supabase
					.from("trip_packing_items")
					.insert(packingRows);

				if (insertPackingError) {
					console.error(
						"supabase packing insert error:",
						insertPackingError,
					);

					throw insertPackingError;
				}
			}
		}

		// updates the local trip immediately after all database changes succeed
		setTrips((currentTrips) =>
			currentTrips.map((trip) =>
				trip.id === tripId
					? {
							...nextTrip,

							status: getTripStatus(nextTrip.endDate),
						}
					: trip,
			),
		);
	};

	// creates a new journal page for a trip
	const createJournalPage = async (tripId) => {
		const currentTrip = trips.find((trip) => trip.id === tripId);

		if (!currentTrip) {
			throw new Error("trip not found");
		}

		const existingPages = currentTrip.journal?.pages || [];

		const pageNumber = existingPages.length + 1;

		const { data, error } = await supabase
			.from("journal_pages")
			.insert({
				trip_id: tripId,

				page_number: pageNumber,

				title: "Scrapbook Page",
			})
			.select()
			.single();

		if (error) {
			console.error("supabase journal page insert error:", error);

			throw error;
		}

		const newPage = {
			id: data.id,

			pageNumber: data.page_number,

			title: data.title || "Scrapbook Page",

			elements: [],
		};

		setTrips((currentTrips) =>
			currentTrips.map((trip) =>
				trip.id === tripId
					? {
							...trip,

							journal: {
								...(trip.journal || {}),
								pages: [
									...(trip.journal?.pages || []),
									newPage,
								],
							},
						}
					: trip,
			),
		);

		return newPage;
	};

	// updates journal page metadata
	const updateJournalPage = async (pageId, updates) => {
		const databaseUpdates = {};

		if (Object.prototype.hasOwnProperty.call(updates, "pageNumber")) {
			databaseUpdates.page_number = updates.pageNumber;
		}

		if (Object.prototype.hasOwnProperty.call(updates, "title")) {
			databaseUpdates.title = updates.title || "Scrapbook Page";
		}

		const { data, error } = await supabase
			.from("journal_pages")
			.update({
				...databaseUpdates,

				updated_at: new Date().toISOString(),
			})
			.eq("id", pageId)
			.select()
			.single();

		if (error) {
			console.error("supabase journal page update error:", error);

			throw error;
		}

		setTrips((currentTrips) =>
			currentTrips.map((trip) => ({
				...trip,

				journal: {
					...(trip.journal || {}),

					pages: (trip.journal?.pages || []).map((page) =>
						page.id === pageId
							? {
									...page,

									pageNumber: data.page_number,

									title: data.title || "Scrapbook Page",
								}
							: page,
					),
				},
			})),
		);
	};

	// deletes a journal page and all of its elements through the database relationship
	const deleteJournalPage = async (pageId) => {
		const { error } = await supabase
			.from("journal_pages")
			.delete()
			.eq("id", pageId);

		if (error) {
			console.error("supabase journal page delete error:", error);

			throw error;
		}

		setTrips((currentTrips) =>
			currentTrips.map((trip) => {
				const pages = (trip.journal?.pages || []).filter(
					(page) => page.id !== pageId,
				);

				return {
					...trip,

					journal: {
						...(trip.journal || {}),

						pages,
					},
				};
			}),
		);
	};

	// adds a text, image, or sticker element to a journal page
    const addJournalElement = async (pageId, element) => {
        const { data, error } = await supabase
            .from("journal_elements")
            .insert({
                page_id: pageId,
                type: element.type,
                x: element.x || 0,
                y: element.y || 0,
                width: element.width ?? null,
                height: element.height ?? null,
                rotation: element.rotation || 0,
                z_index: element.zIndex ?? 0,
                content: element.content || null,
                font_size: element.fontSize ?? null,
                text_color: element.textColor || "#000000",
                image_url: element.imageUrl || null,
                sticker_value: element.stickerValue || null,
            })
            .select()
            .single();

        if (error) {
            console.error("supabase journal element insert error:", error);
            throw error;
        }

        const newElement = {
            id: data.id,
            type: data.type,
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
            rotation: data.rotation || 0,
            zIndex: data.z_index ?? 0,
            content: data.content || "",
            fontSize: data.font_size,
            textColor: data.text_color || "#000000",
            imageUrl: data.image_url,
            stickerValue: data.sticker_value,
        };

        setTrips((currentTrips) =>
            currentTrips.map((trip) =>
                trip.journal?.pages?.some((page) => page.id === pageId)
                    ? {
                            ...trip,
                            journal: {
                                ...trip.journal,
                                pages: trip.journal.pages.map((page) =>
                                    page.id === pageId
                                        ? {
                                                ...page,
                                                elements: [
                                                    ...page.elements,
                                                    newElement,
                                                ],
                                            }
                                        : page,
                                ),
                            },
                        }
                    : trip,
            ),
        );

        return newElement;
    };

    // updates the position, size, content, color, or other properties of a journal element
    const updateJournalElement = async (elementId, updates) => {
        const databaseUpdates = {};

        if (Object.prototype.hasOwnProperty.call(updates, "x")) {
            databaseUpdates.x = updates.x;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "y")) {
            databaseUpdates.y = updates.y;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "width")) {
            databaseUpdates.width = updates.width;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "height")) {
            databaseUpdates.height = updates.height;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "rotation")) {
            databaseUpdates.rotation = updates.rotation;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "zIndex")) {
            databaseUpdates.z_index = updates.zIndex;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "content")) {
            databaseUpdates.content = updates.content;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "fontSize")) {
            databaseUpdates.font_size = updates.fontSize;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "textColor")) {
            databaseUpdates.text_color = updates.textColor;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "imageUrl")) {
            databaseUpdates.image_url = updates.imageUrl;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "stickerValue")) {
            databaseUpdates.sticker_value = updates.stickerValue;
        }

        const { data, error } = await supabase
            .from("journal_elements")
            .update({
                ...databaseUpdates,
                updated_at: new Date().toISOString(),
            })
            .eq("id", elementId)
            .select()
            .single();

        if (error) {
            console.error("supabase journal element update error:", error);
            throw error;
        }

        setTrips((currentTrips) =>
            currentTrips.map((trip) => ({
                ...trip,
                journal: {
                    ...(trip.journal || {}),
                    pages: (trip.journal?.pages || []).map((page) => ({
                        ...page,
                        elements: (page.elements || []).map((element) =>
                            element.id === elementId
                                ? {
                                        ...element,
                                        x: data.x,
                                        y: data.y,
                                        width: data.width,
                                        height: data.height,
                                        rotation: data.rotation || 0,
                                        zIndex: data.z_index ?? 0,
                                        content: data.content || "",
                                        fontSize: data.font_size,
                                        textColor: data.text_color || "#000000",
                                        imageUrl: data.image_url,
                                        stickerValue: data.sticker_value,
                                    }
                                : element,
                        ),
                    })),
                },
            })),
        );
    };

	// removes a journal element from the database and local state
	const deleteJournalElement = async (elementId) => {
		const { error } = await supabase
			.from("journal_elements")
			.delete()
			.eq("id", elementId);

		if (error) {
			console.error("supabase journal element delete error:", error);

			throw error;
		}

		setTrips((currentTrips) =>
			currentTrips.map((trip) => ({
				...trip,

				journal: {
					...(trip.journal || {}),

					pages: (trip.journal?.pages || []).map((page) => ({
						...page,

						elements: (page.elements || []).filter(
							(element) => element.id !== elementId,
						),
					})),
				},
			})),
		);
	};

	const removeTrip = async (tripId) => {
		// deletes the trips related records before deleting the main trip
		// this keeps the database clean even if foreign keys are not configured with cascade deletes
		const relatedTables = [
			"trip_trails",
			"trip_campsites",
			"trip_activities",
			"trip_packing_items",
		];

		for (const table of relatedTables) {
			const { error } = await supabase
				.from(table)
				.delete()
				.eq("trip_id", tripId);

			if (error) {
				console.error(`supabase ${table} delete error:`, error);

				throw error;
			}
		}

		// deletes the main trip record from supabase
		const { error: tripDeleteError } = await supabase
			.from("trips")
			.delete()
			.eq("id", tripId);

		if (tripDeleteError) {
			console.error("supabase trip delete error:", tripDeleteError);

			throw tripDeleteError;
		}

		// removes the deleted trip from local state immediately
		setTrips((currentTrips) =>
			currentTrips.filter((trip) => trip.id !== tripId),
		);
	};

	return (
		<TripContext.Provider
			value={{
				trips,

				loading,

				addTrip,

				updateTrip,

				removeTrip,

				createJournalPage,

				updateJournalPage,

				deleteJournalPage,

				addJournalElement,

				updateJournalElement,

				deleteJournalElement,
			}}
		>
			{children}
		</TripContext.Provider>
	);
}

// provides a reusable hook so screens can access trip state without repeating context boilerplate
export function useTrips() {
	const context = useContext(TripContext);

	if (!context) {
		throw new Error("useTrips must be used inside TripProvider");
	}

	return context;
}
