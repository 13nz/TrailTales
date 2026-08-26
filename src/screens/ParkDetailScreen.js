import {
	ScrollView,
	View,
	Text,
	Pressable,
	StyleSheet,
	Image,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import theme from "../constants/theme";
import mockWildlife from "../data/mockWildlife";
import mockAlerts from "../data/mockAlerts";

import { useWildlifeReports } from "../context/WildlifeReportContext";
import { useTrips } from "../context/TripContext";

import { useEffect, useState } from "react";
import TripPickerModal from "../components/TripPickerModal";
import {
	getParkByCode,
	getTrailsByPark,
	getCampgroundsByPark,
} from "../api/npsApi";

import { isFavorite, toggleFavorite } from "../services/favorites";

// displays the main information hub for a national park and provides contextual information about wildlife, reports, alerts, trails, and campgrounds
export default function ParkDetailScreen({ route, navigation }) {
	const insets = useSafeAreaInsets();

	// provides access to wildlife reports shared across the app
	const { getReportsForPark } = useWildlifeReports();

	const { parkId } = route.params;

	const { trips } = useTrips();

	const [park, setPark] = useState(null);
	const [loadingPark, setLoadingPark] = useState(true);
	const [parkError, setParkError] = useState(null);
	const [showTripPicker, setShowTripPicker] = useState(false);

	// tracks whether this park belongs to the current user's favorites
	const [isParkFavorite, setIsParkFavorite] = useState(false);

	// prevents multiple favorite requests while one is being processed
	const [favoriteLoading, setFavoriteLoading] = useState(false);

	// loads the selected park and its related nps data
	// while also restoring the user's saved favorite state
	useEffect(() => {
		let active = true;

		async function loadPark() {
			try {
				setLoadingPark(true);
				setParkError(null);

				const apiPark = await getParkByCode(parkId);

				const [trails, campgrounds] = await Promise.all([
					getTrailsByPark(parkId),
					getCampgroundsByPark(parkId),
				]);

				// checks supabase for the user's existing favorite
				const favorite = await isFavorite("park", parkId);

				if (!active) {
					return;
				}

				setPark({
					...apiPark,
					trails: trails || [],
					campgrounds: campgrounds || [],
					trailCount: (trails || []).length,
					campgroundCount: (campgrounds || []).length,
				});

				setIsParkFavorite(favorite);
			} catch (error) {
				console.error("NPS park error:", error);

				if (active) {
					setParkError("Unable to load this park");
				}
			} finally {
				if (active) {
					setLoadingPark(false);
				}
			}
		}

		loadPark();

		return () => {
			active = false;
		};
	}, [parkId]);

	// prevents the screen from crashing while the selected park is being loaded
	if (loadingPark) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorTitle}>Loading park...</Text>
			</View>
		);
	}

	// prevents the screen from crashing if the api cannot find the selected park
	if (parkError || !park) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorTitle}>
					{parkError || "Park not found"}
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

	const wildlife = mockWildlife[park.id] || [];

	// gets user-submitted wildlife reports associated with this park
	const reports = getReportsForPark(park.id);

	const alerts = mockAlerts[park.id] || [];

	const wildlifeCount = wildlife.length;
	const photoCount = park.images?.length || 0;

	// toggles this park in the current user's favorites
	const handleToggleFavorite = async () => {
		if (!park || favoriteLoading) {
			return;
		}

		try {
			setFavoriteLoading(true);

			const newFavoriteState = await toggleFavorite("park", park.id);

			setIsParkFavorite(newFavoriteState);
		} catch (error) {
			console.error("toggle park favorite error:", error);
		} finally {
			setFavoriteLoading(false);
		}
	};

	return (
		<View style={styles.screen}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.content}
			>
				{/* hero image */}
				<View style={styles.hero}>
					{park.images?.[0]?.url ? (
						<Image
							source={{ uri: park.images[0].url }}
							style={styles.heroImage}
						/>
					) : (
						<View style={styles.heroPlaceholder}>
							<Text style={styles.heroPlaceholderText}>
								{park.name.toUpperCase()}
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
							isParkFavorite
								? `remove ${park.name} from favorites`
								: `add ${park.name} to favorites`
						}
					>
						<Text
							style={[
								styles.favoriteIcon,
								isParkFavorite && styles.favoriteIconActive,
							]}
						>
							{isParkFavorite ? "♥" : "♡"}
						</Text>
					</Pressable>
				</View>

				{/* park header */}
				<View style={styles.header}>
					<Text style={styles.eyebrow}>
						{park.designation.toUpperCase()}
					</Text>

					<Text style={styles.title}>{park.name}</Text>

					<Text style={styles.location}>
						{park.states.join(" · ")}
					</Text>

					<View style={styles.actions}>
						<Pressable
							style={styles.primaryAction}
							onPress={handleToggleFavorite}
							disabled={favoriteLoading}
							accessibilityRole="button"
							accessibilityLabel={
								isParkFavorite
									? `remove ${park.name} from favorites`
									: `add ${park.name} to favorites`
							}
						>
							<Text style={styles.primaryActionText}>
								{isParkFavorite
									? "Remove from favorites ♥"
									: "Add to favorites ♡"}
							</Text>
						</Pressable>

						<Pressable
							style={styles.secondaryAction}
							accessibilityRole="button"
							onPress={() => {
								// opens the trips navigator and starts a new trip for this park
								navigation.navigate("Trips", {
									screen: "CreateTrip",
									params: {
										parkId: park.id,
									},
								});
							}}
						>
							<Text style={styles.secondaryActionText}>
								+ Trip
							</Text>
						</Pressable>
					</View>
				</View>

				{/* about */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>About</Text>

					<Text style={styles.body}>
						{park.description || park.longDescription}
					</Text>
				</View>

				{/* park information */}
				<View style={styles.infoGrid}>
					<InfoCard value={park.trailCount} label="Trails" />

					{park.campgrounds.length > 0 && (
						<InfoCard
							value={park.campgroundCount}
							label="Campgrounds"
						/>
					)}

					{wildlife.length > 0 && (
						<InfoCard value={wildlife.length} label="Wildlife" />
					)}

					<InfoCard value={photoCount} label="Photos" />
				</View>

				{/* trails */}

				<View style={styles.section}>
					<SectionHeader
						title="Trails"
						actionLabel="See all"
						onActionPress={() => {
							navigation.navigate("TrailDirectory", {
								parkId: park.id,
							});
						}}
					/>

					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.trailList}
					>
						{park.trails.map((trail) => (
							<TrailPreview
								key={trail.id}
								trail={trail}
								onPress={() => {
									navigation.navigate("TrailDetail", {
										parkId: park.id,
										trailId: trail.id,
									});
								}}
							/>
						))}
					</ScrollView>
				</View>

				{/* campgrounds */}

				{park.campgrounds.length > 0 && (
					<View style={styles.section}>
						<SectionHeader
							title="Campgrounds"
							actionLabel="See all"
							onActionPress={() => {
								navigation.navigate("CampgroundDirectory", {
									parkId: park.id,
								});
							}}
						/>

						<View style={styles.campgroundList}>
							{park.campgrounds.slice(0, 3).map((campground) => (
								<CampgroundPreview
									key={campground.id}
									campground={campground}
									onPress={() => {
										navigation.navigate(
											"CampgroundDetail",
											{
												parkId: park.id,
												campgroundId: campground.id,
											},
										);
									}}
								/>
							))}
						</View>
					</View>
				)}

				{/* Photos */}
				<View style={styles.section}>
					<SectionHeader
						title="Photos"
						actionLabel={
							photoCount > 0 ? `${photoCount} photos` : null
						}
					/>

					{park.images?.length > 0 ? (
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.photoList}
						>
							{park.images.map((image, index) => (
								<View
									key={image.id || index}
									style={styles.photoCard}
								>
									<Image
										source={{
											uri: image.url,
										}}
										style={styles.photoImage}
										accessibilityLabel={`${park.name} photo ${index + 1}`}
									/>
								</View>
							))}
						</ScrollView>
					) : (
						<EmptyCard text="No photos available" />
					)}
				</View>

				{/* wildlife */}
				<View style={styles.section}>
					<SectionHeader
						title="Wildlife"
						actionLabel={
							wildlifeCount > 0
								? `${wildlifeCount} species`
								: null
						}
					/>

					<Text style={styles.sectionDescription}>
						Animals known to live in or around this park.
					</Text>

					{wildlife.length > 0 ? (
						<View style={styles.wildlifeList}>
							{wildlife.map((animal) => (
								<WildlifeRow key={animal.id} animal={animal} />
							))}
						</View>
					) : (
						<EmptyCard text="Wildlife information is not available yet" />
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

					<Text style={styles.sectionDescription}>
						Wildlife reports submitted by TrailTales users.
					</Text>

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
						<EmptyCard text="No user reports yet" />
					)}

					<Pressable
						style={styles.reportButton}
						onPress={() => {
							// opens the wildlife report form for this park
							navigation.navigate("ReportWildlife", {
								parkId: park.id,
							});
						}}
						accessibilityRole="button"
						accessibilityLabel="report a wildlife sighting"
					>
						<Text style={styles.reportButtonText}>
							+ Report a sighting
						</Text>
					</Pressable>
				</View>

				{/* official park alerts */}

				<View style={styles.section}>
					<SectionHeader
						title="Alerts"
						actionLabel={
							alerts.length > 0 ? `${alerts.length} active` : null
						}
					/>

					{alerts.length > 0 ? (
						<View style={styles.alertList}>
							{alerts.map((alert) => (
								<AlertRow key={alert.id} alert={alert} />
							))}
						</View>
					) : (
						<EmptyCard text="No active park alerts" />
					)}
				</View>

				{/* activities */}
				<View style={styles.section}>
					<SectionHeader
						title="Activities"
						actionLabel={
							park.activities?.length > 0 ? "See all" : null
						}
					/>

					{park.activities?.length > 0 ? (
						<View style={styles.activityList}>
							{park.activities.map((activity) => (
								<View
									key={activity}
									style={styles.activityPill}
								>
									<Text style={styles.activityText}>
										{activity}
									</Text>
								</View>
							))}
						</View>
					) : (
						<EmptyCard text="No activities are listed for this park yet" />
					)}
				</View>

				{/* dogs */}
				{/*
                <View style={styles.section}>
                    <SectionHeader
                        title="Dogs"
                        actionLabel="See all"
                    />

                    <View style={styles.dogCard}>
                        <Text style={styles.dogTitle}>
                            Know before you go
                        </Text>

                        <Text style={styles.dogBody}>
                            Check current park rules before bringing
                            your dog. Rules can vary by trail,
                            campground, and season.
                        </Text>
                    </View>
                </View>
                */}

				{/* plan your visit */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Plan your visit</Text>

					<View style={styles.planCard}>
						<Text style={styles.planTitle}>
							Make this park part of your next adventure
						</Text>

						<Text style={styles.planBody}>
							Save trails, campsites, and activities to build a
							trip around {park.name}.
						</Text>

						<Pressable
							style={styles.planButton}
							onPress={() => {
								// opens the trip picker so the user can choose an existing trip
								setShowTripPicker(true);
							}}
							accessibilityRole="button"
							accessibilityLabel={`add ${park.name} to a trip`}
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
				navigation={navigation}
			/>
		</View>
	);
}

// displays a section title and optional action
function SectionHeader({ title, actionLabel, onActionPress }) {
	return (
		<View style={styles.sectionHeader}>
			<Text style={styles.sectionTitle}>{title}</Text>

			{actionLabel && (
				<Pressable
					onPress={onActionPress}
					disabled={!onActionPress}
					accessibilityRole="button"
				>
					<Text style={styles.sectionAction}>{actionLabel}</Text>
				</Pressable>
			)}
		</View>
	);
}

// displays a single park information statistic
function InfoCard({ value, label }) {
	return (
		<View style={styles.infoCard}>
			<Text style={styles.infoValue}>{value}</Text>

			<Text style={styles.infoLabel}>{label}</Text>
		</View>
	);
}

// displays an official park alert with its source clearly represented
function AlertRow({ alert }) {
	const isDanger =
		alert.category === "Danger" || alert.category === "Closure";

	return (
		<View style={[styles.alertCard, isDanger && styles.alertCardDanger]}>
			<View style={styles.alertIndicator} />

			<View style={styles.alertContent}>
				<View style={styles.alertHeader}>
					<Text style={styles.alertCategory}>{alert.category}</Text>

					<Text style={styles.alertSource}>NPS</Text>
				</View>

				<Text style={styles.alertTitle}>{alert.title}</Text>

				<Text style={styles.alertDescription}>{alert.description}</Text>
			</View>
		</View>
	);
}

// displays official wildlife information without assigning individual emojis to species
function WildlifeRow({ animal }) {
	return (
		<View style={styles.wildlifeRow}>
			<View style={styles.wildlifeIcon}>
				<Text style={styles.wildlifeIconText}>W</Text>
			</View>

			<View style={styles.wildlifeContent}>
				<Text style={styles.wildlifeSpecies}>{animal.name}</Text>

				<Text style={styles.wildlifeDescription} numberOfLines={2}>
					{animal.description}
				</Text>
			</View>
		</View>
	);
}

// displays community reports separately from official wildlife information
function WildlifeReportRow({ report }) {
	return (
		<View style={styles.reportCard}>
			<View style={styles.reportIcon}>
				<Text style={styles.reportIconText}>R</Text>
			</View>

			<View style={styles.reportContent}>
				<View style={styles.reportTitleRow}>
					<Text style={styles.reportSpecies}>{report.species}</Text>

					<Text style={styles.userLabel}>USER REPORT</Text>
				</View>

				<Text style={styles.reportLocation}>{report.location}</Text>

				<Text style={styles.reportDescription} numberOfLines={2}>
					{report.description}
				</Text>
			</View>
		</View>
	);
}

// displays a neutral empty state for sections without data
function EmptyCard({ text }) {
	return (
		<View style={styles.emptyCard}>
			<Text style={styles.emptyCardText}>{text}</Text>
		</View>
	);
}

// displays a trail preview using data returned by the nps api
function TrailPreview({ trail, onPress }) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.trailCard,
				pressed && styles.pressed,
			]}
			accessibilityRole="button"
			accessibilityLabel={`view ${trail.name}`}
		>
			<View style={styles.trailImage}>
				{trail.image ? (
					<Image
						source={{ uri: trail.image }}
						style={styles.trailImageActual}
					/>
				) : (
					<Text style={styles.trailImageText}>TRAIL</Text>
				)}
			</View>

			<View style={styles.trailContent}>
				<Text style={styles.trailName} numberOfLines={2}>
					{trail.name}
				</Text>

				<Text style={styles.trailMeta}>
					{trail.distance || "Distance unavailable"}
					{trail.difficulty ? ` · ${trail.difficulty}` : ""}
				</Text>

				<Text style={styles.trailElevation}>
					{trail.duration || "Duration unavailable"}
				</Text>
			</View>
		</Pressable>
	);
}

// displays a campground preview using data returned by the nps api
function CampgroundPreview({ campground, onPress }) {
	const sites = campground.numberOfSites || campground.sites || "";

	const season = campground.operatingSeason || campground.season || "";

	return (
		<Pressable
			style={({ pressed }) => [
				styles.campgroundCard,
				pressed && styles.pressed,
			]}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={`view ${campground.name}`}
		>
			<View style={styles.campgroundIcon}>
				<Text style={styles.campgroundIconText}>⌂</Text>
			</View>

			<View style={styles.campgroundContent}>
				<Text style={styles.campgroundName}>{campground.name}</Text>

				<Text style={styles.campgroundMeta}>
					{sites ? `${sites} sites` : "Site count unavailable"}
					{season ? ` · ${season}` : ""}
				</Text>

				<Text style={styles.campgroundDescription} numberOfLines={2}>
					{campground.description ||
						campground.directionsOverview ||
						"NPS campground information"}
				</Text>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: theme.colors.parchment,
	},

	content: {
		paddingBottom: 120,
	},

	errorContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.parchment,
		padding: theme.spacing.lg,
	},

	errorTitle: {
		color: theme.colors.ink,
		fontSize: theme.typography.heading.fontSize,
		fontWeight: "700",
		textAlign: "center",
	},

	backButton: {
		color: theme.colors.forest,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "700",
		marginTop: theme.spacing.md,
	},

	hero: {
		height: 280,
		position: "relative",
	},

	heroImage: {
		width: "100%",
		height: "100%",
		backgroundColor: theme.colors.sage,
	},

	heroPlaceholder: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.sage,
	},

	heroPlaceholderText: {
		color: theme.colors.forest,
		fontSize: theme.typography.label.fontSize,
		fontWeight: "700",
		letterSpacing: 1.5,
		textAlign: "center",
		paddingHorizontal: theme.spacing.lg,
	},

	backButtonContainer: {
		position: "absolute",
		left: theme.spacing.lg,
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.parchment,
	},

	heroButton: {
		color: theme.colors.ink,
		fontSize: 30,
		lineHeight: 32,
	},

	favoriteButton: {
		position: "absolute",
		right: theme.spacing.lg,
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.parchment,
	},

	favoriteIcon: {
		color: theme.colors.earth,
		fontSize: 26,
	},

	favoriteIconActive: {
		color: theme.colors.forest,
	},

	header: {
		padding: theme.spacing.lg,
	},

	eyebrow: {
		color: theme.colors.forest,
		fontSize: theme.typography.label.fontSize,
		fontWeight: "700",
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
		flexDirection: "row",
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
		fontWeight: "700",
	},

	secondaryAction: {
		borderColor: theme.colors.earth,
		borderRadius: theme.radii.sm,
		borderWidth: 1,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.sm,
	},

	secondaryActionText: {
		color: theme.colors.earth,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "700",
	},

	section: {
		marginTop: theme.spacing.xl,
		paddingHorizontal: theme.spacing.lg,
	},

	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: theme.spacing.md,
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
		marginBottom: theme.spacing.md,
	},

	sectionAction: {
		color: theme.colors.forest,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "700",
		marginLeft: theme.spacing.sm,
	},

	body: {
		color: theme.colors.bark,
		fontSize: theme.typography.body.fontSize,
		lineHeight: theme.typography.body.lineHeight,
		marginTop: theme.spacing.sm,
	},

	infoGrid: {
		flexDirection: "row",
		gap: theme.spacing.sm,
		marginTop: theme.spacing.xl,
		paddingHorizontal: theme.spacing.lg,
	},

	infoCard: {
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		flex: 1,
		padding: theme.spacing.md,
		...theme.shadows.card,
	},

	infoValue: {
		color: theme.colors.forest,
		fontSize: theme.typography.heading.fontSize,
		fontWeight: "700",
	},

	infoLabel: {
		color: theme.colors.earth,
		fontSize: theme.typography.label.fontSize,
		marginTop: theme.spacing.xs,
	},

	/* alerts */

	alertList: {
		gap: theme.spacing.sm,
	},

	alertCard: {
		flexDirection: "row",
		overflow: "hidden",
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
	},

	alertCardDanger: {
		borderWidth: 1,
		borderColor: theme.colors.earth,
	},

	alertIndicator: {
		width: 5,
		backgroundColor: theme.colors.forest,
	},

	alertContent: {
		flex: 1,
		padding: theme.spacing.md,
	},

	alertHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},

	alertCategory: {
		color: theme.colors.forest,
		fontSize: 9,
		fontWeight: "800",
		letterSpacing: 1,
		textTransform: "uppercase",
	},

	alertSource: {
		color: theme.colors.earth,
		fontSize: 9,
		fontWeight: "700",
		letterSpacing: 0.8,
	},

	alertTitle: {
		color: theme.colors.ink,
		fontSize: theme.typography.body.fontSize,
		fontWeight: "700",
		marginTop: theme.spacing.xs,
	},

	alertDescription: {
		color: theme.colors.earth,
		fontSize: theme.typography.bodySmall.fontSize,
		lineHeight: theme.typography.bodySmall.lineHeight,
		marginTop: theme.spacing.xs,
	},

	/* trails */

	trailList: {
		gap: theme.spacing.md,
	},

	trailCard: {
		width: 220,
		overflow: "hidden",
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		...theme.shadows.card,
	},

	trailImage: {
		height: 100,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.sage,
	},

	trailImageActual: {
		width: "100%",
		height: "100%",
	},

	trailImageText: {
		color: theme.colors.forest,
		fontSize: theme.typography.caption.fontSize,
		fontWeight: "700",
		letterSpacing: 1,
	},

	trailContent: {
		padding: theme.spacing.md,
	},

	trailName: {
		color: theme.colors.ink,
		fontSize: theme.typography.body.fontSize,
		fontWeight: "700",
	},

	trailMeta: {
		color: theme.colors.earth,
		fontSize: theme.typography.caption.fontSize,
		marginTop: theme.spacing.xs,
	},

	trailElevation: {
		color: theme.colors.forest,
		fontSize: theme.typography.caption.fontSize,
		fontWeight: "600",
		marginTop: theme.spacing.xs,
	},

	pressed: {
		opacity: 0.85,
	},

	/* campgrounds */

	campgroundList: {
		gap: theme.spacing.sm,
	},

	campgroundCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		padding: theme.spacing.md,
		...theme.shadows.card,
	},

	campgroundIcon: {
		width: 52,
		height: 52,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: theme.radii.sm,
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
		fontSize: theme.typography.body.fontSize,
		fontWeight: "700",
	},

	campgroundMeta: {
		color: theme.colors.forest,
		fontSize: theme.typography.caption.fontSize,
		marginTop: theme.spacing.xs,
	},

	campgroundDescription: {
		color: theme.colors.earth,
		fontSize: theme.typography.caption.fontSize,
		lineHeight: theme.typography.caption.lineHeight,
		marginTop: theme.spacing.xs,
	},

	/* photos */

	photoList: {
		gap: theme.spacing.md,
	},

	photoCard: {
		width: 220,
		height: 150,
		overflow: "hidden",
		borderRadius: theme.radii.md,
		backgroundColor: theme.colors.sage,
		...theme.shadows.card,
	},

	photoImage: {
		width: "100%",
		height: "100%",
	},

	/* wildlife */

	wildlifeList: {
		gap: theme.spacing.sm,
	},

	wildlifeRow: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		padding: theme.spacing.md,
	},

	wildlifeIcon: {
		width: 48,
		height: 48,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: 24,
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

	/* user reports */

	reportList: {
		gap: theme.spacing.sm,
	},

	reportCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		padding: theme.spacing.md,
	},

	reportIcon: {
		width: 48,
		height: 48,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: 24,
	},

	reportIconText: {
		color: theme.colors.forest,
		fontSize: 12,
		fontWeight: "800",
		letterSpacing: 1,
	},

	reportContent: {
		flex: 1,
		marginLeft: theme.spacing.md,
	},

	reportTitleRow: {
		flexDirection: "row",
		alignItems: "center",
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
		borderWidth: 1,
		borderRadius: theme.radii.sm,
		marginTop: theme.spacing.md,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
	},

	reportButtonText: {
		color: theme.colors.forest,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "700",
	},

	/* activities */

	activityList: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.sm,
	},

	activityPill: {
		backgroundColor: theme.colors.canvas,
		borderRadius: 20,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
	},

	activityText: {
		color: theme.colors.forest,
		fontSize: theme.typography.caption.fontSize,
		fontWeight: "600",
	},

	/* empty state */

	emptyCard: {
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		padding: theme.spacing.lg,
	},

	emptyCardText: {
		color: theme.colors.earth,
		fontSize: theme.typography.bodySmall.fontSize,
		textAlign: "center",
	},

	/* plan */

	planCard: {
		backgroundColor: theme.colors.forest,
		borderRadius: theme.radii.lg,
		padding: theme.spacing.lg,
	},

	planTitle: {
		color: theme.colors.parchment,
		fontSize: theme.typography.heading.fontSize,
		fontWeight: "700",
		lineHeight: theme.typography.heading.lineHeight,
	},

	planBody: {
		color: theme.colors.canvas,
		fontSize: theme.typography.bodySmall.fontSize,
		lineHeight: theme.typography.bodySmall.lineHeight,
		marginTop: theme.spacing.sm,
	},

	planButton: {
		alignSelf: "flex-start",
		backgroundColor: theme.colors.parchment,
		borderRadius: theme.radii.sm,
		marginTop: theme.spacing.lg,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
	},

	planButtonText: {
		color: theme.colors.forest,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "700",
	},

	/* dogs */

	dogCard: {
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		padding: theme.spacing.lg,
	},

	dogTitle: {
		color: theme.colors.ink,
		fontSize: theme.typography.body.fontSize,
		fontWeight: "700",
	},

	dogBody: {
		color: theme.colors.earth,
		fontSize: theme.typography.bodySmall.fontSize,
		lineHeight: theme.typography.bodySmall.lineHeight,
		marginTop: theme.spacing.sm,
	},
});
