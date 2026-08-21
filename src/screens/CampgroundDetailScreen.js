import {
    ScrollView,
    View,
    Text,
    Pressable,
    StyleSheet,
    Image,
} from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import theme from '../constants/theme'
import mockWildlife from '../data/mockWildlife'

import { useWildlifeReports } from '../context/WildlifeReportContext'

import { useState, useEffect } from 'react'
import { useTrips } from '../context/TripContext'
import TripPickerModal from '../components/TripPickerModal'

import {
    getParkByCode,
    getTrailsByPark,
    getCampgroundsByPark,
} from '../api/npsApi'

// displays detailed campground information and provides actions for saving and trip planning
export default function CampgroundDetailScreen({
    route,
    navigation,
}) {
    const insets = useSafeAreaInsets()
    const { trips } = useTrips()
    const [showTripPicker, setShowTripPicker] = useState(false)
    const { parkId, campgroundId } = route.params

    // provides access to shared user wildlife reports
    const { getReportsForCampground } = useWildlifeReports()

    const [park, setPark] = useState(null)
    const [campground, setCampground] = useState(null)
    const [trails, setTrails] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // loads the selected campground and its related park and trail data from the nps api
    useEffect(() => {
        let active = true

        async function loadCampground() {
            try {
                setLoading(true)
                setError(null)

                const apiPark = await getParkByCode(parkId)
                const [apiTrails, apiCampgrounds] = await Promise.all([
                    getTrailsByPark(parkId),
                    getCampgroundsByPark(parkId),
                ])

                // keeps the screen compatible with either a flat or nested campground response
                const campgroundList = Array.isArray(apiCampgrounds?.[0])
                    ? apiCampgrounds.flat()
                    : apiCampgrounds || []

                const selectedCampground = campgroundList.find(
                    (item) =>
                        String(item.id) === String(campgroundId)
                )

                if (!selectedCampground) {
                    throw new Error('Campground not found')
                }

                if (active) {
                    setPark({
                        ...apiPark,
                        trails: apiTrails || [],
                        campgrounds: campgroundList,
                    })
                    setCampground(selectedCampground)
                    setTrails(apiTrails || [])
                }
            } catch (loadError) {
                console.error('NPS campground error:', loadError)

                if (active) {
                    setError('Unable to load this campground')
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadCampground()

        return () => {
            active = false
        }
    }, [parkId, campgroundId])

    // prevents the screen from rendering campground information before the api request finishes
    if (loading) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Loading campground...</Text>
            </View>
        )
    }

    // prevents the screen from crashing if the api cannot find the campground
    if (error || !park || !campground) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>
                    {error || 'Campground not found'}
                </Text>

                <Pressable
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                >
                    <Text style={styles.backButton}>Go back</Text>
                </Pressable>
            </View>
        )
    }

    // gets official wildlife information associated with the park
    const wildlife = mockWildlife[park.id] || []


    // gets only user reports associated with this campground
    const reports = getReportsForCampground(campgroundId)

    const accessibility = campground.accessibility || {}
    const amenities = campground.amenities || {}
    const amenityItems = buildAmenityItems(amenities)

    const hasReservationInformation = Boolean(
        campground.reservationDescription ||
        campground.firstComeFirstServe ||
        campground.reservableSites ||
        campground.reservationsUrl
    )

    const hasAccessibilityInformation = Boolean(
        accessibility.wheelchairaccess ||
        accessibility.wheelchairAccess ||
        accessibility.internetinfo ||
        accessibility.cellphoneinfo ||
        accessibility.firestovepolicy ||
        accessibility.additionalinfo ||
        accessibility.adainfo ||
        accessibility.rvinfo ||
        accessibility.accessroads?.length ||
        accessibility.classifications?.length
    )

    const hasDirections = Boolean(
        campground.directionsOverview ||
        campground.directionsUrl
    )

    const hasWeather = Boolean(
        campground.weatherOverview
    )

    const hasRegulations = Boolean(
        campground.regulationsOverview ||
        campground.regulationsUrl
    )

    const heroImage =
        campground.image ||
        park.images?.find(
            (image) =>
                image?.url
        )?.url ||
        null

    return (
        <View style={styles.screen}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* provides quick navigation back to the park page */}
                <View style={styles.hero}>
                    {heroImage ? (
                        <Image
                            source={{
                                uri: heroImage,
                            }}
                            style={styles.heroImage}
                            resizeMode="cover"
                            accessibilityLabel={`${campground.name} campground`}
                        />
                    ) : (
                        <View style={styles.heroImage}>
                            <Text style={styles.heroImageText}>
                                CAMPGROUND PHOTO
                            </Text>
                        </View>
                    )}

                    <Pressable
                        style={[
                            styles.backButtonContainer,
                            {
                                top:
                                    insets.top +
                                    theme.spacing.sm,
                            },
                        ]}
                        onPress={() =>
                            navigation.goBack()
                        }
                        accessibilityRole="button"
                        accessibilityLabel="go back"
                    >
                        <Text style={styles.heroButton}>
                            ‹
                        </Text>
                    </Pressable>

                    {/* this will eventually persist the campground in the user's favorites */}
                    <Pressable
                        style={[
                            styles.favoriteButton,
                            {
                                top:
                                    insets.top +
                                    theme.spacing.sm,
                            },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`save ${campground.name}`}
                    >
                        <Text style={styles.favoriteIcon}>
                            ♡
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.header}>
                    <Text style={styles.eyebrow}>
                        {park.name.toUpperCase()}
                    </Text>

                    <Text style={styles.title}>
                        {campground.name}
                    </Text>

                    <Text style={styles.location}>
                        {getCampgroundLocation(campground)}
                    </Text>

                    <View style={styles.actions}>
                        <Pressable
                            style={styles.primaryAction}
                            accessibilityRole="button"
                        >
                            <Text style={styles.primaryActionText}>
                                Save
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.secondaryAction}
                            onPress={() => {
                                setShowTripPicker(true)
                            }}
                            accessibilityRole="button"
                        >
                            <Text style={styles.secondaryActionText}>
                                + Trip
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* highlights the campground information needed when planning a stay */}
                <View style={styles.stats}>
                    <View style={styles.statsRow}>
                        <CampgroundStat
                            value={campground.totalSites}
                            label="Sites"
                        />

                        <CampgroundStat
                            value={campground.tentOnly}
                            label="Tent sites"
                        />

                        <CampgroundStat
                            value={campground.rvOnly}
                            label="RV sites"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        About
                    </Text>

                    {campground.description ? (
                        <Text style={styles.body}>
                            {campground.description}
                        </Text>
                    ) : (
                        <EmptyCard
                            text="No campground description available"
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Campground details
                    </Text>

                    <View style={styles.detailList}>
                        <DetailRow
                            label="Total sites"
                            value={campground.totalSites}
                        />

                        <DetailRow
                            label="Tent-only sites"
                            value={campground.tentOnly}
                        />

                        <DetailRow
                            label="RV-only sites"
                            value={campground.rvOnly}
                        />

                        <DetailRow
                            label="Group sites"
                            value={campground.groupSites}
                        />

                        <DetailRow
                            label="Horse sites"
                            value={campground.horseSites}
                        />

                        <DetailRow
                            label="Electrical hookups"
                            value={campground.electricalHookups}
                        />

                        <DetailRow
                            label="Walk/boat-to sites"
                            value={campground.walkBoatTo}
                        />

                        <DetailRow
                            label="RV access"
                            value={
                                accessibility.rvallowed ===
                                1
                                    ? 'Allowed'
                                    : accessibility.rvallowed ===
                                      0
                                    ? 'Not allowed'
                                    : null
                            }
                        />

                        <DetailRow
                            label="Trailer access"
                            value={
                                accessibility.trailerallowed ===
                                1
                                    ? 'Allowed'
                                    : accessibility.trailerallowed ===
                                      0
                                    ? 'Not allowed'
                                    : null
                            }
                        />

                        <DetailRow
                            label="RV information"
                            value={
                                accessibility.rvinfo
                            }
                        />

                        <DetailRow
                            label="Trailer maximum length"
                            value={
                                accessibility.trailermaxlength
                                    ? `${accessibility.trailermaxlength} ft`
                                    : null
                            }
                        />

                        <DetailRow
                            label="RV maximum length"
                            value={
                                accessibility.rvmaxlength
                                    ? `${accessibility.rvmaxlength} ft`
                                    : null
                            }
                        />

                        <DetailRow
                            label="Classification"
                            value={
                                Array.isArray(
                                    accessibility.classifications
                                )
                                    ? accessibility.classifications.join(
                                          ', '
                                      )
                                    : null
                            }
                        />
                    </View>
                </View>

               

                {/* {hasReservationInformation && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Reservations
                        </Text>

                        <View style={styles.detailList}>
                            <DetailRow
                                label="Reservation information"
                                value={
                                    campground.reservationDescription
                                }
                            />

                            <DetailRow
                                label="First come, first served"
                                value={
                                    campground.firstComeFirstServe
                                }
                            />

                            <DetailRow
                                label="Reservable sites"
                                value={
                                    campground.reservableSites
                                }
                            />

                            <DetailRow
                                label="Reservations"
                                value={
                                    campground.reservationsUrl
                                }
                            />
                        </View>
                    </View>
                )} */}

                {/* {hasDirections && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Directions
                        </Text>

                        <View style={styles.detailList}>
                            <DetailRow
                                label="Directions"
                                value={
                                    campground.directionsOverview
                                }
                            />

                            <DetailRow
                                label="Directions link"
                                value={
                                    campground.directionsUrl
                                }
                            />
                        </View>
                    </View>
                )} */}

                {/* {hasWeather && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Weather
                        </Text>

                        <Text style={styles.body}>
                            {campground.weatherOverview}
                        </Text>
                    </View>
                )} */}

                {/* {hasRegulations && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Regulations
                        </Text>

                        <View style={styles.detailList}>
                            <DetailRow
                                label="Regulations"
                                value={
                                    campground.regulationsOverview
                                }
                            />

                            <DetailRow
                                label="Regulations link"
                                value={
                                    campground.regulationsUrl
                                }
                            />
                        </View>
                    </View>
                )} */}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Nearby trails
                    </Text>

                    <Text style={styles.sectionDescription}>
                        Explore trails that can be added to your trip
                        alongside this campground.
                    </Text>

                    <View style={styles.nearbyList}>
                        {trails
                            .slice(0, 3)
                            .map(
                                (trail) => (
                                    <Pressable
                                        key={trail.id}
                                        style={({
                                            pressed,
                                        }) => [
                                            styles.nearbyTrail,
                                            pressed &&
                                                styles.pressed,
                                        ]}
                                        onPress={() => {
                                            // allows campers to move directly from a campground to a nearby trail
                                            navigation.navigate(
                                                'TrailDetail',
                                                {
                                                    parkId:
                                                        park.id,
                                                    trailId:
                                                        trail.id,
                                                }
                                            )
                                        }}
                                        accessibilityRole="button"
                                    >
                                        <View
                                            style={
                                                styles.nearbyTrailIcon
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.nearbyTrailIconText
                                                }
                                            >
                                                ↗
                                            </Text>
                                        </View>

                                        <View
                                            style={
                                                styles.nearbyTrailContent
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.nearbyTrailName
                                                }
                                            >
                                                {trail.name}
                                            </Text>

                                            {(trail.distance ||
                                                trail.difficulty) && (
                                                <Text
                                                    style={
                                                        styles.nearbyTrailMeta
                                                    }
                                                >
                                                    {
                                                        trail.distance ||
                                                        'Distance unavailable'
                                                    }
                                                    {trail.distance &&
                                                    trail.difficulty
                                                        ? ' · '
                                                        : ''}
                                                    {
                                                        trail.difficulty ||
                                                        ''
                                                    }
                                                </Text>
                                            )}
                                        </View>

                                        <Text
                                            style={
                                                styles.chevron
                                            }
                                        >
                                            ›
                                        </Text>
                                    </Pressable>
                                )
                            )}
                    </View>
                </View>

                {/* <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Amenities
                    </Text>

                    {amenityItems.length > 0 ? (
                        <View style={styles.amenityGrid}>
                            {amenityItems.map(
                                (amenity) => (
                                    <Amenity
                                        key={
                                            amenity.key
                                        }
                                        icon={
                                            amenity.icon
                                        }
                                        label={
                                            amenity.label
                                        }
                                        value={
                                            amenity.value
                                        }
                                    />
                                )
                            )}
                        </View>
                    ) : (
                        <EmptyCard
                            text="No campground amenities available"
                        />
                    )}
                </View> */}
                {Object.entries(campground.amenities || {}).filter(
                    ([_, value]) =>
                        value !== null &&
                        value !== undefined &&
                        value !== '' &&
                        !(Array.isArray(value) && value.length === 0)
                ).length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Amenities
                        </Text>

                        <View style={styles.detailList}>
                            {Object.entries(campground.amenities || {})
                                .filter(
                                    ([_, value]) =>
                                        value !== null &&
                                        value !== undefined &&
                                        value !== '' &&
                                        !(Array.isArray(value) && value.length === 0)
                                )
                                .map(([key, value]) => {
                                    const label = key
                                        .replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, (letter) =>
                                            letter.toUpperCase()
                                        )

                                    const displayValue = Array.isArray(value)
                                        ? value.join(', ')
                                        : String(value)

                                    return (
                                        <DetailRow
                                            key={key}
                                            label={label}
                                            value={displayValue}
                                        />
                                    )
                                })}
                        </View>
                    </View>
                )}

                {/* displays official wildlife information separately from user reports */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View
                            style={
                                styles.sectionHeaderContent
                            }
                        >
                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Wildlife
                            </Text>

                            <Text
                                style={
                                    styles.sectionDescription
                                }
                            >
                                Wildlife known to live in this area
                            </Text>
                        </View>
                    </View>

                    {wildlife.length > 0 ? (
                        <View
                            style={
                                styles.wildlifeList
                            }
                        >
                            {wildlife.map(
                                (animal) => (
                                    <WildlifeRow
                                        key={
                                            animal.id
                                        }
                                        animal={
                                            animal
                                        }
                                    />
                                )
                            )}
                        </View>
                    ) : (
                        <EmptyCard
                            text="Wildlife information is not available yet"
                        />
                    )}
                </View>

                {/* displays only community reports associated with this campground */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View
                            style={
                                styles.sectionHeaderContent
                            }
                        >
                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                User Reports
                            </Text>

                            <Text
                                style={
                                    styles.sectionDescription
                                }
                            >
                                Wildlife reports submitted by TrailTales users
                            </Text>
                        </View>

                        <Pressable
                            onPress={() =>
                                navigation.navigate(
                                    'ReportWildlife',
                                    {
                                        parkId:
                                            park.id,
                                        campgroundId:
                                            campground.id,
                                    }
                                )
                            }
                            accessibilityRole="button"
                            accessibilityLabel="report a wildlife sighting"
                        >
                            <Text
                                style={
                                    styles.sectionAction
                                }
                            >
                                Report sighting
                            </Text>
                        </Pressable>
                    </View>

                    {reports.length > 0 ? (
                        <View
                            style={
                                styles.reportList
                            }
                        >
                            {reports.map(
                                (report) => (
                                    <WildlifeReportRow
                                        key={
                                            report.id
                                        }
                                        report={
                                            report
                                        }
                                    />
                                )
                            )}
                        </View>
                    ) : (
                        <EmptyCard
                            text="No wildlife reports have been submitted for this campground yet"
                        />
                    )}

                    <Pressable
                        style={
                            styles.reportButton
                        }
                        onPress={() =>
                            navigation.navigate(
                                'ReportWildlife',
                                {
                                    parkId:
                                        park.id,
                                    campgroundId:
                                        campground.id,
                                }
                            )
                        }
                        accessibilityRole="button"
                        accessibilityLabel="report a wildlife sighting"
                    >
                        <Text
                            style={
                                styles.reportButtonText
                            }
                        >
                            + Report a sighting
                        </Text>
                    </Pressable>
                </View>

                 {hasAccessibilityInformation && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Accessibility
                        </Text>

                        <View style={styles.detailList}>
                            <DetailRow
                                label="Wheelchair access"
                                value={
                                    accessibility.wheelchairaccess ||
                                    accessibility.wheelchairAccess
                                }
                            />

                            <DetailRow
                                label="ADA information"
                                value={
                                    accessibility.adainfo
                                }
                            />

                            <DetailRow
                                label="Access roads"
                                value={
                                    Array.isArray(
                                        accessibility.accessroads
                                    )
                                        ? accessibility.accessroads.join(
                                              ', '
                                          )
                                        : null
                                }
                            />

                            <DetailRow
                                label="Additional information"
                                value={
                                    accessibility.additionalinfo
                                }
                            />

                            <DetailRow
                                label="Internet information"
                                value={
                                    accessibility.internetinfo
                                }
                            />

                            <DetailRow
                                label="Cell service information"
                                value={
                                    accessibility.cellphoneinfo
                                }
                            />

                            <DetailRow
                                label="Fire stove policy"
                                value={
                                    accessibility.firestovepolicy
                                }
                            />
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <View
                        style={
                            styles.planCard
                        }
                    >
                        <Text
                            style={
                                styles.planEyebrow
                            }
                        >
                            PLAN YOUR STAY
                        </Text>

                        <Text
                            style={
                                styles.planTitle
                            }
                        >
                            Add this campground
                            to a trip
                        </Text>

                        <Text
                            style={
                                styles.planBody
                            }
                        >
                            Keep your campsite,
                            trails, and activities
                            together in one
                            adventure.
                        </Text>

                        <Pressable
                            style={
                                styles.planButton
                            }
                            onPress={() => {
                                // opens trips belonging to this park before adding the campground
                                setShowTripPicker(true)
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`add ${campground.name} to a trip`}
                        >
                            <Text
                                style={
                                    styles.planButtonText
                                }
                            >
                                Add to trip
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>

            <TripPickerModal
                visible={
                    showTripPicker
                }
                trips={
                    trips
                }
                park={
                    park
                }
                onClose={() =>
                    setShowTripPicker(false)
                }
                onSelectTrip={(trip) => {
                    setShowTripPicker(false)

                    navigation.navigate(
                        'AddCampsite',
                        {
                            tripId:
                                trip.id,
                        }
                    )
                }}
                onCreateTrip={() => {
                    setShowTripPicker(false)

                    navigation.navigate(
                        'Trips',
                        {
                            screen:
                                'CreateTrip',
                            params: {
                                parkId:
                                    park.id,
                            },
                        }
                    )
                }}
            />
        </View>
    )
}

function CampgroundStat({
    value,
    label,
}) {
    if (
        value === null ||
        value === undefined
    ) {
        return null
    }

    return (
        <View
            style={
                styles.stat
            }
        >
            <Text
                style={
                    styles.statValue
                }
            >
                {String(value)}
            </Text>

            <Text
                style={
                    styles.statLabel
                }
            >
                {label}
            </Text>
        </View>
    )
}

function DetailRow({
    label,
    value,
}) {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return null
    }

    const displayValue =
        Array.isArray(value)
            ? value.join(', ')
            : String(value)

    return (
        <View
            style={
                styles.detailRow
            }
        >
            <Text
                style={
                    styles.detailLabel
                }
            >
                {label}
            </Text>

            <Text
                style={
                    styles.detailValue
                }
            >
                {displayValue}
            </Text>
        </View>
    )
}

function Amenity({
    icon,
    label,
    value,
}) {
    return (
        <View
            style={
                styles.amenity
            }
        >
            <View
                style={
                    styles.amenityIcon
                }
            >
                <Text
                    style={
                        styles.amenityIconText
                    }
                >
                    {icon}
                </Text>
            </View>

            <Text
                style={
                    styles.amenityLabel
                }
            >
                {label}
                {value
                    ? `: ${value}`
                    : ''}
            </Text>
        </View>
    )
}

// converts the nps amenity object into displayable campground amenity cards
function buildAmenityItems(
    amenities
) {
    const items = [
        {
            key: 'trash',
            icon: '♻',
            label: 'Trash & recycling',
            value:
                amenities.trashrecyclingcollection,
        },
        {
            key: 'toilets',
            icon: '⌁',
            label: 'Restrooms',
            value:
                amenities.toilets,
        },
        {
            key: 'showers',
            icon: '♨',
            label: 'Showers',
            value:
                amenities.showers,
        },
        {
            key: 'water',
            icon: '◉',
            label: 'Potable water',
            value:
                amenities.potablewater,
        },
        {
            key: 'internet',
            icon: '⌁',
            label: 'Internet',
            value:
                typeof amenities.internetconnectivity ===
                'boolean'
                    ? amenities.internetconnectivity
                        ? 'Available'
                        : 'Not available'
                    : amenities.internetconnectivity,
        },
        {
            key: 'cell',
            icon: '⌁',
            label: 'Cell reception',
            value:
                typeof amenities.cellphonereception ===
                'boolean'
                    ? amenities.cellphonereception
                        ? 'Available'
                        : 'Not available'
                    : amenities.cellphonereception,
        },
        {
            key: 'laundry',
            icon: '◉',
            label: 'Laundry',
            value:
                typeof amenities.laundry ===
                'boolean'
                    ? amenities.laundry
                        ? 'Available'
                        : 'Not available'
                    : amenities.laundry,
        },
        {
            key: 'dump',
            icon: '◉',
            label: 'Dump station',
            value:
                typeof amenities.dumpstation ===
                'boolean'
                    ? amenities.dumpstation
                        ? 'Available'
                        : 'Not available'
                    : amenities.dumpstation,
        },
        {
            key: 'store',
            icon: '⌂',
            label: 'Camp store',
            value:
                typeof amenities.campstore ===
                'boolean'
                    ? amenities.campstore
                        ? 'Available'
                        : 'Not available'
                    : amenities.campstore,
        },
        {
            key: 'host',
            icon: 'W',
            label: 'Staff / host',
            value:
                amenities.stafforvolunteerhostonsite,
        },
        {
            key: 'ice',
            icon: '◆',
            label: 'Ice',
            value:
                typeof amenities.iceavailableforsale ===
                'boolean'
                    ? amenities.iceavailableforsale
                        ? 'Available'
                        : 'Not available'
                    : amenities.iceavailableforsale,
        },
        {
            key: 'firewood',
            icon: '♨',
            label: 'Firewood',
            value:
                typeof amenities.firewoodforsale ===
                'boolean'
                    ? amenities.firewoodforsale
                        ? 'Available'
                        : 'Not available'
                    : amenities.firewoodforsale,
        },
        {
            key: 'food-lockers',
            icon: '▣',
            label: 'Food storage lockers',
            value:
                amenities.foodstoragelockers,
        },
        {
            key: 'amphitheater',
            icon: '♧',
            label: 'Amphitheater',
            value:
                amenities.amphitheater ||
                amenities.ampitheater,
        },
    ]

    return items
        .map(
            (item) => ({
                ...item,
                value:
                    formatAmenityValue(
                        item.value
                    ),
            })
        )
        .filter(
            (item) =>
                item.value !==
                    null &&
                item.value !==
                    undefined &&
                item.value !== ''
        )
}

function formatAmenityValue(
    value
) {
    if (
        Array.isArray(value)
    ) {
        return value.join(
            ', '
        )
    }

    if (
        typeof value ===
        'boolean'
    ) {
        return value
            ? 'Available'
            : 'Not available'
    }

    return value
}

function getCampgroundLocation(
    campground
) {
    const physicalAddress =
        campground.addresses?.find(
            (address) =>
                address?.type ===
                'Physical'
        )

    if (
        physicalAddress
    ) {
        const parts = [
            physicalAddress.city,
            physicalAddress.stateCode,
        ].filter(Boolean)

        if (
            parts.length >
            0
        ) {
            return parts.join(
                ', '
            )
        }
    }

    return campground.parkCode
        ? campground.parkCode.toUpperCase()
        : 'National Park'
}

// displays official wildlife information without species-specific emojis
function WildlifeRow({
    animal,
}) {
    return (
        <View
            style={
                styles.wildlifeRow
            }
        >
            <View
                style={
                    styles.wildlifeIcon
                }
            >
                <Text
                    style={
                        styles.wildlifeIconText
                    }
                >
                    W
                </Text>
            </View>

            <View
                style={
                    styles.wildlifeContent
                }
            >
                <Text
                    style={
                        styles.wildlifeTitle
                    }
                >
                    {animal.name}
                </Text>

                <Text
                    style={
                        styles.wildlifeBody
                    }
                    numberOfLines={
                        3
                    }
                >
                    {
                        animal.description
                    }
                </Text>
            </View>
        </View>
    )
}

// displays community reports separately from official wildlife information
function WildlifeReportRow({
    report,
}) {
    return (
        <View
            style={
                styles.reportCard
            }
        >
            <View
                style={
                    styles.reportIcon
                }
            >
                <Text
                    style={
                        styles.reportIconText
                    }
                >
                    R
                </Text>
            </View>

            <View
                style={
                    styles.reportContent
                }
            >
                <View
                    style={
                        styles.reportTitleRow
                    }
                >
                    <Text
                        style={
                            styles.reportSpecies
                        }
                    >
                        {report.species}
                    </Text>

                    <Text
                        style={
                            styles.userLabel
                        }
                    >
                        USER REPORT
                    </Text>
                </View>

                <Text
                    style={
                        styles.reportLocation
                    }
                >
                    {report.location}
                </Text>

                <Text
                    style={
                        styles.reportDescription
                    }
                    numberOfLines={
                        3
                    }
                >
                    {report.description ||
                        'No additional details provided'}
                </Text>

                <Text
                    style={
                        styles.reportTime
                    }
                >
                    {report.time ||
                        formatReportTime(
                            report.reportedAt
                        )}
                </Text>
            </View>
        </View>
    )
}

function EmptyCard({
    text,
}) {
    return (
        <View
            style={
                styles.emptyCard
            }
        >
            <Text
                style={
                    styles.emptyCardText
                }
            >
                {text}
            </Text>
        </View>
    )
}

function formatReportTime(
    reportedAt
) {
    if (
        !reportedAt
    ) {
        return ''
    }

    const date =
        new Date(
            reportedAt
        )

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return ''
    }

    return date.toLocaleDateString(
        undefined,
        {
            month:
                'short',
            day:
                'numeric',
        }
    )
}

const styles =
    StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: theme.colors.parchment,
        },

        content: {
            paddingBottom: 120,
        },

        hero: {
            height: 280,
            position: 'relative',
        },

        heroImage: {
            alignItems: 'center',
            backgroundColor: theme.colors.sage,
            flex: 1,
            justifyContent: 'center',
        },

        heroImageText: {
            color: theme.colors.forest,
            fontSize: theme.typography.label.fontSize,
            fontWeight: '700',
            letterSpacing: 1.5,
        },

        backButtonContainer: {
            alignItems: 'center',
            backgroundColor: theme.colors.parchment,
            borderRadius: 22,
            height: 44,
            justifyContent: 'center',
            left: theme.spacing.lg,
            position: 'absolute',
            width: 44,
        },

        heroButton: {
            color: theme.colors.ink,
            fontSize: 30,
            lineHeight: 32,
        },

        favoriteButton: {
            alignItems: 'center',
            backgroundColor: theme.colors.parchment,
            borderRadius: 22,
            height: 44,
            justifyContent: 'center',
            position: 'absolute',
            right: theme.spacing.lg,
            width: 44,
        },

        favoriteIcon: {
            color: theme.colors.earth,
            fontSize: 26,
        },

        header: {
            padding: theme.spacing.lg,
        },

        eyebrow: {
            color: theme.colors.forest,
            fontSize: theme.typography.label.fontSize,
            fontWeight: '700',
            letterSpacing: 1.5,
        },

        title: {
            color: theme.colors.ink,
            fontSize: theme.typography.display.fontSize,
            fontWeight: theme.typography.display.fontWeight,
            lineHeight: theme.typography.display.lineHeight,
            marginTop: theme.spacing.xs,
        },

        location: {
            color: theme.colors.earth,
            fontSize: theme.typography.body.fontSize,
            marginTop: theme.spacing.xs,
        },

        actions: {
            flexDirection: 'row',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.lg,
        },

        primaryAction: {
            backgroundColor: theme.colors.forest,
            borderRadius: theme.radii.sm,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm,
        },

        primaryActionText: {
            color: theme.colors.parchment,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
        },

        secondaryAction: {
            borderColor:  theme.colors.earth,
            borderRadius:  theme.radii.sm,
            borderWidth: 1,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm,
        },

        secondaryActionText: {
            color: theme.colors.earth,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
        },

        stats: {
            backgroundColor: theme.colors.canvas,
            borderBottomColor: theme.colors.parchment,
            borderBottomWidth: 1,
            borderTopColor: theme.colors.parchment,
            borderTopWidth: 1,
            paddingVertical: theme.spacing.md,
        },

        statsRow: {
            flexDirection: 'row',
            paddingHorizontal: theme.spacing.md,
        },

        stat: {
            flex: 1,
            paddingHorizontal:  theme.spacing.xs,
        },

        statValue: {
            color:
                theme.colors.forest,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
        },

        statLabel: {
            color: theme.colors.earth,
            fontSize:  theme.typography.caption.fontSize,
            marginTop: theme.spacing.xs,
        },

        petStat: {
            alignItems: 'center',
            borderTopColor: theme.colors.parchment,
            borderTopWidth: 1,
            flexDirection: 'row',
            marginTop: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
        },

        petIcon: {
            fontSize: 22,
            marginRight: theme.spacing.sm,
        },

        petLabel: {
            color: theme.colors.earth,
            fontSize: theme.typography.caption.fontSize,
        },

        petValue: {
            color: theme.colors.ink,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
            marginTop: 2,
        },

        section: {
            marginTop: theme.spacing.xl,
            paddingHorizontal: theme.spacing.lg,
        },

        sectionHeader: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.md,
        },

        sectionHeaderContent: {
            flex: 1,
        },

        sectionTitle: {
            color: theme.colors.ink,
            fontSize: theme.typography.heading.fontSize,
            fontWeight: theme.typography.heading.fontWeight,
            lineHeight: theme.typography.heading.lineHeight,
        },

        sectionDescription: {
            color: theme.colors.earth,
            fontSize: theme.typography.bodySmall.fontSize,
            lineHeight: theme.typography.bodySmall.lineHeight,
            marginTop: theme.spacing.xs,
        },

        sectionAction: {
            color: theme.colors.forest,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
            marginLeft: theme.spacing.sm,
        },

        body: {
            color: theme.colors.bark,
            fontSize: theme.typography.body.fontSize,
            lineHeight: theme.typography.body.lineHeight,
            marginTop: theme.spacing.md,
        },

        detailList: {
            backgroundColor: theme.colors.canvas,
            borderRadius: theme.radii.md,
            marginTop: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
        },

        detailRow: {
            alignItems: 'center',
            borderBottomColor: theme.colors.parchment,
            borderBottomWidth: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: theme.spacing.md,
        },

        detailLabel: {
            color: theme.colors.earth,
            fontSize: theme.typography.bodySmall.fontSize,
        },

        detailValue: {
            color: theme.colors.ink,
            flexShrink: 1,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '600',
            marginLeft: theme.spacing.md,
            textAlign: 'right',
        },

        nearbyList: {
            gap: theme.spacing.sm,
            marginTop:  theme.spacing.md,
        },

        nearbyTrail: {
            alignItems: 'center',
            backgroundColor: theme.colors.canvas,
            borderRadius: theme.radii.md,
            flexDirection: 'row',
            padding: theme.spacing.md,
        },

        nearbyTrailIcon: {
            alignItems: 'center',
            backgroundColor: theme.colors.sage,
            borderRadius:  theme.radii.sm,
            height: 46,
            justifyContent: 'center',
            width: 46,
        },

        nearbyTrailIconText: {
            color: theme.colors.forest,
            fontSize: 22,
            fontWeight: '700',
        },

        nearbyTrailContent: {
            flex: 1,
            marginLeft: theme.spacing.md,
        },

        nearbyTrailName: {
            color: theme.colors.ink,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
        },

        nearbyTrailMeta: {
            color: theme.colors.earth,
            fontSize: theme.typography.caption.fontSize,
            marginTop: theme.spacing.xs,
        },

        chevron: {
            color: theme.colors.earth,
            fontSize: 24,
            marginLeft: theme.spacing.sm,
        },

        amenityGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.md,
        },

        amenity: {
            alignItems: 'center',
            backgroundColor: theme.colors.canvas,
            borderRadius: theme.radii.md,
            flex: 1,
            minWidth: '45%',
            padding: theme.spacing.md,
        },

        amenityIcon: {
            alignItems: 'center',
            backgroundColor: theme.colors.sage,
            borderRadius: 24,
            height: 48,
            justifyContent: 'center',
            width: 48,
        },

        amenityIconText: {
            color: theme.colors.forest,
            fontSize: 22,
        },

        amenityLabel: {
            color: theme.colors.ink,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '600',
            marginTop: theme.spacing.sm,
            textAlign: 'center',
        },

        /* official wildlife information */

        wildlifeList: {
            gap: theme.spacing.sm,
        },

        wildlifeRow: {
            alignItems: 'center',
            backgroundColor: theme.colors.canvas,
            borderRadius: theme.radii.md,
            flexDirection: 'row',
            padding: theme.spacing.md,
        },

        wildlifeIcon: {
            alignItems: 'center',
            backgroundColor: theme.colors.sage,
            borderRadius: 24,
            height: 48,
            justifyContent: 'center',
            width: 48,
        },

        wildlifeIconText: {
            color: theme.colors.forest,
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 1,
        },

        wildlifeContent: {
            flex: 1,
            marginLeft: theme.spacing.md,
        },

        wildlifeTitle: {
            color: theme.colors.ink,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
        },

        wildlifeBody: {
            color: theme.colors.earth,
            fontSize: theme.typography.caption.fontSize,
            lineHeight: theme.typography.caption.lineHeight,
            marginTop: theme.spacing.xs,
        },

        /* user-submitted wildlife reports */

        reportList: {
            gap: theme.spacing.sm,
        },

        reportCard: {
            alignItems: 'center',
            backgroundColor: theme.colors.canvas,
            borderRadius:  theme.radii.md,
            flexDirection: 'row',
            padding: theme.spacing.md,
        },

        reportIcon: {
            alignItems: 'center',
            backgroundColor:  theme.colors.sage,
            borderRadius: 24,
            height: 48,
            justifyContent: 'center',
            width: 48,
        },

        reportIconText: {
            color: theme.colors.forest,
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 1,
        },

        reportContent: {
            flex: 1,
            marginLeft: theme.spacing.md,
        },

        reportTitleRow: {
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.xs,
        },

        reportSpecies: {
            color: theme.colors.ink,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
        },

        userLabel: {
            color: theme.colors.forest,
            fontSize: 8,
            fontWeight: '800',
            letterSpacing: 0.7,
        },

        reportLocation: {
            color: theme.colors.forest,
            fontSize: theme.typography.caption.fontSize,
            fontWeight: '600',
            marginTop: theme.spacing.xs,
        },

        reportDescription: {
            color: theme.colors.earth,
            fontSize:  theme.typography.caption.fontSize,
            lineHeight: theme.typography.caption.lineHeight,
            marginTop: theme.spacing.xs,
        },

        reportTime: {
            color: theme.colors.earth,
            fontSize: 9,
            marginTop: theme.spacing.xs,
        },

        reportButton: {
            alignSelf: 'flex-start',
            borderColor: theme.colors.forest,
            borderRadius: theme.radii.sm,
            borderWidth: 1,
            marginTop: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
        },

        reportButtonText: {
            color: theme.colors.forest,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
        },

        emptyCard: {
            backgroundColor: theme.colors.canvas,
            borderRadius: theme.radii.md,
            padding: theme.spacing.lg,
        },

        emptyCardText: {
            color: theme.colors.earth,
            fontSize: theme.typography.bodySmall.fontSize,
            textAlign: 'center',
        },

        planCard: {
            backgroundColor: theme.colors.forest,
            borderRadius: theme.radii.lg,
            padding: theme.spacing.lg,
        },

        planEyebrow: {
            color: theme.colors.sage,
            fontSize: theme.typography.caption.fontSize,
            fontWeight: '700',
            letterSpacing: 1.2,
        },

        planTitle: {
            color: theme.colors.parchment,
            fontSize: theme.typography.heading.fontSize,
            fontWeight: '700',
            lineHeight: theme.typography.heading.lineHeight,
            marginTop: theme.spacing.xs,
        },

        planBody: {
            color: theme.colors.canvas,
            fontSize: theme.typography.bodySmall.fontSize,
            lineHeight: theme.typography.bodySmall.lineHeight,
            marginTop:  theme.spacing.sm,
        },

        planButton: {
            alignSelf: 'flex-start',
            backgroundColor: theme.colors.parchment,
            borderRadius: theme.radii.sm,
            marginTop:  theme.spacing.lg,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
        },

        planButtonText: {
            color: theme.colors.forest,
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '700',
        },

        pressed: {
            opacity: 0.85,
        },

        errorContainer: {
            alignItems: 'center',
            backgroundColor: theme.colors.parchment,
            flex: 1,
            justifyContent: 'center',
            padding: theme.spacing.lg,
        },

        errorTitle: {
            color: theme.colors.ink,
            fontSize: theme.typography.heading.fontSize,
            fontWeight: '700',
        },

        backButton: {
            color: theme.colors.forest,
            fontSize: theme.typography.body.fontSize,
            fontWeight: '600',
            marginTop: theme.spacing.md,
        },
    })