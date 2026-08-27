const NPS_BASE_URL = "https://developer.nps.gov/api/v1";

// keeps the national parks available to every screen
// without requesting the same data from the nps api repeatedly
let parksCache = null;

// keeps an in-progress request available to other screens
// so multiple screens cannot start duplicate park requests
let parksRequest = null;

// keeps all campgrounds available for the current app session
let campgroundsCache = null;

// keeps an in-progress campground request available to other screens
let campgroundsRequest = null;

// keeps all trails available for the current app session
let trailsCache = null;

// keeps an in-progress trail request available to other screens
let trailsRequest = null;

// keeps all visitor centers available for the current app session
let visitorCentersCache = null;

// keeps an in-progress visitor center request available to other screens
let visitorCentersRequest = null;

// caches trail results by national park code
const trailsByParkCache = new Map();

// keeps in-progress trail requests from being duplicated
const trailsByParkRequests = new Map();

// caches campground results by national park code
const campgroundsByParkCache = new Map();

// keeps in-progress campground requests from being duplicated
const campgroundsByParkRequests = new Map();

// caches visitor center results by national park code
const visitorCentersByParkCache = new Map();

// keeps in-progress visitor center requests from being duplicated
const visitorCentersByParkRequests = new Map();

// keeps all nps requests in one place so screens do not need to handle api details
async function npsRequest(endpoint) {
	const apiKey = process.env.EXPO_PUBLIC_NPS_API_KEY;

	if (!apiKey) {
		throw new Error("NPS API key is missing");
	}

	const separator = endpoint.includes("?") ? "&" : "?";

	const url =
		`${NPS_BASE_URL}${endpoint}` +
		`${separator}api_key=${encodeURIComponent(apiKey)}`;

	try {
		const response = await fetch(url, {
			headers: {
				Accept: "application/json",
			},
		});

		const text = await response.text();

		let data;

		try {
			data = JSON.parse(text);
		} catch {
			throw new Error(
				`NPS API returned invalid JSON (${response.status})`,
			);
		}

		if (!response.ok) {
			throw new Error(
				`NPS API request failed: ${response.status} ${data?.error?.message || ""}`.trim(),
			);
		}

		return data;
	} catch (error) {
		// keeps network errors clear so they are easier to diagnose
		if (
			error instanceof TypeError &&
			error.message === "Network request failed"
		) {
			throw new Error("Unable to connect to the NPS API");
		}

		throw error;
	}
}

// extracts the first api result object from the nps response wrapper
function getNpsResult(response) {
	if (Array.isArray(response)) {
		return response[0] || {};
	}

	return response || {};
}

// converts an nps coordinate string into numeric latitude and longitude
function normalizeCoordinates(latLong) {
	if (!latLong) {
		return {
			latitude: null,
			longitude: null,
		};
	}

	const latitudeMatch = latLong.match(/lat:([-0-9.]+)/);

	const longitudeMatch = latLong.match(/long:([-0-9.]+)/);

	return {
		latitude: latitudeMatch ? Number(latitudeMatch[1]) : null,
		longitude: longitudeMatch ? Number(longitudeMatch[1]) : null,
	};
}

// converts an nps park into the simpler structure used by trail tales
function normalizePark(park) {
	return {
		id: park.parkCode,
		npsId: park.id,
		name: park.fullName || park.name || "",
		shortName: park.name || "",
		designation: park.designation || "",
		description: park.description || "",

		states: park.states
			? park.states
					.split(",")
					.map((state) => state.trim())
					.filter(Boolean)
			: [],

		coordinates: normalizeCoordinates(park.latLong),

		// removes duplicate or empty activity names from the nps response
		activities: [
			...new Set(
				(park.activities || [])
					.map((activity) => activity.name?.trim())
					.filter(Boolean),
			),
		],

		topics: park.topics || [],

		images: park.images || [],

		contacts: park.contacts || {
			phoneNumbers: [],
			emailAddresses: [],
		},

		entranceFees: park.entranceFees || [],

		entrancePasses: park.entrancePasses || [],

		fees: park.fees || [],

		directionsInfo: park.directionsInfo || "",

		directionsUrl: park.directionsUrl || "",

		operatingHours: park.operatingHours || [],

		addresses: park.addresses || [],

		weatherInfo: park.weatherInfo || "",

		url: park.url || "",
	};
}

// gets official national parks, national/state parks, and state parks
export async function getParks(params = {}) {
    const query = new URLSearchParams();

    if (params.stateCode) {
        query.append("stateCode", params.stateCode);
    }

    if (params.q) {
        query.append("q", params.q);
    }

    query.append("limit", String(params.limit || 50));

    if (params.start !== undefined) {
        query.append("start", String(params.start));
    }

    const response = await npsRequest(`/parks?${query.toString()}`);

    const result = getNpsResult(response);

    const allowedDesignations = new Set([
        "National Park",
        "National and State Parks",
        "State Park",
    ]);

    return {
        ...result,
        data: (result.data || [])
            .filter((park) =>
                allowedDesignations.has(park.designation)
            )
            .map(normalizePark),
    };
}

// gets all national parks and caches them for the current app session
export async function getAllParks() {
	// return the cached parks immediately when they are already loaded
	if (parksCache) {
		return parksCache;
	}

	// if another screen is already loading parks, reuse that request
	if (parksRequest) {
		return parksRequest;
	}

	// create one shared request for all screens that need the parks
	parksRequest = (async () => {
		try {
			const response = await getParks({
				limit: 600,
			});

			const parks = response.data || [];

			// save the successful result for the rest of the app session
			parksCache = parks;

			return parks;
		} finally {
			// allows another request if the original request fails
			parksRequest = null;
		}
	})();

	return parksRequest;
}

// retrieves a national park from the session cache when available
export async function getParkByCode(parkCode) {
	const parks = await getAllParks();

	const park = parks.find((item) => item.id === parkCode);

	if (!park) {
		throw new Error("National park not found");
	}

	return park;
}

// retrieves all things to do for a specific national park
export async function getThingsToDoByPark(parkCode) {
	const response = await npsRequest(
		`/thingstodo?parkCode=${encodeURIComponent(
			parkCode,
		)}&limit=50&fields=images`,
	);

	const result = getNpsResult(response);

	if (!result.data) {
		return [];
	}

	return result.data.flat();
}

// retrieves trails for a national park and caches the result for the app session
export async function getTrailsByPark(parkCode) {
	if (trailsByParkCache.has(parkCode)) {
		return trailsByParkCache.get(parkCode);
	}

	if (trailsByParkRequests.has(parkCode)) {
		return trailsByParkRequests.get(parkCode);
	}

	const request = (async () => {
		try {
			const response = await npsRequest(
				`/thingstodo?parkCode=${encodeURIComponent(
					parkCode,
				)}&limit=50&fields=images`,
			);

			const result = getNpsResult(response);

			if (!result.data) {
				const emptyTrails = [];

				trailsByParkCache.set(parkCode, emptyTrails);

				return emptyTrails;
			}

			const trails = result.data
				.filter((item) =>
					item.topics?.some((topic) => topic.name === "Trails"),
				)
				.map(normalizeNpsTrail);

			trailsByParkCache.set(parkCode, trails);

			return trails;
		} finally {
			trailsByParkRequests.delete(parkCode);
		}
	})();

	trailsByParkRequests.set(parkCode, request);

	return request;
}

// retrieves trails for all national parks and caches them for the app session
export async function getAllTrails() {
	if (trailsCache) {
		return trailsCache;
	}

	if (trailsRequest) {
		return trailsRequest;
	}

	trailsRequest = (async () => {
		try {
			const parks = await getAllParks();

			const trailGroups = await Promise.all(
				parks.map((park) => getTrailsByPark(park.id)),
			);

			const trails = trailGroups.flat();

			trailsCache = trails;

			return trails;
		} finally {
			trailsRequest = null;
		}
	})();

	return trailsRequest;
}

// converts an nps trail into a simple object that the app can use
export function normalizeNpsTrail(trail) {
	const description = trail.longDescription || trail.shortDescription || "";
	const difficultyMatch = description.match(
		/\b(easy|moderate|difficult|strenuous|challenging)\b/i,
	);
	const distanceMatch = description.match(
		/\b(\d+(?:\.\d+)?)\s*(?:-|–)?\s*(mile|miles|mi|kilometer|kilometers|km)\b/i,
	);
	const elevationMatch = (
		trail.accessibilityInformation || description
	).match(
		/elevation(?: gain)?[^0-9]*(\d+(?:\.\d+)?)\s*(feet|foot|ft|meters|meter|m)\b/i,
	);
	const duration = trail.duration || "";
	const distance = distanceMatch
		? `${distanceMatch[1]} ${distanceMatch[2]}`
		: "";
	const difficulty = difficultyMatch
		? difficultyMatch[1].charAt(0).toUpperCase() +
			difficultyMatch[1].slice(1).toLowerCase()
		: "";
	const elevation = elevationMatch
		? `${elevationMatch[1]} ${elevationMatch[2]}`
		: "";

	// uses the first nps image when the thing to do record provides one
	const image =
		trail.images?.find((image) => image?.url)?.url ||
		trail.image?.url ||
		null;

	const trailType = trailTypeFromNpsTrail(trail);

	// normalizes nps pet values because the api may return booleans or strings
	const petsPermitted =
		trail.arePetsPermitted === true || trail.arePetsPermitted === "true";
	const petsPermittedWithRestrictions =
		trail.arePetsPermittedWithRestrictions === true ||
		trail.arePetsPermittedWithRestrictions === "true";
	const petsNotPermitted =
		trail.arePetsPermitted === false || trail.arePetsPermitted === "false";
	const petInformationAvailable =
		petsPermitted || petsPermittedWithRestrictions || petsNotPermitted;

	return {
		id: trail.id,
		name: trail.title || trail.name || "Unnamed trail",
		description: trail.shortDescription || description || "",
		longDescription: trail.longDescription || "",
		image,
		latitude: trail.latitude ? Number(trail.latitude) : null,
		longitude: trail.longitude ? Number(trail.longitude) : null,
		duration,
		difficulty,
		distance,
		elevation,
		trailType,
		type: trailType,
		dogsAllowed: petsPermitted || petsPermittedWithRestrictions,
		petsAllowed: petsPermitted,
		petsRestricted: petsPermittedWithRestrictions,
		petInformationAvailable,
		petsDescription: trail.petsDescription || "",
		accessibilityInformation: trail.accessibilityInformation || "",
		reservationRequired:
			trail.isReservationRequired === true ||
			trail.isReservationRequired === "true",
		reservationDescription: trail.reservationDescription || "",
		feeRequired: trail.doFeesApply === true || trail.doFeesApply === "true",
		feeDescription: trail.feeDescription || "",
		seasons: trail.season || [],
		timeOfDay: trail.timeOfDay || [],
		activities:
			trail.activities
				?.map((activity) => activity.name)
				.filter(Boolean) || [],
		location: trail.location || trail.locationDescription || "",
		url: trail.url || "",
	};
}

// gets the most useful trail type available from the nps thing to do record
function trailTypeFromNpsTrail(trail) {
	const activity = trail.activities?.find((item) => item?.name)?.name;

	if (activity) {
		return activity;
	}

	const type = trail.type || trail.trailType;

	return type || "Trail";
}

// retrieves campgrounds for a national park and caches the result for the app session
export async function getCampgroundsByPark(parkCode) {
	if (campgroundsByParkCache.has(parkCode)) {
		return campgroundsByParkCache.get(parkCode);
	}

	if (campgroundsByParkRequests.has(parkCode)) {
		return campgroundsByParkRequests.get(parkCode);
	}

	const request = (async () => {
		try {
			const response = await npsRequest(
				`/campgrounds?parkCode=${encodeURIComponent(
					parkCode,
				)}&limit=50`,
			);

			const result = getNpsResult(response);

			const campgrounds = result.data || [];

			const normalizedCampgrounds = campgrounds.map(
				normalizeNpsCampground,
			);

			campgroundsByParkCache.set(parkCode, normalizedCampgrounds);

			return normalizedCampgrounds;
		} finally {
			campgroundsByParkRequests.delete(parkCode);
		}
	})();

	campgroundsByParkRequests.set(parkCode, request);

	return request;
}

// converts an nps campground into the simpler structure used by trail tales
function normalizeNpsCampground(campground) {
	const campsiteInfo = campground.campsites || {};
	const accessibility = campground.accessibility || {};
	const amenities = campground.amenities || {};

	const image = campground.images?.find((image) => image?.url)?.url || null;

	return {
		id: campground.id,
		name: campground.name || "Unnamed campground",
		parkCode: campground.parkCode || "",
		description: campground.description || "",
		image,

		latitude: campground.latitude ? Number(campground.latitude) : null,
		longitude: campground.longitude ? Number(campground.longitude) : null,

		totalSites: campsiteInfo.totalSites ?? null,
		tentOnly: campsiteInfo.tentOnly ?? null,
		rvOnly: campsiteInfo.rvOnly ?? null,
		groupSites: campsiteInfo.group ?? null,
		horseSites: campsiteInfo.horse ?? null,
		electricalHookups: campsiteInfo.electricalHookups ?? null,
		walkBoatTo: campsiteInfo.walkBoatTo ?? null,
		otherSites: campsiteInfo.other ?? null,

		accessibility,
		amenities,

		rvAllowed: accessibility.rvAllowed ?? "",
		rvInfo: accessibility.rvInfo ?? "",
		rvMaxLength: accessibility.rvMaxLength ?? "",
		trailerAllowed: accessibility.trailerAllowed ?? "",
		trailerMaxLength: accessibility.trailerMaxLength ?? "",
		wheelchairAccess: accessibility.wheelchairAccess ?? "",
		adaInfo: accessibility.adaInfo ?? "",
		accessRoads: accessibility.accessRoads ?? [],
		classifications: accessibility.classifications ?? [],

		reservationDescription: campground.reservationInfo || "",
		reservationsUrl: campground.reservationUrl || "",
		reservableSites: campground.numberOfSitesReservable ?? "",
		firstComeFirstServe: campground.numberOfSitesFirstComeFirstServe ?? "",

		directionsOverview: campground.directionsOverview || "",
		directionsUrl: campground.directionsUrl || "",

		weatherOverview: campground.weatherOverview || "",

		contacts: campground.contacts || {},
		addresses: campground.addresses || [],
		operatingHours: campground.operatingHours || [],

		regulationsOverview: campground.regulationsOverview || "",
		regulationsUrl: campground.regulationsurl || "",

		fees: campground.fees || [],
	};
}

// retrieves and caches all campgrounds associated with national parks
export async function getCampgrounds() {
	if (campgroundsCache) {
		return campgroundsCache;
	}

	if (campgroundsRequest) {
		return campgroundsRequest;
	}

	campgroundsRequest = (async () => {
		try {
			const allCampgrounds = [];

			let start = 0;
			const limit = 50;
			let total = null;

			// gets the official national park list first
			const nationalParks = await getAllParks();

			// creates a fast lookup of valid national park codes
			const nationalParkCodes = new Set(
				nationalParks.map((park) => park.id).filter(Boolean),
			);

			do {
				const response = await npsRequest(
					`/campgrounds?limit=${limit}&start=${start}`,
				);

				const result = getNpsResult(response);

				const campgrounds = result.data || [];

				total = Number(result.total || campgrounds.length);

				allCampgrounds.push(
					...campgrounds
						.filter((campground) => campground.parkCode)
						.filter((campground) =>
							nationalParkCodes.has(campground.parkCode),
						)
						.map(normalizeNpsCampground),
				);

				start += campgrounds.length;

				if (campgrounds.length === 0) {
					break;
				}
			} while (start < total);

			campgroundsCache = allCampgrounds;

			return allCampgrounds;
		} finally {
			campgroundsRequest = null;
		}
	})();

	return campgroundsRequest;
}

// retrieves and caches all visitor centers for the current app session
export async function getVisitorCenters() {
	if (visitorCentersCache) {
		return visitorCentersCache;
	}

	if (visitorCentersRequest) {
		return visitorCentersRequest;
	}

	visitorCentersRequest = (async () => {
		try {
			const response = await npsRequest(
				`/visitorcenters?limit=500&fields=images`,
			);

			const result = getNpsResult(response);

			if (!result.data) {
				visitorCentersCache = [];

				return [];
			}

			const visitorCenters = result.data
				.map(normalizeNpsVisitorCenter)
				.sort((a, b) => a.name.localeCompare(b.name));

			visitorCentersCache = visitorCenters;

			return visitorCenters;
		} finally {
			visitorCentersRequest = null;
		}
	})();

	return visitorCentersRequest;
}

// retrieves visitor centers for a national park and caches the result
export async function getVisitorCentersByPark(parkCode) {
	if (visitorCentersByParkCache.has(parkCode)) {
		return visitorCentersByParkCache.get(parkCode);
	}

	if (visitorCentersByParkRequests.has(parkCode)) {
		return visitorCentersByParkRequests.get(parkCode);
	}

	const request = (async () => {
		try {
			const response = await npsRequest(
				`/visitorcenters?parkCode=${encodeURIComponent(
					parkCode,
				)}&limit=50&fields=images`,
			);

			const result = getNpsResult(response);

			if (!result.data) {
				const emptyCenters = [];

				visitorCentersByParkCache.set(parkCode, emptyCenters);

				return emptyCenters;
			}

			const visitorCenters = result.data
				.map(normalizeNpsVisitorCenter)
				.sort((a, b) => a.name.localeCompare(b.name));

			visitorCentersByParkCache.set(parkCode, visitorCenters);

			return visitorCenters;
		} finally {
			visitorCentersByParkRequests.delete(parkCode);
		}
	})();

	visitorCentersByParkRequests.set(parkCode, request);

	return request;
}

// converts an nps visitor center into the simpler structure used by trail tales
function normalizeNpsVisitorCenter(visitorCenter) {
	const image = visitorCenter.images?.find((item) => item?.url)?.url || null;

	return {
		id: visitorCenter.id || "",

		name: visitorCenter.name || "Unnamed visitor center",

		parkId: visitorCenter.parkCode || "",

		parkCode: visitorCenter.parkCode || "",

		description: visitorCenter.description || "",

		image,

		images: visitorCenter.images || [],

		latitude: visitorCenter.latitude
			? Number(visitorCenter.latitude)
			: null,

		longitude: visitorCenter.longitude
			? Number(visitorCenter.longitude)
			: null,

		addresses: visitorCenter.addresses || [],

		contacts: visitorCenter.contacts || {},

		operatingHours: visitorCenter.operatingHours || [],

		directionsInfo: visitorCenter.directionsInfo || "",

		directionsUrl: visitorCenter.directionsUrl || "",

		amenities: visitorCenter.amenities || {},

		url: visitorCenter.url || "",

		fees: visitorCenter.fees || [],

		feesDescription: visitorCenter.feesDescription || "",

		passportStamp: visitorCenter.isPassportStamp || false,

		passportStampLocationDescription:
			visitorCenter.passportStampLocationDescription || "",
	};
}
