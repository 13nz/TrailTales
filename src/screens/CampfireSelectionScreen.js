import React, { useEffect, useState } from "react";

import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getParkByCode, getAllParks } from "../api/npsApi";

import {
	getCampfireLoreEntries,
	getAllCampfireLoreEntries,
} from "../services/lore";

// displays campfire stories either for one park or for all national parks
export default function CampfireSelectionScreen({ route, navigation }) {
	const insets = useSafeAreaInsets();

	const { parkId } = route.params || {};

	const [park, setPark] = useState(null);

	const [campfireStories, setCampfireStories] = useState([]);

	const [loading, setLoading] = useState(true);

	const [error, setError] = useState(null);

    // stores the cached national parks so global campfire stories can show park names
    const [parks, setParks] = useState([]);

	/*
	 * loads campfire stories either for one park or for
	 * every park when no park id was provided.
	 *
	 * when a park id exists, the park itself is also loaded
	 * so the existing park-specific header can remain unchanged.
	 */
	useEffect(() => {
		let active = true;

		async function loadCampfireSelection() {
			try {
				setLoading(true);
				setError(null);

				const storiesPromise = parkId
                    ? getCampfireLoreEntries(parkId)
                    : getAllCampfireLoreEntries();

                const parkPromise = parkId
                    ? getParkByCode(parkId)
                    : Promise.resolve(null);

                const parksPromise = parkId
                    ? Promise.resolve([])
                    : getAllParks();

                const [stories, apiPark, apiParks] = await Promise.all([
                    storiesPromise,
                    parkPromise,
                    parksPromise,
                ]);

                if (!active) {
                    return;
                }

                setPark(apiPark);
                setParks(apiParks || []);

                setCampfireStories(
                    (stories || []).filter(
                        (entry) =>
                            entry.campfire_eligible &&
                            entry.entry_type === "story" &&
                            entry.campfire_content,
                    ),
                );
			} catch (loadError) {
				console.error("campfire selection load error:", loadError);

				if (active) {
					setPark(null);
					setCampfireStories([]);
					setError("Unable to load campfire stories");
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		}

		loadCampfireSelection();

		return () => {
			active = false;
		};
	}, [parkId]);

	/*
	 * converts database category ids into the same uppercase
	 * labels used by the campfire selection ui.
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
	 * supports lore entries that belong to multiple categories.
	 */
	const getCategoriesText = (categories) => {
		if (!Array.isArray(categories) || categories.length === 0) {
			return "LORE";
		}

		return categories
			.map((category) => getCategoryLabel(category))
			.join(" · ");
	};

    // finds the readable national park name for a lore entry's nps park code
    const getStoryParkName = (story) => {
        if (park) {
            return park.name;
        }

        const matchingPark = parks.find(
            (item) => item.id === story.park_code,
        );

        return matchingPark?.name || story.park_code?.toUpperCase();
    };

	/*
	 * opens the selected story inside the immersive
	 * campfire experience.
	 *
	 * the story's own park_code is used so global campfire
	 * mode can correctly identify the park for each story.
	 */
	const openStory = (story) => {
		const storyParkId = story.park_code || parkId;

		navigation.navigate("CampfireStory", {
			parkId: storyParkId,
			loreId: story.id,
		});
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
					<Text style={styles.loadingFire}>🔥</Text>

					<Text style={styles.loadingTitle}>
						Gathering stories...
					</Text>
				</View>
			</View>
		);
	}

	if (error) {
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
					style={styles.errorBackButton}
					onPress={() => navigation.goBack()}
					accessibilityRole="button"
					accessibilityLabel="go back"
				>
					<Ionicons name="chevron-back" size={22} color="#E7D8C5" />

					<Text style={styles.backText}>Back</Text>
				</Pressable>

				<View style={styles.errorState}>
					<Text style={styles.errorFire}>🔥</Text>

					<Text style={styles.errorTitle}>
						Unable to load stories
					</Text>

					<Text style={styles.errorText}>{error}</Text>
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
			<FlatList
				data={campfireStories}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<>
						<View style={styles.header}>
							<Pressable
								onPress={() => navigation.goBack()}
								style={styles.backButton}
								accessibilityRole="button"
								accessibilityLabel="leave campfire story selection"
							>
								<Ionicons
									name="chevron-back"
									size={22}
									color="#E7D8C5"
								/>

								<Text style={styles.backText}>
									{park ? park.name : "Parks"}
								</Text>
							</Pressable>

							<Text style={styles.fire}>🔥</Text>

							<Text style={styles.title}>Campfire</Text>

							<Text style={styles.subtitle}>
								{park
									? `Stories from ${park.name}`
									: "Stories from the national parks"}
							</Text>
						</View>

						<View style={styles.divider} />

						<Text style={styles.sectionTitle}>Choose a story</Text>
					</>
				}
				renderItem={({ item }) => (
					<Pressable
						style={styles.storyCard}
						onPress={() => openStory(item)}
						accessibilityRole="button"
						accessibilityLabel={`hear ${
							item.campfire_title || item.title
						}`}
					>
						<View style={styles.cardContent}>
							<Text style={styles.category}>
								{getCategoriesText(item.categories)}
							</Text>

							<Text style={styles.storyTitle}>
								{item.campfire_title || item.title}
							</Text>

							<Text style={styles.summary}>{item.summary}</Text>

							{!park ? (
                                <Text style={styles.parkCode}>
                                    {getStoryParkName(item)}
                                </Text>
                            ) : null}
						</View>

						<View style={styles.arrow}>
							<Ionicons
								name="chevron-forward"
								size={20}
								color="#C09A67"
							/>
						</View>
					</Pressable>
				)}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Text style={styles.emptyFire}>🔥</Text>

						<Text style={styles.emptyTitle}>No stories yet</Text>

						<Text style={styles.emptyText}>
							More campfire stories will appear here as they are
							added.
						</Text>
					</View>
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#11100E",
		flex: 1,
	},

	content: {
		paddingHorizontal: 20,
		paddingBottom: 50,
	},

	header: {
		paddingTop: 10,
	},

	backButton: {
		alignItems: "center",
		flexDirection: "row",
		paddingVertical: 8,
	},

	errorBackButton: {
		alignItems: "center",
		flexDirection: "row",
		paddingHorizontal: 20,
		paddingVertical: 8,
	},

	backText: {
		color: "#C8BBAA",
		fontSize: 13,
		fontWeight: "600",
		marginLeft: 2,
	},

	fire: {
		fontSize: 42,
		marginTop: 28,
	},

	title: {
		color: "#F1E7D8",
		fontSize: 34,
		fontWeight: "800",
		marginTop: 5,
	},

	subtitle: {
		color: "#8F8375",
		fontSize: 13,
		marginTop: 4,
	},

	divider: {
		backgroundColor: "#39332D",
		height: 1,
		marginVertical: 24,
	},

	sectionTitle: {
		color: "#C8BBAA",
		fontSize: 12,
		fontWeight: "800",
		letterSpacing: 1,
		marginBottom: 12,
		textTransform: "uppercase",
	},

	storyCard: {
		alignItems: "center",
		backgroundColor: "#1B1916",
		borderColor: "#38322C",
		borderRadius: 14,
		borderWidth: 1,
		flexDirection: "row",
		marginBottom: 10,
		minHeight: 115,
		padding: 16,
	},

	cardContent: {
		flex: 1,
	},

	category: {
		color: "#B87942",
		fontSize: 9,
		fontWeight: "800",
		letterSpacing: 1.2,
	},

	storyTitle: {
		color: "#E9DED0",
		fontSize: 17,
		fontWeight: "750",
		lineHeight: 22,
		marginTop: 5,
	},

	summary: {
		color: "#8F8375",
		fontSize: 11,
		lineHeight: 17,
		marginTop: 5,
	},

	parkCode: {
		color: "#B87942",
		fontSize: 9,
		fontWeight: "700",
		letterSpacing: 1,
		marginTop: 7,
	},

	arrow: {
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 10,
	},

	loadingState: {
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
	},

	loadingFire: {
		fontSize: 52,
	},

	loadingTitle: {
		color: "#E9DED0",
		fontSize: 17,
		fontWeight: "700",
		marginTop: 16,
	},

	errorState: {
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 30,
	},

	errorFire: {
		fontSize: 48,
	},

	errorTitle: {
		color: "#E9DED0",
		fontSize: 18,
		fontWeight: "700",
		marginTop: 16,
	},

	errorText: {
		color: "#8F8375",
		fontSize: 13,
		marginTop: 8,
		textAlign: "center",
	},

	emptyState: {
		alignItems: "center",
		paddingVertical: 70,
	},

	emptyFire: {
		fontSize: 48,
	},

	emptyTitle: {
		color: "#E9DED0",
		fontSize: 18,
		fontWeight: "700",
		marginTop: 15,
	},

	emptyText: {
		color: "#8F8375",
		fontSize: 12,
		lineHeight: 18,
		marginTop: 7,
		textAlign: "center",
	},
});
