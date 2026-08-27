import React, { useEffect, useState } from "react";

import {
	View,
	Text,
	Pressable,
	ScrollView,
	StyleSheet,
	Image,
	Linking,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getParkByCode } from "../api/npsApi";

import { getLoreEntryById } from "../services/lore";

import theme from "../constants/theme";

// displays the full details for a lore entry from supabase
export default function LoreStoryScreen({ route, navigation }) {
	const insets = useSafeAreaInsets();

	const { loreId } = route.params;

	const [story, setStory] = useState(null);

	const [park, setPark] = useState(null);

	const [loading, setLoading] = useState(true);

	const [error, setError] = useState(null);

	/*
	 * loads the lore entry and its related nps park.
	 *
	 * the lore entry stores the nps park code instead of
	 * duplicating the park information in supabase.
	 */
	useEffect(() => {
		let active = true;

		async function loadStory() {
			try {
				setLoading(true);
				setError(null);

				const entry = await getLoreEntryById(loreId);

				if (!entry) {
					throw new Error("Lore entry not found");
				}

				const apiPark = await getParkByCode(entry.park_code);

				if (!active) {
					return;
				}

				setStory(entry);
				setPark(apiPark);
			} catch (loadError) {
				console.error("lore story load error:", loadError);

				if (active) {
					setStory(null);
					setPark(null);
					setError("Lore entry could not be found");
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		}

		loadStory();

		return () => {
			active = false;
		};
	}, [loreId]);

	// converts a database category into the label and icon used by the existing ui
	const getCategoryInfo = (category) => {
		switch (category) {
			case "cryptids":
				return {
					label: "CRYPTID",
					icon: "paw",
				};

			case "folklore":
				return {
					label: "FOLKLORE",
					icon: "leaf",
				};

			case "legends":
				return {
					label: "LEGEND",
					icon: "sparkles",
				};

			default:
				return {
					label: "LORE",
					icon: "book",
				};
		}
	};

	// returns the categories attached to this lore entry
	const categories = story?.categories || [];

	/*
	 * keeps the badge compact when an entry has multiple categories.
	 * the first category is used as the primary badge, while the
	 * remaining categories are displayed underneath the title.
	 */
	const primaryCategory = categories[0] || null;

	const categoryInfo = getCategoryInfo(primaryCategory);

	const openSource = async () => {
		if (!story?.source_url) {
			return;
		}

		try {
			await Linking.openURL(story.source_url);
		} catch (linkError) {
			console.error("lore source link error:", linkError);
		}
	};

	if (loading) {
		return (
			<View
				style={[
					styles.container,
					{
						paddingTop: insets.top,
					},
				]}
			>
				<View style={styles.loadingState}>
					<Ionicons
						name="book-outline"
						size={38}
						color={theme.colors.earth}
					/>

					<Text style={styles.loadingTitle}>Loading lore...</Text>

					<Text style={styles.loadingText}>Gathering the story</Text>
				</View>
			</View>
		);
	}

	if (error || !story || !park) {
		return (
			<View
				style={[
					styles.container,
					{
						paddingTop: insets.top,
					},
				]}
			>
				<View style={styles.loadingState}>
					<Ionicons
						name="alert-circle-outline"
						size={38}
						color={theme.colors.earth}
					/>

					<Text style={styles.loadingTitle}>
						Lore entry not found
					</Text>

					<Text style={styles.loadingText}>
						{error || "This lore entry is no longer available."}
					</Text>

					<Pressable
						onPress={() => navigation.goBack()}
						style={styles.errorBackButton}
						accessibilityRole="button"
						accessibilityLabel="go back to lore"
					>
						<Text style={styles.errorBackText}>Go back</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	return (
		<View
			style={[
				styles.container,
				{
					paddingTop: insets.top,
				},
			]}
		>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<Pressable
						onPress={() => navigation.goBack()}
						style={styles.backButton}
						accessibilityRole="button"
						accessibilityLabel="go back to lore"
					>
						<Ionicons
							name="chevron-back"
							size={22}
							color={theme.colors.forest}
						/>

						<Text style={styles.backText}>Lore</Text>
					</Pressable>

					<View style={styles.categoryBadge}>
						<Ionicons
							name={categoryInfo.icon}
							size={14}
							color={theme.colors.forest}
						/>

						<Text style={styles.categoryText}>
							{categoryInfo.label}
						</Text>
					</View>
				</View>

				<Text style={styles.parkName}>{park.name}</Text>

				<Text style={styles.title}>{story.title}</Text>

				{categories.length > 1 ? (
					<View style={styles.additionalCategories}>
						{categories.slice(1).map((category) => {
							const info = getCategoryInfo(category);

							return (
								<View
									key={category}
									style={styles.secondaryCategory}
								>
									<Ionicons
										name={info.icon}
										size={12}
										color={theme.colors.forest}
									/>

									<Text style={styles.secondaryCategoryText}>
										{info.label}
									</Text>
								</View>
							);
						})}
					</View>
				) : null}

				<Text style={styles.summary}>{story.summary}</Text>

				{story.image_url ? (
					<View style={styles.imageSection}>
						<Image
							source={{
								uri: story.image_url,
							}}
							style={styles.storyImage}
							resizeMode="cover"
							accessibilityLabel={`${story.title} image`}
						/>
					</View>
				) : null}

				<View style={styles.divider} />

				<View style={styles.infoSection}>
					<Text style={styles.sectionLabel}>ABOUT</Text>

					<Text style={styles.description}>{story.description}</Text>
				</View>

				{story.location ? (
					<View style={styles.locationCard}>
						<View style={styles.locationIcon}>
							<Ionicons
								name="location"
								size={18}
								color={theme.colors.forest}
							/>
						</View>

						<View style={styles.locationInfo}>
							<Text style={styles.locationLabel}>LOCATION</Text>

							<Text style={styles.locationText}>
								{story.location}
							</Text>
						</View>
					</View>
				) : null}

				{story.source ? (
					<View style={styles.sourceSection}>
						<View style={styles.sourceHeader}>
							<Ionicons
								name="library-outline"
								size={17}
								color={theme.colors.forest}
							/>

							<Text style={styles.sourceTitle}>Source</Text>
						</View>

						<Text style={styles.sourceText}>{story.source}</Text>

						{story.source_url ? (
							<Pressable
								onPress={openSource}
								accessibilityRole="link"
								accessibilityLabel="open lore source"
							>
								<Text style={styles.sourceLink}>
									View source
								</Text>
							</Pressable>
						) : null}
					</View>
				) : null}

				{story.campfire_eligible && story.campfire_content ? (
					<Pressable
						style={styles.campfireButton}
						onPress={() =>
							navigation.navigate("CampfireStory", {
								parkId: story.park_code,
								loreId: story.id,
							})
						}
						accessibilityRole="button"
						accessibilityLabel="hear this story in campfire mode"
					>
						<View style={styles.campfireIcon}>
							<Text style={styles.campfireEmoji}>🔥</Text>
						</View>

						<View style={styles.campfireInfo}>
							<Text style={styles.campfireTitle}>
								Hear the story
							</Text>

							<Text style={styles.campfireText}>
								Enter Campfire Mode
							</Text>
						</View>

						<Ionicons
							name="chevron-forward"
							size={20}
							color="#E7C48A"
						/>
					</Pressable>
				) : null}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: theme.colors.parchment,
		flex: 1,
	},

	content: {
		padding: theme.spacing.md,
		paddingBottom: theme.spacing.xl * 2,
	},

	header: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: theme.spacing.xl,
	},

	backButton: {
		alignItems: "center",
		flexDirection: "row",
	},

	backText: {
		color: theme.colors.forest,
		fontSize: 13,
		fontWeight: "600",
		marginLeft: 2,
	},

	categoryBadge: {
		alignItems: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: 14,
		flexDirection: "row",
		paddingHorizontal: 10,
		paddingVertical: 6,
	},

	categoryText: {
		color: theme.colors.forest,
		fontSize: 9,
		fontWeight: "800",
		letterSpacing: 0.6,
		marginLeft: 5,
	},

	parkName: {
		color: theme.colors.forest,
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},

	title: {
		color: theme.colors.ink,
		fontSize: 32,
		fontWeight: "800",
		lineHeight: 38,
		marginTop: theme.spacing.xs,
	},

	additionalCategories: {
		alignItems: "center",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.xs,
		marginTop: theme.spacing.sm,
	},

	secondaryCategory: {
		alignItems: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: 12,
		flexDirection: "row",
		paddingHorizontal: 8,
		paddingVertical: 4,
	},

	secondaryCategoryText: {
		color: theme.colors.forest,
		fontSize: 8,
		fontWeight: "800",
		letterSpacing: 0.5,
		marginLeft: 4,
	},

	summary: {
		color: theme.colors.earth,
		fontSize: 15,
		fontStyle: "italic",
		lineHeight: 23,
		marginTop: theme.spacing.md,
	},

	imageSection: {
		marginTop: theme.spacing.lg,
		overflow: "hidden",
		borderRadius: theme.radii.md,
	},

	storyImage: {
		height: 220,
		width: "100%",
	},

	divider: {
		backgroundColor: theme.colors.sage,
		height: 1,
		marginVertical: theme.spacing.xl,
	},

	infoSection: {
		marginBottom: theme.spacing.xl,
	},

	sectionLabel: {
		color: theme.colors.forest,
		fontSize: 10,
		fontWeight: "800",
		letterSpacing: 1.5,
		marginBottom: theme.spacing.sm,
	},

	description: {
		color: theme.colors.ink,
		fontSize: 15,
		lineHeight: 24,
	},

	locationCard: {
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderColor: theme.colors.sage,
		borderRadius: theme.radii.md,
		borderWidth: 1,
		flexDirection: "row",
		padding: theme.spacing.md,
	},

	locationIcon: {
		alignItems: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: 20,
		height: 40,
		justifyContent: "center",
		width: 40,
	},

	locationInfo: {
		flex: 1,
		marginLeft: theme.spacing.md,
	},

	locationLabel: {
		color: theme.colors.earth,
		fontSize: 9,
		fontWeight: "800",
		letterSpacing: 1,
	},

	locationText: {
		color: theme.colors.ink,
		fontSize: 13,
		fontWeight: "600",
		marginTop: 3,
	},

	sourceSection: {
		backgroundColor: theme.colors.canvas,
		borderColor: theme.colors.sage,
		borderRadius: theme.radii.md,
		borderWidth: 1,
		marginTop: theme.spacing.md,
		padding: theme.spacing.md,
	},

	sourceHeader: {
		alignItems: "center",
		flexDirection: "row",
	},

	sourceTitle: {
		color: theme.colors.ink,
		fontSize: 13,
		fontWeight: "700",
		marginLeft: theme.spacing.xs,
	},

	sourceText: {
		color: theme.colors.earth,
		fontSize: 12,
		lineHeight: 18,
		marginTop: theme.spacing.sm,
	},

	sourceLink: {
		color: theme.colors.forest,
		fontSize: 12,
		fontWeight: "700",
		marginTop: theme.spacing.sm,
		textDecorationLine: "underline",
	},

	campfireButton: {
		alignItems: "center",
		backgroundColor: "#30261E",
		borderRadius: theme.radii.md,
		flexDirection: "row",
		marginTop: theme.spacing.xl,
		minHeight: 76,
		padding: theme.spacing.md,
	},

	campfireIcon: {
		alignItems: "center",
		backgroundColor: "#4A3325",
		borderRadius: 22,
		height: 44,
		justifyContent: "center",
		width: 44,
	},

	campfireEmoji: {
		fontSize: 22,
	},

	campfireInfo: {
		flex: 1,
		marginHorizontal: theme.spacing.md,
	},

	campfireTitle: {
		color: "#F4D6A3",
		fontSize: 15,
		fontWeight: "800",
	},

	campfireText: {
		color: "#C8B49B",
		fontSize: 11,
		marginTop: 3,
	},

	loadingState: {
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: theme.spacing.xl,
	},

	loadingTitle: {
		color: theme.colors.ink,
		fontSize: 16,
		fontWeight: "700",
		marginTop: theme.spacing.md,
	},

	loadingText: {
		color: theme.colors.earth,
		fontSize: 12,
		marginTop: theme.spacing.xs,
		textAlign: "center",
	},

	errorBackButton: {
		backgroundColor: theme.colors.forest,
		borderRadius: theme.radii.md,
		marginTop: theme.spacing.lg,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.sm,
	},

	errorBackText: {
		color: theme.colors.parchment,
		fontSize: 12,
		fontWeight: "700",
	},

	errorText: {
		color: theme.colors.earth,
		fontSize: 15,
		margin: theme.spacing.xl,
		textAlign: "center",
	},
});
