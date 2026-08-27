import {
	View,
	Text,
	Pressable,
	TextInput,
	ScrollView,
	StyleSheet,
	Keyboard,
} from "react-native";

import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../constants/theme";
import { useWildlifeReports } from "../context/WildlifeReportContext";

// provides a form for creating a user-submitted wildlife report
// reports are saved to supabase through the wildlife report context

export default function ReportWildlifeScreen({ route, navigation }) {
	const insets = useSafeAreaInsets();

	// provides access to the shared wildlife report state
	const { addReport } = useWildlifeReports();

	const { parkId, trailId = null, campgroundId = null } = route.params || {};

	const [species, setSpecies] = useState("");
	const [location, setLocation] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async () => {
		// requires the main information needed to create a useful report
		if (!species.trim() || !location.trim()) {
			setError("Please enter the wildlife species and where you saw it.");

			return;
		}

		try {
			setError("");
			setSubmitting(true);

			// saves the report to supabase through the shared report service
			await addReport({
				parkId,
				trailId,
				campgroundId,
				species: species.trim(),
				location: location.trim(),
				description: description.trim(),
			});

			Keyboard.dismiss();

			// returns to the previous screen after the report has been successfully saved
			navigation.goBack();
		} catch (submitError) {
			console.error("create wildlife report error:", submitError);

			setError("Unable to submit your report. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<View style={styles.screen}>
			<ScrollView
				contentContainerStyle={[
					styles.content,
					{
						paddingTop: insets.top + theme.spacing.sm,
					},
				]}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<Pressable
						style={styles.backButton}
						onPress={() => {
							// dismisses the keyboard before returning to the previous screen
							Keyboard.dismiss();
							navigation.goBack();
						}}
						accessibilityRole="button"
						accessibilityLabel="go back"
					>
						<Text style={styles.backButtonText}>‹</Text>
					</Pressable>

					<Text style={styles.headerTitle}>Report Wildlife</Text>

					<View style={styles.headerSpacer} />
				</View>

				<View style={styles.intro}>
					<Text style={styles.eyebrow}>USER REPORT</Text>

					<Text style={styles.title}>Report a sighting</Text>

					<Text style={styles.description}>
						Share a wildlife sighting you observed on your visit.
					</Text>

					<View style={styles.notice}>
						<Text style={styles.noticeTitle}>
							TrailTales community report
						</Text>

						<Text style={styles.noticeText}>
							This report is submitted by a TrailTales user and is
							not official National Park Service information.
						</Text>
					</View>
				</View>

				<View style={styles.form}>
					<Text style={styles.label}>What did you see?</Text>

					<TextInput
						value={species}
						onChangeText={setSpecies}
						placeholder="e.g. Black Bear"
						placeholderTextColor={theme.colors.earth}
						style={styles.input}
						accessibilityLabel="wildlife species"
						autoCapitalize="words"
					/>

					<Text style={[styles.label, styles.spacedLabel]}>
						Where did you see it?
					</Text>

					<TextInput
						value={location}
						onChangeText={setLocation}
						placeholder="e.g. Near the campground entrance"
						placeholderTextColor={theme.colors.earth}
						style={styles.input}
						accessibilityLabel="wildlife location"
					/>

					<Text style={[styles.label, styles.spacedLabel]}>
						Tell us more
					</Text>

					<TextInput
						value={description}
						onChangeText={setDescription}
						placeholder="Describe what you saw..."
						placeholderTextColor={theme.colors.earth}
						style={[styles.input, styles.descriptionInput]}
						multiline
						textAlignVertical="top"
						accessibilityLabel="wildlife description"
					/>

					{error ? (
						<Text style={styles.errorText}>{error}</Text>
					) : null}

					<Pressable
						style={({ pressed }) => [
							styles.submitButton,
							pressed && styles.pressed,
						]}
						onPress={handleSubmit}
						disabled={submitting}
						accessibilityRole="button"
						accessibilityLabel="submit wildlife report"
					>
						<Text style={styles.submitButtonText}>
							{submitting ? "Submitting..." : "Submit report"}
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: theme.colors.parchment,
	},

	content: {
		paddingBottom: theme.spacing.xxxl,
	},

	header: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: theme.spacing.lg,
	},

	backButton: {
		alignItems: "center",
		height: 44,
		justifyContent: "center",
		width: 44,
	},

	backButtonText: {
		color: theme.colors.ink,
		fontSize: 30,
		lineHeight: 32,
	},

	headerTitle: {
		color: theme.colors.ink,
		fontSize: 17,
		fontWeight: "700",
	},

	headerSpacer: {
		height: 44,
		width: 44,
	},

	intro: {
		paddingHorizontal: theme.spacing.lg,
		paddingTop: theme.spacing.xl,
	},

	eyebrow: {
		color: theme.colors.forest,
		fontSize: 10,
		fontWeight: "800",
		letterSpacing: 1.2,
	},

	title: {
		color: theme.colors.ink,
		fontSize: 30,
		fontWeight: "800",
		marginTop: theme.spacing.xs,
	},

	description: {
		color: theme.colors.earth,
		fontSize: 13,
		lineHeight: 20,
		marginTop: theme.spacing.sm,
	},

	notice: {
		backgroundColor: theme.colors.canvas,
		borderRadius: theme.radii.md,
		marginTop: theme.spacing.lg,
		padding: theme.spacing.md,
	},

	noticeTitle: {
		color: theme.colors.forest,
		fontSize: 12,
		fontWeight: "700",
	},

	noticeText: {
		color: theme.colors.earth,
		fontSize: 11,
		lineHeight: 17,
		marginTop: theme.spacing.xs,
	},

	form: {
		paddingHorizontal: theme.spacing.lg,
		paddingTop: theme.spacing.xl,
	},

	label: {
		color: theme.colors.ink,
		fontSize: 12,
		fontWeight: "700",
		marginBottom: theme.spacing.xs,
	},

	spacedLabel: {
		marginTop: theme.spacing.lg,
	},

	input: {
		backgroundColor: theme.colors.canvas,
		borderColor: theme.colors.sage,
		borderRadius: theme.radii.sm,
		borderWidth: 1,
		color: theme.colors.ink,
		fontSize: 14,
		minHeight: 48,
		paddingHorizontal: theme.spacing.md,
	},

	descriptionInput: {
		minHeight: 120,
		paddingTop: theme.spacing.md,
	},

	errorText: {
		color: theme.colors.earth,
		fontSize: 11,
		marginTop: theme.spacing.sm,
	},

	submitButton: {
		alignItems: "center",
		backgroundColor: theme.colors.forest,
		borderRadius: theme.radii.sm,
		marginTop: theme.spacing.xl,
		paddingVertical: theme.spacing.md,
	},

	pressed: {
		opacity: 0.8,
	},

	submitButtonText: {
		color: theme.colors.parchment,
		fontSize: 13,
		fontWeight: "700",
	},
});
