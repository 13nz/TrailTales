import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native'

import { useState } from 'react'

import { supabase } from '../services/supabase'
import theme from '../constants/theme'

// provides sign in, sign up, and guest access for Trail Tales
export default function AuthScreen({ navigation }) {
    const [mode, setMode] = useState('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const isSignUp = mode === 'signup'

    // handles both account creation and existing account sign in
    const handleSubmit = async () => {
        const trimmedEmail = email.trim()

        setErrorMessage('')
        setSuccessMessage('')

        if (!trimmedEmail || !password) {
            setErrorMessage(
                'Please enter your email and password.'
            )
            return
        }

        if (password.length < 6) {
            setErrorMessage(
                'Your password must be at least 6 characters.'
            )
            return
        }

        if (isSignUp && password !== confirmPassword) {
            setErrorMessage(
                'Your passwords do not match.'
            )
            return
        }

        try {
            setLoading(true)

            if (isSignUp) {
                const {
                    data,
                    error,
                } = await supabase.auth.signUp({
                    email: trimmedEmail,
                    password,
                })

                if (error) {
                    throw error
                }

                console.log(
                    'supabase signup successful:',
                    {
                        userId:
                            data.user?.id,
                        hasSession:
                            Boolean(
                                data.session
                            ),
                    }
                )

                // supabase returns no session when email confirmation is required
                if (!data.session) {
                    setSuccessMessage(
                        'Account created! Check your email to confirm your account, then sign in.'
                    )

                    setMode('signin')
                    setPassword('')
                    setConfirmPassword('')

                    return
                }

                return
            }

            const {
                data,
                error,
            } =
                await supabase.auth.signInWithPassword(
                    {
                        email: trimmedEmail,
                        password,
                    }
                )

            if (error) {
                throw error
            }

            console.log(
                'supabase signin successful:',
                {
                    userId:
                        data.user?.id,
                    hasSession:
                        Boolean(
                            data.session
                        ),
                }
            )
        } catch (error) {
            console.error(
                isSignUp
                    ? 'supabase signup error:'
                    : 'supabase signin error:',
                error
            )

            setErrorMessage(
                error.message ||
                    'Unable to complete authentication.'
            )
        } finally {
            setLoading(false)
        }
    }

    // creates the anonymous session used by guest mode
    const handleContinueAsGuest =
        async () => {
            setErrorMessage('')
            setSuccessMessage('')

            try {
                setLoading(true)

                const {
                    error,
                } =
                    await supabase.auth.signInAnonymously()

                if (error) {
                    throw error
                }
            } catch (error) {
                console.error(
                    'supabase guest authentication error:',
                    error
                )

                setErrorMessage(
                    error.message ||
                        'Unable to continue as a guest.'
                )
            } finally {
                setLoading(false)
            }
        }

    return (
        <View style={styles.screen}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={
                    Platform.OS ===
                    'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <ScrollView
                    contentContainerStyle={
                        styles.content
                    }
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={
                        false
                    }
                >
                    <View
                        style={
                            styles.brand
                        }
                    >
                        <Text
                            style={
                                styles.brandIcon
                            }
                        >
                            ✦
                        </Text>

                        <Text
                            style={
                                styles.brandTitle
                            }
                        >
                            Trail Tales
                        </Text>

                        <Text
                            style={
                                styles.brandSubtitle
                            }
                        >
                            plan your adventure
                        </Text>
                    </View>

                    <View
                        style={
                            styles.card
                        }
                    >
                        <Text
                            style={
                                styles.eyebrow
                            }
                        >
                            WELCOME
                        </Text>

                        <Text
                            style={
                                styles.title
                            }
                        >
                            {isSignUp
                                ? 'Create your account'
                                : 'Welcome back'}
                        </Text>

                        <Text
                            style={
                                styles.description
                            }
                        >
                            {isSignUp
                                ? 'Save your adventures, build trips, and keep your memories with you.'
                                : 'Sign in to access your saved adventures and memories.'}
                        </Text>

                        <View
                            style={
                                styles.modeToggle
                            }
                        >
                            <Pressable
                                style={[
                                    styles.modeButton,
                                    !isSignUp &&
                                        styles.activeModeButton,
                                ]}
                                onPress={() => {
                                    setMode(
                                        'signin'
                                    )
                                    setErrorMessage(
                                        ''
                                    )
                                    setSuccessMessage(
                                        ''
                                    )
                                }}
                                accessibilityRole="button"
                            >
                                <Text
                                    style={[
                                        styles.modeButtonText,
                                        !isSignUp &&
                                            styles.activeModeButtonText,
                                    ]}
                                >
                                    Sign in
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.modeButton,
                                    isSignUp &&
                                        styles.activeModeButton,
                                ]}
                                onPress={() => {
                                    setMode(
                                        'signup'
                                    )
                                    setErrorMessage(
                                        ''
                                    )
                                    setSuccessMessage(
                                        ''
                                    )
                                }}
                                accessibilityRole="button"
                            >
                                <Text
                                    style={[
                                        styles.modeButtonText,
                                        isSignUp &&
                                            styles.activeModeButtonText,
                                    ]}
                                >
                                    Sign up
                                </Text>
                            </Pressable>
                        </View>

                        <View
                            style={
                                styles.form
                            }
                        >
                            <Text
                                style={
                                    styles.label
                                }
                            >
                                Email
                            </Text>

                            <TextInput
                                value={
                                    email
                                }
                                onChangeText={
                                    setEmail
                                }
                                placeholder="you@example.com"
                                placeholderTextColor={
                                    theme.colors
                                        .earth
                                }
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={
                                    false
                                }
                                textContentType="emailAddress"
                                style={
                                    styles.input
                                }
                                editable={
                                    !loading
                                }
                            />

                            <Text
                                style={[
                                    styles.label,
                                    styles.spacedLabel,
                                ]}
                            >
                                Password
                            </Text>

                            <TextInput
                                value={
                                    password
                                }
                                onChangeText={
                                    setPassword
                                }
                                placeholder="Password"
                                placeholderTextColor={
                                    theme.colors
                                        .earth
                                }
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={
                                    false
                                }
                                textContentType="password"
                                style={
                                    styles.input
                                }
                                editable={
                                    !loading
                                }
                            />

                            {isSignUp ? (
                                <>
                                    <Text
                                        style={[
                                            styles.label,
                                            styles.spacedLabel,
                                        ]}
                                    >
                                        Confirm password
                                    </Text>

                                    <TextInput
                                        value={
                                            confirmPassword
                                        }
                                        onChangeText={
                                            setConfirmPassword
                                        }
                                        placeholder="Confirm password"
                                        placeholderTextColor={
                                            theme.colors
                                                .earth
                                        }
                                        secureTextEntry
                                        autoCapitalize="none"
                                        autoCorrect={
                                            false
                                        }
                                        textContentType="password"
                                        style={
                                            styles.input
                                        }
                                        editable={
                                            !loading
                                        }
                                    />
                                </>
                            ) : null}

                            {errorMessage ? (
                                <View
                                    style={
                                        styles.messageBox
                                    }
                                >
                                    <Text
                                        style={
                                            styles.errorText
                                        }
                                    >
                                        {
                                            errorMessage
                                        }
                                    </Text>
                                </View>
                            ) : null}

                            {successMessage ? (
                                <View
                                    style={
                                        styles.messageBox
                                    }
                                >
                                    <Text
                                        style={
                                            styles.successText
                                        }
                                    >
                                        {
                                            successMessage
                                        }
                                    </Text>
                                </View>
                            ) : null}

                            <Pressable
                                style={[
                                    styles.primaryButton,
                                    loading &&
                                        styles.disabledButton,
                                ]}
                                onPress={
                                    handleSubmit
                                }
                                disabled={
                                    loading
                                }
                                accessibilityRole="button"
                            >
                                <Text
                                    style={
                                        styles.primaryButtonText
                                    }
                                >
                                    {loading
                                        ? 'Please wait...'
                                        : isSignUp
                                            ? 'Create account'
                                            : 'Sign in'}
                                </Text>
                            </Pressable>
                        </View>

                        <View
                            style={
                                styles.dividerRow
                            }
                        >
                            <View
                                style={
                                    styles.divider
                                }
                            />

                            <Text
                                style={
                                    styles.dividerText
                                }
                            >
                                OR
                            </Text>

                            <View
                                style={
                                    styles.divider
                                }
                            />
                        </View>

                        <Pressable
                            style={
                                styles.guestButton
                            }
                            onPress={
                                handleContinueAsGuest
                            }
                            disabled={
                                loading
                            }
                            accessibilityRole="button"
                            accessibilityLabel="continue as guest"
                        >
                            <Text
                                style={
                                    styles.guestButtonText
                                }
                            >
                                Continue as guest
                            </Text>
                        </Pressable>

                        <Text
                            style={
                                styles.guestDescription
                            }
                        >
                            Explore Trail Tales without creating an account. Your saved trips and other personal content will not be available if you leave without creating an account.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles =
    StyleSheet.create({
        screen: {
            backgroundColor:
                theme.colors.parchment,
            flex: 1,
        },

        keyboardView: {
            flex: 1,
        },

        content: {
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal:
                theme.spacing.lg,
            paddingVertical:
                theme.spacing.xl,
        },

        brand: {
            alignItems: 'center',
            marginBottom:
                theme.spacing.xl,
        },

        brandIcon: {
            color: theme.colors.forest,
            fontSize: 28,
            marginBottom:
                theme.spacing.xs,
        },

        brandTitle: {
            color: theme.colors.ink,
            fontSize: 32,
            fontWeight: '700',
        },

        brandSubtitle: {
            color: theme.colors.earth,
            fontSize: 13,
            marginTop:
                theme.spacing.xs,
        },

        card: {
            backgroundColor:
                theme.colors.canvas,
            borderRadius:
                theme.radii.lg,
            padding:
                theme.spacing.lg,
            ...theme.shadows.card,
        },

        eyebrow: {
            color: theme.colors.forest,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1.5,
        },

        title: {
            color: theme.colors.ink,
            fontSize: 26,
            fontWeight: '700',
            marginTop:
                theme.spacing.xs,
        },

        description: {
            color: theme.colors.earth,
            fontSize: 14,
            lineHeight: 20,
            marginTop:
                theme.spacing.sm,
        },

        modeToggle: {
            backgroundColor:
                theme.colors.sage,
            borderRadius:
                theme.radii.md,
            flexDirection: 'row',
            marginTop:
                theme.spacing.lg,
            padding: 3,
        },

        modeButton: {
            alignItems: 'center',
            borderRadius:
                theme.radii.sm,
            flex: 1,
            minHeight: 40,
            justifyContent:
                'center',
        },

        activeModeButton: {
            backgroundColor:
                theme.colors.parchment,
            ...theme.shadows.card,
        },

        modeButtonText: {
            color: theme.colors.earth,
            fontSize: 13,
            fontWeight: '600',
        },

        activeModeButtonText: {
            color: theme.colors.forest,
        },

        form: {
            marginTop:
                theme.spacing.lg,
        },

        label: {
            color: theme.colors.ink,
            fontSize: 12,
            fontWeight: '700',
        },

        spacedLabel: {
            marginTop:
                theme.spacing.lg,
        },

        input: {
            backgroundColor:
                theme.colors.parchment,
            borderColor:
                theme.colors.sage,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            color: theme.colors.ink,
            fontSize: 14,
            marginTop:
                theme.spacing.sm,
            minHeight: 50,
            paddingHorizontal:
                theme.spacing.md,
        },

        messageBox: {
            backgroundColor:
                theme.colors.parchment,
            borderRadius:
                theme.radii.md,
            marginTop:
                theme.spacing.md,
            padding:
                theme.spacing.md,
        },

        errorText: {
            color: '#9B3D32',
            fontSize: 12,
            lineHeight: 18,
        },

        successText: {
            color: theme.colors.forest,
            fontSize: 12,
            lineHeight: 18,
        },

        primaryButton: {
            alignItems: 'center',
            backgroundColor:
                theme.colors.forest,
            borderRadius:
                theme.radii.md,
            justifyContent:
                'center',
            marginTop:
                theme.spacing.lg,
            minHeight: 52,
            paddingHorizontal:
                theme.spacing.md,
        },

        disabledButton: {
            opacity: 0.6,
        },

        primaryButtonText: {
            color: theme.colors.parchment,
            fontSize: 14,
            fontWeight: '700',
        },

        dividerRow: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: theme.spacing.sm,
            marginVertical:
                theme.spacing.lg,
        },

        divider: {
            backgroundColor:
                theme.colors.sage,
            flex: 1,
            height: 1,
        },

        dividerText: {
            color: theme.colors.earth,
            fontSize: 10,
            fontWeight: '700',
        },

        guestButton: {
            alignItems: 'center',
            borderColor:
                theme.colors.forest,
            borderRadius:
                theme.radii.md,
            borderWidth: 1,
            justifyContent:
                'center',
            minHeight: 52,
        },

        guestButtonText: {
            color: theme.colors.forest,
            fontSize: 14,
            fontWeight: '700',
        },

        guestDescription: {
            color: theme.colors.earth,
            fontSize: 11,
            lineHeight: 16,
            marginTop:
                theme.spacing.sm,
            textAlign: 'center',
        },
    })