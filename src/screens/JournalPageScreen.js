import React from 'react'

import {
    View,
    Text,
    Pressable,
    TextInput,
    StyleSheet,
    PanResponder,
    Keyboard,
} from 'react-native'

import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

import theme from '../constants/theme'

import {
    useTrips,
} from '../context/TripContext'

import {
    createJournalElement,
} from '../utils/journalUtils'

// displays and edits the freeform scrapbook canvas for one journal page
export default function JournalPageScreen({
    route,
    navigation,
}) {
    const insets =
        useSafeAreaInsets()

    const {
        tripId,
        pageId,
    } = route.params

    const {
        trips,
        updateTrip,
    } = useTrips()

    const [
        editingElementId,
        setEditingElementId,
    ] = React.useState(null)

    const trip =
        trips.find(
            (item) =>
                item.id === tripId
        )

    const page =
        trip?.journal?.pages?.find(
            (item) =>
                item.id === pageId
        )

    if (!trip || !page) {
        return (
            <View
                style={
                    styles.screen
                }
            >
                <Text
                    style={
                        styles.errorText
                    }
                >
                    Journal page could not
                    be found.
                </Text>
            </View>
        )
    }

    const elements =
        page.elements || []

    // updates the current journal page without changing unrelated trip data
    const updatePage = (
        updates
    ) => {
        const updatedPages =
            trip.journal.pages.map(
                (currentPage) =>
                    currentPage.id ===
                    page.id
                        ? {
                              ...currentPage,
                              ...updates,
                          }
                        : currentPage
            )

        updateTrip(
            trip.id,
            {
                journal: {
                    ...trip.journal,
                    pages:
                        updatedPages,
                },
            }
        )
    }

    // adds a new text element and immediately places it into editing mode
    const handleAddText = () => {
        Keyboard.dismiss()

        const element =
            createJournalElement(
                page.id,
                'text',
                {
                    content: '',
                    x: 40,
                    y: 120,
                    width: 230,
                    height: 90,
                    rotation: 0,
                    fontSize: 18,
                }
            )

        updatePage({
            elements: [
                ...elements,
                element,
            ],
        })

        setEditingElementId(
            element.id
        )
    }

    // updates the text content while preserving the element position and styling
    const handleTextChange = (
        elementId,
        content
    ) => {
        updatePage({
            elements:
                elements.map(
                    (element) =>
                        element.id ===
                        elementId
                            ? {
                                  ...element,
                                  content,
                              }
                            : element
                ),
        })
    }

    // updates the position of an element after a drag operation
    const handleMoveElement = (
        elementId,
        x,
        y
    ) => {
        updatePage({
            elements:
                elements.map(
                    (element) =>
                        element.id ===
                        elementId
                            ? {
                                  ...element,
                                  x,
                                  y,
                              }
                            : element
                ),
        })
    }

    // changes the text size while keeping the element anchored to its current position
    // saves the text dimensions and font size after a pinch gesture
    const handleResizeText = (
        elementId,
        dimensions
    ) => {
        updatePage({
            elements:
                elements.map(
                    (element) =>
                        element.id ===
                        elementId
                            ? {
                                ...element,
                                width:
                                    dimensions.width,
                                height:
                                    dimensions.height,
                                fontSize:
                                    dimensions.fontSize,
                            }
                            : element
                ),
        })
    }

    // removes the selected element from the scrapbook page
    const handleDeleteElement = (
        elementId
    ) => {
        Keyboard.dismiss()

        updatePage({
            elements:
                elements.filter(
                    (element) =>
                        element.id !==
                        elementId
                ),
        })

        setEditingElementId(
            null
        )
    }

    // deselects the current element and dismisses the keyboard when the page itself is tapped
    const handleCanvasPress = () => {
        Keyboard.dismiss()
        setEditingElementId(null)
    }

    // dismisses the keyboard before leaving the scrapbook page
    const handleGoBack = () => {
        Keyboard.dismiss()
        setEditingElementId(null)
        navigation.goBack()
    }

    return (
        <View
            style={[
                styles.screen,
                {
                    paddingTop:
                        insets.top,
                },
            ]}
        >
            <View
                style={
                    styles.header
                }
            >
                <Pressable
                    onPress={
                        handleGoBack
                    }
                    style={
                        styles.headerButton
                    }
                    accessibilityRole="button"
                    accessibilityLabel="go back"
                >
                    <Text
                        style={
                            styles.backText
                        }
                    >
                        ‹
                    </Text>
                </Pressable>

                <View
                    style={
                        styles.headerCenter
                    }
                >
                    <Text
                        style={
                            styles.headerTitle
                        }
                    >
                        {page.title}
                    </Text>

                    <Text
                        style={
                            styles.headerDate
                        }
                    >
                        {page.date}
                    </Text>
                </View>

                <Pressable
                    style={
                        styles.headerButton
                    }
                    accessibilityRole="button"
                    accessibilityLabel="journal page options"
                    onPress={() => {
                        // keeps the options button reserved for future page actions
                        Keyboard.dismiss()
                        setEditingElementId(
                            null
                        )
                    }}
                >
                    <Text
                        style={
                            styles.moreText
                        }
                    >
                        •••
                    </Text>
                </Pressable>
            </View>

            <View
                style={
                    styles.canvasArea
                }
            >
                <View
                    style={
                        styles.paper
                    }
                >
                    <Pressable
                        style={
                            styles.canvasDismissLayer
                        }
                        onPress={
                            handleCanvasPress
                        }
                        accessibilityLabel="scrapbook canvas"
                    />

                    {elements.length ===
                    0 ? (
                        <View
                            pointerEvents="none"
                            style={
                                styles.emptyCanvas
                            }
                        >
                            <Text
                                style={
                                    styles.emptyCanvasIcon
                                }
                            >
                                ✦
                            </Text>

                            <Text
                                style={
                                    styles.emptyCanvasTitle
                                }
                            >
                                Your story starts
                                here
                            </Text>

                            <Text
                                style={
                                    styles.emptyCanvasText
                                }
                            >
                                Add photos, words,
                                and stickers to
                                create your
                                scrapbook page.
                            </Text>
                        </View>
                    ) : (
                        elements.map(
                            (element) => {
                                if (
                                    element.type !==
                                    'text'
                                ) {
                                    return null
                                }

                                return (
                                    <ScrapbookTextElement
                                        key={
                                            element.id
                                        }
                                        element={
                                            element
                                        }
                                        isEditing={
                                            editingElementId ===
                                            element.id
                                        }
                                        onSelect={() => {
                                            Keyboard.dismiss()

                                            setEditingElementId(
                                                element.id
                                            )
                                        }}
                                        onChangeText={
                                            handleTextChange
                                        }
                                        onDelete={
                                            handleDeleteElement
                                        }
                                        onMove={
                                            handleMoveElement
                                        }
                                        onResize={
                                            handleResizeText
                                        }
                                    />
                                )
                            }
                        )
                    )}
                </View>
            </View>

            <View
                style={[
                    styles.toolbar,
                    {
                        paddingBottom:
                            insets.bottom +
                            theme.spacing.sm,
                    },
                ]}
            >
                <ToolbarButton
                    icon="T"
                    label="Text"
                    onPress={
                        handleAddText
                    }
                    accessibilityLabel="add text"
                />

                <ToolbarButton
                    icon="▣"
                    label="Photo"
                    accessibilityLabel="add photo"
                    disabled
                />

                <ToolbarButton
                    icon="✦"
                    label="Sticker"
                    accessibilityLabel="add sticker"
                    disabled
                />
            </View>
        </View>
    )
}

// renders a text element that can be selected, edited, moved, resized, and deleted
// renders a text element that can be selected, moved, edited, and pinch-resized
function ScrapbookTextElement({
    element,
    isEditing,
    onSelect,
    onChangeText,
    onDelete,
    onMove,
    onResize,
}) {
    const [position, setPosition] =
        React.useState({
            x: element.x,
            y: element.y,
        })

    const [size, setSize] =
        React.useState({
            width:
                element.width || 230,
            height:
                element.height || 90,
            fontSize:
                element.fontSize || 18,
        })

    // keeps the current position available without causing gesture calculations to reset
    const positionRef =
        React.useRef({
            x: element.x,
            y: element.y,
        })

    // stores the position that existed when the current drag started
    const dragStartRef =
        React.useRef(null)

    // stores the dimensions that existed when the current pinch started
    const pinchStartRef =
        React.useRef(null)

    const getTouchDistance = (
        touches
    ) => {
        if (touches.length < 2) {
            return null
        }

        const first =
            touches[0]

        const second =
            touches[1]

        const dx =
            first.pageX -
            second.pageX

        const dy =
            first.pageY -
            second.pageY

        return Math.sqrt(
            dx * dx + dy * dy
        )
    }

    React.useEffect(() => {
        const nextPosition = {
            x: element.x,
            y: element.y,
        }

        const nextSize = {
            width:
                element.width || 230,
            height:
                element.height || 90,
            fontSize:
                element.fontSize || 18,
        }

        positionRef.current =
            nextPosition

        setPosition(
            nextPosition
        )

        setSize(nextSize)
    }, [
        element.x,
        element.y,
        element.width,
        element.height,
        element.fontSize,
    ])

    // handles one-finger movement and two-finger resizing as separate gestures
    const panResponder =
        React.useMemo(
            () =>
                PanResponder.create({
                    onStartShouldSetPanResponder:
                        () => true,

                    onMoveShouldSetPanResponder:
                        () => true,

                    onPanResponderGrant:
                        (event) => {
                            const touches =
                                event
                                    .nativeEvent
                                    .touches

                            if (
                                touches.length >=
                                2
                            ) {
                                const distance =
                                    getTouchDistance(
                                        touches
                                    )

                                if (
                                    distance
                                ) {
                                    pinchStartRef.current =
                                        {
                                            distance,
                                            width:
                                                size.width,
                                            height:
                                                size.height,
                                            fontSize:
                                                size.fontSize,
                                        }
                                }

                                dragStartRef.current =
                                    null

                                return
                            }

                            // captures the exact position before the finger starts moving
                            dragStartRef.current =
                                {
                                    x: positionRef
                                        .current
                                        .x,
                                    y: positionRef
                                        .current
                                        .y,
                                }

                            pinchStartRef.current =
                                null
                        },

                    onPanResponderMove:
                        (
                            event,
                            gestureState
                        ) => {
                            const touches =
                                event
                                    .nativeEvent
                                    .touches

                            if (
                                touches.length >=
                                2
                            ) {
                                if (
                                    !pinchStartRef.current
                                ) {
                                    return
                                }

                                const distance =
                                    getTouchDistance(
                                        touches
                                    )

                                if (
                                    !distance
                                ) {
                                    return
                                }

                                const scale =
                                    distance /
                                    pinchStartRef
                                        .current
                                        .distance

                                const nextWidth =
                                    Math.max(
                                        100,
                                        Math.min(
                                            500,
                                            pinchStartRef
                                                .current
                                                .width *
                                                scale
                                        )
                                    )

                                const nextHeight =
                                    Math.max(
                                        50,
                                        Math.min(
                                            500,
                                            pinchStartRef
                                                .current
                                                .height *
                                                scale
                                        )
                                    )

                                const nextFontSize =
                                    Math.max(
                                        10,
                                        Math.min(
                                            60,
                                            pinchStartRef
                                                .current
                                                .fontSize *
                                                scale
                                        )
                                    )

                                setSize({
                                    width:
                                        nextWidth,
                                    height:
                                        nextHeight,
                                    fontSize:
                                        nextFontSize,
                                })

                                return
                            }

                            if (
                                !dragStartRef.current
                            ) {
                                return
                            }

                            // calculates movement from the original touch position instead of the current rendered position
                            const nextX =
                                dragStartRef.current
                                    .x +
                                gestureState.dx

                            const nextY =
                                dragStartRef.current
                                    .y +
                                gestureState.dy

                            const nextPosition =
                                {
                                    x: nextX,
                                    y: nextY,
                                }

                            // keeps the live position separate from the persisted trip state
                            positionRef.current =
                                nextPosition

                            setPosition(
                                nextPosition
                            )
                        },

                    onPanResponderRelease:
                        () => {
                            const finalPosition =
                                positionRef.current

                            const finalSize =
                                size

                            // persists the final position only after the gesture finishes
                            onMove(
                                element.id,
                                finalPosition.x,
                                finalPosition.y
                            )

                            // persists the final size after a pinch gesture finishes
                            onResize(
                                element.id,
                                {
                                    width:
                                        finalSize.width,
                                    height:
                                        finalSize.height,
                                    fontSize:
                                        finalSize.fontSize,
                                }
                            )

                            dragStartRef.current =
                                null

                            pinchStartRef.current =
                                null
                        },

                    onPanResponderTerminate:
                        () => {
                            const finalPosition =
                                positionRef.current

                            const finalSize =
                                size

                            // saves the latest position if another native gesture interrupts the drag
                            onMove(
                                element.id,
                                finalPosition.x,
                                finalPosition.y
                            )

                            onResize(
                                element.id,
                                {
                                    width:
                                        finalSize.width,
                                    height:
                                        finalSize.height,
                                    fontSize:
                                        finalSize.fontSize,
                                }
                            )

                            dragStartRef.current =
                                null

                            pinchStartRef.current =
                                null
                        },
                }),
            [
                element.id,
                size,
                onMove,
                onResize,
            ]
        )

    return (
        <View
            {...panResponder.panHandlers}
            style={[
                styles.textElement,
                {
                    left:
                        position.x,
                    top:
                        position.y,
                    width:
                        size.width,
                    minHeight:
                        size.height,
                    transform: [
                        {
                            rotate: `${element.rotation}deg`,
                        },
                    ],
                },
                isEditing &&
                    styles.textElementEditing,
            ]}
        >
            {isEditing ? (
                <TextInput
                    value={
                        element.content
                    }
                    onChangeText={(
                        content
                    ) =>
                        onChangeText(
                            element.id,
                            content
                        )
                    }
                    multiline
                    autoFocus
                    style={[
                        styles.textInput,
                        {
                            fontSize:
                                size.fontSize,
                        },
                    ]}
                    placeholder="write something..."
                    placeholderTextColor={
                        theme.colors.earth
                    }
                    textAlignVertical="top"
                    accessibilityLabel={`edit journal text ${element.id}`}
                />
            ) : (
                <Pressable
                    style={
                        styles.savedTextContainer
                    }
                    onPress={
                        onSelect
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`select journal text ${element.id}`}
                >
                    <Text
                        style={[
                            styles.savedText,
                            {
                                fontSize:
                                    size.fontSize,
                            },
                        ]}
                    >
                        {element.content ||
                            'Double tap to write'}
                    </Text>
                </Pressable>
            )}

            {isEditing ? (
                <Pressable
                    onPress={() =>
                        onDelete(
                            element.id
                        )
                    }
                    style={
                        styles.deleteButton
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`delete journal text ${element.id}`}
                >
                    <Text
                        style={
                            styles.deleteButtonText
                        }
                    >
                        ×
                    </Text>
                </Pressable>
            ) : null}
        </View>
    )
}

// renders a consistent toolbar control for the scrapbook editor
function ToolbarButton({
    icon,
    label,
    onPress,
    accessibilityLabel,
    disabled = false,
}) {
    return (
        <Pressable
            style={[
                styles.toolbarButton,
                disabled &&
                    styles.toolbarButtonDisabled,
            ]}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={
                accessibilityLabel
            }
        >
            <View
                style={
                    styles.toolbarIcon
                }
            >
                <Text
                    style={
                        styles.toolbarIconText
                    }
                >
                    {icon}
                </Text>
            </View>

            <Text
                style={
                    styles.toolbarLabel
                }
            >
                {label}
            </Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.parchment,
        flex: 1,
    },

    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: 58,
        paddingHorizontal: theme.spacing.sm,
    },

    headerButton: {
        alignItems: 'center',
        height: 42,
        justifyContent: 'center',
        width: 42,
    },

    backText: {
        color: theme.colors.forest,
        fontSize: 36,
        fontWeight: '300',
    },

    headerCenter: {
        alignItems: 'center',
        flex: 1,
    },

    headerTitle: {
        color: theme.colors.ink,
        fontSize: 17,
        fontWeight: '700',
    },

    headerDate: {
        color: theme.colors.earth,
        fontSize: 10,
        marginTop: 2,
    },

    moreText: {
        color: theme.colors.forest,
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 2,
    },

    canvasArea: {
        flex: 1,
        padding: theme.spacing.md,
    },

    paper: {
        backgroundColor: theme.colors.canvas,
        borderColor: theme.colors.sage,
        borderWidth: 1,
        flex: 1,
        overflow: 'hidden',
        padding: theme.spacing.lg,
        position: 'relative',
        ...theme.shadows.card,
    },

    canvasDismissLayer: {
        ...StyleSheet.absoluteFillObject,
    },

    emptyCanvas: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xl,
    },

    emptyCanvasIcon: {
        color: theme.colors.forest,
        fontSize: 34,
    },

    emptyCanvasTitle: {
        color: theme.colors.ink,
        fontSize: 17,
        fontWeight: '700',
        marginTop: theme.spacing.md,
        textAlign: 'center',
    },

    emptyCanvasText: {
        color: theme.colors.earth,
        fontSize: 12,
        lineHeight: 18,
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },

    textElement: {
        position: 'absolute',
    },

    textElementEditing: {
        backgroundColor: 'rgba(255,255,255,0.45)',
        borderColor: theme.colors.forest,
        borderRadius: theme.radii.sm,
        borderWidth: 1,
        borderStyle: 'dashed',
    },

    textInput: {
        color: theme.colors.ink,
        flex: 1,
        padding: 4,
        textAlignVertical: 'top',
    },

    savedTextContainer: {
        minHeight: 40,
        padding: 4,
    },

    savedText: {
        color: theme.colors.ink,
    },

    deleteButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.forest,
        borderRadius: 12,
        height: 24,
        justifyContent: 'center',
        position: 'absolute',
        right: -10,
        top: -10,
        width: 24,
    },

    deleteButtonText: {
        color: theme.colors.parchment,
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 20,
    },

    resizeHandle: {
        alignItems: 'center',
        backgroundColor: theme.colors.forest,
        borderRadius: 10,
        bottom: -9,
        height: 20,
        justifyContent: 'center',
        position: 'absolute',
        right: -9,
        width: 20,
    },

    resizeHandleText: {
        color: theme.colors.parchment,
        fontSize: 12,
        fontWeight: '700',
    },

    toolbar: {
        alignItems: 'flex-start',
        backgroundColor: theme.colors.parchment,
        borderTopColor: theme.colors.sage,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.sm,
    },

    toolbarButton: {
        alignItems: 'center',
        minWidth: 72,
    },

    toolbarButtonDisabled: {
        opacity: 0.35,
    },

    toolbarIcon: {
        alignItems: 'center',
        backgroundColor: theme.colors.sage,
        borderRadius: 22,
        height: 44,
        justifyContent: 'center',
        width: 44,
    },

    toolbarIconText: {
        color: theme.colors.forest,
        fontSize: 19,
        fontWeight: '700',
    },

    toolbarLabel: {
        color: theme.colors.earth,
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
    },

    errorText: {
        color: theme.colors.earth,
        fontSize: 15,
        margin: theme.spacing.xl,
        textAlign: 'center',
    },
})