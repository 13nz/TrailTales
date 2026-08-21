const NPS_BASE_URL =
    'https://developer.nps.gov/api/v1'

// keeps all nps requests in one place so screens do not need to handle api details
async function npsRequest(endpoint) {
    const apiKey =
        process.env.EXPO_PUBLIC_NPS_API_KEY

    if (!apiKey) {
        throw new Error(
            'NPS API key is missing'
        )
    }

    const separator =
        endpoint.includes('?')
            ? '&'
            : '?'

    const url =
        `${NPS_BASE_URL}${endpoint}` +
        `${separator}api_key=${encodeURIComponent(apiKey)}`

    try {
        const response = await fetch(
            url,
            {
                headers: {
                    Accept: 'application/json',
                },
            }
        )

        const text =
            await response.text()

        let data

        try {
            data = JSON.parse(text)
        } catch {
            throw new Error(
                `NPS API returned invalid JSON (${response.status})`
            )
        }

        if (!response.ok) {
            throw new Error(
                `NPS API request failed: ${response.status} ${data?.error?.message || ''}`.trim()
            )
        }

        return data
    } catch (error) {
        // keeps network errors clear so they are easier to diagnose
        if (
            error instanceof TypeError &&
            error.message ===
                'Network request failed'
        ) {
            throw new Error(
                'Unable to connect to the NPS API'
            )
        }

        throw error
    }
}

// extracts the first api result object from the nps response wrapper
function getNpsResult(response) {
    if (Array.isArray(response)) {
        return response[0] || {}
    }

    return response || {}
}

// converts an nps coordinate string into numeric latitude and longitude
function normalizeCoordinates(
    latLong
) {
    if (!latLong) {
        return {
            latitude: null,
            longitude: null,
        }
    }

    const latitudeMatch =
        latLong.match(
            /lat:([-0-9.]+)/
        )

    const longitudeMatch =
        latLong.match(
            /long:([-0-9.]+)/
        )

    return {
        latitude: latitudeMatch
            ? Number(latitudeMatch[1])
            : null,
        longitude: longitudeMatch
            ? Number(longitudeMatch[1])
            : null,
    }
}

// converts an nps park into the simpler structure used by trail tales
function normalizePark(park) {
    return {
        id: park.parkCode,
        npsId: park.id,
        name:
            park.fullName ||
            park.name ||
            '',
        shortName:
            park.name ||
            '',
        designation:
            park.designation ||
            '',
        description:
            park.description ||
            '',

        states: park.states
            ? park.states
                  .split(',')
                  .map(
                      (state) =>
                          state.trim()
                  )
                  .filter(Boolean)
            : [],

        coordinates:
            normalizeCoordinates(
                park.latLong
            ),

        // removes duplicate or empty activity names from the nps response
        activities: [
            ...new Set(
                (park.activities || [])
                    .map(
                        (activity) =>
                            activity.name?.trim()
                    )
                    .filter(Boolean)
            ),
        ],

        topics: park.topics || [],

        images: park.images || [],

        contacts:
            park.contacts || {
                phoneNumbers: [],
                emailAddresses: [],
            },

        entranceFees:
            park.entranceFees || [],

        entrancePasses:
            park.entrancePasses || [],

        fees: park.fees || [],

        directionsInfo:
            park.directionsInfo || '',

        directionsUrl:
            park.directionsUrl || '',

        operatingHours:
            park.operatingHours || [],

        addresses:
            park.addresses || [],

        weatherInfo:
            park.weatherInfo || '',

        url: park.url || '',
    }
}

// gets only official national parks from the nps api
export async function getParks(
    params = {}
) {
    const query =
        new URLSearchParams()

    // restricts the nps request to national parks before data is downloaded
    query.append(
        'designation',
        'National Park'
    )

    if (params.stateCode) {
        query.append(
            'stateCode',
            params.stateCode
        )
    }

    if (params.q) {
        query.append(
            'q',
            params.q
        )
    }

    query.append(
        'limit',
        String(
            params.limit || 50
        )
    )

    if (params.start !== undefined) {
        query.append(
            'start',
            String(params.start)
        )
    }

    const response =
        await npsRequest(
            `/parks?${query.toString()}`
        )

    const result =
        getNpsResult(response)

    return {
        ...result,
        data: (result.data || [])
            .filter(
                (park) =>
                    park.designation ===
                    'National Park'
            )
            .map(normalizePark),
    }
}

// gets all official national parks
export async function getAllParks() {
    const response =
        await getParks({
            limit: 600,
        })

    return response.data || []
}

// retrieves one specific national park using its park code
export async function getParkByCode(
    parkCode
) {
    const response =
        await npsRequest(
            `/parks?parkCode=${encodeURIComponent(
                parkCode
            )}`
        )

    const result =
        getNpsResult(response)

    const park =
        result.data?.find(
            (item) =>
                item.designation ===
                'National Park'
        )

    if (!park) {
        throw new Error(
            'National park not found'
        )
    }

    return normalizePark(park)
}

// retrieves all things to do for a specific national park
export async function getThingsToDoByPark(
    parkCode
) {
    const response =
        await npsRequest(
            `/thingstodo?parkCode=${encodeURIComponent(
                parkCode
            )}&limit=50&fields=images`
        )

    const result =
        getNpsResult(response)

    if (!result.data) {
        return []
    }

    return result.data.flat()
}

// retrieves and prepares only trail activities for a specific national park
export async function getTrailsByPark(
    parkCode
) {
    const response =
        await npsRequest(
            `/thingstodo?parkCode=${encodeURIComponent(
                parkCode
            )}&limit=50&fields=images`
        )

    const result =
        getNpsResult(response)

    if (!result.data) {
        return []
    }

    return result.data
        .filter(
            (item) =>
                item.topics?.some(
                    (topic) =>
                        topic.name ===
                        'Trails'
                )
        )
        .map(normalizeNpsTrail)
}

// converts an nps trail into a simple object that the app can use
export function normalizeNpsTrail(trail) {
    const description = trail.longDescription || trail.shortDescription || ''
    const difficultyMatch = description.match(/\b(easy|moderate|difficult|strenuous|challenging)\b/i)
    const distanceMatch = description.match(/\b(\d+(?:\.\d+)?)\s*(?:-|–)?\s*(mile|miles|mi|kilometer|kilometers|km)\b/i)
    const elevationMatch = (trail.accessibilityInformation || description).match(/elevation(?: gain)?[^0-9]*(\d+(?:\.\d+)?)\s*(feet|foot|ft|meters|meter|m)\b/i)
    const duration = trail.duration || ''
    const distance = distanceMatch ? `${distanceMatch[1]} ${distanceMatch[2]}` : ''
    const difficulty = difficultyMatch ? difficultyMatch[1].charAt(0).toUpperCase() + difficultyMatch[1].slice(1).toLowerCase() : ''
    const elevation = elevationMatch ? `${elevationMatch[1]} ${elevationMatch[2]}` : ''

    // uses the first nps image when the thing to do record provides one
    const image = trail.images?.find((image) => image?.url)?.url || trail.image?.url || null

    const trailType = trailTypeFromNpsTrail(trail)

    // normalizes nps pet values because the api may return booleans or strings
    const petsPermitted = trail.arePetsPermitted === true || trail.arePetsPermitted === 'true'
    const petsPermittedWithRestrictions = trail.arePetsPermittedWithRestrictions === true || trail.arePetsPermittedWithRestrictions === 'true'
    const petsNotPermitted = trail.arePetsPermitted === false || trail.arePetsPermitted === 'false'
    const petInformationAvailable = petsPermitted || petsPermittedWithRestrictions || petsNotPermitted

    return {
        id: trail.id,
        name: trail.title || trail.name || 'Unnamed trail',
        description: trail.shortDescription || description || '',
        longDescription: trail.longDescription || '',
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
        petsDescription: trail.petsDescription || '',
        accessibilityInformation: trail.accessibilityInformation || '',
        reservationRequired: trail.isReservationRequired === true || trail.isReservationRequired === 'true',
        reservationDescription: trail.reservationDescription || '',
        feeRequired: trail.doFeesApply === true || trail.doFeesApply === 'true',
        feeDescription: trail.feeDescription || '',
        seasons: trail.season || [],
        timeOfDay: trail.timeOfDay || [],
        activities: trail.activities?.map((activity) => activity.name).filter(Boolean) || [],
        location: trail.location || trail.locationDescription || '',
        url: trail.url || '',
    }
}

// gets the most useful trail type available from the nps thing to do record
function trailTypeFromNpsTrail(
    trail
) {
    const activity =
        trail.activities?.find(
            (item) =>
                item?.name
        )?.name

    if (activity) {
        return activity
    }

    const type =
        trail.type ||
        trail.trailType

    return type || 'Trail'
}

// retrieves and normalizes campgrounds for a specific national park
export async function getCampgroundsByPark(parkCode) {
    const response = await npsRequest(`/campgrounds?parkCode=${parkCode}&limit=50`)

    const campgrounds = response.data || []

    const normalizedCampgrounds = campgrounds.map(normalizeNpsCampground)

    return normalizedCampgrounds
}

// converts an nps campground into the simpler structure used by trail tales
function normalizeNpsCampground(campground) {
    const campsiteInfo = campground.campsites || {}
    const accessibility = campground.accessibility || {}
    const amenities = campground.amenities || {}

    const image = campground.images?.find((image) => image?.url)?.url || null

    return {
        id: campground.id,
        name: campground.name || 'Unnamed campground',
        parkCode: campground.parkCode || '',
        description: campground.description || '',
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

        rvAllowed: accessibility.rvAllowed ?? '',
        rvInfo: accessibility.rvInfo ?? '',
        rvMaxLength: accessibility.rvMaxLength ?? '',
        trailerAllowed: accessibility.trailerAllowed ?? '',
        trailerMaxLength: accessibility.trailerMaxLength ?? '',
        wheelchairAccess: accessibility.wheelchairAccess ?? '',
        adaInfo: accessibility.adaInfo ?? '',
        accessRoads: accessibility.accessRoads ?? [],
        classifications: accessibility.classifications ?? [],

        reservationDescription: campground.reservationInfo || '',
        reservationsUrl: campground.reservationUrl || '',
        reservableSites: campground.numberOfSitesReservable ?? '',
        firstComeFirstServe: campground.numberOfSitesFirstComeFirstServe ?? '',

        directionsOverview: campground.directionsOverview || '',
        directionsUrl: campground.directionsUrl || '',

        weatherOverview: campground.weatherOverview || '',

        contacts: campground.contacts || {},
        addresses: campground.addresses || [],
        operatingHours: campground.operatingHours || [],

        regulationsOverview: campground.regulationsOverview || '',
        regulationsUrl: campground.regulationsurl || '',

        fees: campground.fees || [],
    }
}


// retrieves and normalizes all national park campgrounds for the explore directory
export async function getCampgrounds() {
    const allCampgrounds = []
    let start = 0
    const limit = 50
    let total = null

    do {
        const response = await npsRequest(
            `/campgrounds?limit=${limit}&start=${start}`
        )

        const result = getNpsResult(response)
        const campgrounds = result.data || []

        total = Number(result.total || campgrounds.length)

        allCampgrounds.push(
            ...campgrounds
                .filter(
                    (campground) =>
                        campground.parkCode
                )
                .map(normalizeNpsCampground)
        )

        start += campgrounds.length

        if (campgrounds.length === 0) {
            break
        }
    } while (
        start < total
    )

    return allCampgrounds
}