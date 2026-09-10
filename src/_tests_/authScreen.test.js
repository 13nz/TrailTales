import React from 'react'

import {
    Text,
    Pressable,
    TextInput,
} from 'react-native'

import {
    act,
    create,
} from 'react-test-renderer'

import AuthScreen from '../screens/AuthScreen'
import {
    supabase,
} from '../services/supabase'

jest.mock(
    '../services/supabase',
    () => ({
        supabase: {
            auth: {
                signInWithPassword:
                    jest.fn(),
                signUp:
                    jest.fn(),
                signInAnonymously:
                    jest.fn(),
            },
        },
    })
)

describe('AuthScreen', () => {
    let navigation

    beforeEach(() => {
        navigation = {
            goBack:
                jest.fn(),
        }

        supabase.auth.signInWithPassword.mockReset()
        supabase.auth.signUp.mockReset()
        supabase.auth.signInAnonymously.mockReset()

        supabase.auth.signInWithPassword.mockResolvedValue({
            data: {
                user: {
                    id: 'test-user',
                },
                session: {
                    access_token:
                        'test-token',
                },
            },
            error: null,
        })

        supabase.auth.signUp.mockResolvedValue({
            data: {
                user: {
                    id: 'test-user',
                },
                session: null,
            },
            error: null,
        })

        supabase.auth.signInAnonymously.mockResolvedValue({
            data: {
                user: {
                    id: 'guest-user',
                },
                session: {
                    access_token:
                        'guest-token',
                },
            },
            error: null,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    function renderScreen() {
        let renderer

        act(() => {
            renderer = create(
                <AuthScreen
                    navigation={
                        navigation
                    }
                />
            )
        })

        return renderer
    }

    function findByProps(
        renderer,
        props
    ) {
        return renderer.root.findByProps(
            props
        )
    }

    function findText(
        renderer,
        text
    ) {
        return renderer.root
            .findAllByType(Text)
            .find(
                (item) =>
                    item.props.children ===
                    text
            )
    }

    function findButtonByText(
        renderer,
        text,
        occurrence = 0
    ) {
        const textNodes =
            renderer.root
                .findAllByType(Text)
                .filter(
                    (item) =>
                        item.props.children ===
                        text
                )

        const textNode =
            textNodes[occurrence]

        if (!textNode) {
            return undefined
        }

        let current =
            textNode.parent

        while (current) {
            if (
                current.props &&
                typeof current.props.onPress ===
                    'function'
            ) {
                return current
            }

            current =
                current.parent
        }

        return undefined
    }

    function findLastButtonByText(
        renderer,
        text
    ) {
        const textNodes =
            renderer.root
                .findAllByType(Text)
                .filter(
                    (item) =>
                        item.props.children ===
                        text
                )

        const textNode =
            textNodes[
                textNodes.length - 1
            ]

        if (!textNode) {
            return undefined
        }

        let current =
            textNode.parent

        while (current) {
            if (
                current.props &&
                typeof current.props.onPress ===
                    'function'
            ) {
                return current
            }

            current =
                current.parent
        }

        return undefined
    }

    test('renders the sign in form by default', () => {
        const renderer =
            renderScreen()

        expect(
            findText(
                renderer,
                'Welcome back'
            )
        ).toBeTruthy()

        expect(
            findText(
                renderer,
                'Sign in'
            )
        ).toBeTruthy()

        expect(
            findByProps(
                renderer,
                {
                    placeholder:
                        'you@example.com',
                }
            )
        ).toBeTruthy()

        expect(
            findByProps(
                renderer,
                {
                    placeholder:
                        'Password',
                }
            )
        ).toBeTruthy()

        expect(
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'continue as guest',
                }
            )
        ).toBeTruthy()
    })

    test('switches from sign in to sign up mode', () => {
        const renderer =
            renderScreen()

        const signUpButton =
            findButtonByText(
                renderer,
                'Sign up'
            )

        expect(
            signUpButton
        ).toBeTruthy()

        act(() => {
            signUpButton.props.onPress()
        })

        expect(
            findText(
                renderer,
                'Create your account'
            )
        ).toBeTruthy()

        expect(
            findByProps(
                renderer,
                {
                    placeholder:
                        'Confirm password',
                }
            )
        ).toBeTruthy()
    })

    

    test('shows an error when email and password are missing', () => {
        const renderer =
            renderScreen()

        const signInButton =
            findLastButtonByText(
                renderer,
                'Sign in'
            )

        act(() => {
            signInButton.props.onPress()
        })

        expect(
            findText(
                renderer,
                'Please enter your email and password.'
            )
        ).toBeTruthy()

        expect(
            supabase.auth
                .signInWithPassword
        ).not.toHaveBeenCalled()
    })

    test('shows an error when the password is too short', () => {
        const renderer =
            renderScreen()

        const emailInput =
            findByProps(
                renderer,
                {
                    placeholder:
                        'you@example.com',
                }
            )

        const passwordInput =
            findByProps(
                renderer,
                {
                    placeholder:
                        'Password',
                }
            )

        act(() => {
            emailInput.props.onChangeText(
                'test@example.com'
            )

            passwordInput.props.onChangeText(
                '12345'
            )
        })

        const signInButton =
            findLastButtonByText(
                renderer,
                'Sign in'
            )

        act(() => {
            signInButton.props.onPress()
        })

        expect(
            findText(
                renderer,
                'Your password must be at least 6 characters.'
            )
        ).toBeTruthy()

        expect(
            supabase.auth
                .signInWithPassword
        ).not.toHaveBeenCalled()
    })

    test('signs in with trimmed email and password', async () => {
        const renderer =
            renderScreen()

        const emailInput =
            findByProps(
                renderer,
                {
                    placeholder:
                        'you@example.com',
                }
            )

        const passwordInput =
            findByProps(
                renderer,
                {
                    placeholder:
                        'Password',
                }
            )

        act(() => {
            emailInput.props.onChangeText(
                '  test@example.com  '
            )

            passwordInput.props.onChangeText(
                'password123'
            )
        })

        const signInButton =
            findLastButtonByText(
                renderer,
                'Sign in'
            )

        await act(
            async () => {
                await signInButton.props.onPress()
            }
        )

        expect(
            supabase.auth
                .signInWithPassword
        ).toHaveBeenCalledTimes(1)

        expect(
            supabase.auth
                .signInWithPassword
        ).toHaveBeenCalledWith({
            email:
                'test@example.com',
            password:
                'password123',
        })
    })

    test('shows a sign in error returned by supabase', async () => {
        supabase.auth.signInWithPassword.mockResolvedValueOnce({
            data: {
                user: null,
                session: null,
            },
            error: {
                message:
                    'Invalid login credentials',
            },
        })

        const renderer =
            renderScreen()

        const emailInput =
            findByProps(
                renderer,
                {
                    placeholder:
                        'you@example.com',
                }
            )

        const passwordInput =
            findByProps(
                renderer,
                {
                    placeholder:
                        'Password',
                }
            )

        act(() => {
            emailInput.props.onChangeText(
                'test@example.com'
            )

            passwordInput.props.onChangeText(
                'password123'
            )
        })

        const signInButton =
            findLastButtonByText(
                renderer,
                'Sign in'
            )

        await act(
            async () => {
                await signInButton.props.onPress()
            }
        )

        expect(
            findText(
                renderer,
                'Invalid login credentials'
            )
        ).toBeTruthy()
    })

    test('requires matching passwords during sign up', () => {
        const renderer =
            renderScreen()

        const signUpButton =
            findButtonByText(
                renderer,
                'Sign up'
            )

        act(() => {
            signUpButton.props.onPress()
        })

        const inputs =
            renderer.root.findAllByType(
                TextInput
            )

        act(() => {
            inputs[0].props.onChangeText(
                'test@example.com'
            )

            inputs[1].props.onChangeText(
                'password123'
            )

            inputs[2].props.onChangeText(
                'different123'
            )
        })

        const createAccountButton =
            findButtonByText(
                renderer,
                'Create account'
            )

        act(() => {
            createAccountButton.props.onPress()
        })

        expect(
            findText(
                renderer,
                'Your passwords do not match.'
            )
        ).toBeTruthy()

        expect(
            supabase.auth.signUp
        ).not.toHaveBeenCalled()
    })

    test('signs up successfully when email confirmation is required', async () => {
        const renderer =
            renderScreen()

        const signUpButton =
            findButtonByText(
                renderer,
                'Sign up'
            )

        act(() => {
            signUpButton.props.onPress()
        })

        const inputs =
            renderer.root.findAllByType(
                TextInput
            )

        act(() => {
            inputs[0].props.onChangeText(
                '  new@example.com  '
            )

            inputs[1].props.onChangeText(
                'password123'
            )

            inputs[2].props.onChangeText(
                'password123'
            )
        })

        const createAccountButton =
            findButtonByText(
                renderer,
                'Create account'
            )

        await act(
            async () => {
                await createAccountButton.props.onPress()
            }
        )

        expect(
            supabase.auth.signUp
        ).toHaveBeenCalledTimes(1)

        expect(
            supabase.auth.signUp
        ).toHaveBeenCalledWith({
            email:
                'new@example.com',
            password:
                'password123',
        })

        expect(
            findText(
                renderer,
                'Account created! Check your email to confirm your account, then sign in.'
            )
        ).toBeTruthy()

        expect(
            findText(
                renderer,
                'Welcome back'
            )
        ).toBeTruthy()
    })

    test('handles a successful sign up with an active session', async () => {
        supabase.auth.signUp.mockResolvedValueOnce({
            data: {
                user: {
                    id: 'new-user',
                },
                session: {
                    access_token:
                        'new-token',
                },
            },
            error: null,
        })

        const renderer =
            renderScreen()

        const signUpButton =
            findButtonByText(
                renderer,
                'Sign up'
            )

        act(() => {
            signUpButton.props.onPress()
        })

        const inputs =
            renderer.root.findAllByType(
                TextInput
            )

        act(() => {
            inputs[0].props.onChangeText(
                'new@example.com'
            )

            inputs[1].props.onChangeText(
                'password123'
            )

            inputs[2].props.onChangeText(
                'password123'
            )
        })

        const createAccountButton =
            findButtonByText(
                renderer,
                'Create account'
            )

        await act(
            async () => {
                await createAccountButton.props.onPress()
            }
        )

        expect(
            supabase.auth.signUp
        ).toHaveBeenCalledTimes(1)

        expect(
            findText(
                renderer,
                'Welcome back'
            )
        ).toBeFalsy()
    })

    test('shows a sign up error returned by supabase', async () => {
        supabase.auth.signUp.mockResolvedValueOnce({
            data: {
                user: null,
                session: null,
            },
            error: {
                message:
                    'Email already registered',
            },
        })

        const renderer =
            renderScreen()

        const signUpButton =
            findButtonByText(
                renderer,
                'Sign up'
            )

        act(() => {
            signUpButton.props.onPress()
        })

        const inputs =
            renderer.root.findAllByType(
                TextInput
            )

        act(() => {
            inputs[0].props.onChangeText(
                'existing@example.com'
            )

            inputs[1].props.onChangeText(
                'password123'
            )

            inputs[2].props.onChangeText(
                'password123'
            )
        })

        const createAccountButton =
            findButtonByText(
                renderer,
                'Create account'
            )

        await act(
            async () => {
                await createAccountButton.props.onPress()
            }
        )

        expect(
            findText(
                renderer,
                'Email already registered'
            )
        ).toBeTruthy()
    })

    test('continues as a guest successfully', async () => {
        const renderer =
            renderScreen()

        const guestButton =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'continue as guest',
                }
            )

        await act(
            async () => {
                await guestButton.props.onPress()
            }
        )

        expect(
            supabase.auth
                .signInAnonymously
        ).toHaveBeenCalledTimes(1)
    })

    test('shows a guest authentication error', async () => {
        supabase.auth.signInAnonymously.mockResolvedValueOnce({
            data: {
                user: null,
                session: null,
            },
            error: {
                message:
                    'Anonymous sign in is disabled',
            },
        })

        const renderer =
            renderScreen()

        const guestButton =
            findByProps(
                renderer,
                {
                    accessibilityLabel:
                        'continue as guest',
                }
            )

        await act(
            async () => {
                await guestButton.props.onPress()
            }
        )

        expect(
            findText(
                renderer,
                'Anonymous sign in is disabled'
            )
        ).toBeTruthy()
    })
})