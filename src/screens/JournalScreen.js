import { View, Text, StyleSheet } from 'react-native'

export default function JournalScreen() {
    return (
        <View style={styles.container}>
            {/* this placeholder confirms that the personal journal tab is connected correctly */}
            <Text style={styles.title}>Journal</Text>

            {/* the private and public scrapbook features will replace this temporary content */}
            <Text style={styles.subtitle}>Keep your memories</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    // centers the temporary screen content while the journal is being developed
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // establishes the primary heading for the journal section
    title: {
        fontSize: 32,
        fontWeight: '700',
    },

    // explains the purpose of the user's personal journal
    subtitle: {
        marginTop: 8,
        fontSize: 16,
    },
})