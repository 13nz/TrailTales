import {
    ScrollView,
    View,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

import theme from '../constants/theme'
import SectionHeader from '../components/SectionHeader'
import ParkCard from '../components/ParkCard'

export default function ExploreScreen() {
    const navigation = useNavigation()
    const handleParkPress = () => {
        // this temporary handler will eventually navigate to the selected park's detail screen
        console.log('park selected')
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.screen}
                contentContainerStyle={styles.content}
                contentInsetAdjustmentBehavior="automatic"
                showsVerticalScrollIndicator={false}
            >
            
                <View style={styles.header}>
                    <Text style={styles.eyebrow}>
                        TRAIL TALES
                    </Text>

                    <Text style={styles.title}>
                        Where will you wander?
                    </Text>

                    <Text style={styles.subtitle}>
                        Discover national parks, trails, and stories
                        from the wild.
                    </Text>
                </View>

                {/* search will eventually query the national parks service dataset */}
                <Pressable
                    style={styles.searchBar}
                    accessibilityRole="button"
                >
                    <Text style={styles.searchIcon}>⌕</Text>

                    <Text style={styles.searchPlaceholder}>
                        Search parks, trails, and places
                    </Text>
                </Pressable>

                <View style={styles.section}>
                    <SectionHeader
                        title="Featured park"
                        actionLabel="See all"
                        onActionPress={() => {
                            // opens the complete national park directory from the explore landing page
                            navigation.navigate('ParkDirectory')
                        }}
                    />

                    <ParkCard
                        name="Great Smoky Mountains"
                        location="Tennessee · North Carolina"
                        description="Explore mist-covered mountains, forest trails, wildlife, and the stories connected to one of America's most visited national parks."
                        onPress={handleParkPress}
                    />
                </View>

                <View style={styles.section}>
                    <SectionHeader
                        title="Explore"
                    />

                    <View style={styles.categoryGrid}>
                        <CategoryButton
                            label="National Parks"
                            icon="◇"
                            onPress={() => {
                                // provides a second entry point to the national park directory
                                navigation.navigate('ParkDirectory')
                            }}
                        />

                        <CategoryButton
                            label="Trails"
                            icon="⌁"
                        />

                        <CategoryButton
                            label="Campgrounds"
                            icon="⌂"
                        />

                        <CategoryButton
                            label="Activities"
                            icon="✦"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <SectionHeader
                        title="Your journey"
                    />

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
                        >
                            <Text style={styles.journeyButtonText}>
                                View passport
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
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
            {/* simple placeholder symbols will be replaced with a consistent icon set later */}
            <Text style={styles.categoryIcon}>
                {icon}
            </Text>

            <Text style={styles.categoryLabel}>
                {label}
            </Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.parchment,
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
        fontWeight: '700',
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
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.md,
        flexDirection: 'row',
        minHeight: 52,
        paddingHorizontal: theme.spacing.md,
    },

    searchIcon: {
        color: theme.colors.forest,
        fontSize: 24,
        marginRight: theme.spacing.sm,
    },

    searchPlaceholder: {
        color: theme.colors.earth,
        fontSize: theme.typography.bodySmall.fontSize,
    },

    section: {
        marginTop: theme.spacing.xxxl,
    },

    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
    },

    categoryButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.md,
        minHeight: 110,
        justifyContent: 'center',
        padding: theme.spacing.md,
        width: '47%',
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
        fontWeight: '600',
        textAlign: 'center',
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
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.parchment,
        borderRadius: theme.radii.sm,
        marginTop: theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },

    journeyButtonText: {
        color: theme.colors.forest,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '700',
    },
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.parchment,
    },
})