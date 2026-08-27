import {
	View,
	Text,
	Pressable,
	ScrollView,
	StyleSheet,
	Image,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useState, useEffect, useCallback } from "react";

import theme from "../constants/theme";

import { useWildlifeReports } from "../context/WildlifeReportContext";

import { useTrips } from "../context/TripContext";
import TripPickerModal from "../components/TripPickerModal";
import { getParkByCode, getTrailsByPark } from "../api/npsApi";

import { isFavorite, toggleFavorite } from "../services/favorites";

import mockWildlife from "../data/mockWildlife";

import { useFocusEffect } from "@react-navigation/native";

import {
	getWildlifeReportsForTrail,
} from "../services/wildlifeReports";


// displays the complete information page for a single trail
export default function TrailDetailScreen({ route, navigation }) {
	const insets = useSafeAreaInsets();

	const { trips } = useTrips();
	const { tripId } = route.params;

	const [showTripPicker, setShowTripPicker] = useState(false);
	const [park, setPark] = useState(null);
	const [trail, setTrail] = useState(null);
	const [loadingTrail, setLoadingTrail] = useState(true);
	const [trailError, setTrailError] = useState(null);

	
	const { parkId, trailId } = route.params;

	// tracks whether this trail is currently a favorite
	const [isTrailFavorite, setIsTrailFavorite] = useState(false);

	// prevents multiple favorite requests at the same time
	const [favoriteLoading, setFavoriteLoading] = useState(false);

	const [reports, setReports] = useState([]);

	// loads the selected national park and trail from the nps api
	// and restores the user's favorite state from supabase
	useEffect(() => {
		let active = true;

		async function loadTrail() {
			try {
				setLoadingTrail(true);
				setTrailError(null);

				const [apiPark, trails] = await Promise.all([
					getParkByCode(parkId),
					getTrailsByPark(parkId),
				]);

				const apiTrail = (trails || []).find(
					(item) => item.id === trailId,
				);

				if (!apiTrail) {
					throw new Error("Trail not found");
				}

				// checks whether this trail is already favorited
				const favorite = await isFavorite("trail", trailId);

				if (!active) {
					return;
				}

				setPark(apiPark);
				setTrail(apiTrail);
				setIsTrailFavorite(favorite);
			} catch (error) {
				console.error("NPS trail error:", error);

				if (active) {
					setTrailError("Unable to load this trail");
				}
			} finally {
				if (active) {
					setLoadingTrail(false);
				}
			}
		}

		loadTrail();

		return () => {
			active = false;
		};
	}, [parkId, trailId]);


	useFocusEffect(
		useCallback(() => {
			let active = true;

			async function loadWildlifeReports() {
				try {
					const recentReports =
						await getWildlifeReportsForTrail(
							trailId
						);

					if (active) {
						setReports(
							recentReports || []
						);
					}
				} catch (error) {
					console.error(
						"load trail wildlife reports error:",
						error
					);

					if (active) {
						setReports([]);
					}
				}
			}

			loadWildlifeReports();

			return () => {
				active = false;
			};
		}, [trailId])
	);

	// adds or removes this trail from the current user's favorites
	const handleToggleFavorite = async () => {
		if (!trail || favoriteLoading) {
			return;
		}

		try {
			setFavoriteLoading(true);

			const newFavoriteState = await toggleFavorite("trail", trail.id);

			setIsTrailFavorite(newFavoriteState);
		} catch (error) {
			console.error("toggle trail favorite error:", error);
		} finally {
			setFavoriteLoading(false);
		}
	};

	// gets the official wildlife associated with the park
	const wildlife = mockWildlife[parkId] || [];


	if (loadingTrail) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorTitle}>Loading trail...</Text>
			</View>
		);
	}

	if (trailError || !park || !trail) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorTitle}>
					{trailError || "Trail could not be found"}
				</Text>

				<Pressable
					onPress={() => navigation.goBack()}
					accessibilityRole="button"
				>
					<Text style={styles.backButton}>Go back</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View style={styles.screen}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.content}
			>
				{/* provides quick navigation back to the park page */}
				<View style={styles.hero}>
                    {trail.image ? (
                        <Image
                            source={{
                                uri: trail.image,
                            }}
                            style={styles.heroImage}
                            resizeMode="cover"
                            accessibilityLabel={`${trail.name} trail photo`}
                        />
                    ) : (
                        <View style={styles.heroImage}>
                            <Text style={styles.heroImageText}>
                                TRAIL PHOTO
                            </Text>
                        </View>
                    )}



					<Pressable
						style={[
							styles.backButtonContainer,
							{
								top: insets.top + theme.spacing.sm,
							},
						]}
						onPress={() => navigation.goBack()}
						accessibilityRole="button"
						accessibilityLabel="go back"
					>
						<Text style={styles.heroButton}>‹</Text>
					</Pressable>

					{/* toggles favs */}
					<Pressable
						style={[
							styles.favoriteButton,
							{
								top: insets.top + theme.spacing.sm,
							},
						]}
						onPress={handleToggleFavorite}
						disabled={favoriteLoading}
						accessibilityRole="button"
						accessibilityLabel={
							isTrailFavorite
								? `remove ${trail.name} from favorites`
								: `add ${trail.name} to favorites`
						}
					>
						<Text
							style={[
								styles.favoriteIcon,
								isTrailFavorite && styles.favoriteIconActive,
							]}
						>
							{isTrailFavorite ? "♥" : "♡"}
						</Text>
					</Pressable>
				</View>

				{/* identifies the trail and provides the main trip actions */}
				<View style={styles.intro}>
					<Text style={styles.eyebrow}>TRAIL</Text>

					<Text style={styles.title}>{trail.name}</Text>

					<Text style={styles.parkName}>{park.name}</Text>

					<View style={styles.actions}>
						<Pressable
							style={styles.primaryAction}
							onPress={handleToggleFavorite}
							disabled={favoriteLoading}
							accessibilityRole="button"
							accessibilityLabel={
								isTrailFavorite
									? `remove ${trail.name} from favorites`
									: `add ${trail.name} to favorites`
							}
						>
							<Text style={styles.primaryActionText}>
								{isTrailFavorite
									? "Remove from favorites ♥"
									: "Add to favorites ♡"}
							</Text>
						</Pressable>

						<Pressable
							style={styles.secondaryAction}
							// top + Trip button
							onPress={() => {
								setShowTripPicker(true);
							}}
							accessibilityRole="button"
						>
							<Text style={styles.secondaryActionText}>
								+ Trip
							</Text>
						</Pressable>
					</View>
				</View>

				{/* presents the most important hiking information at a glance */}
				<View style={styles.stats}>
					{trail.distance ? (
						<TrailStat value={trail.distance} label="Distance" />
					) : null}
					{trail.difficulty ? (
						<TrailStat
							value={trail.difficulty}
							label="Difficulty"
						/>
					) : null}
					{trail.duration ? (
						<TrailStat value={trail.duration} label="Duration" />
					) : null}
				</View>

				{/* describes the trail */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>About this trail</Text>

					<Text style={styles.body}>{trail.description}</Text>
				</View>

				{/* displays useful trail information */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Trail details</Text>

					<View style={styles.detailCard}>
						{trail.distance ? (
							<TrailDetail
								label="Distance"
								value={trail.distance}
							/>
						) : null}
						{trail.difficulty ? (
							<TrailDetail
								label="Difficulty"
								value={trail.difficulty}
							/>
						) : null}
						{trail.duration ? (
							<TrailDetail
								label="Duration"
								value={trail.duration}
							/>
						) : null}
						{trail.elevation ? (
							<TrailDetail
								label="Elevation"
								value={trail.elevation}
							/>
						) : null}
						{trail.type ? (
							<TrailDetail
								label="Trail type"
								value={trail.type}
							/>
						) : null}
						{trail.petInformationAvailable ? (
							<TrailDetail
								label="Pets"
								value={getDogAccessText(trail)}
							/>
						) : null}
					</View>
				</View>

				{/* shows official wildlife associated with the park */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<View>
							<Text style={styles.sectionTitle}>Wildlife</Text>

							<Text style={styles.sectionIntro}>
								Wildlife known to live in or around this park.
							</Text>
						</View>
					</View>

					{wildlife.length > 0 ? (
						<View style={styles.wildlifeList}>
							{wildlife.map((animal) => (
								<WildlifeRow key={animal.id} animal={animal} />
							))}
						</View>
					) : (
						<View style={styles.emptyCard}>
							<Text style={styles.emptyCardText}>
								Wildlife information will be available here.
							</Text>
						</View>
					)}
				</View>

				{/* separates community sightings from official wildlife information */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<View style={styles.sectionHeaderContent}>
							<Text style={styles.sectionTitle}>
								Community sightings
							</Text>

							<Text style={styles.sectionIntro}>
								Recent wildlife sightings reported by TrailTales
								users.
							</Text>
						</View>

						<Pressable
							onPress={() =>
								
								navigation.navigate("ReportWildlife", {
									parkId: park.id,
									trailId: trail.id,
								})
							}
							accessibilityRole="button"
							accessibilityLabel="report a wildlife sighting"
						>
							<Text style={styles.sectionAction}>
								Report sighting
							</Text>
						</Pressable>
					</View>

					{reports.length > 0 ? (
						<View style={styles.reportList}>
							{reports.map((report) => (
								<WildlifeReportRow
									key={report.id}
									report={report}
								/>
							))}
						</View>
					) : (
						<EmptyCard text="No wildlife reports have been submitted for this trail yet" />
					)}

					<Pressable
						style={styles.reportButton}
						onPress={() =>
							navigation.navigate("ReportWildlife", {
								parkId: park.id,
								trailId: trail.id,
							})
						}
						accessibilityRole="button"
						accessibilityLabel="report a wildlife sighting"
					>
						<Text style={styles.reportButtonText}>
							+ Report a sighting
						</Text>
					</Pressable>
				</View>

				{/* provides the main trip-planning action */}
				<View style={styles.section}>
					<View style={styles.planCard}>
						<Text style={styles.planEyebrow}>PLAN YOUR HIKE</Text>

						<Text style={styles.planTitle}>
							Add this trail to a trip
						</Text>

						<Text style={styles.planBody}>
							Keep your favorite trails, campsites, and activities
							together in one adventure.
						</Text>

						<Pressable
							style={styles.planButton}
							accessibilityRole="button"
							onPress={() => {
								// opens trips belonging to this park before adding the trail
								setShowTripPicker(true);
							}}
						>
							<Text style={styles.planButtonText}>
								Add to trip
							</Text>
						</Pressable>
					</View>
				</View>
			</ScrollView>

			<TripPickerModal
				visible={showTripPicker}
				trips={trips}
				park={park}
				onClose={() => setShowTripPicker(false)}
				onSelectTrip={(trip) => {
					setShowTripPicker(false);

					navigation.navigate("AddTrail", {
						tripId: trip.id,
					});
				}}
				onCreateTrip={() => {
					setShowTripPicker(false);

					// opens the root-level Create Trip workflow
					navigation.navigate("CreateTrip", {
						parkId: park.id,
					});
				}}
			/>
		</View>
	);
}

function TrailStat({ value, label }) {
	return (
		<View style={styles.stat}>
			<Text style={styles.statValue}>{value}</Text>

			<Text style={styles.statLabel}>{label}</Text>
		</View>
	);
}

function TrailDetail({ label, value }) {
	return (
		<View style={styles.detailRow}>
			<Text style={styles.detailLabel}>{label}</Text>

			<Text style={styles.detailValue}>{value}</Text>
		</View>
	);
}

// displays official wildlife without species-specific emojis
function WildlifeRow({ animal }) {
	return (
		<View style={styles.wildlifeRow}>
			<View style={styles.wildlifeIcon}>
				<Text style={styles.wildlifeIconText}>W</Text>
			</View>

			<View style={styles.wildlifeContent}>
				<Text style={styles.wildlifeSpecies}>{animal.name}</Text>

				{animal.description ? (
					<Text style={styles.wildlifeDescription}>
						{animal.description}
					</Text>
				) : null}
			</View>
		</View>
	);
}

// displays a community wildlife report
function WildlifeReportRow({ report }) {
	return (
		<View style={styles.reportCard}>
			<View style={styles.reportIcon}>
				<Text style={styles.reportIconText}>USER</Text>
			</View>

			<View style={styles.reportContent}>
				<View style={styles.reportTitleRow}>
					<Text style={styles.reportSpecies}>
						{report.species || report.animal || "Wildlife sighting"}
					</Text>

					<Text style={styles.userLabel}>COMMUNITY</Text>
				</View>

				{report.location ? (
					<Text style={styles.reportLocation}>{report.location}</Text>
				) : null}

				{report.description ? (
					<Text style={styles.reportDescription}>
						{report.description}
					</Text>
				) : null}
			</View>
		</View>
	);
}

function EmptyCard({ text }) {
	return (
		<View style={styles.emptyCard}>
			<Text style={styles.emptyCardText}>{text}</Text>
		</View>
	);
}

function getDogAccessText(trail) {
	if (trail.petsRestricted) {
		return "Allowed with restrictions";
	}

	if (trail.petsAllowed) {
		return "Allowed";
	}

	if (trail.petInformationAvailable) {
		return "Not allowed";
	}

	return "Information unavailable";
}

const styles = StyleSheet.create({
	screen: {
		backgroundColor: theme.colors.parchment,
		flex: 1,
	},

	content: {
		paddingBottom: theme.spacing.xxl,
	},

	hero: {
		height: 250,
		position: "relative",
	},

	heroImage: {
		alignItems: "center",
		backgroundColor: theme.colors.sage,
		flex: 1,
		justifyContent: "center",
	},

	heroImageText: {
		color: theme.colors.forest,
		fontSize: theme.typography.caption.fontSize,
		fontWeight: "700",
		letterSpacing: 1,
	},

	backButtonContainer: {
		alignItems: "center",
		backgroundColor: "rgba(248, 245, 235, 0.9)",
		borderRadius: 22,
		height: 44,
		justifyContent: "center",
		left: theme.spacing.md,
		position: "absolute",
		width: 44,
	},

	heroButton: {
		color: theme.colors.forest,
		fontSize: 30,
		lineHeight: 32,
	},

	favoriteButton: {
		alignItems: "center",
		backgroundColor: "rgba(248, 245, 235, 0.9)",
		borderRadius: 22,
		height: 44,
		justifyContent: "center",
		position: "absolute",
		right: theme.spacing.md,
		width: 44,
	},

	favoriteIcon: {
		color: theme.colors.forest,
		fontSize: 26,
	},

	favoriteIconActive: {
		color: theme.colors.forest,
	},

	intro: {
		paddingHorizontal: theme.spacing.lg,
		paddingTop: theme.spacing.lg,
	},

	eyebrow: {
		color: theme.colors.forest,
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 1.5,
	},

	title: {
		color: theme.colors.ink,
		fontSize: 30,
		fontWeight: "700",
		marginTop: theme.spacing.xs,
	},

	parkName: {
		color: theme.colors.earth,
		fontSize: 14,
		marginTop: theme.spacing.xs,
	},

	actions: {
		flexDirection: "row",
		gap: theme.spacing.sm,
		marginTop: theme.spacing.lg,
	},

	primaryAction: {
		alignItems: "center",
		backgroundColor: theme.colors.forest,
		borderRadius: theme.radii.md,
		flex: 1,
		justifyContent: "center",
		minHeight: 48,
		paddingHorizontal: theme.spacing.md,
	},

	primaryActionText: {
		color: theme.colors.parchment,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "700",
	},

	secondaryAction: {
		alignItems: "center",
		borderColor: theme.colors.forest,
		borderRadius: theme.radii.md,
		borderWidth: 1,
		justifyContent: "center",
		minHeight: 48,
		paddingHorizontal: theme.spacing.lg,
	},

	secondaryActionText: {
		color: theme.colors.forest,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "700",
	},

	stats: {
		backgroundColor: theme.colors.sage,
		flexDirection: "row",
		marginHorizontal: theme.spacing.lg,
		marginTop: theme.spacing.lg,
		padding: theme.spacing.md,
		borderRadius: theme.radii.md,
	},

	stat: {
		alignItems: "center",
		flex: 1,
	},

	statValue: {
		color: theme.colors.forest,
		fontSize: theme.typography.body.fontSize,
		fontWeight: "700",
	},

	statLabel: {
		color: theme.colors.earth,
		fontSize: theme.typography.caption.fontSize,
		marginTop: theme.spacing.xs,
	},

	section: {
		paddingHorizontal: theme.spacing.lg,
		marginTop: theme.spacing.xl,
	},

	sectionHeader: {
		alignItems: "flex-start",
		flexDirection: "row",
		justifyContent: "space-between",
	},

	sectionHeaderContent: {
		flex: 1,
		paddingRight: theme.spacing.md,
	},

	sectionTitle: {
		color: theme.colors.ink,
		fontSize: theme.typography.subheading.fontSize,
		fontWeight: theme.typography.subheading.fontWeight,
	},

	sectionIntro: {
		color: theme.colors.earth,
		fontSize: theme.typography.caption.fontSize,
		lineHeight: theme.typography.caption.lineHeight,
		marginTop: theme.spacing.xs,
	},

	sectionAction: {
		color: theme.colors.forest,
		fontSize: theme.typography.caption.fontSize,
		fontWeight: "700",
	},

	body: {
		color: theme.colors.ink,
		fontSize: theme.typography.body.fontSize,
		lineHeight: theme.typography.body.lineHeight,
		marginTop: theme.spacing.sm,
	},

	detailCard: {
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		marginTop: theme.spacing.sm,
		padding: theme.spacing.md,
	},

	detailRow: {
		borderBottomColor: theme.colors.sage,
		borderBottomWidth: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: theme.spacing.sm,
	},

	detailLabel: {
		color: theme.colors.earth,
		fontSize: theme.typography.bodySmall.fontSize,
	},

	detailValue: {
		color: theme.colors.ink,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "600",
		textAlign: "right",
	},

	wildlifeList: {
		gap: theme.spacing.sm,
		marginTop: theme.spacing.sm,
	},

	wildlifeRow: {
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		flexDirection: "row",
		padding: theme.spacing.md,
	},

	wildlifeIcon: {
		alignItems: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: 24,
		height: 48,
		justifyContent: "center",
		width: 48,
	},

	wildlifeIconText: {
		color: theme.colors.forest,
		fontSize: 12,
		fontWeight: "800",
		letterSpacing: 1,
	},

	wildlifeContent: {
		flex: 1,
		marginLeft: theme.spacing.md,
	},

	wildlifeSpecies: {
		color: theme.colors.ink,
		fontSize: theme.typography.body.fontSize,
		fontWeight: "700",
	},

	wildlifeDescription: {
		color: theme.colors.earth,
		fontSize: theme.typography.caption.fontSize,
		lineHeight: theme.typography.caption.lineHeight,
		marginTop: theme.spacing.xs,
	},

	reportList: {
		gap: theme.spacing.sm,
		marginTop: theme.spacing.sm,
	},

	reportCard: {
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		flexDirection: "row",
		padding: theme.spacing.md,
	},

	reportIcon: {
		alignItems: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: 24,
		height: 48,
		justifyContent: "center",
		width: 48,
	},

	reportIconText: {
		color: theme.colors.forest,
		fontSize: 9,
		fontWeight: "800",
		letterSpacing: 0.5,
	},

	reportContent: {
		flex: 1,
		marginLeft: theme.spacing.md,
	},

	reportTitleRow: {
		alignItems: "center",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.xs,
	},

	reportSpecies: {
		color: theme.colors.ink,
		fontSize: theme.typography.body.fontSize,
		fontWeight: "700",
	},

	userLabel: {
		color: theme.colors.forest,
		fontSize: 8,
		fontWeight: "800",
		letterSpacing: 0.7,
	},

	reportLocation: {
		color: theme.colors.forest,
		fontSize: theme.typography.caption.fontSize,
		fontWeight: "600",
		marginTop: theme.spacing.xs,
	},

	reportDescription: {
		color: theme.colors.earth,
		fontSize: theme.typography.caption.fontSize,
		lineHeight: theme.typography.caption.lineHeight,
		marginTop: theme.spacing.xs,
	},

	reportButton: {
		alignSelf: "flex-start",
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
		fontWeight: "700",
	},

	emptyCard: {
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		marginTop: theme.spacing.sm,
		padding: theme.spacing.lg,
	},

	emptyCardText: {
		color: theme.colors.earth,
		fontSize: theme.typography.bodySmall.fontSize,
		textAlign: "center",
	},

	planCard: {
		backgroundColor: theme.colors.sage,
		borderRadius: theme.radii.lg,
		padding: theme.spacing.lg,
	},

	planEyebrow: {
		color: theme.colors.forest,
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 1.3,
	},

	planTitle: {
		color: theme.colors.ink,
		fontSize: theme.typography.subheading.fontSize,
		fontWeight: theme.typography.subheading.fontWeight,
		marginTop: theme.spacing.xs,
	},

	planBody: {
		color: theme.colors.earth,
		fontSize: theme.typography.bodySmall.fontSize,
		lineHeight: theme.typography.bodySmall.lineHeight,
		marginTop: theme.spacing.sm,
	},

	planButton: {
		alignItems: "center",
		backgroundColor: theme.colors.forest,
		borderRadius: theme.radii.md,
		marginTop: theme.spacing.md,
		minHeight: 50,
		justifyContent: "center",
	},

	planButtonText: {
		color: theme.colors.parchment,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "700",
	},

	errorContainer: {
		alignItems: "center",
		backgroundColor: theme.colors.parchment,
		flex: 1,
		justifyContent: "center",
		padding: theme.spacing.xl,
	},

	errorTitle: {
		color: theme.colors.ink,
		fontSize: theme.typography.heading.fontSize,
		fontWeight: theme.typography.heading.fontWeight,
		marginBottom: theme.spacing.md,
		textAlign: "center",
	},

	backButton: {
		color: theme.colors.forest,
		fontSize: theme.typography.body.fontSize,
		fontWeight: "700",
	},
});
