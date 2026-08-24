import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    Image
} from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { supabase } from '../services/supabase'

import theme from '../constants/theme'

import { useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'

// displays the user's profile and provides access to account settings
export default function ProfileScreen({ navigation }) {
    const insets = useSafeAreaInsets()

    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useFocusEffect(
        useCallback(() => {
            // loads the profile every time the profile tab becomes active
            const loadProfile = async () => {
                try {
                    const { data: userData, error: userError } = await supabase.auth.getUser()

                    if (userError) {
                        console.error('supabase profile user error:', userError)
                        return
                    }

                    const currentUser = userData.user || null
                    setUser(currentUser)

                    if (!currentUser || currentUser.is_anonymous) {
                        return
                    }

                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('username, username_discriminator, display_name, avatar_url, bio')
                        .eq('id', currentUser.id)
                        .single()

                    if (profileError) {
                        console.error('supabase profile data error:', profileError)
                        return
                    }

                    setProfile(profileData)
                } catch (error) {
                    console.error('profile loading error:', error)
                } finally {
                    setLoading(false)
                }
            }

            loadProfile()
        }, [])
    )

    const isGuest = user?.is_anonymous === true

    const profileName = isGuest
        ? 'Guest Explorer'
        : profile?.display_name || 'Trail Tales Explorer'

    const username = profile?.username
        ? `@${profile.username}#${profile.username_discriminator}`
        : ''

    return (
        <View style={styles.screen}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.md }]}
            >
                <View style={styles.header}>
                    <View style={styles.headerSpacer} />

                    <Text style={styles.headerTitle}>
                        Profile
                    </Text>

                    <Pressable
                        style={styles.settingsButton}
                        onPress={() => navigation.navigate('Settings')}
                        accessibilityRole="button"
                        accessibilityLabel="open settings"
                    >
                        <Text style={styles.settingsIcon}>
                            ⚙
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.profileCard}>
                    {profile?.avatar_url ? (
                        <Image
                            source={{ uri: profile.avatar_url }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <View style={styles.profileImagePlaceholder}>
                            <Text style={styles.profileImagePlaceholderText}>
                                {profile?.display_name
                                    ? profile.display_name.charAt(0).toUpperCase()
                                    : '🌲'}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.profileName}>
                        {loading ? 'Loading...' : profileName}
                    </Text>

                    {!loading && isGuest ? (
                        <>
                            <Text style={styles.accountType}>
                                GUEST EXPLORER
                            </Text>

                            <Text style={styles.profileDescription}>
                                You are exploring Trail Tales as a guest.
                            </Text>
                        </>
                    ) : null}

                    {!loading && !isGuest ? (
                        <>
                            <Text style={styles.username}>
                                {username}
                            </Text>

                            <Text style={styles.accountType}>
                                TRAIL TALES MEMBER
                            </Text>
                        </>
                    ) : null}

                    <Pressable
                        style={styles.editProfileButton}
                        onPress={() => navigation.navigate('EditProfile')}
                        accessibilityRole="button"
                    >
                        <Text style={styles.editProfileButtonText}>
                            Edit Profile
                        </Text>
                    </Pressable>
                </View>

                {isGuest ? (
                    <View style={styles.guestNotice}>
                        <Text style={styles.guestNoticeTitle}>
                            Create an account
                        </Text>

                        <Text style={styles.guestNoticeText}>
                            Create an account to keep your trips, favorites, journal entries, and other Trail Tales activity.
                        </Text>

                        <Pressable
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('Settings')}
                            accessibilityRole="button"
                        >
                            <Text style={styles.primaryButtonText}>
                                Account settings
                            </Text>
                        </Pressable>
                    </View>
                ) : null}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        My Trail Tales
                    </Text>

                    <View style={styles.activityList}>
                        <ProfileRow
                            icon="🗺️"
                            title="My trips"
                            subtitle="Plan and manage your adventures"
                            onPress={() => navigation.navigate('Trips')}
                        />

                        <ProfileRow
                            icon="♡"
                            title="Favorites"
                            subtitle="Your saved parks, trails, and campgrounds"
                            onPress={() => {}}
                        />

                        <ProfileRow
                            icon="📖"
                            title="Journal"
                            subtitle="Your outdoor memories and entries"
                            onPress={() => navigation.navigate('Journal')}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Account
                    </Text>

                    <View style={styles.activityList}>
                        <ProfileRow
                            icon="⚙"
                            title="Settings"
                            subtitle="Manage your account and preferences"
                            onPress={() => navigation.navigate('Settings')}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

// displays one selectable profile navigation row
function ProfileRow({ icon, title, subtitle, onPress }) {
    return (
        <Pressable
            style={styles.profileRow}
            onPress={onPress}
            accessibilityRole="button"
        >
            <View style={styles.rowIcon}>
                <Text style={styles.rowIconText}>
                    {icon}
                </Text>
            </View>

            <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>
                    {title}
                </Text>

                <Text style={styles.rowSubtitle}>
                    {subtitle}
                </Text>
            </View>

            <Text style={styles.rowArrow}>
                ›
            </Text>
        </Pressable>
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

    headerSpacer: {
        width: 44,
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.ink,
    },

    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.parchment,
    },

    settingsIcon: {
        fontSize: 21,
        color: theme.colors.earth,
    },

    profileCard: {
        alignItems: 'center',
        backgroundColor: theme.colors.parchment,
        borderRadius: 20,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },

    avatar: {
        width: 78,
        height: 78,
        borderRadius: 39,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.forest,
        marginBottom: theme.spacing.sm,
    },

    avatarText: {
        fontSize: 30,
        color: '#FFFFFF',
        fontWeight: '700',
    },

    profileName: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.ink,
        textAlign: 'center',
    },

    username: {
        marginTop: theme.spacing.xs,
        fontSize: 14,
        color: theme.colors.earth,
        textAlign: 'center',
    },

    accountType: {
        marginTop: theme.spacing.xs,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        color: theme.colors.forest,
    },

    profileDescription: {
        marginTop: theme.spacing.sm,
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.earth,
        textAlign: 'center',
    },

    guestNotice: {
        backgroundColor: theme.colors.parchment,
        borderRadius: 16,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },

    guestNoticeTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.ink,
        marginBottom: theme.spacing.xs,
    },

    guestNoticeText: {
        fontSize: 14,
        lineHeight: 21,
        color: theme.colors.earth,
        marginBottom: theme.spacing.md,
    },

    primaryButton: {
        minHeight: 46,
        borderRadius: 12,
        backgroundColor: theme.colors.forest,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.md,
    },

    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
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

    activityList: {
        backgroundColor: theme.colors.parchment,
        borderRadius: 16,
        overflow: 'hidden',
    },

    profileRow: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
    },

    rowIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.canvas,
        marginRight: theme.spacing.sm,
    },

    rowIconText: {
        fontSize: 20,
        color: theme.colors.earth,
    },

    rowContent: {
        flex: 1,
    },

    rowTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.ink,
    },

    rowSubtitle: {
        marginTop: 3,
        fontSize: 12,
        color: theme.colors.earth,
    },

    rowArrow: {
        fontSize: 25,
        color: theme.colors.earth,
        marginLeft: theme.spacing.sm,
    },

    editProfileButton: {
        minHeight: 42,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.forest,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.md,
    },

    editProfileButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.forest,
    },

    profileImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },

    profileImagePlaceholder: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.forest,
    },

    profileImagePlaceholderText: {
        fontSize: 34,
        fontWeight: '700',
        color: '#FFFFFF',
    },
})