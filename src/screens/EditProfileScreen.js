import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image
} from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useEffect, useState } from 'react'

import { supabase } from '../services/supabase'

import theme from '../constants/theme'
import * as ImagePicker from 'expo-image-picker'

// allows a signed-in user to edit their profile information
export default function EditProfileScreen({ navigation }) {
    const insets = useSafeAreaInsets()

    const [user, setUser] = useState(null)
    const [displayName, setDisplayName] = useState('')
    const [username, setUsername] = useState('')
    const [discriminator, setDiscriminator] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)

    useEffect(() => {
        // loads the current user's profile information
        const loadProfile = async () => {
            try {
                const { data: userData, error: userError } = await supabase.auth.getUser()

                if (userError) {
                    console.error('supabase edit profile user error:', userError)
                    return
                }

                const currentUser = userData.user || null
                setUser(currentUser)

                if (!currentUser || currentUser.is_anonymous) {
                    return
                }

                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('username, username_discriminator, display_name, avatar_url')
                    .eq('id', currentUser.id)
                    .single()

                if (profileError) {
                    console.error('supabase edit profile data error:', profileError)
                    return
                }

                setDisplayName(profileData.display_name || '')
                setUsername(profileData.username || '')
                setDiscriminator(String(profileData.username_discriminator || ''))

                // save avatar
                setAvatarUrl(profileData.avatar_url || null)
            } catch (error) {
                console.error('edit profile loading error:', error)
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [])

    // avatar change handler
    const handleChoosePhoto = async () => {
        // requests access to the user's photo library
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permission.granted) {
            Alert.alert(
                'Photo access needed',
                'Please allow photo library access to choose a profile picture.'
            )
            return
        }

        // opens the device photo picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if (result.canceled || !result.assets?.length) {
            return
        }

        // keeps the selected image available for upload when the user saves
        setSelectedImage(result.assets[0].uri)
    }

    const handleSave = async () => {
        if (!user || user.is_anonymous) {
            Alert.alert('Account required', 'Create an account before editing your profile.')
            return
        }

        const cleanedDisplayName = displayName.trim()
        const cleanedUsername = username.trim().toLowerCase()

        if (!cleanedDisplayName) {
            Alert.alert('Display name required', 'Please enter a display name.')
            return
        }

        if (!cleanedUsername) {
            Alert.alert('Username required', 'Please enter a username.')
            return
        }

        if (!/^[a-z0-9_]{3,24}$/.test(cleanedUsername)) {
            Alert.alert(
                'Invalid username',
                'Usernames must be 3–24 characters and can only contain lowercase letters, numbers, and underscores.'
            )
            return
        }

        let newAvatarUrl = avatarUrl

        if (selectedImage) {
            // creates a unique filename so every profile picture upload is a new storage object
            const filePath = `${user.id}/${Date.now()}.jpg`

            const response = await fetch(selectedImage)
            const arrayBuffer = await response.arrayBuffer()

            // logs
            const { data: sessionData } = await supabase.auth.getSession()

            console.log('avatar session:', sessionData.session)
            console.log('avatar session user:', sessionData.session?.user?.id)
            console.log('avatar session role:', sessionData.session?.user?.role)
            console.log('avatar anonymous:', sessionData.session?.user?.is_anonymous)

            // uploads the selected image to the user's private storage folder
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: false,
                })

            if (uploadError) {
                console.error('supabase avatar upload error:', uploadError)

                Alert.alert(
                    'Unable to upload picture',
                    'Your profile picture could not be uploaded. Please try again.'
                )

                return
            }

            // gets the public URL used to display the avatar
            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            newAvatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`
        }

        setSaving(true)

        try {
            // checks whether another profile already uses this username and discriminator
            const { data: existingProfile, error: existingProfileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', cleanedUsername)
                .eq('username_discriminator', Number(discriminator))
                .neq('id', user.id)
                .maybeSingle()

            if (existingProfileError) {
                console.error('supabase username availability error:', existingProfileError)

                Alert.alert(
                    'Unable to check username',
                    'Please try again.'
                )

                return
            }

            if (existingProfile) {
                Alert.alert(
                    'Username unavailable',
                    `@${cleanedUsername}#${discriminator} is already taken. Please choose another username.`
                )

                return
            }

            // updates the authenticated user's profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    display_name: cleanedDisplayName,
                    username: cleanedUsername,
                    avatar_url: newAvatarUrl,
                })
                .eq('id', user.id)

            if (updateError) {
                console.error('supabase profile update error:', updateError)

                Alert.alert(
                    'Unable to save profile',
                    'Your profile could not be updated. Please try again.'
                )

                return
            }

            Alert.alert(
                'Profile updated',
                'Your profile has been saved.'
            )

            navigation.goBack()
        } catch (error) {
            console.error('edit profile save error:', error)

            Alert.alert(
                'Unable to save profile',
                'Something went wrong while saving your profile.'
            )
        } finally {
            setSaving(false)
        }
    }

    const isGuest = user?.is_anonymous === true

    return (
        <View style={styles.screen}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
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
                            Edit Profile
                        </Text>

                        <View style={styles.headerSpacer} />
                    </View>

                    {isGuest ? (
                        <View style={styles.messageCard}>
                            <Text style={styles.messageTitle}>
                                Create an account
                            </Text>

                            <Text style={styles.messageText}>
                                Guest profiles cannot be edited. Create an account to customize your Trail Tales profile.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Pressable
                                style={styles.avatarPlaceholder}
                                onPress={handleChoosePhoto}
                                accessibilityRole="button"
                                accessibilityLabel="change profile picture"
                            >
                                {selectedImage || avatarUrl ? (
                                    <Image
                                        source={{
                                            uri: selectedImage || avatarUrl,
                                        }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <Text style={styles.avatarText}>
                                        {displayName ? displayName.charAt(0).toUpperCase() : '🌲'}
                                    </Text>
                                )}
                            </Pressable>

                            <View style={styles.form}>
                                <View style={styles.field}>
                                    <Text style={styles.label}>
                                        Display name
                                    </Text>

                                    <TextInput
                                        style={styles.input}
                                        value={displayName}
                                        onChangeText={setDisplayName}
                                        placeholder="Enter your display name"
                                        placeholderTextColor={theme.colors.earth}
                                        maxLength={40}
                                        autoCapitalize="words"
                                    />
                                </View>

                                <View style={styles.field}>
                                    <Text style={styles.label}>
                                        Username
                                    </Text>

                                    <TextInput
                                        style={styles.input}
                                        value={username}
                                        onChangeText={(value) => setUsername(value.toLowerCase())}
                                        placeholder="Enter your username"
                                        placeholderTextColor={theme.colors.earth}
                                        maxLength={24}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />

                                    <Text style={styles.helperText}>
                                        3–24 characters. Lowercase letters, numbers, and underscores only.
                                    </Text>
                                </View>

                                <View style={styles.field}>
                                    <Text style={styles.label}>
                                        Your Trail Tales username
                                    </Text>

                                    <View style={styles.usernamePreview}>
                                        <Text style={styles.usernamePreviewText}>
                                            @{username || 'username'}#{discriminator || '0000'}
                                        </Text>
                                    </View>
                                </View>

                                <Pressable
                                    style={[
                                        styles.saveButton,
                                        (loading || saving) && styles.disabledButton,
                                    ]}
                                    onPress={handleSave}
                                    disabled={loading || saving}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.saveButtonText}>
                                        {saving ? 'Saving...' : 'Save changes'}
                                    </Text>
                                </Pressable>
                            </View>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.canvas,
    },

    keyboardView: {
        flex: 1,
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
        color: theme.colors.earth,
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

    avatarPlaceholder: {
        width: 92,
        height: 92,
        borderRadius: 46,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.forest,
        marginBottom: theme.spacing.sm,
    },

    avatarText: {
        fontSize: 34,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    avatarMessage: {
        fontSize: 12,
        color: theme.colors.earth,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },

    form: {
        backgroundColor: theme.colors.parchment,
        borderRadius: 18,
        padding: theme.spacing.md,
    },

    field: {
        marginBottom: theme.spacing.lg,
    },

    label: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.ink,
        marginBottom: theme.spacing.xs,
    },

    input: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 12,
        paddingHorizontal: theme.spacing.sm,
        fontSize: 15,
        color: theme.colors.ink,
        backgroundColor: theme.colors.canvas,
    },

    helperText: {
        marginTop: theme.spacing.xs,
        fontSize: 12,
        lineHeight: 17,
        color: theme.colors.earth,
    },

    usernamePreview: {
        minHeight: 48,
        borderRadius: 12,
        paddingHorizontal: theme.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.canvas,
    },

    usernamePreviewText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.forest,
    },

    saveButton: {
        minHeight: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.forest,
        marginTop: theme.spacing.xs,
    },

    disabledButton: {
        opacity: 0.6,
    },

    saveButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    messageCard: {
        backgroundColor: theme.colors.parchment,
        borderRadius: 18,
        padding: theme.spacing.lg,
    },

    messageTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: theme.colors.ink,
        marginBottom: theme.spacing.xs,
    },

    messageText: {
        fontSize: 14,
        lineHeight: 21,
        color: theme.colors.earth,
    },

    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 46,
    },
})