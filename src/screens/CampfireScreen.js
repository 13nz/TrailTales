import React, { useEffect, useState } from "react";

import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getParkByCode } from "../api/npsApi";

import { getCampfireLoreEntries } from "../services/lore";

import theme from "../constants/theme";

// displays lore as an immersive nighttime storytelling experience
export default function CampfireScreen({ route, navigation }) {
	const insets = useSafeAreaInsets();

	const { parkId, initialLoreId, loreId } = route.params || {};

	const [park, setPark] = useState(null);

	const [campfireEntries, setCampfireEntries] = useState([]);

	const [currentIndex, setCurrentIndex] = useState(0);

	const [loading, setLoading] = useState(true);

	const [error, setError] = useState(null);

	/*
	 * loads the selected national park and all lore entries
	 * that are eligible for campfire mode.
	 *
	 * the park is loaded from the nps api using its official
	 * park code, while the campfire stories come from supabase.
	 */
	useEffect(() => {
		let active = true;

		async function loadCampfire() {
			try {
				setLoading(true);
				setError(null);

				const [apiPark, apiEntries] = await Promise.all([
					getParkByCode(parkId),
					getCampfireLoreEntries(parkId),
				]);

				if (!active) {
					return;
				}

				setPark(apiPark);

				const entries = (apiEntries || []).filter(
					(entry) =>
						entry.campfire_eligible && entry.entry_type === "story" && entry.campfire_content,
				);

				setCampfireEntries(entries);

				/*
				 * if campfire mode was opened from a specific
				 * lore entry, start on that story.
				 *
				 * otherwise begin with the first eligible story.
				 */
				const requestedLoreId = initialLoreId || loreId;

				if (requestedLoreId) {
					const initialIndex = entries.findIndex(
						(entry) => String(entry.id) === String(requestedLoreId),
					);

					setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);
				} else {
					setCurrentIndex(0);
				}
			} catch (loadError) {
				console.error("campfire lore load error:", loadError);

				if (active) {
					setPark(null);
					setCampfireEntries([]);
					setError("Unable to load campfire stories");
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		}

		if (parkId) {
			loadCampfire();
		} else {
			setLoading(false);
			setError("A national park was not provided");
		}

		return () => {
			active = false;
		};
	}, [parkId, initialLoreId, loreId]);

	const currentEntry = campfireEntries[currentIndex];

	/*
	 * converts the database category ids into readable
	 * labels for the campfire story header.
	 */
	const getCategoryLabel = (category) => {
		switch (category) {
			case "legends":
				return "LEGEND";

			case "folklore":
				return "FOLKLORE";

			case "cryptids":
				return "CRYPTID";

			default:
				return category ? category.toUpperCase() : "LORE";
		}
	};

	/*
	 * supports entries that belong to multiple categories.
	 * the categories are joined into one compact label so the
	 * existing campfire layout does not need to change.
	 */
	const categoryLabel =
		currentEntry?.categories
			?.map((category) => getCategoryLabel(category))
			.join(" · ") || "LORE";

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
				<Pressable
					style={styles.closeButton}
					onPress={() => navigation.goBack()}
					accessibilityRole="button"
					accessibilityLabel="exit campfire mode"
				>
					<Ionicons name="close" size={24} color="#E8DCCB" />
				</Pressable>

				<View style={styles.loadingState}>
					<Text style={styles.loadingFire}>🔥</Text>

					<Text style={styles.loadingTitle}>
						Gathering stories...
					</Text>
				</View>
			</View>
		);
	}

	if (!park || !currentEntry) {
		return (
			<View
				style={[
					styles.container,
					{
						paddingTop: insets.top,
					},
				]}
			>
				<Pressable
					style={styles.closeButton}
					onPress={() => navigation.goBack()}
					accessibilityRole="button"
					accessibilityLabel="exit campfire mode"
				>
					<Ionicons name="close" size={24} color="#E8DCCB" />
				</Pressable>

				<Text style={styles.errorText}>
					{error ||
						"No campfire stories are available for this park yet"}
				</Text>
			</View>
		);
	}

	const hasPrevious = currentIndex > 0;

	const hasNext = currentIndex < campfireEntries.length - 1;

	// moves to the previous campfire story without leaving campfire mode
	const showPrevious = () => {
		if (!hasPrevious) {
			return;
		}

		setCurrentIndex((index) => index - 1);
	};

	// moves to the next campfire story without leaving campfire mode
	const showNext = () => {
		if (!hasNext) {
			return;
		}

		setCurrentIndex((index) => index + 1);
	};

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
				<View style={styles.topBar}>
					<Pressable
						style={styles.exitButton}
						onPress={() => navigation.goBack()}
						accessibilityRole="button"
						accessibilityLabel="exit campfire mode"
					>
						<Ionicons name="close" size={22} color="#E8DCCB" />

						<Text style={styles.exitText}>Exit</Text>
					</Pressable>

					<View style={styles.modeLabel}>
						<Text style={styles.modeEmoji}>🔥</Text>

						<Text style={styles.modeText}>CAMPFIRE MODE</Text>
					</View>
				</View>

				<View style={styles.campfireArea}>
					<View style={styles.moon} />

					<View style={styles.stars}>
						<Text style={[styles.star, styles.starOne]}>·</Text>

						<Text style={[styles.star, styles.starTwo]}>·</Text>

						<Text style={[styles.star, styles.starThree]}>·</Text>

						<Text style={[styles.star, styles.starFour]}>·</Text>
					</View>

					<View style={styles.fireGlow} />

					<Text style={styles.fire}>🔥</Text>

					<Text style={styles.parkLabel}>
						{park.name.toUpperCase()}
					</Text>
				</View>

				<View style={styles.storyHeader}>
					<Text style={styles.category}>{categoryLabel}</Text>

					<Text style={styles.title}>
						{currentEntry.campfire_title || currentEntry.title}
					</Text>
				</View>

				<View style={styles.storyDivider} />

				<Text style={styles.storyText}>
					{currentEntry.campfire_content}
				</Text>

				<View style={styles.navigationArea}>
					<Text style={styles.progress}>
						{currentIndex + 1} / {campfireEntries.length}
					</Text>

					<View style={styles.navigationButtons}>
						<Pressable
							style={[
								styles.storyButton,
								!hasPrevious && styles.storyButtonDisabled,
							]}
							onPress={showPrevious}
							disabled={!hasPrevious}
							accessibilityRole="button"
							accessibilityLabel="previous campfire story"
						>
							<Ionicons
								name="chevron-back"
								size={20}
								color={hasPrevious ? "#E8DCCB" : "#655B51"}
							/>

							<Text
								style={[
									styles.storyButtonText,
									!hasPrevious &&
										styles.storyButtonTextDisabled,
								]}
							>
								Previous
							</Text>
						</Pressable>

						<Pressable
							style={[
								styles.storyButton,
								!hasNext && styles.storyButtonDisabled,
							]}
							onPress={showNext}
							disabled={!hasNext}
							accessibilityRole="button"
							accessibilityLabel="next campfire story"
						>
							<Text
								style={[
									styles.storyButtonText,
									!hasNext && styles.storyButtonTextDisabled,
								]}
							>
								Next
							</Text>

							<Ionicons
								name="chevron-forward"
								size={20}
								color={hasNext ? "#E8DCCB" : "#655B51"}
							/>
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#11100E",
		flex: 1,
	},

	content: {
		minHeight: "100%",
		paddingHorizontal: 20,
		paddingBottom: 50,
	},

	topBar: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 14,
	},

	exitButton: {
		alignItems: "center",
		flexDirection: "row",
		paddingVertical: 8,
	},

	exitText: {
		color: "#C8BBAA",
		fontSize: 12,
		fontWeight: "600",
		marginLeft: 4,
	},

	modeLabel: {
		alignItems: "center",
		flexDirection: "row",
	},

	modeEmoji: {
		fontSize: 14,
	},

	modeText: {
		color: "#8F8375",
		fontSize: 9,
		fontWeight: "800",
		letterSpacing: 1.3,
		marginLeft: 5,
	},

	campfireArea: {
		alignItems: "center",
		height: 245,
		justifyContent: "flex-end",
		overflow: "hidden",
		position: "relative",
	},

	moon: {
		backgroundColor: "#D8D0BA",
		borderRadius: 35,
		height: 52,
		opacity: 0.75,
		position: "absolute",
		right: 30,
		top: 20,
		width: 52,
	},

	stars: {
		height: 150,
		left: 0,
		position: "absolute",
		right: 0,
		top: 0,
	},

	star: {
		color: "#C8BBAA",
		fontSize: 30,
		opacity: 0.6,
		position: "absolute",
	},

	starOne: {
		left: "12%",
		top: 35,
	},

	starTwo: {
		left: "34%",
		top: 70,
	},

	starThree: {
		right: "28%",
		top: 40,
	},

	starFour: {
		right: "10%",
		top: 95,
	},

	fireGlow: {
		backgroundColor: "#B85F2C",
		borderRadius: 100,
		bottom: 5,
		height: 130,
		opacity: 0.16,
		position: "absolute",
		width: 170,
	},

	fire: {
		fontSize: 82,
		marginBottom: 10,
		textShadowColor: "#C15F28",
		textShadowOffset: {
			width: 0,
			height: 0,
		},
		textShadowRadius: 25,
	},

	parkLabel: {
		bottom: 0,
		color: "#8F8375",
		fontSize: 9,
		fontWeight: "800",
		letterSpacing: 2,
		position: "absolute",
	},

	storyHeader: {
		alignItems: "center",
		marginTop: 20,
	},

	category: {
		color: "#B87942",
		fontSize: 9,
		fontWeight: "800",
		letterSpacing: 1.5,
		textAlign: "center",
	},

	title: {
		color: "#E8DCCB",
		fontSize: 27,
		fontWeight: "700",
		lineHeight: 34,
		marginTop: 7,
		textAlign: "center",
	},

	storyDivider: {
		backgroundColor: "#40372F",
		height: 1,
		marginVertical: 22,
	},

	storyText: {
		color: "#D0C4B5",
		fontSize: 15,
		lineHeight: 27,
	},

	navigationArea: {
		marginTop: 35,
	},

	progress: {
		color: "#756A5F",
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 1,
		textAlign: "center",
	},

	navigationButtons: {
		flexDirection: "row",
		gap: 10,
		marginTop: 12,
	},

	storyButton: {
		alignItems: "center",
		borderColor: "#4A4139",
		borderRadius: 10,
		borderWidth: 1,
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
		minHeight: 48,
		paddingHorizontal: 12,
	},

	storyButtonDisabled: {
		borderColor: "#292521",
	},

	storyButtonText: {
		color: "#E8DCCB",
		fontSize: 12,
		fontWeight: "700",
		marginHorizontal: 5,
	},

	storyButtonTextDisabled: {
		color: "#655B51",
	},

	closeButton: {
		alignItems: "center",
		height: 48,
		justifyContent: "center",
		position: "absolute",
		right: 12,
		top: 12,
		width: 48,
		zIndex: 10,
	},

	errorText: {
		color: "#C8BBAA",
		fontSize: 15,
		lineHeight: 23,
		marginHorizontal: 30,
		textAlign: "center",
	},

	loadingState: {
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
	},

	loadingFire: {
		fontSize: 54,
	},

	loadingTitle: {
		color: "#C8BBAA",
		fontSize: 14,
		fontWeight: "700",
		marginTop: 12,
	},
});
