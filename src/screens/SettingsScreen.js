import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    Alert,
    Switch,
} from 'react-native'

import { useCallback, useState } from 'react'

import { useFocusEffect } from '@react-navigation/native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import theme from '../constants/theme'

import { supabase } from '../services/supabase'

// provides account, preference, and application settings
export default function SettingsScreen({ navigation }) {
    const insets = useSafeAreaInsets()

    const [loadingPreferences, setLoadingPreferences] = useState(true)
    const [tripReminders, setTripReminders] = useState(true)
    const [journalReminders, setJournalReminders] = useState(true)
    const [campfireStoryNotifications, setCampfireStoryNotifications] = useState(true)
    const [communityNotifications, setCommunityNotifications] = useState(true)
    const [useLocation, setUseLocation] = useState(true)
    

    // loads the current user's saved preferences whenever the settings screen becomes active
    useFocusEffect(
        useCallback(() => {
            const loadPreferences = async () => {
                setLoadingPreferences(true)

                try {
                    const { data: userData, error: userError } = await supabase.auth.getUser()

                    if (userError) {
                        throw userError
                    }

                    const user = userData.user

                    if (!user || user.is_anonymous) {
                        setLoadingPreferences(false)
                        return
                    }

                    const { data: preferences, error: preferencesError } = await supabase
                        .from('user_preferences')
                        .select('trip_reminders, journal_reminders, campfire_story_notifications, community_notifications, use_location')
                        .eq('user_id', user.id)
                        .maybeSingle()

                    if (preferencesError) {
                        throw preferencesError
                    }

                    // creates the default preference row for users who do not have one yet
                    if (!preferences) {
                        const { data: newPreferences, error: insertError } = await supabase
                            .from('user_preferences')
                            .insert({
                                user_id: user.id,
                                trip_reminders: true,
                                journal_reminders: true,
                                campfire_story_notifications: true,
                                community_notifications: true,
                                use_location: true,
                            })
                            .select()
                            .single()

                        if (insertError) {
                            throw insertError
                        }

                        setTripReminders(newPreferences.trip_reminders)
                        setJournalReminders(newPreferences.journal_reminders)
                        setCampfireStoryNotifications(newPreferences.campfire_story_notifications)
                        setCommunityNotifications(newPreferences.community_notifications)
                        setUseLocation(newPreferences.use_location)
                    } else {
                        setTripReminders(preferences.trip_reminders)
                        setJournalReminders(preferences.journal_reminders)
                        setCampfireStoryNotifications(preferences.campfire_story_notifications)
                        setCommunityNotifications(preferences.community_notifications)
                        setUseLocation(preferences.use_location)
                    }
                } catch (error) {
                    console.error('supabase preferences load error:', error)
                } finally {
                    setLoadingPreferences(false)
                }
            }

            loadPreferences()
        }, [])
    )

    // updates one preference immediately after the user changes a toggle
    const updatePreference = async (column, value, setValue) => {
        setValue(value)

        try {
            const { data: userData, error: userError } = await supabase.auth.getUser()

            if (userError) {
                throw userError
            }

            const user = userData.user

            if (!user || user.is_anonymous) {
                return
            }

            const { error: updateError } = await supabase
                .from('user_preferences')
                .update({
                    [column]: value,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id)

            if (updateError) {
                throw updateError
            }
        } catch (error) {
            console.error('supabase preference update error:', error)

            setValue(!value)

            Alert.alert(
                'Unable to save setting',
                'Your preference could not be saved. Please try again.'
            )
        }
    }



    // signs the current user out of the supabase session
    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()

            if (error) {
                throw error
            }

            console.log('supabase sign out successful')
        } catch (error) {
            console.error('supabase sign out error:', error)

            Alert.alert(
                'Unable to sign out',
                'Something went wrong while signing out. Please try again.'
            )
        }
    }

    return (
        <View style={styles.screen}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.md }]}
            >
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        accessibilityRole="button"
                        accessibilityLabel="go back"
                    >
                        <Text style={styles.backButtonText}>
                            ‹
                        </Text>
                    </Pressable>

                    <Text style={styles.headerTitle}>
                        Settings
                    </Text>

                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Account
                    </Text>

                    <View style={styles.settingsCard}>
                        <SettingRow
                            icon="👤"
                            title="Profile"
                            subtitle="View your Trail Tales profile"
                            onPress={() => navigation.goBack()}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Notifications
                    </Text>

                    <View style={styles.settingsCard}>
                        <SettingToggle
                            icon="🥾"
                            title="Trip reminders"
                            subtitle="Get reminders about your planned trips"
                            value={tripReminders}
                            onValueChange={(value) => updatePreference('trip_reminders', value, setTripReminders)}
                            disabled={loadingPreferences}
                        />

                        <SettingToggle
                            icon="📖"
                            title="Journal reminders"
                            subtitle="Get reminders to record your adventures"
                            value={journalReminders}
                            onValueChange={(value) => updatePreference('journal_reminders', value, setJournalReminders)}
                            disabled={loadingPreferences}
                        />

                        <SettingToggle
                            icon="🔥"
                            title="Campfire stories"
                            subtitle="Get notified about new campfire stories"
                            value={campfireStoryNotifications}
                            onValueChange={(value) => updatePreference('campfire_story_notifications', value, setCampfireStoryNotifications)}
                            disabled={loadingPreferences}
                        />

                        <SettingToggle
                            icon="💬"
                            title="Community activity"
                            subtitle="Get updates about community activity"
                            value={communityNotifications}
                            onValueChange={(value) => updatePreference('community_notifications', value, setCommunityNotifications)}
                            disabled={loadingPreferences}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Preferences
                    </Text>

                    <View style={styles.settingsCard}>
                        <SettingToggle
                            icon="📍"
                            title="Use my location"
                            subtitle="Allow Trail Tales to use your location"
                            value={useLocation}
                            onValueChange={(value) => updatePreference('use_location', value, setUseLocation)}
                            disabled={loadingPreferences}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        About
                    </Text>

                    <View style={styles.settingsCard}>
                        <SettingRow
                            icon="ℹ️"
                            title="About Trail Tales"
                            subtitle="Learn more about the app"
                            onPress={() => {}}
                        />

                        <SettingRow
                            icon="🔒"
                            title="Privacy"
                            subtitle="Review privacy information"
                            onPress={() => {}}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Pressable
                        style={styles.signOutButton}
                        onPress={handleSignOut}
                        accessibilityRole="button"
                        accessibilityLabel="sign out"
                    >
                        <Text style={styles.signOutText}>
                            Sign out
                        </Text>
                    </Pressable>
                </View>

                <Text style={styles.versionText}>
                    Trail Tales
                </Text>
            </ScrollView>
        </View>
    )
}

// displays one selectable settings row
function SettingRow({ icon, title, subtitle, onPress }) {
    return (
        <Pressable
            style={styles.settingRow}
            onPress={onPress}
            accessibilityRole="button"
        >
            <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>
                    {icon}
                </Text>
            </View>

            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>
                    {title}
                </Text>

                <Text style={styles.settingSubtitle}>
                    {subtitle}
                </Text>
            </View>

            <Text style={styles.settingArrow}>
                ›
            </Text>
        </Pressable>
    )
}

// displays one boolean preference with an inline toggle
function SettingToggle({ icon, title, subtitle, value, onValueChange, disabled }) {
    return (
        <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>
                    {icon}
                </Text>
            </View>

            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>
                    {title}
                </Text>

                <Text style={styles.settingSubtitle}>
                    {subtitle}
                </Text>
            </View>

            <View style={styles.switchContainer}>
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    disabled={disabled}
                    trackColor={{
                        false: theme.colors.border,
                        true: theme.colors.forest,
                    }}
                    thumbColor={theme.colors.parchment}
                    accessibilityRole="switch"
                    accessibilityLabel={title}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.canvas,
    },

    content: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
    },

    header: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },

    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    backButtonText: {
        fontSize: 36,
        lineHeight: 40,
        color: theme.colors.ink,
        fontWeight: '300',
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.ink,
    },

    headerSpacer: {
        width: 44,
    },

    section: {
        marginBottom: theme.spacing.lg,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.ink,
        marginBottom: theme.spacing.sm,
    },

    settingsCard: {
        backgroundColor: theme.colors.parchment,
        borderRadius: 16,
        overflow: 'hidden',
    },

    settingRow: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
    },

    settingIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.canvas,
        marginRight: theme.spacing.sm,
    },

    settingIconText: {
        fontSize: 19,
    },

    settingContent: {
        flex: 1,
    },

    settingTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.ink,
    },

    settingSubtitle: {
        marginTop: 3,
        fontSize: 12,
        color: theme.colors.earth,
    },

    settingArrow: {
        fontSize: 25,
        color: theme.colors.earth,
        marginLeft: theme.spacing.sm,
    },

    signOutButton: {
        minHeight: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.parchment,
        borderWidth: 1,
        borderColor: '#B56B5B',
    },

    signOutText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#B04F3F',
    },

    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: theme.colors.earth,
        marginTop: theme.spacing.sm,
    },

    switchContainer: {
        minWidth: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing.sm,
    },
})