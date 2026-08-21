import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Image,
} from 'react-native'

import theme from '../constants/theme'

// displays a park summary that can be reused across search results, recommendations, and saved parks
export default function ParkCard({
    name,
    location,
    description,
    image,
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
            {image ? (
                <Image
                    source={{
                        uri: image,
                    }}
                    style={styles.image}
                    resizeMode="cover"
                    accessibilityLabel={`${name} park photo`}
                />
            ) : (
                // keeps the card usable when a park does not have an available image
                <View
                    style={
                        styles.imagePlaceholder
                    }
                >
                    <Text
                        style={
                            styles.imagePlaceholderText
                        }
                    >
                        PARK IMAGE
                    </Text>
                </View>
            )}

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

    image: {
        height: 180,
        width: '100%',
    },

    // acts as a fallback when a park does not provide an image
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