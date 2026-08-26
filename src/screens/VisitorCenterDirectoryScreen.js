import {
	View,
	Text,
	Pressable,
	TextInput,
	FlatList,
	StyleSheet,
} from "react-native";

import { useEffect, useMemo, useState } from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import theme from "../constants/theme";

import { getAllParks, getVisitorCenters } from "../api/npsApi";

// provides a searchable directory of visitor centers across national parks
export default function VisitorCenterDirectoryScreen({ navigation }) {
	const insets = useSafeAreaInsets();

	const [searchQuery, setSearchQuery] = useState("");

	const [visitorCenters, setVisitorCenters] = useState([]);

	const [loadingVisitorCenters, setLoadingVisitorCenters] = useState(true);

	const [visitorCenterError, setVisitorCenterError] = useState(null);

	// loads visitor centers and attaches their national park names
	useEffect(() => {
		async function loadVisitorCenters() {
			try {
				setLoadingVisitorCenters(true);

				setVisitorCenterError(null);

				const [results, parks] = await Promise.all([
					getVisitorCenters(),
					getAllParks(),
				]);

				const parkNames = new Map(
					parks.map((park) => [park.id, park.name]),
				);

				const normalized = (results || []).map((visitorCenter) => ({
					...visitorCenter,
					parkName:
						parkNames.get(visitorCenter.parkId) ||
						visitorCenter.parkId,
				}));

				setVisitorCenters(normalized);
			} catch (error) {
				console.error("nps visitor center directory error:", error);

				setVisitorCenterError("Unable to load visitor centers");
			} finally {
				setLoadingVisitorCenters(false);
			}
		}

		loadVisitorCenters();
	}, []);

	// filters visitor centers by name, park, and description
	const filteredVisitorCenters = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		if (!query) {
			return visitorCenters;
		}

		return visitorCenters.filter(
			(visitorCenter) =>
				visitorCenter.name?.toLowerCase().includes(query) ||
				visitorCenter.parkName?.toLowerCase().includes(query) ||
				visitorCenter.description?.toLowerCase().includes(query),
		);
	}, [visitorCenters, searchQuery]);

	// opens the selected visitor center detail page
	const openVisitorCenter = (visitorCenter) => {
		navigation.navigate("VisitorCenterDetail", {
			visitorCenter: visitorCenter,
		});
	};

	if (loadingVisitorCenters) {
		return (
			<View
				style={[
					styles.screen,
					{
						paddingTop: insets.top,
					},
				]}
			>
				<DirectoryHeader navigation={navigation} />

				<View style={styles.emptyState}>
					<Text style={styles.emptyIcon}>🏛️</Text>

					<Text style={styles.emptyTitle}>
						Loading visitor centers...
					</Text>

					<Text style={styles.emptyText}>
						Getting visitor centers from the National Park Service.
					</Text>
				</View>
			</View>
		);
	}

	if (visitorCenterError) {
		return (
			<View
				style={[
					styles.screen,
					{
						paddingTop: insets.top,
					},
				]}
			>
				<DirectoryHeader navigation={navigation} />

				<View style={styles.emptyState}>
					<Text style={styles.emptyIcon}>⚠️</Text>

					<Text style={styles.emptyTitle}>
						Unable to load visitor centers
					</Text>

					<Text style={styles.emptyText}>
						Please try again later.
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View
			style={[
				styles.screen,
				{
					paddingTop: insets.top,
				},
			]}
		>
			<DirectoryHeader navigation={navigation} />

			<View style={styles.searchContainer}>
				<Ionicons
					name="search-outline"
					size={19}
					color={theme.colors.earth}
				/>

				<TextInput
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholder="Search visitor centers or parks"
					placeholderTextColor={theme.colors.earth}
					style={styles.searchInput}
					returnKeyType="search"
					accessibilityLabel="search visitor centers"
				/>

				{searchQuery.length > 0 ? (
					<Pressable
						onPress={() => setSearchQuery("")}
						style={styles.clearButton}
						accessibilityRole="button"
						accessibilityLabel="clear visitor center search"
					>
						<Ionicons
							name="close-circle"
							size={19}
							color={theme.colors.earth}
						/>
					</Pressable>
				) : null}
			</View>

			<View style={styles.resultHeader}>
				<Text style={styles.resultCount}>
					{filteredVisitorCenters.length}{" "}
					{filteredVisitorCenters.length === 1
						? "visitor center"
						: "visitor centers"}
				</Text>
			</View>

			<FlatList
				data={filteredVisitorCenters}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.list}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				renderItem={({ item }) => (
					<Pressable
						style={({ pressed }) => [
							styles.card,
							pressed && styles.pressed,
						]}
						onPress={() => openVisitorCenter(item)}
						accessibilityRole="button"
						accessibilityLabel={`open ${item.name}`}
					>
						<View style={styles.icon}>
							<Text style={styles.iconText}>🏛️</Text>
						</View>

						<View style={styles.info}>
							<Text style={styles.parkName}>
								{item.parkName || item.parkId}
							</Text>

							<Text style={styles.name} numberOfLines={2}>
								{item.name}
							</Text>

							{item.description ? (
								<Text
									style={styles.description}
									numberOfLines={2}
								>
									{item.description}
								</Text>
							) : null}
						</View>

						<Ionicons
							name="chevron-forward"
							size={20}
							color={theme.colors.earth}
						/>
					</Pressable>
				)}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Text style={styles.emptyIcon}>🏛️</Text>

						<Text style={styles.emptyTitle}>
							No visitor centers found
						</Text>

						<Text style={styles.emptyText}>
							Try searching for a different visitor center or
							park.
						</Text>
					</View>
				}
			/>
		</View>
	);
}

// renders the shared directory header
function DirectoryHeader({ navigation }) {
	return (
		<View style={styles.header}>
			<Pressable
				style={styles.backButton}
				onPress={() => navigation.goBack()}
				accessibilityRole="button"
				accessibilityLabel="go back to explore"
			>
				<Ionicons
					name="chevron-back"
					size={22}
					color={theme.colors.forest}
				/>

				<Text style={styles.backText}>Explore</Text>
			</Pressable>

			<Text style={styles.title}>Visitor Centers</Text>

			<Text style={styles.subtitle}>
				Find information centers across the parks
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		backgroundColor: theme.colors.parchment,
		flex: 1,
	},

	header: {
		paddingHorizontal: theme.spacing.lg,
		paddingTop: theme.spacing.sm,
	},

	backButton: {
		alignItems: "center",
		flexDirection: "row",
		marginBottom: theme.spacing.lg,
	},

	backText: {
		color: theme.colors.forest,
		fontSize: 13,
		fontWeight: "600",
		marginLeft: 2,
	},

	title: {
		color: theme.colors.ink,
		fontSize: 32,
		fontWeight: "800",
	},

	subtitle: {
		color: theme.colors.earth,
		fontSize: 14,
		marginTop: theme.spacing.xs,
	},

	searchContainer: {
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderColor: theme.colors.sage,
		borderRadius: theme.radii.md,
		borderWidth: 1,
		flexDirection: "row",
		marginHorizontal: theme.spacing.lg,
		marginTop: theme.spacing.lg,
		minHeight: 50,
		paddingHorizontal: theme.spacing.md,
	},

	searchInput: {
		color: theme.colors.ink,
		flex: 1,
		fontSize: 14,
		marginLeft: theme.spacing.sm,
		minHeight: 48,
	},

	clearButton: {
		alignItems: "center",
		justifyContent: "center",
		padding: 5,
	},

	resultHeader: {
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
	},

	resultCount: {
		color: theme.colors.earth,
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},

	list: {
		paddingHorizontal: theme.spacing.lg,
		paddingBottom: theme.spacing.xxxl,
	},

	card: {
		alignItems: "center",
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		flexDirection: "row",
		marginBottom: theme.spacing.sm,
		padding: theme.spacing.md,
		...theme.shadows.card,
	},

	pressed: {
		opacity: 0.8,
	},

	icon: {
		alignItems: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: 24,
		height: 48,
		justifyContent: "center",
		width: 48,
	},

	iconText: {
		fontSize: 21,
	},

	info: {
		flex: 1,
		marginHorizontal: theme.spacing.md,
	},

	parkName: {
		color: theme.colors.forest,
		fontSize: 9,
		fontWeight: "800",
		letterSpacing: 0.8,
		textTransform: "uppercase",
	},

	name: {
		color: theme.colors.ink,
		fontSize: 16,
		fontWeight: "700",
		marginTop: 3,
	},

	description: {
		color: theme.colors.earth,
		fontSize: 11,
		lineHeight: 16,
		marginTop: 4,
	},

	emptyState: {
		alignItems: "center",
		paddingHorizontal: theme.spacing.xl,
		paddingTop: 80,
	},

	emptyIcon: {
		fontSize: 42,
	},

	emptyTitle: {
		color: theme.colors.ink,
		fontSize: 18,
		fontWeight: "700",
		marginTop: theme.spacing.md,
	},

	emptyText: {
		color: theme.colors.earth,
		fontSize: 12,
		lineHeight: 18,
		marginTop: theme.spacing.xs,
		textAlign: "center",
	},
});
