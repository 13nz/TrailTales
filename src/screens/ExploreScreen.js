import {
    ScrollView,
    View,
    Text,
    Pressable,
    TextInput,
    StyleSheet,
} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'

import theme from '../constants/theme'
import SectionHeader from '../components/SectionHeader'
import ParkCard from '../components/ParkCard'

// provides the main discovery hub for parks, trails, campgrounds, and activities
export default function ExploreScreen() {
    const navigation = useNavigation()

    const [searchQuery, setSearchQuery] =
        useState('')

    // opens the selected featured park using the same park detail screen used elsewhere in the app
    const handleParkPress = () => {
        navigation.navigate(
            'ParkDetail',
            {
                parkId:
                    'great-smoky-mountains',
            }
        )
    }

    // opens the global explore search when the user submits a query
    const handleSearchSubmit = () => {
        const query =
            searchQuery.trim()

        if (!query) {
            return
        }

        navigation.navigate(
            'ExploreSearch',
            {
                query,
            }
        )
    }

    return (
        <SafeAreaView
            style={
                styles.safeArea
            }
        >
            <ScrollView
                style={
                    styles.screen
                }
                contentContainerStyle={
                    styles.content
                }
                contentInsetAdjustmentBehavior="automatic"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={
                    false
                }
            >
                <View
                    style={
                        styles.header
                    }
                >
                    <Text
                        style={
                            styles.eyebrow
                        }
                    >
                        TRAIL TALES
                    </Text>

                    <Text
                        style={
                            styles.title
                        }
                    >
                        Where will you wander?
                    </Text>

                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        Discover national parks, trails, and stories
                        from the wild.
                    </Text>
                </View>

                {/* allows users to search across the explore content */}
                <View
                    style={
                        styles.searchBar
                    }
                >
                    <Text
                        style={
                            styles.searchIcon
                        }
                    >
                        ⌕
                    </Text>

                    <TextInput
                        value={
                            searchQuery
                        }
                        onChangeText={
                            setSearchQuery
                        }
                        onSubmitEditing={
                            handleSearchSubmit
                        }
                        placeholder="Search parks, trails, and places"
                        placeholderTextColor={
                            theme.colors.earth
                        }
                        style={
                            styles.searchInput
                        }
                        returnKeyType="search"
                        accessibilityLabel="search parks trails and places"
                    />

                    {searchQuery.length >
                    0 ? (
                        <Pressable
                            onPress={() => {
                                // clears the search field without leaving the explore page
                                setSearchQuery(
                                    ''
                                )
                            }}
                            style={
                                styles.clearButton
                            }
                            accessibilityRole="button"
                            accessibilityLabel="clear search"
                        >
                            <Text
                                style={
                                    styles.clearText
                                }
                            >
                                ×
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                <View
                    style={
                        styles.section
                    }
                >
                    <SectionHeader
                        title="Featured park"
                        actionLabel="See all"
                        onActionPress={() => {
                            // opens the complete national park directory
                            navigation.navigate(
                                'ParkDirectory'
                            )
                        }}
                    />

                    <ParkCard
                        name="Great Smoky Mountains"
                        location="Tennessee · North Carolina"
                        description="Explore mist-covered mountains, forest trails, wildlife, and the stories connected to one of America's most visited national parks."
                        onPress={
                            handleParkPress
                        }
                    />
                </View>

                <View
                    style={
                        styles.section
                    }
                >
                    <SectionHeader
                        title="Explore"
                    />

                    <View
                        style={
                            styles.categoryGrid
                        }
                    >
                        <CategoryButton
                            label="National Parks"
                            icon="◇"
                            onPress={() => {
                                // opens the national park directory
                                navigation.navigate(
                                    'ParkDirectory'
                                )
                            }}
                        />

                        <CategoryButton
                            label="Trails"
                            icon="⌁"
                            onPress={() => {
                                // opens the complete trail directory
                                navigation.navigate(
                                    'TrailDirectory'
                                )
                            }}
                        />

                        <CategoryButton
                            label="Campgrounds"
                            icon="⌂"
                            onPress={() => {
                                // opens the complete campground directory
                                navigation.navigate(
                                    'CampgroundDirectory'
                                )
                            }}
                        />

                        <CategoryButton
                            label="Activities"
                            icon="✦"
                            onPress={() => {
                                // opens the activity discovery directory
                                navigation.navigate(
                                    'ActivityDirectory'
                                )
                            }}
                        />
                    </View>
                </View>

                <View
                    style={
                        styles.section
                    }
                >
                    <SectionHeader
                        title="Your journey"
                    />

                    <View
                        style={
                            styles.journeyCard
                        }
                    >
                        <Text
                            style={
                                styles.journeyTitle
                            }
                        >
                            Start your passport
                        </Text>

                        <Text
                            style={
                                styles.journeyBody
                            }
                        >
                            Visit a national park and collect your first
                            Trail Tales stamp.
                        </Text>

                        <Pressable
                            style={
                                styles.journeyButton
                            }
                            onPress={() => {
                                // opens the passport experience when it is available
                                navigation.navigate(
                                    'Passport'
                                )
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="view passport"
                        >
                            <Text
                                style={
                                    styles.journeyButtonText
                                }
                            >
                                View passport
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

function CategoryButton({
    label,
    icon,
    onPress,
}) {
    return (
        <Pressable
            style={({
                pressed,
            }) => [
                styles.categoryButton,
                pressed &&
                    styles.pressed,
            ]}
            onPress={
                onPress
            }
            accessibilityRole="button"
            accessibilityLabel={
                label
            }
        >
            {/* simple symbols keep the explore page lightweight while the icon system is finalized */}
            <Text
                style={
                    styles.categoryIcon
                }
            >
                {icon}
            </Text>

            <Text
                style={
                    styles.categoryLabel
                }
            >
                {label}
            </Text>
        </Pressable>
    )
}

const styles =
    StyleSheet.create({
        screen: {
            backgroundColor:
                theme.colors.parchment,
            flex: 1,
        },

        safeArea: {
            backgroundColor:
                theme.colors.parchment,
            flex: 1,
        },

        content: {
            padding:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.xxl,
            paddingBottom:
                theme.spacing.xxxl,
        },

        header: {
            marginBottom:
                theme.spacing.lg,
        },

        eyebrow: {
            color:
                theme.colors.forest,
            fontSize:
                theme.typography
                    .label.fontSize,
            fontWeight: '700',
            letterSpacing: 1.5,
        },

        title: {
            color:
                theme.colors.ink,
            fontSize:
                theme.typography
                    .display.fontSize,
            fontWeight:
                theme.typography
                    .display.fontWeight,
            lineHeight:
                theme.typography
                    .display.lineHeight,
            marginTop:
                theme.spacing.sm,
        },

        subtitle: {
            color:
                theme.colors.earth,
            fontSize:
                theme.typography
                    .body.fontSize,
            lineHeight:
                theme.typography
                    .body.lineHeight,
            marginTop:
                theme.spacing.sm,
        },

        searchBar: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors.canvas,
            borderRadius:
                theme.radii.md,
            flexDirection:
                'row',
            minHeight: 52,
            paddingHorizontal:
                theme.spacing.md,
        },

        searchIcon: {
            color:
                theme.colors.forest,
            fontSize: 24,
            marginRight:
                theme.spacing.sm,
        },

        searchInput: {
            color:
                theme.colors.ink,
            flex: 1,
            fontSize:
                theme.typography
                    .bodySmall
                    .fontSize,
            minHeight: 48,
        },

        clearButton: {
            alignItems:
                'center',
            height: 32,
            justifyContent:
                'center',
            width: 32,
        },

        clearText: {
            color:
                theme.colors.earth,
            fontSize: 22,
        },

        section: {
            marginTop:
                theme.spacing.xxxl,
        },

        categoryGrid: {
            flexDirection:
                'row',
            flexWrap:
                'wrap',
            gap:
                theme.spacing.md,
        },

        categoryButton: {
            alignItems:
                'center',
            backgroundColor:
                theme.colors.canvas,
            borderRadius:
                theme.radii.md,
            justifyContent:
                'center',
            minHeight: 110,
            padding:
                theme.spacing.md,
            width: '47%',
            ...theme.shadows
                .card,
        },

        pressed: {
            opacity: 0.8,
        },

        categoryIcon: {
            color:
                theme.colors.forest,
            fontSize: 28,
            marginBottom:
                theme.spacing.sm,
        },

        categoryLabel: {
            color:
                theme.colors.ink,
            fontSize:
                theme.typography
                    .bodySmall
                    .fontSize,
            fontWeight: '600',
            textAlign:
                'center',
        },

        journeyCard: {
            backgroundColor:
                theme.colors.forest,
            borderRadius:
                theme.radii.lg,
            padding:
                theme.spacing.lg,
        },

        journeyTitle: {
            color:
                theme.colors.parchment,
            fontSize:
                theme.typography
                    .heading.fontSize,
            fontWeight:
                theme.typography
                    .heading.fontWeight,
            lineHeight:
                theme.typography
                    .heading.lineHeight,
        },

        journeyBody: {
            color:
                theme.colors.canvas,
            fontSize:
                theme.typography
                    .body.fontSize,
            lineHeight:
                theme.typography
                    .body.lineHeight,
            marginTop:
                theme.spacing.sm,
        },

        journeyButton: {
            alignSelf:
                'flex-start',
            backgroundColor:
                theme.colors.parchment,
            borderRadius:
                theme.radii.sm,
            marginTop:
                theme.spacing.lg,
            paddingHorizontal:
                theme.spacing.md,
            paddingVertical:
                theme.spacing.sm,
        },

        journeyButtonText: {
            color:
                theme.colors.forest,
            fontSize:
                theme.typography
                    .bodySmall
                    .fontSize,
            fontWeight: '700',
        },
    })