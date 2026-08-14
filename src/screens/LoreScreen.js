import { View, Text, StyleSheet } from 'react-native'

export default function LoreScreen() {
    return (
        <View style={styles.container}>
            {/* this placeholder confirms that the campfire lore tab is connected correctly */}
            <Text style={styles.title}>Lore</Text>

            {/* the interactive campfire story experience will replace this temporary content */}
            <Text style={styles.subtitle}>Gather around the campfire</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    // centers the temporary screen content while the lore feature is being developed
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // establishes the primary heading for the lore section
    title: {
        fontSize: 32,
        fontWeight: '700',
    },

    // introduces the storytelling purpose of the lore section
    subtitle: {
        marginTop: 8,
        fontSize: 16,
    },
})