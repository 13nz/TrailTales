import { View, Text, Pressable, StyleSheet } from 'react-native'

import theme from '../constants/theme'

// displays a park summary that can be reused across search results, recommendations, and saved parks
export default function ParkCard({
    name,
    location,
    description,
    onPress,
}) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && styles.pressed,
            ]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`view ${name}`}
        >
            {/* this placeholder represents where the park's official or curated hero image will appear */}
            <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>
                    PARK IMAGE
                </Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.eyebrow}>
                    NATIONAL PARK
                </Text>

                <Text style={styles.name}>
                    {name}
                </Text>

                <Text style={styles.location}>
                    {location}
                </Text>

                <Text
                    style={styles.description}
                    numberOfLines={2}
                >
                    {description}
                </Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.canvas,
        borderRadius: theme.radii.lg,
        overflow: 'hidden',
        ...theme.shadows.card,
    },

    // gives users immediate visual feedback when they press a park card
    pressed: {
        opacity: 0.85,
    },

    // acts as a temporary image area until we connect real park imagery
    imagePlaceholder: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        height: 180,
        justifyContent: 'center',
    },

    imagePlaceholderText: {
        color: theme.colors.forest,
        fontSize: theme.typography.label.fontSize,
        fontWeight: '700',
        letterSpacing: 1,
    },

    content: {
        padding: theme.spacing.lg,
    },

    eyebrow: {
        color: theme.colors.forest,
        fontSize: theme.typography.label.fontSize,
        fontWeight: '700',
        letterSpacing: 1,
    },

    name: {
        color: theme.colors.ink,
        fontSize: theme.typography.title.fontSize,
        fontWeight: theme.typography.title.fontWeight,
        lineHeight: theme.typography.title.lineHeight,
        marginTop: theme.spacing.sm,
    },

    location: {
        color: theme.colors.earth,
        fontSize: theme.typography.bodySmall.fontSize,
        marginTop: theme.spacing.xs,
    },

    description: {
        color: theme.colors.bark,
        fontSize: theme.typography.body.fontSize,
        lineHeight: theme.typography.body.lineHeight,
        marginTop: theme.spacing.md,
    },
})