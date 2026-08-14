import { View, Text, Pressable, StyleSheet } from 'react-native'

import theme from '../constants/theme'

// provides a consistent heading and optional action for sections throughout the application
export default function SectionHeader({
    title,
    actionLabel,
    onActionPress,
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            {/* only renders the action when the section needs additional navigation */}
            {actionLabel && onActionPress ? (
                <Pressable
                    onPress={onActionPress}
                    accessibilityRole="button"
                >
                    <Text style={styles.action}>
                        {actionLabel}
                    </Text>
                </Pressable>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },

    title: {
        color: theme.colors.ink,
        fontSize: theme.typography.heading.fontSize,
        fontWeight: theme.typography.heading.fontWeight,
        lineHeight: theme.typography.heading.lineHeight,
    },

    action: {
        color: theme.colors.forest,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: '700',
    },
})