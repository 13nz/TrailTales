import {
	View,
	Text,
	TextInput,
	Pressable,
	FlatList,
	StyleSheet,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { useEffect, useMemo, useState } from "react";

import { getAllParks } from "../api/npsApi";

import { getLoreEntries } from "../services/lore";

import theme from "../constants/theme";

// displays searchable parks that have lore entries in the database
export default function LoreScreen({ navigation }) {
	const insets = useSafeAreaInsets();

	const [searchText, setSearchText] = useState("");

	// stores the national parks returned by the nps api
	const [parks, setParks] = useState([]);

	// stores the lore entries returned from supabase
	const [loreEntries, setLoreEntries] = useState([]);

	// controls the initial loading state
	const [loading, setLoading] = useState(true);

	// stores an error without crashing the screen
	const [error, setError] = useState(null);

	/*
	 * loads the cached national parks and lore entries.
	 *
	 * getAllParks() already uses the nps park cache, so this
	 * does not need to download the entire park list again.
	 */
	useEffect(() => {
		let active = true;

		async function loadLore() {
			try {
				setLoading(true);
				setError(null);

				const [apiParks, entries] = await Promise.all([
					getAllParks(),
					getLoreEntries(),
				]);

				if (!active) {
					return;
				}

				setParks(apiParks || []);

				setLoreEntries(entries || []);
			} catch (loadError) {
				console.error("lore load error:", loadError);

				if (active) {
					setParks([]);
					setLoreEntries([]);
					setError("Unable to load lore.");
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		}

		loadLore();

		return () => {
			active = false;
		};
	}, []);

	/*
	 * creates the park list from the nps parks that actually
	 * have at least one lore entry in supabase.
	 */
	const loreParks = useMemo(() => {
		const loreParkCodes = new Set(
			loreEntries.map((entry) => entry.park_code).filter(Boolean),
		);

		return parks
			.filter((park) => loreParkCodes.has(park.id))
			.map((park) => ({
				...park,

				// keeps the existing screen's subtitle area
				subtitle: park.fullName || park.name,

				// keeps the existing screen's region area
				region: park.states?.join(" · ") || "United States",
			}));
	}, [parks, loreEntries]);

	// filters parks locally after the api and database data are loaded
	const filteredParks = useMemo(() => {
		const normalizedSearch = searchText.trim().toLowerCase();

		if (!normalizedSearch) {
			return loreParks;
		}

		return loreParks.filter(
			(park) =>
				park.name?.toLowerCase().includes(normalizedSearch) ||
				park.subtitle?.toLowerCase().includes(normalizedSearch) ||
				park.region?.toLowerCase().includes(normalizedSearch),
		);
	}, [searchText, loreParks]);

	// opens the selected park so users can browse its lore categories
	const handleParkPress = (park) => {
		navigation.navigate("LorePark", {
			parkId: park.id,
		});
	};

    // opens global campfire mode with stories from every national park
    const handleCampfirePress = () => {
        navigation.navigate("CampfireSelection");
    };

	const renderPark = ({ item }) => (
		<Pressable
			style={styles.parkCard}
			onPress={() => handleParkPress(item)}
			accessibilityRole="button"
			accessibilityLabel={`open lore for ${item.name}`}
		>
			<View style={styles.parkIcon}>
				<Ionicons
					name="trail-sign"
					size={24}
					color={theme.colors.forest}
				/>
			</View>

			<View style={styles.parkInfo}>
				<Text style={styles.parkName}>{item.name}</Text>

				<Text style={styles.parkSubtitle}>{item.subtitle}</Text>

				<Text style={styles.parkRegion}>{item.region}</Text>
			</View>

			<Ionicons
				name="chevron-forward"
				size={20}
				color={theme.colors.earth}
			/>
		</Pressable>
	);

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
				data={filteredParks}
				keyExtractor={(item) => item.id}
				renderItem={renderPark}
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
				ListHeaderComponent={
					<>
						<View style={styles.header}>
							<Text style={styles.eyebrow}>TRAILTALES</Text>

							<Text style={styles.title}>Lore</Text>

							<Text style={styles.subtitle}>
								Stories, legends, and mysteries from the wild
							</Text>
						</View>

						<View style={styles.searchContainer}>
							<Ionicons
								name="search"
								size={20}
								color={theme.colors.earth}
							/>

							<TextInput
								value={searchText}
								onChangeText={setSearchText}
								placeholder="search parks..."
								placeholderTextColor={theme.colors.earth}
								style={styles.searchInput}
								returnKeyType="search"
								accessibilityLabel="search parks"
							/>

							{searchText.length > 0 ? (
								<Pressable
									onPress={() => setSearchText("")}
									accessibilityRole="button"
									accessibilityLabel="clear park search"
								>
									<Ionicons
										name="close-circle"
										size={20}
										color={theme.colors.earth}
									/>
								</Pressable>
							) : null}
						</View>

                        <Pressable
                            style={styles.campfireButton}
                            onPress={handleCampfirePress}
                            accessibilityRole="button"
                            accessibilityLabel="open campfire mode"
                        >
                            <View style={styles.campfireIcon}>
                                <Text style={styles.campfireEmoji}>🔥</Text>
                            </View>

                            <View style={styles.campfireInfo}>
                                <Text style={styles.campfireTitle}>
                                    Campfire Mode
                                </Text>

                                <Text style={styles.campfireSubtitle}>
                                    Gather around for stories from the parks
                                </Text>
                            </View>

                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={theme.colors.earth}
                            />
                        </Pressable>

						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>
								Explore a place
							</Text>

							<Text style={styles.sectionCount}>
								{filteredParks.length} parks
							</Text>
						</View>
					</>
				}
				ListEmptyComponent={
					loading ? (
						<View style={styles.emptyState}>
							<Ionicons
								name="leaf-outline"
								size={36}
								color={theme.colors.earth}
							/>

							<Text style={styles.emptyTitle}>
								Loading lore...
							</Text>

							<Text style={styles.emptyText}>
								Gathering stories from the national parks
							</Text>
						</View>
					) : error ? (
						<View style={styles.emptyState}>
							<Ionicons
								name="alert-circle-outline"
								size={36}
								color={theme.colors.earth}
							/>

							<Text style={styles.emptyTitle}>
								Unable to load lore
							</Text>

							<Text style={styles.emptyText}>{error}</Text>
						</View>
					) : (
						<View style={styles.emptyState}>
							<Ionicons
								name="search-outline"
								size={36}
								color={theme.colors.earth}
							/>

							<Text style={styles.emptyTitle}>
								No parks found
							</Text>

							<Text style={styles.emptyText}>
								Try searching for another park or region
							</Text>
						</View>
					)
				}
				showsVerticalScrollIndicator={false}
			/>
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
		paddingBottom: theme.spacing.xl,
	},

	header: {
		paddingTop: theme.spacing.lg,
		paddingBottom: theme.spacing.md,
	},

	eyebrow: {
		color: theme.colors.forest,
		fontSize: 10,
		fontWeight: "800",
		letterSpacing: 2,
	},

	title: {
		color: theme.colors.ink,
		fontSize: 34,
		fontWeight: "800",
		marginTop: theme.spacing.xs,
	},

	subtitle: {
		color: theme.colors.earth,
		fontSize: 14,
		lineHeight: 21,
		marginTop: theme.spacing.xs,
		maxWidth: 300,
	},

	searchContainer: {
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderColor: theme.colors.sage,
		borderRadius: theme.radii.md,
		borderWidth: 1,
		flexDirection: "row",
		minHeight: 50,
		paddingHorizontal: theme.spacing.md,
	},

	searchInput: {
		color: theme.colors.ink,
		flex: 1,
		fontSize: 14,
		marginLeft: theme.spacing.sm,
		paddingVertical: theme.spacing.sm,
	},

	sectionHeader: {
		alignItems: "baseline",
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: theme.spacing.xl,
		marginBottom: theme.spacing.sm,
	},

	sectionTitle: {
		color: theme.colors.ink,
		fontSize: 18,
		fontWeight: "700",
	},

	sectionCount: {
		color: theme.colors.earth,
		fontSize: 11,
	},

	parkCard: {
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderColor: theme.colors.sage,
		borderRadius: theme.radii.md,
		borderWidth: 1,
		flexDirection: "row",
		marginBottom: theme.spacing.sm,
		minHeight: 88,
		padding: theme.spacing.md,
	},

	parkIcon: {
		alignItems: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: 24,
		height: 48,
		justifyContent: "center",
		width: 48,
	},

	parkInfo: {
		flex: 1,
		marginHorizontal: theme.spacing.md,
	},

	parkName: {
		color: theme.colors.ink,
		fontSize: 16,
		fontWeight: "700",
	},

	parkSubtitle: {
		color: theme.colors.forest,
		fontSize: 11,
		fontWeight: "600",
		marginTop: 2,
	},

	parkRegion: {
		color: theme.colors.earth,
		fontSize: 11,
		marginTop: 4,
	},

	emptyState: {
		alignItems: "center",
		paddingVertical: theme.spacing.xl * 2,
	},

	emptyTitle: {
		color: theme.colors.ink,
		fontSize: 16,
		fontWeight: "700",
		marginTop: theme.spacing.md,
	},

	emptyText: {
		color: theme.colors.earth,
		fontSize: 12,
		marginTop: theme.spacing.xs,
		textAlign: "center",
	},

    campfireButton: {
        alignItems: "center",
        backgroundColor: theme.colors.forest,
        borderRadius: theme.radii.md,
        flexDirection: "row",
        marginTop: theme.spacing.md,
        minHeight: 76,
        padding: theme.spacing.md,
    },

    campfireIcon: {
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        borderRadius: 22,
        height: 44,
        justifyContent: "center",
        width: 44,
    },

    campfireEmoji: {
        fontSize: 23,
    },

    campfireInfo: {
        flex: 1,
        marginHorizontal: theme.spacing.md,
    },

    campfireTitle: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "800",
    },

    campfireSubtitle: {
        color: "rgba(255, 255, 255, 0.75)",
        fontSize: 11,
        lineHeight: 16,
        marginTop: 3,
    },
});
