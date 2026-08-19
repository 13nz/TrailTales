import {
    ScrollView,
    View,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import theme from '../constants/theme'
import mockParks from '../data/mockParks'
import mockWildlife from '../data/mockWildlife'
import mockAlerts from '../data/mockAlerts'

import { useWildlifeReports } from '../context/WildlifeReportContext'
import { useTrips } from '../context/TripContext'

import { useState } from 'react'
import TripPickerModal from '../components/TripPickerModal'

// displays the main information hub for a national park and provides contextual information about wildlife, reports, alerts, trails, and campgrounds
export default function ParkDetailScreen({
    route,
    navigation,
}) {
    const insets = useSafeAreaInsets()

    // provides access to wildlife reports shared across the app
    const { getReportsForPark } = useWildlifeReports()

    const { parkId } = route.params

    const park = mockParks.find( (item) => item.id === parkId )

    const { trips } = useTrips()

    const [showTripPicker, setShowTripPicker] = useState(false)

    const openCreateTrip = () => {
        navigation.navigate('CreateTrip', {
            parkId: park.id,
        })
    }

    // prevents the screen from crashing if a navigation route references an invalid park
    if (!park) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>
                    Park not found
                </Text>

                <Pressable
                    onPress={() =>
                        navigation.goBack()
                    }
                    accessibilityRole="button"
                >
                    <Text
                        style={
                            styles.backButton
                        }
                    >
                        Go back
                    </Text>
                </Pressable>
            </View>
        )
    }

    const wildlife = mockWildlife[park.id] || []

    // gets user-submitted wildlife reports associated with this park
    const reports = getReportsForPark(park.id)

    const alerts = mockAlerts[park.id] || []

    return (
        <View style={styles.screen}>
            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.content
                }
            >
                <View style={styles.hero}>
                    <View
                        style={
                            styles.heroPlaceholder
                        }
                    >
                        <Text
                            style={
                                styles.heroPlaceholderText
                            }
                        >
                            {park.name.toUpperCase()}
                        </Text>
                    </View>

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
                        <Text
                            style={
                                styles.heroButton
                            }
                        >
                            ‹
                        </Text>
                    </Pressable>

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
                        accessibilityLabel={`save ${park.name}`}
                    >
                        <Text
                            style={
                                styles.favoriteIcon
                            }
                        >
                            ♡
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.header}>
                    <Text
                        style={
                            styles.eyebrow
                        }
                    >
                        {park.designation.toUpperCase()}
                    </Text>

                    <Text
                        style={
                            styles.title
                        }
                    >
                        {park.name}
                    </Text>

                    <Text
                        style={
                            styles.location
                        }
                    >
                        {park.states.join(
                            ' · '
                        )}
                    </Text>

                    <View
                        style={
                            styles.actions
                        }
                    >
                        <Pressable
                            style={
                                styles.primaryAction
                            }
                            accessibilityRole="button"
                        >
                            <Text
                                style={
                                    styles.primaryActionText
                                }
                            >
                                Save
                            </Text>
                        </Pressable>

                        <Pressable
                            style={
                                styles.secondaryAction
                            }
                            
                            accessibilityRole="button"
                            onPress={() => {
                                // opens the trips navigator and starts a new trip for this park
                                navigation.navigate(
                                    'Trips',
                                    {
                                        screen: 'CreateTrip',
                                        params: {
                                            parkId: park.id,
                                        },
                                    }
                                )
                            }}
                            
                        >
                            <Text
                                style={
                                    styles.secondaryActionText
                                }
                            >
                                + Trip
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        About
                    </Text>

                    <Text
                        style={
                            styles.body
                        }
                    >
                        {
                            park.longDescription
                        }
                    </Text>
                </View>

                <View style={styles.infoGrid}>
                    <InfoCard
                        value={
                            park.trailCount
                        }
                        label="Trails"
                    />

                    <InfoCard
                        value={
                            park.campgroundCount
                        }
                        label="Campgrounds"
                    />

                    <InfoCard
                        value={
                            park.difficulty
                        }
                        label="Difficulty"
                    />

                    {/* <InfoCard
                        value={
                            park.dogsAllowed
                                ? 'Yes'
                                : 'No'
                        }
                        label="Dogs allowed"
                    /> */}
                </View>

                {/* official park alerts */}

                <View style={styles.section}>
                    <SectionHeader
                        title="Alerts"
                        actionLabel={
                            alerts.length > 0
                                ? `${alerts.length} active`
                                : null
                        }
                    />

                    {alerts.length >
                    0 ? (
                        <View
                            style={
                                styles.alertList
                            }
                        >
                            {alerts.map(
                                (
                                    alert
                                ) => (
                                    <AlertRow
                                        key={
                                            alert.id
                                        }
                                        alert={
                                            alert
                                        }
                                    />
                                )
                            )}
                        </View>
                    ) : (
                        <EmptyCard
                            text="No active park alerts"
                        />
                    )}
                </View>

                

                {/* trails */}

                <View style={styles.section}>
                    <SectionHeader
                        title="Trails"
                        actionLabel="See all"
                        onActionPress={() => {
                            navigation.navigate(
                                'TrailDirectory',
                                {
                                    parkId:
                                        park.id,
                                }
                            )
                        }}
                    />

                    <View
                        style={
                            styles.horizontalList
                        }
                    >
                        {park.trails.map(
                            (trail) => (
                                <TrailPreview
                                    key={
                                        trail.id
                                    }
                                    trail={
                                        trail
                                    }
                                    onPress={() => {
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
                                />
                            )
                        )}
                    </View>
                </View>

                {/* campgrounds */}

                <View style={styles.section}>
                    <SectionHeader
                        title="Campgrounds"
                        actionLabel="See all"
                        onActionPress={() => {
                            navigation.navigate(
                                'CampgroundDirectory',
                                {
                                    parkId:
                                        park.id,
                                }
                            )
                        }}
                    />

                    <View
                        style={
                            styles.campgroundList
                        }
                    >
                        {park.campgrounds.map(
                            (
                                campground
                            ) => (
                                <CampgroundPreview
                                    key={
                                        campground.id
                                    }
                                    campground={
                                        campground
                                    }
                                    onPress={() => {
                                        navigation.navigate(
                                            'CampgroundDetail',
                                            {
                                                parkId:
                                                    park.id,
                                                campgroundId:
                                                    campground.id,
                                            }
                                        )
                                    }}
                                />
                            )
                        )}
                    </View>
                </View>

                {/* official wildlife information */}

                <View style={styles.section}>
                    <SectionHeader
                        title="Wildlife"
                        actionLabel={
                            wildlife.length > 0
                                ? 'Wildlife in this area'
                                : null
                        }
                    />

                    <Text
                        style={
                            styles.sectionDescription
                        }
                    >
                        Animals known to live in
                        or around this park.
                    </Text>

                    {wildlife.length >
                    0 ? (
                        <View
                            style={
                                styles.wildlifeList
                            }
                        >
                            {wildlife.map(
                                (
                                    animal
                                ) => (
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

                {/* user submitted wildlife reports */}

                <View style={styles.section}>
                    <SectionHeader
                        title="User Reports"
                        actionLabel={
                            reports.length > 0
                                ? `${reports.length} reports`
                                : null
                        }
                    />

                    <Text
                        style={
                            styles.sectionDescription
                        }
                    >
                        Wildlife reports submitted
                        by TrailTales users.
                    </Text>

                    {reports.length >
                    0 ? (
                        <View
                            style={
                                styles.reportList
                            }
                        >
                            {reports.map(
                                (
                                    report
                                ) => (
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
                            text="No user reports yet"
                        />
                    )}

                    <Pressable
                        style={
                            styles.reportButton
                        }
                        onPress={() => {
                            // opens the user wildlife report form for this park
                            navigation.navigate(
                                'ReportWildlife',
                                {
                                    parkId: park.id,
                                }
                            )
                        }}
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

                {/* activities */}

                <View style={styles.section}>
                    <SectionHeader
                        title="Activities"
                        actionLabel="See all"
                        onActionPress={() => {
                            navigation.navigate(
                                'ActivityDirectory'
                            )
                        }}
                    />

                    <View
                        style={
                            styles.activityList
                        }
                    >
                        {park.activities.map(
                            (
                                activity
                            ) => (
                                <View
                                    key={
                                        activity
                                    }
                                    style={
                                        styles.activityPill
                                    }
                                >
                                    <Text
                                        style={
                                            styles.activityText
                                        }
                                    >
                                        {
                                            activity
                                        }
                                    </Text>
                                </View>
                            )
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Plan your visit
                    </Text>

                    <View
                        style={
                            styles.planCard
                        }
                    >
                        <Text
                            style={
                                styles.planTitle
                            }
                        >
                            Make this park part of
                            your next adventure
                        </Text>

                        <Text
                            style={
                                styles.planBody
                            }
                        >
                            Save trails, campsites,
                            and activities to build a
                            trip around {park.name}.
                        </Text>

                        <Pressable
                            style={styles.primaryAction}
                            onPress={() => {
                            // opens the trips navigator and starts a new trip for this park
                            navigation.navigate(
                                'Trips',
                                {
                                    screen: 'CreateTrip',
                                    params: {
                                        parkId: park.id,
                                    },
                                }
                            )
                        }}
                            accessibilityRole="button"
                            accessibilityLabel={`add ${park.name} to a trip`}
                        >
                            <Text
                                style={
                                    styles.primaryActionText
                                }
                            >
                                Add to trip
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

function SectionHeader({
    title,
    actionLabel,
    onActionPress,
}) {
    return (
        <View
            style={
                styles.sectionHeader
            }
        >
            <Text
                style={
                    styles.sectionTitle
                }
            >
                {title}
            </Text>

            {actionLabel ? (
                <Pressable
                    onPress={
                        onActionPress
                    }
                    disabled={
                        !onActionPress
                    }
                    accessibilityRole="button"
                >
                    <Text
                        style={
                            styles.sectionAction
                        }
                    >
                        {actionLabel}
                    </Text>
                </Pressable>
            ) : null}
        </View>
    )
}

function InfoCard({
    value,
    label,
}) {
    return (
        <View
            style={
                styles.infoCard
            }
        >
            <Text
                style={
                    styles.infoValue
                }
            >
                {value}
            </Text>

            <Text
                style={
                    styles.infoLabel
                }
            >
                {label}
            </Text>
        </View>
    )
}

// displays an official park alert with its source clearly represented
function AlertRow({
    alert,
}) {
    const isDanger =
        alert.category ===
            'Danger' ||
        alert.category ===
            'Closure'

    return (
        <View
            style={[
                styles.alertCard,
                isDanger &&
                    styles.alertCardDanger,
            ]}
        >
            <View
                style={
                    styles.alertIndicator
                }
            />

            <View
                style={
                    styles.alertContent
                }
            >
                <View
                    style={
                        styles.alertHeader
                    }
                >
                    <Text
                        style={
                            styles.alertCategory
                        }
                    >
                        {alert.category}
                    </Text>

                    <Text
                        style={
                            styles.alertSource
                        }
                    >
                        NPS
                    </Text>
                </View>

                <Text
                    style={
                        styles.alertTitle
                    }
                >
                    {alert.title}
                </Text>

                <Text
                    style={
                        styles.alertDescription
                    }
                >
                    {
                        alert.description
                    }
                </Text>
            </View>
        </View>
    )
}

// displays official wildlife information without assigning individual emojis to species
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
                        styles.wildlifeSpecies
                    }
                >
                    {animal.name}
                </Text>

                <Text
                    style={
                        styles.wildlifeDescription
                    }
                    numberOfLines={
                        2
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
                        2
                    }
                >
                    {
                        report.description
                    }
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

function TrailPreview({
    trail,
    onPress,
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({
                pressed,
            }) => [
                styles.trailCard,
                pressed &&
                    styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`view ${trail.name}`}
        >
            <View
                style={
                    styles.trailImage
                }
            >
                <Text
                    style={
                        styles.trailImageText
                    }
                >
                    TRAIL
                </Text>
            </View>

            <View
                style={
                    styles.trailContent
                }
            >
                <Text
                    style={
                        styles.trailName
                    }
                >
                    {trail.name}
                </Text>

                <Text
                    style={
                        styles.trailMeta
                    }
                >
                    {trail.distance} ·{' '}
                    {trail.difficulty}
                </Text>

                <Text
                    style={
                        styles.trailElevation
                    }
                >
                    {trail.elevation}
                </Text>
            </View>
        </Pressable>
    )
}

function CampgroundPreview({
    campground,
    onPress,
}) {
    return (
        <Pressable
            style={({
                pressed,
            }) => [
                styles.campgroundCard,
                pressed &&
                    styles.pressed,
            ]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`view ${campground.name}`}
        >
            <View
                style={
                    styles.campgroundIcon
                }
            >
                <Text
                    style={
                        styles.campgroundIconText
                    }
                >
                    ⌂
                </Text>
            </View>

            <View
                style={
                    styles.campgroundContent
                }
            >
                <Text
                    style={
                        styles.campgroundName
                    }
                >
                    {campground.name}
                </Text>

                <Text
                    style={
                        styles.campgroundMeta
                    }
                >
                    {campground.sites} ·{' '}
                    {campground.season}
                </Text>

                <Text
                    style={
                        styles.campgroundDescription
                    }
                    numberOfLines={2}
                >
                    {
                        campground.description
                    }
                </Text>
            </View>
        </Pressable>
    )
}

const styles =
    StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor:
                theme.colors.parchment,
        },

        content: {
            paddingBottom: 120,
        },

        hero: {
            height: 280,
            position: 'relative',
        },

        heroPlaceholder: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.sage,
            flex: 1,
            justifyContent: 'center',
        },

        heroPlaceholderText: {
            color:
                theme.colors.forest,
            fontSize:
                theme.typography.label
                    .fontSize,
            fontWeight: '700',
            letterSpacing: 1.5,
        },

        backButtonContainer: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.parchment,
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
            backgroundColor:
                theme.colors.parchment,
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
            fontSize:
                theme.typography.label
                    .fontSize,
            fontWeight: '700',
            letterSpacing: 1.5,
        },

        title: {
            color: theme.colors.ink,
            fontSize:
                theme.typography.display
                    .fontSize,
            fontWeight:
                theme.typography.display
                    .fontWeight,
            lineHeight:
                theme.typography.display
                    .lineHeight,
            marginTop: theme.spacing.xs,
        },

        location: {
            color: theme.colors.earth,
            fontSize:
                theme.typography.body
                    .fontSize,
            marginTop: theme.spacing.xs,
        },

        actions: {
            flexDirection: 'row',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.lg,
        },

        primaryAction: {
            backgroundColor:
                theme.colors.forest,
            borderRadius:
                theme.radii.sm,
            paddingHorizontal:
                theme.spacing.lg,
            paddingVertical:
                theme.spacing.sm,
        },

        primaryActionText: {
            color: theme.colors.parchment,
            fontSize:
                theme.typography.bodySmall
                    .fontSize,
            fontWeight: '700',
        },

        secondaryAction: {
            borderColor: theme.colors.earth,
            borderRadius:
                theme.radii.sm,
            borderWidth: 1,
            paddingHorizontal:
                theme.spacing.lg,
            paddingVertical:
                theme.spacing.sm,
        },

        secondaryActionText: {
            color: theme.colors.earth,
            fontSize:
                theme.typography.bodySmall
                    .fontSize,
            fontWeight: '700',
        },

        section: {
            marginTop: theme.spacing.xl,
            paddingHorizontal:
                theme.spacing.lg,
        },

        sectionHeader: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent:
                'space-between',
            marginBottom:
                theme.spacing.md,
        },

        sectionTitle: {
            color: theme.colors.ink,
            fontSize:
                theme.typography.heading
                    .fontSize,
            fontWeight:
                theme.typography.heading
                    .fontWeight,
            lineHeight:
                theme.typography.heading
                    .lineHeight,
        },

        sectionAction: {
            color: theme.colors.forest,
            fontSize:
                theme.typography.bodySmall
                    .fontSize,
            fontWeight: '700',
        },

        sectionDescription: {
            color: theme.colors.earth,
            fontSize:
                theme.typography.bodySmall
                    .fontSize,
            lineHeight:
                theme.typography.bodySmall
                    .lineHeight,
            marginBottom:
                theme.spacing.md,
        },

        body: {
            color: theme.colors.bark,
            fontSize:
                theme.typography.body
                    .fontSize,
            lineHeight:
                theme.typography.body
                    .lineHeight,
            marginTop: theme.spacing.sm,
        },

        infoGrid: {
            backgroundColor: theme.colors.canvas,
            borderRadius: theme.radii.md,
            flexDirection: 'row',
            marginHorizontal: theme.spacing.lg,
            marginTop: theme.spacing.md,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.sm,
        },

        infoCard: {
            flex: 1,
            alignItems: 'center',
            paddingHorizontal: theme.spacing.xs,
        },

        infoValue: {
            color: theme.colors.forest,
            fontSize: 14,
            fontWeight: '700',
        },

        infoLabel: {
            color: theme.colors.earth,
            fontSize: 9,
            marginTop: 2,
            textAlign: 'center',
        },

        /* alerts */

        alertList: {
            gap: theme.spacing.sm,
        },

        alertCard: {
            backgroundColor:
                theme.colors.canvas,
            borderRadius:
                theme.radii.md,
            flexDirection: 'row',
            overflow: 'hidden',
        },

        alertCardDanger: {
            borderWidth: 1,
            borderColor:
                theme.colors.earth,
        },

        alertIndicator: {
            backgroundColor:
                theme.colors.forest,
            width: 5,
        },

        alertContent: {
            flex: 1,
            padding: theme.spacing.md,
        },

        alertHeader: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent:
                'space-between',
        },

        alertCategory: {
            color: theme.colors.forest,
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 1,
            textTransform:
                'uppercase',
        },

        alertSource: {
            color: theme.colors.earth,
            fontSize: 9,
            fontWeight: '700',
            letterSpacing: 0.8,
        },

        alertTitle: {
            color: theme.colors.ink,
            fontSize:
                theme.typography.body
                    .fontSize,
            fontWeight: '700',
            marginTop: theme.spacing.xs,
        },

        alertDescription: {
            color: theme.colors.earth,
            fontSize:
                theme.typography.bodySmall
                    .fontSize,
            lineHeight:
                theme.typography.bodySmall
                    .lineHeight,
            marginTop: theme.spacing.xs,
        },

        /* wildlife */

        wildlifeList: {
            gap: theme.spacing.sm,
        },

        wildlifeRow: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.canvas,
            borderRadius:
                theme.radii.md,
            flexDirection: 'row',
            padding: theme.spacing.md,
        },

        wildlifeIcon: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.sage,
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

        wildlifeSpecies: {
            color: theme.colors.ink,
            fontSize:
                theme.typography.body
                    .fontSize,
            fontWeight: '700',
        },

        wildlifeDescription: {
            color: theme.colors.earth,
            fontSize:
                theme.typography.caption
                    .fontSize,
            lineHeight:
                theme.typography.caption
                    .lineHeight,
            marginTop:
                theme.spacing.xs,
        },

        /* user reports */

        reportList: {
            gap: theme.spacing.sm,
        },

        reportCard: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.canvas,
            borderRadius:
                theme.radii.md,
            flexDirection: 'row',
            padding: theme.spacing.md,
        },

        reportIcon: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.sage,
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
            fontSize:
                theme.typography.body
                    .fontSize,
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
            fontSize:
                theme.typography.caption
                    .fontSize,
            fontWeight: '600',
            marginTop: theme.spacing.xs,
        },

        reportDescription: {
            color: theme.colors.earth,
            fontSize:
                theme.typography.caption
                    .fontSize,
            lineHeight:
                theme.typography.caption
                    .lineHeight,
            marginTop: theme.spacing.xs,
        },

        reportButton: {
            alignSelf: 'flex-start',
            borderColor: theme.colors.forest,
            borderRadius:
                theme.radii.sm,
            borderWidth: 1,
            marginTop: theme.spacing.md,
            paddingHorizontal:
                theme.spacing.md,
            paddingVertical:
                theme.spacing.sm,
        },

        reportButtonText: {
            color: theme.colors.forest,
            fontSize:
                theme.typography.bodySmall
                    .fontSize,
            fontWeight: '700',
        },

        emptyCard: {
            backgroundColor:
                theme.colors.canvas,
            borderRadius:
                theme.radii.md,
            padding: theme.spacing.lg,
        },

        emptyCardText: {
            color: theme.colors.earth,
            fontSize:
                theme.typography.bodySmall
                    .fontSize,
            textAlign: 'center',
        },

        horizontalList: {
            flexDirection: 'row',
            gap: theme.spacing.md,
        },

        trailCard: {
            backgroundColor:
                theme.colors.canvas,
            borderRadius:
                theme.radii.md,
            overflow: 'hidden',
            width: 220,
            ...theme.shadows.card,
        },

        pressed: {
            opacity: 0.85,
        },

        trailImage: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.sage,
            height: 100,
            justifyContent: 'center',
        },

        trailImageText: {
            color: theme.colors.forest,
            fontSize:
                theme.typography.caption
                    .fontSize,
            fontWeight: '700',
            letterSpacing: 1,
        },

        trailContent: {
            padding: theme.spacing.md,
        },

        trailName: {
            color: theme.colors.ink,
            fontSize:
                theme.typography.body
                    .fontSize,
            fontWeight: '700',
        },

        trailMeta: {
            color: theme.colors.earth,
            fontSize:
                theme.typography.caption
                    .fontSize,
            marginTop: theme.spacing.xs,
        },

        trailElevation: {
            color: theme.colors.forest,
            fontSize:
                theme.typography.caption
                    .fontSize,
            fontWeight: '600',
            marginTop: theme.spacing.xs,
        },

        campgroundList: {
            gap: theme.spacing.sm,
        },

        campgroundCard: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.canvas,
            borderRadius:
                theme.radii.md,
            flexDirection: 'row',
            padding: theme.spacing.md,
            ...theme.shadows.card,
        },

        campgroundIcon: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.sage,
            borderRadius:
                theme.radii.sm,
            height: 52,
            justifyContent: 'center',
            width: 52,
        },

        campgroundIconText: {
            color: theme.colors.forest,
            fontSize: 28,
        },

        campgroundContent: {
            flex: 1,
            marginLeft: theme.spacing.md,
        },

        campgroundName: {
            color: theme.colors.ink,
            fontSize:
                theme.typography.body
                    .fontSize,
            fontWeight: '700',
        },

        campgroundMeta: {
            color: theme.colors.forest,
            fontSize:
                theme.typography.caption
                    .fontSize,
            marginTop: theme.spacing.xs,
        },

        campgroundDescription: {
            color: theme.colors.earth,
            fontSize:
                theme.typography.caption
                    .fontSize,
            lineHeight:
                theme.typography.caption
                    .lineHeight,
            marginTop: theme.spacing.xs,
        },

        activityList: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.sm,
        },

        activityPill: {
            backgroundColor:
                theme.colors.canvas,
            borderRadius: 20,
            paddingHorizontal:
                theme.spacing.md,
            paddingVertical:
                theme.spacing.sm,
        },

        activityText: {
            color: theme.colors.forest,
            fontSize:
                theme.typography.caption
                    .fontSize,
            fontWeight: '600',
        },

        planCard: {
            backgroundColor:
                theme.colors.forest,
            borderRadius:
                theme.radii.lg,
            padding: theme.spacing.lg,
        },

        planTitle: {
            color:
                theme.colors.parchment,
            fontSize:
                theme.typography.heading
                    .fontSize,
            fontWeight: '700',
            lineHeight:
                theme.typography.heading
                    .lineHeight,
        },

        planBody: {
            color: theme.colors.canvas,
            fontSize:
                theme.typography.bodySmall
                    .fontSize,
            lineHeight:
                theme.typography.bodySmall
                    .lineHeight,
            marginTop: theme.spacing.sm,
        },

        planButton: {
            alignSelf: 'flex-start',
            backgroundColor:
                theme.colors.parchment,
            borderRadius:
                theme.radii.sm,
            marginTop: theme.spacing.lg,
            paddingHorizontal:
                theme.spacing.md,
            paddingVertical:
                theme.spacing.sm,
        },

        planButtonText: {
            color: theme.colors.forest,
            fontSize:
                theme.typography.bodySmall
                    .fontSize,
            fontWeight: '700',
        },

        errorContainer: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.parchment,
            flex: 1,
            justifyContent: 'center',
            padding: theme.spacing.lg,
        },

        errorTitle: {
            color: theme.colors.ink,
            fontSize:
                theme.typography.heading
                    .fontSize,
            fontWeight: '700',
        },

        backButton: {
            color: theme.colors.forest,
            fontSize: 14,
            fontWeight: '700',
            marginTop: theme.spacing.md,
        },
    })