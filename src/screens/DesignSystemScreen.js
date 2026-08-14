import {
    ScrollView,
    View,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native'

import theme from '../constants/theme'

export default function DesignSystemScreen() {
    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.content}
        >
            {/* this heading identifies the temporary screen used to evaluate the application's visual system */}
            <Text style={styles.eyebrow}>TRAIL TALES</Text>

            <Text style={styles.display}>Design System</Text>

            <Text style={styles.body}>
                National park exploration, personal memories, and stories
                from the wild.
            </Text>

            {/* the color section lets us evaluate the palette before using it throughout the application */}
            <View style={styles.section}>
                <Text style={styles.heading}>Colors</Text>

                <View style={styles.colorGrid}>
                    <ColorSwatch
                        name="Forest"
                        color={theme.colors.forest}
                    />

                    <ColorSwatch
                        name="Pine"
                        color={theme.colors.pine}
                    />

                    <ColorSwatch
                        name="Bark"
                        color={theme.colors.bark}
                    />

                    <ColorSwatch
                        name="Earth"
                        color={theme.colors.earth}
                    />

                    <ColorSwatch
                        name="Parchment"
                        color={theme.colors.parchment}
                    />

                    <ColorSwatch
                        name="Canvas"
                        color={theme.colors.canvas}
                    />

                    <ColorSwatch
                        name="Sage"
                        color={theme.colors.sage}
                    />

                    <ColorSwatch
                        name="Ember"
                        color={theme.colors.ember}
                    />
                </View>
            </View>

            {/* the typography section shows the hierarchy that will be reused throughout the application */}
            <View style={styles.section}>
                <Text style={styles.heading}>Typography</Text>

                <Text style={styles.display}>Explore the Wild</Text>

                <Text style={styles.title}>
                    Great Smoky Mountains
                </Text>

                <Text style={styles.subheading}>
                    A place worth wandering
                </Text>

                <Text style={styles.body}>
                    Discover trails, campgrounds, wildlife, activities,
                    and stories connected to the places you visit.
                </Text>

                <Text style={styles.label}>NATIONAL PARK</Text>

                <Text style={styles.caption}>
                    Updated from National Park Service information
                </Text>
            </View>

            {/* the button section establishes the primary and secondary actions used throughout the app */}
            <View style={styles.section}>
                <Text style={styles.heading}>Buttons</Text>

                <Pressable style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>
                        Explore Park
                    </Text>
                </Pressable>

                <Pressable style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>
                        Add to Trip
                    </Text>
                </Pressable>
            </View>

            {/* badges provide compact ways to communicate trail and park metadata */}
            <View style={styles.section}>
                <Text style={styles.heading}>Badges</Text>

                <View style={styles.badgeRow}>
                    <View style={styles.easyBadge}>
                        <Text style={styles.easyBadgeText}>EASY</Text>
                    </View>

                    <View style={styles.moderateBadge}>
                        <Text style={styles.moderateBadgeText}>
                            MODERATE
                        </Text>
                    </View>

                    <View style={styles.hardBadge}>
                        <Text style={styles.hardBadgeText}>HARD</Text>
                    </View>
                </View>
            </View>

            {/* this sample card demonstrates how park information can be presented using the design system */}
            <View style={styles.section}>
                <Text style={styles.heading}>Card</Text>

                <View style={styles.card}>
                    <Text style={styles.cardEyebrow}>
                        YELLOWSTONE NATIONAL PARK
                    </Text>

                    <Text style={styles.cardTitle}>
                        Explore the Wild
                    </Text>

                    <Text style={styles.cardBody}>
                        Trails, campgrounds, wildlife, and stories
                        waiting to be discovered.
                    </Text>

                    <Pressable style={styles.cardButton}>
                        <Text style={styles.cardButtonText}>
                            View Park
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    )
}

function ColorSwatch({ name, color }) {
    return (
        <View style={styles.swatchContainer}>
            {/* the swatch provides a quick visual reference for each semantic theme color */}
            <View
                style={[
                    styles.swatch,
                    {
                        backgroundColor: color,
                    },
                ]}
            />

            <Text style={styles.swatchName}>{name}</Text>

            <Text style={styles.swatchValue}>{color}</Text>
        </View>
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

    eyebrow: {
        color: theme.colors.forest,
        fontSize: theme.typography.label.fontSize,
        fontWeight: theme.typography.label.fontWeight,
        letterSpacing: 1.5,
        marginBottom: theme.spacing.sm,
    },

    display: {
        color: theme.colors.ink,
        fontSize: theme.typography.display.fontSize,
        fontWeight: theme.typography.display.fontWeight,
        lineHeight: theme.typography.display.lineHeight,
    },

    title: {
        color: theme.colors.ink,
        fontSize: theme.typography.title.fontSize,
        fontWeight: theme.typography.title.fontWeight,
        lineHeight: theme.typography.title.lineHeight,
        marginTop: theme.spacing.md,
    },

    heading: {
        color: theme.colors.ink,
        fontSize: theme.typography.heading.fontSize,
        fontWeight: theme.typography.heading.fontWeight,
        lineHeight: theme.typography.heading.lineHeight,
        marginBottom: theme.spacing.md,
    },

    subheading: {
        color: theme.colors.earth,
        fontSize: theme.typography.subheading.fontSize,
        fontWeight: theme.typography.subheading.fontWeight,
        lineHeight: theme.typography.subheading.lineHeight,
        marginTop: theme.spacing.sm,
    },

    body: {
        color: theme.colors.ink,
        fontSize: theme.typography.body.fontSize,
        fontWeight: theme.typography.body.fontWeight,
        lineHeight: theme.typography.body.lineHeight,
        marginTop: theme.spacing.md,
    },

    label: {
        color: theme.colors.forest,
        fontSize: theme.typography.label.fontSize,
        fontWeight: theme.typography.label.fontWeight,
        letterSpacing: theme.typography.label.letterSpacing,
        marginTop: theme.spacing.lg,
    },

    caption: {
        color: theme.colors.earth,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: theme.typography.caption.fontWeight,
        lineHeight: theme.typography.caption.lineHeight,
        marginTop: theme.spacing.xs,
    },

    section: {
        marginTop: theme.spacing.xxxl,
    },

    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
    },

    swatchContainer: {
        width: '46%',
    },

    swatch: {
        height: 64,
        borderRadius: theme.radii.md,
    },


    primaryButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.forest,
        borderRadius: theme.radii.md,
        minHeight: 52,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
    },

    primaryButtonText: {
        color: theme.colors.parchment,
        fontSize: theme.typography.body.fontSize,
        fontWeight: '700',
    },

    secondaryButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.md,
        minHeight: 52,
        justifyContent: 'center',
        marginTop: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
    },

    secondaryButtonText: {
        color: theme.colors.forest,
        fontSize: theme.typography.body.fontSize,
        fontWeight: '700',
    },

    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },

    easyBadge: {
        backgroundColor: theme.colors.sage,
        borderRadius: theme.radii.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },

    easyBadgeText: {
        color: theme.colors.ink,
        fontSize: theme.typography.label.fontSize,
        fontWeight: '700',
    },

    moderateBadge: {
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },

    moderateBadgeText: {
        color: theme.colors.bark,
        fontSize: theme.typography.label.fontSize,
        fontWeight: '700',
    },

    hardBadge: {
        backgroundColor: theme.colors.ember,
        borderRadius: theme.radii.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },

    hardBadgeText: {
        color: theme.colors.parchment,
        fontSize: theme.typography.label.fontSize,
        fontWeight: '700',
    },

    card: {
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.card,
    },

    cardEyebrow: {
        color: theme.colors.forest,
        fontSize: theme.typography.label.fontSize,
        fontWeight: '700',
        letterSpacing: 1,
    },

    cardTitle: {
        color: theme.colors.ink,
        fontSize: theme.typography.title.fontSize,
        fontWeight: theme.typography.title.fontWeight,
        lineHeight: theme.typography.title.lineHeight,
        marginTop: theme.spacing.sm,
    },

    cardBody: {
        color: theme.colors.bark,
        fontSize: theme.typography.body.fontSize,
        lineHeight: theme.typography.body.lineHeight,
        marginTop: theme.spacing.sm,
    },

    cardButton: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.forest,
        borderRadius: theme.radii.sm,
        marginTop: theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },

    cardButtonText: {
        color: theme.colors.parchment,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '700',
    },
    
    swatchName: {
        color: theme.colors.ink,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '600',
        marginTop: theme.spacing.sm,
    },

    swatchValue: {
        color: theme.colors.earth,
        fontSize: theme.typography.caption.fontSize,
        marginTop: 2,
    },
})