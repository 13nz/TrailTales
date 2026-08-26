import {
	View,
	Text,
	Pressable,
	ScrollView,
	StyleSheet,
	Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useEffect, useState } from "react";

import theme from "../constants/theme";

// displays detailed information about one nps visitor center
export default function VisitorCenterDetailScreen({ route, navigation }) {
	const insets = useSafeAreaInsets();

	const { visitorCenter: initialVisitorCenter } = route.params || {};

	const [visitorCenter, setVisitorCenter] = useState(
		initialVisitorCenter || null,
	);

	const [loadingVisitorCenter, setLoadingVisitorCenter] =
		useState(!initialVisitorCenter);

	const [visitorCenterError, setVisitorCenterError] = useState(null);

	// uses the complete visitor center record passed from the directory
	useEffect(() => {
		if (initialVisitorCenter) {
			setVisitorCenter(initialVisitorCenter);

			setLoadingVisitorCenter(false);

			return;
		}

		setLoadingVisitorCenter(false);

		setVisitorCenterError("Visitor center could not be found.");
	}, [initialVisitorCenter]);

	if (loadingVisitorCenter) {
		return (
			<View style={styles.centeredState}>
				<Text style={styles.loadingText}>
					Loading visitor center...
				</Text>
			</View>
		);
	}

	if (visitorCenterError || !visitorCenter) {
		return (
			<View style={styles.centeredState}>
				<Text style={styles.errorTitle}>
					{visitorCenterError || "Visitor center could not be found."}
				</Text>

				<Pressable
					style={styles.errorBackButton}
					onPress={() => navigation.goBack()}
					accessibilityRole="button"
					accessibilityLabel="go back"
				>
					<Text style={styles.errorBackButtonText}>Go back</Text>
				</Pressable>
			</View>
		);
	}

	const heroImage = getVisitorCenterImage(visitorCenter);

	const parkName =
		visitorCenter.parkName ||
		visitorCenter.park?.name ||
		"National Park Service";

	const address = getPrimaryAddress(visitorCenter);

	const addressText = formatAddress(address);

	const phone = getPrimaryPhone(visitorCenter);

	const hours = getOperatingHours(visitorCenter);

	const amenities = getAmenities(visitorCenter);

	const directions = visitorCenter.directionsInfo || "";

	return (
		<View style={styles.screen}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.content}
			>
				{/* hero image */}

				<View style={styles.hero}>
					{heroImage ? (
						<Image
							source={{
								uri: heroImage,
							}}
							style={styles.heroImage}
							resizeMode="cover"
							accessibilityLabel={`${visitorCenter.name} photo`}
						/>
					) : (
						<View style={styles.heroPlaceholder}>
							<Text style={styles.heroPlaceholderIcon}>🏛️</Text>

							<Text style={styles.heroPlaceholderText}>
								VISITOR CENTER
							</Text>
						</View>
					)}

					<Pressable
						style={[
							styles.heroButton,
							{
								top: insets.top + theme.spacing.sm,
							},
						]}
						onPress={() => navigation.goBack()}
						accessibilityRole="button"
						accessibilityLabel="go back"
					>
						<Ionicons
							name="chevron-back"
							size={25}
							color={theme.colors.ink}
						/>
					</Pressable>
				</View>

				{/* visitor center introduction */}

				<View style={styles.header}>
					<Text style={styles.eyebrow}>VISITOR CENTER</Text>

					<Text style={styles.title}>{visitorCenter.name}</Text>

					<Text style={styles.parkName}>{parkName}</Text>
				</View>

				{/* quick visitor center facts */}

				{addressText || phone || hours.length > 0 ? (
					<View style={styles.infoGrid}>
						{addressText ? (
							<InfoCard
								label={getShortAddress(address)}
								value="Location"
							/>
						) : null}

						{/* {hours.length >
                        0 ? (
                            <InfoCard
                                label={
                                    getHoursSummary(
                                        hours
                                    )
                                }
                                value="Hours"
                            />
                        ) : null} */}

						{phone ? (
							<InfoCard label={phone} value="Phone" />
						) : null}
					</View>
				) : null}

				{/* about */}

				{visitorCenter.description ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>About</Text>

						<Text style={styles.body}>
							{visitorCenter.description}
						</Text>
					</View>
				) : null}

				{/* hours */}

				{hours.length > 0 ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Hours & Seasons</Text>

						<View style={styles.detailCard}>
							{hours.map((item, index) => (
								<View
									key={`${item.name || "hours"}-${index}`}
									style={[
										styles.detailRow,
										index === hours.length - 1 &&
											styles.lastDetailRow,
									]}
								>
									<Text style={styles.detailLabel}>
										{item.name}
									</Text>

									<Text style={styles.detailValue}>
										{item.description}
									</Text>
								</View>
							))}
						</View>
					</View>
				) : null}

				{/* location */}

				{addressText ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Location</Text>

						<View style={styles.detailCard}>
							<Text style={styles.addressText}>
								{addressText}
							</Text>

							{directions ? (
								<View style={styles.directionsBlock}>
									<Text style={styles.detailLabel}>
										Directions
									</Text>

									<Text style={styles.body}>
										{directions}
									</Text>
								</View>
							) : null}
						</View>
					</View>
				) : directions ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Directions</Text>

						<Text style={styles.body}>{directions}</Text>
					</View>
				) : null}

				{/* contact */}

				{phone ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Contact</Text>

						<View style={styles.detailCard}>
							<View style={styles.contactRow}>
								<View style={styles.contactIcon}>
									<Ionicons
										name="call-outline"
										size={18}
										color={theme.colors.forest}
									/>
								</View>

								<View style={styles.contactContent}>
									<Text style={styles.detailLabel}>
										Phone
									</Text>

									<Text style={styles.contactValue}>
										{phone}
									</Text>
								</View>
							</View>
						</View>
					</View>
				) : null}

				{/* amenities */}

				{amenities.length > 0 ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Amenities</Text>

						<View style={styles.amenityList}>
							{amenities.map((amenity, index) => (
								<View
									key={`${amenity}-${index}`}
									style={styles.amenityChip}
								>
									<Ionicons
										name="checkmark"
										size={14}
										color={theme.colors.forest}
									/>

									<Text style={styles.amenityText}>
										{amenity}
									</Text>
								</View>
							))}
						</View>
					</View>
				) : null}

				{/* additional photos */}

				{visitorCenter.images?.length > 1 ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Photos</Text>

						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.photoList}
						>
							{visitorCenter.images
								.filter((image) => image?.url)
								.map((image, index) => (
									<Image
										key={`${image.url}-${index}`}
										source={{
											uri: image.url,
										}}
										style={styles.photo}
										resizeMode="cover"
										accessibilityLabel={
											image.altText ||
											`${visitorCenter.name} photo ${
												index + 1
											}`
										}
									/>
								))}
						</ScrollView>
					</View>
				) : null}

				<View style={styles.bottomSpacer} />
			</ScrollView>
		</View>
	);
}

/*
 * finds the best visitor center image available.
 *
 * the api may return several images, so the first usable
 * image is selected instead of assuming a specific index.
 */
function getVisitorCenterImage(visitorCenter) {
	if (visitorCenter.image) {
		return visitorCenter.image;
	}

	const image = visitorCenter.images?.find((item) => item?.url);

	return image?.url || null;
}

/*
 * returns the first useful address supplied by the nps api.
 */
function getPrimaryAddress(visitorCenter) {
	if (!Array.isArray(visitorCenter.addresses)) {
		return null;
	}

	return (
		visitorCenter.addresses.find(
			(address) =>
				address &&
				(address.line1 ||
					address.city ||
					address.stateCode ||
					address.postalCode),
		) || null
	);
}

/*
 * converts the nps address object into readable text.
 */
function formatAddress(address) {
	if (!address) {
		return "";
	}

	const firstLine = [address.line1, address.line2, address.line3]
		.filter((value) => value && typeof value === "string")
		.join(", ");

	const secondLine = [address.city, address.stateCode, address.postalCode]
		.filter((value) => value && typeof value === "string")
		.join(", ");

	return [firstLine, secondLine].filter(Boolean).join("\n");
}

/*
 * keeps the location stat compact while the full address
 * remains available in the location section.
 */
function getShortAddress(address) {
	if (!address) {
		return "Location";
	}

	if (address.city && address.stateCode) {
		return `${address.city}, ${address.stateCode}`;
	}

	if (address.city) {
		return address.city;
	}

	if (address.stateCode) {
		return address.stateCode;
	}

	return "Location";
}

/*
 * returns the first usable phone number from the nps
 * contact structure.
 */
function getPrimaryPhone(visitorCenter) {
	const phoneNumbers = visitorCenter.contacts?.phoneNumbers;

	if (!Array.isArray(phoneNumbers)) {
		return "";
	}

	const phone = phoneNumbers.find((item) => item?.phoneNumber);

	return phone?.phoneNumber || "";
}

/*
 * normalizes the operating-hours response so the
 * rendering code only has to handle readable objects.
 */
function getOperatingHours(visitorCenter) {
	if (!Array.isArray(visitorCenter.operatingHours)) {
		return [];
	}

	return visitorCenter.operatingHours
		.map((item) => ({
			name:
				item?.name || item?.description
					? item.name || "Hours"
					: "Hours",
			description: item?.description || "",
		}))
		.filter((item) => item.description);
}

/*
 * creates a short hours value for the top information card.
 */
function getHoursSummary(hours) {
	if (!hours || hours.length === 0) {
		return "See below";
	}

	if (hours.length === 1) {
		return hours[0].description || "See below";
	}

	return "See below";
}

/*
 * converts the nps amenities response into readable
 * labels without displaying raw numeric values.
 *
 * the nps api can represent these values as arrays,
 * strings, booleans, or nested objects depending on
 * the record, so each form is handled safely.
 */
function getAmenities(visitorCenter) {
	const raw = visitorCenter.amenities;

	if (!raw) {
		return [];
	}

	const results = [];

	// handles arrays of amenity names or objects
	if (Array.isArray(raw)) {
		raw.forEach((item) => {
			const value = getReadableAmenity(item);

			if (value) {
				results.push(value);
			}
		});

		return removeDuplicateAmenities(results);
	}

	// handles a normal object returned by the api
	if (typeof raw === "object") {
		Object.entries(raw).forEach(([key, value]) => {
			const readable = getReadableAmenityValue(key, value);

			if (readable) {
				results.push(readable);
			}
		});

		return removeDuplicateAmenities(results);
	}

	return [];
}

/*
 * converts one amenity item into a readable label.
 */
function getReadableAmenity(item) {
	if (typeof item === "string") {
		return cleanAmenityLabel(item);
	}

	if (typeof item === "object" && item) {
		const label = item.name || item.title || item.description || item.label;

		if (typeof label === "string") {
			return cleanAmenityLabel(label);
		}
	}

	return "";
}

/*
 * converts one key/value amenity pair into a display label.
 *
 * numeric values are deliberately ignored because they are
 * usually internal nps values rather than useful user-facing
 * amenity descriptions.
 */
function getReadableAmenityValue(key, value) {
	if (value === null || value === undefined) {
		return "";
	}

	if (typeof value === "number") {
		return "";
	}

	if (typeof value === "boolean") {
		if (!value) {
			return "";
		}

		return cleanAmenityLabel(key);
	}

	if (Array.isArray(value)) {
		const readableValues = value
			.map((item) => getReadableAmenity(item))
			.filter(Boolean);

		if (readableValues.length === 0) {
			return "";
		}

		return readableValues.join(", ");
	}

	if (typeof value === "object") {
		const nested = getReadableAmenity(value);

		return nested || "";
	}

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();

		// ignores empty and negative api values
		if (
			!normalized ||
			normalized === "no" ||
			normalized === "false" ||
			normalized === "0" ||
			normalized === "none"
		) {
			return "";
		}

		// uses the actual api description when it is meaningful
		return cleanAmenityLabel(value);
	}

	return "";
}

/*
 * turns api field names into readable labels.
 */
function cleanAmenityLabel(value) {
	if (typeof value !== "string") {
		return "";
	}

	const cleaned = value
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	if (!cleaned) {
		return "";
	}

	return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/*
 * removes duplicate amenities while preserving their original order.
 */
function removeDuplicateAmenities(amenities) {
	return [...new Set(amenities.filter(Boolean))];
}

function InfoCard({ value, label }) {
	return (
		<View style={styles.infoCard}>
			<Text style={styles.infoValue} numberOfLines={2}>
				{value}
			</Text>

			<Text style={styles.infoLabel}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		backgroundColor: theme.colors.parchment,
		flex: 1,
	},

	content: {
		paddingBottom: 120,
	},

	hero: {
		height: 280,
		position: "relative",
	},

	heroImage: {
		backgroundColor: theme.colors.sage,
		height: "100%",
		width: "100%",
	},

	heroPlaceholder: {
		alignItems: "center",
		backgroundColor: theme.colors.sage,
		flex: 1,
		justifyContent: "center",
	},

	heroPlaceholderIcon: {
		fontSize: 40,
	},

	heroPlaceholderText: {
		color: theme.colors.forest,
		fontSize: theme.typography.label.fontSize,
		fontWeight: "700",
		letterSpacing: 1.5,
		marginTop: theme.spacing.sm,
	},

	heroButton: {
		alignItems: "center",
		backgroundColor: theme.colors.parchment,
		borderRadius: 22,
		height: 44,
		justifyContent: "center",
		left: theme.spacing.lg,
		position: "absolute",
		width: 44,
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
		fontSize: 30,
		fontWeight: "700",
		marginTop: theme.spacing.xs,
	},

	parkName: {
		color: theme.colors.earth,
		fontSize: theme.typography.bodySmall.fontSize,
		marginTop: theme.spacing.xs,
	},

	infoGrid: {
		flexDirection: "row",
		gap: theme.spacing.sm,
		paddingHorizontal: theme.spacing.lg,
	},

	infoCard: {
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		flex: 1,
		minHeight: 76,
		padding: theme.spacing.sm,
		...theme.shadows.card,
	},

	infoValue: {
		color: theme.colors.forest,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "700",
	},

	infoLabel: {
		color: theme.colors.earth,
		fontSize: theme.typography.label.fontSize,
		marginTop: theme.spacing.xs,
		textTransform: "uppercase",
	},

	section: {
		paddingHorizontal: theme.spacing.lg,
		marginTop: theme.spacing.xl,
	},

	sectionTitle: {
		color: theme.colors.ink,
		fontSize: theme.typography.subheading.fontSize,
		fontWeight: theme.typography.subheading.fontWeight,
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
		...theme.shadows.card,
	},

	detailRow: {
		borderBottomColor: theme.colors.sage,
		borderBottomWidth: 1,
		paddingVertical: theme.spacing.sm,
	},

	lastDetailRow: {
		borderBottomWidth: 0,
	},

	detailLabel: {
		color: theme.colors.earth,
		fontSize: theme.typography.label.fontSize,
		fontWeight: "700",
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},

	detailValue: {
		color: theme.colors.ink,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "600",
		lineHeight: theme.typography.bodySmall.lineHeight,
		marginTop: theme.spacing.xs,
	},

	addressText: {
		color: theme.colors.ink,
		fontSize: theme.typography.body.fontSize,
		lineHeight: theme.typography.body.lineHeight,
	},

	directionsBlock: {
		borderTopColor: theme.colors.sage,
		borderTopWidth: 1,
		marginTop: theme.spacing.md,
		paddingTop: theme.spacing.md,
	},

	contactRow: {
		alignItems: "center",
		flexDirection: "row",
	},

	contactIcon: {
		alignItems: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: 22,
		height: 44,
		justifyContent: "center",
		width: 44,
	},

	contactContent: {
		flex: 1,
		marginLeft: theme.spacing.md,
	},

	contactValue: {
		color: theme.colors.ink,
		fontSize: theme.typography.body.fontSize,
		fontWeight: "700",
		marginTop: theme.spacing.xs,
	},

	amenityList: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.sm,
		marginTop: theme.spacing.sm,
	},

	amenityChip: {
		alignItems: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: 20,
		flexDirection: "row",
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
	},

	amenityText: {
		color: theme.colors.forest,
		fontSize: theme.typography.caption.fontSize,
		fontWeight: "600",
		marginLeft: theme.spacing.xs,
	},

	photoList: {
		gap: theme.spacing.sm,
		marginTop: theme.spacing.sm,
	},

	photo: {
		backgroundColor: theme.colors.sage,
		borderRadius: theme.radii.md,
		height: 150,
		width: 210,
	},

	bottomSpacer: {
		height: 40,
	},

	centeredState: {
		alignItems: "center",
		backgroundColor: theme.colors.parchment,
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: theme.spacing.xl,
	},

	loadingText: {
		color: theme.colors.earth,
		fontSize: theme.typography.body.fontSize,
	},

	errorTitle: {
		color: theme.colors.ink,
		fontSize: theme.typography.subheading.fontSize,
		fontWeight: "700",
		textAlign: "center",
	},

	errorBackButton: {
		backgroundColor: theme.colors.forest,
		borderRadius: theme.radii.md,
		marginTop: theme.spacing.lg,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
	},

	errorBackButtonText: {
		color: theme.colors.parchment,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "700",
	},
});
