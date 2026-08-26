import {
	ScrollView,
	View,
	Text,
	Pressable,
	TextInput,
	StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useState, useCallback } from "react";

import theme from "../constants/theme";
import SectionHeader from "../components/SectionHeader";
import ParkCard from "../components/ParkCard";

import { getParks } from "../api/npsApi";

// provides the main discovery hub for parks, trails, campgrounds, and activities
export default function ExploreScreen() {
	const navigation = useNavigation();

	const [searchQuery, setSearchQuery] = useState("");
	const [featuredPark, setFeaturedPark] = useState(null);
	const [loadingPark, setLoadingPark] = useState(true);
	const [parkError, setParkError] = useState(null);

	// loads a random featured park whenever the explore screen becomes active
	useFocusEffect(
		useCallback(() => {
			let active = true;

			async function loadFeaturedPark() {
				try {
					setLoadingPark(true);
					setParkError(null);

					const response = await getParks({
						limit: 50,
					});

					const parks = response.data || [];

					if (!active) {
						return;
					}

					if (parks.length === 0) {
						setFeaturedPark(null);
						return;
					}

					// chooses a random park from the nps results
					const randomIndex = Math.floor(
						Math.random() * parks.length,
					);

					setFeaturedPark(parks[randomIndex]);
				} catch (error) {
					// keeps the rest of the explore page usable if the api request fails
					console.error("NPS API error:", error);

					if (active) {
						setParkError("Unable to load the featured park");
					}
				} finally {
					if (active) {
						setLoadingPark(false);
					}
				}
			}

			loadFeaturedPark();

			return () => {
				active = false;
			};
		}, []),
	);

	// opens the selected featured park using the park id supplied by the nps api
	const handleParkPress = () => {
		if (!featuredPark) {
			return;
		}

		navigation.navigate("ParkDetail", {
			parkId: featuredPark.id,
		});
	};

	// opens the global explore search when the user submits a query
	const handleSearchSubmit = () => {
		const query = searchQuery.trim();

		if (!query) {
			return;
		}

		navigation.navigate("ExploreSearch", {
			query,
		});
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				style={styles.screen}
				contentContainerStyle={styles.content}
				contentInsetAdjustmentBehavior="automatic"
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<Text style={styles.eyebrow}>TRAIL TALES</Text>

					<Text style={styles.title}>Where will you wander?</Text>

					<Text style={styles.subtitle}>
						Discover national parks, trails, and stories from the
						wild.
					</Text>
				</View>

				{/* allows users to search across the explore content */}
				<View style={styles.searchBar}>
					<Text style={styles.searchIcon}>⌕</Text>

					<TextInput
						value={searchQuery}
						onChangeText={setSearchQuery}
						onSubmitEditing={handleSearchSubmit}
						placeholder="Search parks"
						placeholderTextColor={theme.colors.earth}
						style={styles.searchInput}
						returnKeyType="search"
						accessibilityLabel="search parks"
					/>

					{searchQuery.length > 0 ? (
						<Pressable
							onPress={() => {
								// clears the search field without leaving the explore page
								setSearchQuery("");
							}}
							style={styles.clearButton}
							accessibilityRole="button"
							accessibilityLabel="clear search"
						>
							<Text style={styles.clearText}>×</Text>
						</Pressable>
					) : null}
				</View>

				<View style={styles.section}>
					<SectionHeader
						title="Featured park"
						actionLabel="See all"
						onActionPress={() => {
							// opens the complete national park directory
							navigation.navigate("ParkDirectory");
						}}
					/>

					{loadingPark ? (
						<View style={styles.featuredState}>
							<Text style={styles.featuredStateText}>
								Loading featured park...
							</Text>
						</View>
					) : parkError ? (
						<View style={styles.featuredState}>
							<Text style={styles.featuredStateText}>
								{parkError}
							</Text>
						</View>
					) : featuredPark ? (
						<ParkCard
							name={featuredPark.name}
							location={
								featuredPark.states?.join(" · ") ||
								"United States"
							}
							description={featuredPark.description}
							image={featuredPark.images?.[0]?.url}
							onPress={handleParkPress}
						/>
					) : (
						<View style={styles.featuredState}>
							<Text style={styles.featuredStateText}>
								No featured park available
							</Text>
						</View>
					)}
				</View>

				<View style={styles.section}>
					<SectionHeader title="Explore" />

					<View style={styles.categoryGrid}>
						<CategoryButton
							label="National Parks"
							icon="◇"
							onPress={() => {
								// opens the national park directory
								navigation.navigate("ParkDirectory");
							}}
						/>

						<CategoryButton
							label="Trails"
							icon="⌁"
							onPress={() => {
								// opens the complete trail directory
								navigation.navigate("TrailDirectory");
							}}
						/>

						<CategoryButton
							label="Campgrounds"
							icon="⌂"
							onPress={() => {
								// opens the complete campground directory
								navigation.navigate("CampgroundDirectory");
							}}
						/>

						<CategoryButton
							label="Visitor Centers"
							icon="✦"
							onPress={() => {
								// opens the activity discovery directory
								navigation.navigate("VisitorCenterDirectory");
							}}
						/>
					</View>
				</View>

				{/* <View style={styles.section}>
                    <SectionHeader title="Your journey" />

                    <View style={styles.journeyCard}>
                        <Text style={styles.journeyTitle}>
                            Start your passport
                        </Text>

                        <Text style={styles.journeyBody}>
                            Visit a national park and collect your first
                            Trail Tales stamp.
                        </Text>

                        <Pressable
                            style={styles.journeyButton}
                            onPress={() => {
                                // opens the passport after i make it
                                navigation.navigate(
                                    'Passport'
                                )
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="view passport"
                        >
                            <Text style={styles.journeyButtonText}>
                                View passport
                            </Text>
                        </Pressable>
                    </View>
                </View> */}
			</ScrollView>
		</SafeAreaView>
	);
}

function CategoryButton({ label, icon, onPress }) {
	return (
		<Pressable
			style={({ pressed }) => [
				styles.categoryButton,
				pressed && styles.pressed,
			]}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={label}
		>
			{/* simple symbols keep the explore page lightweight while the icon system is finalized */}
			<Text style={styles.categoryIcon}>{icon}</Text>

			<Text style={styles.categoryLabel}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	screen: {
		backgroundColor: theme.colors.parchment,
		flex: 1,
	},

	safeArea: {
		backgroundColor: theme.colors.parchment,
		flex: 1,
	},

	content: {
		padding: theme.spacing.lg,
		paddingTop: theme.spacing.xxl,
		paddingBottom: theme.spacing.xxxl,
	},

	header: {
		marginBottom: theme.spacing.lg,
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
		marginTop: theme.spacing.sm,
	},

	subtitle: {
		color: theme.colors.earth,
		fontSize: theme.typography.body.fontSize,
		lineHeight: theme.typography.body.lineHeight,
		marginTop: theme.spacing.sm,
	},

	searchBar: {
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		flexDirection: "row",
		minHeight: 52,
		paddingHorizontal: theme.spacing.md,
	},

	searchIcon: {
		color: theme.colors.forest,
		fontSize: 24,
		marginRight: theme.spacing.sm,
	},

	searchInput: {
		color: theme.colors.ink,
		flex: 1,
		fontSize: theme.typography.bodySmall.fontSize,
		minHeight: 48,
	},

	clearButton: {
		alignItems: "center",
		height: 32,
		justifyContent: "center",
		width: 32,
	},

	clearText: {
		color: theme.colors.earth,
		fontSize: 22,
	},

	section: {
		marginTop: theme.spacing.xxxl,
	},

	featuredState: {
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		minHeight: 110,
		justifyContent: "center",
		padding: theme.spacing.lg,
		...theme.shadows.card,
	},

	featuredStateText: {
		color: theme.colors.earth,
		fontSize: theme.typography.bodySmall.fontSize,
		textAlign: "center",
	},

	categoryGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.md,
	},

	categoryButton: {
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		justifyContent: "center",
		minHeight: 110,
		padding: theme.spacing.md,
		width: "47%",
		...theme.shadows.card,
	},

	pressed: {
		opacity: 0.8,
	},

	categoryIcon: {
		color: theme.colors.forest,
		fontSize: 28,
		marginBottom: theme.spacing.sm,
	},

	categoryLabel: {
		color: theme.colors.ink,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "600",
		textAlign: "center",
	},

	journeyCard: {
		backgroundColor: theme.colors.forest,
		borderRadius: theme.radii.lg,
		padding: theme.spacing.lg,
	},

	journeyTitle: {
		color: theme.colors.parchment,
		fontSize: theme.typography.heading.fontSize,
		fontWeight: theme.typography.heading.fontWeight,
		lineHeight: theme.typography.heading.lineHeight,
	},

	journeyBody: {
		color: theme.colors.canvas,
		fontSize: theme.typography.body.fontSize,
		lineHeight: theme.typography.body.lineHeight,
		marginTop: theme.spacing.sm,
	},

	journeyButton: {
		alignSelf: "flex-start",
		backgroundColor: theme.colors.parchment,
		borderRadius: theme.radii.sm,
		marginTop: theme.spacing.lg,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
	},

	journeyButtonText: {
		color: theme.colors.forest,
		fontSize: theme.typography.bodySmall.fontSize,
		fontWeight: "700",
	},
});
