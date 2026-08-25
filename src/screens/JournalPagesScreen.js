import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import theme from "../constants/theme";

import { useTrips } from "../context/TripContext";

// formats a trip date for the journal page preview
function formatJournalDate(date) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// displays all scrapbook pages belonging to one trip
export default function JournalPagesScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();

  const { tripId } = route.params;

  const { trips, createJournalPage } = useTrips();

  const trip = trips.find((item) => item.id === tripId);

  if (!trip) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>Trip could not be found.</Text>
      </View>
    );
  }

  const pages = trip.journal?.pages || [];

  const handleCreatePage = async () => {
    try {
      // creates the page in supabase and updates local trip state
      const page = await createJournalPage(trip.id);

      // only navigates after the database successfully creates the page
      navigation.navigate("JournalPage", {
        tripId: trip.id,

        pageId: page.id,
      });
    } catch (error) {
      console.error("create journal page error:", error);

      Alert.alert(
        "Unable to create page",
        "There was a problem creating your scrapbook page. Please try again.",
      );
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="go back"
          >
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.eyebrow}>SCRAPBOOK</Text>

            <Text style={styles.headerTitle} numberOfLines={1}>
              {trip.name}
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {pages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📖</Text>

            <Text style={styles.emptyTitle}>Your scrapbook is empty</Text>

            <Text style={styles.emptyDescription}>
              Start a page and fill it with the memories from this adventure.
            </Text>
          </View>
        ) : (
          <View style={styles.pageList}>
            {pages.map((page, index) => {
              const pageNumber = page.pageNumber || index + 1;

              return (
                <Pressable
                  key={page.id}
                  style={styles.pageCard}
                  onPress={() =>
                    navigation.navigate("JournalPage", {
                      tripId: trip.id,

                      pageId: page.id,
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`open journal page ${pageNumber}`}
                >
                  <View style={styles.pagePaper}>
                    <Text style={styles.pageNumber}>PAGE {pageNumber}</Text>

                    <Text style={styles.pageTitle} numberOfLines={2}> {page.title || "Scrapbook Page"} </Text>

                    <Text style={styles.pageDate}>
                      {formatJournalDate(trip.startDate)}
                    </Text>

                    <Text style={styles.pageElementCount}>
                      {page.elements?.length || 0} elements
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          style={styles.newPageButton}
          onPress={handleCreatePage}
          accessibilityRole="button"
          accessibilityLabel="create new journal page"
        >
          <Text style={styles.newPageIcon}>+</Text>

          <Text style={styles.newPageText}>New scrapbook page</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.parchment,
    flex: 1,
  },

  content: {
    paddingBottom: 100,
    paddingHorizontal: theme.spacing.lg,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  backButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  backButtonText: {
    color: theme.colors.forest,
    fontSize: 36,
    fontWeight: "300",
    lineHeight: 38,
  },

  headerCenter: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },

  headerSpacer: {
    width: 42,
  },

  eyebrow: {
    color: theme.colors.forest,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  headerTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },

  pageList: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },

  pageCard: {
    transform: [
      {
        rotate: "-1deg",
      },
    ],
  },

  pagePaper: {
    backgroundColor: theme.colors.canvas,
    borderColor: theme.colors.sage,
    borderWidth: 1,
    minHeight: 220,
    padding: theme.spacing.xl,
    ...theme.shadows.card,
  },

  pageNumber: {
    color: theme.colors.earth,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  pageTitle: {
    color: theme.colors.ink,
    fontSize: 27,
    fontWeight: "700",
    marginTop: theme.spacing.lg,
  },

  pageDate: {
    color: theme.colors.earth,
    fontSize: 12,
    marginTop: theme.spacing.sm,
  },

  pageElementCount: {
    color: theme.colors.forest,
    fontSize: 11,
    marginTop: theme.spacing.xl,
  },

  emptyState: {
    alignItems: "center",
    backgroundColor: theme.colors.canvas,
    borderColor: theme.colors.sage,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.xl,
  },

  emptyIcon: {
    fontSize: 48,
  },

  emptyTitle: {
    color: theme.colors.ink,
    fontSize: 20,
    fontWeight: "700",
    marginTop: theme.spacing.md,
    textAlign: "center",
  },

  emptyDescription: {
    color: theme.colors.earth,
    fontSize: 13,
    lineHeight: 20,
    marginTop: theme.spacing.xs,
    textAlign: "center",
  },

  newPageButton: {
    alignItems: "center",
    backgroundColor: theme.colors.forest,
    borderRadius: theme.radii.md,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.xl,
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
  },

  newPageIcon: {
    color: theme.colors.parchment,
    fontSize: 25,
    fontWeight: "300",
    marginRight: theme.spacing.sm,
  },

  newPageText: {
    color: theme.colors.parchment,
    fontSize: 14,
    fontWeight: "700",
  },

  errorText: {
    color: theme.colors.earth,
    fontSize: 15,
    margin: theme.spacing.xl,
    textAlign: "center",
  },
});
