import React from "react";

import {
	View,
	Text,
	Pressable,
	TextInput,
	StyleSheet,
	PanResponder,
	Keyboard,
	Modal,
	Image,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import theme from "../constants/theme";

import { useTrips } from "../context/TripContext";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../services/supabase";

// displays and edits the freeform scrapbook canvas for one journal page
export default function JournalPageScreen({ route, navigation }) {
	const insets = useSafeAreaInsets();

	const { tripId, pageId } = route.params;

	const {
		trips,
		addJournalElement,
		updateJournalPage,
		deleteJournalPage,
		updateJournalElement,
		deleteJournalElement,
	} = useTrips();

	const [editingElementId, setEditingElementId] = React.useState(null);

	const [editingTitle, setEditingTitle] = React.useState(false);

	const [pageTitle, setPageTitle] = React.useState("Scrapbook Page");

	const [showOptions, setShowOptions] = React.useState(false);

	const [titleSaving, setTitleSaving] = React.useState(false);

	const trip = trips.find((item) => item.id === tripId);

	const page = trip?.journal?.pages?.find((item) => item.id === pageId);

	// drawing states
	const [paintMode, setPaintMode] = React.useState(false);

	const [paintTool, setPaintTool] = React.useState("brush");

	const [paintColor, setPaintColor] = React.useState("#1f2a24");

	const [brushSize, setBrushSize] = React.useState(6);

	const [eraserSize, setEraserSize] = React.useState(20);

	const [activeStroke, setActiveStroke] = React.useState(null);

	const drawingRef = React.useRef(null);

	React.useEffect(() => {
		if (page) {
			setPageTitle(page.title || "Scrapbook Page");
		}
	}, [page?.id, page?.title]);

	if (!trip || !page) {
		return (
			<View style={styles.screen}>
				<Text style={styles.errorText}>
					Journal page could not be found.
				</Text>
			</View>
		);
	}

	const elements = [...(page.elements || [])].sort(
		(a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
	);

	// creates a new text element directly in supabase and selects it for editing
	const handleAddText = async () => {
		Keyboard.dismiss();

		try {
			const highestZIndex = elements.reduce(
				(highest, element) => Math.max(highest, element.zIndex ?? 0),
				0,
			);

			const element = await addJournalElement(page.id, {
				type: "text",
				content: "",
				x: 40,
				y: 120,
				width: null,
				height: null,
				rotation: 0,
				zIndex: highestZIndex + 1,
				fontSize: 18,
			});

			setEditingElementId(element.id);
		} catch (error) {
			console.error("create journal text error:", error);
		}
	};

	// saves text content when editing finishes instead of writing to supabase for every keystroke
	const handleTextChange = async (elementId, content) => {
		try {
			await updateJournalElement(elementId, { content });
		} catch (error) {
			console.error("update journal text error:", error);
		}
	};

	// saves the selected text color to supabase
	const handleTextColorChange = async (elementId, color) => {
		try {
			await updateJournalElement(elementId, {
				textColor: color,
			});
		} catch (error) {
			console.error("update journal text color error:", error);
		}
	};

	// selects a photo, uploads it to supabase storage, and creates the journal image element
	const handleAddPhoto = async () => {
		Keyboard.dismiss();

		try {
			const permission =
				await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (!permission.granted) {
				Alert.alert(
					"Photo access needed",
					"Please allow photo access to add pictures to your journal.",
				);
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsEditing: true,
				quality: 0.9,
			});

			if (result.canceled || !result.assets?.length) {
				return;
			}

			const selectedPhoto = result.assets[0];

			const response = await fetch(selectedPhoto.uri);

			const arrayBuffer = await response.arrayBuffer();

			const fileExtension =
				selectedPhoto.fileName?.split(".").pop() || "jpg";

			const fileName = `${tripId}/${pageId}/${Date.now()}.${fileExtension}`;

			const { data: uploadData, error: uploadError } =
				await supabase.storage
					.from("journal_images")
					.upload(fileName, arrayBuffer, {
						contentType: selectedPhoto.mimeType || "image/jpeg",
						upsert: false,
					});

			if (uploadError) {
				throw uploadError;
			}

			const { data: publicUrlData } = supabase.storage
				.from("journal_images")
				.getPublicUrl(uploadData.path);

			const highestZIndex = elements.reduce(
				(highest, element) => Math.max(highest, element.zIndex ?? 0),
				0,
			);

			await addJournalElement(page.id, {
				type: "image",
				x: 40,
				y: 140,
				width: 240,
				height: 180,
				rotation: 0,
				zIndex: highestZIndex + 1,
				imageUrl: publicUrlData.publicUrl,
			});
		} catch (error) {
			console.error("add journal photo error:", error);

			Alert.alert(
				"Unable to add photo",
				"Something went wrong while adding this photo.",
			);
		}
	};

	// saves the final position after the user finishes dragging an element
	const handleMoveElement = async (elementId, x, y) => {
		try {
			await updateJournalElement(elementId, {
				x,
				y,
			});
		} catch (error) {
			console.error("move journal element error:", error);
		}
	};

	// saves the final dimensions and font size after the user finishes resizing an element
	const handleResizeText = async (elementId, dimensions) => {
		try {
			await updateJournalElement(elementId, {
				width: dimensions.width,
				height: dimensions.height,
				fontSize: dimensions.fontSize,
			});
		} catch (error) {
			console.error("resize journal element error:", error);
		}
	};

	// saves the final rotation after the user finishes rotating an element
	const handleRotateElement = async (elementId, rotation) => {
		try {
			await updateJournalElement(elementId, {
				rotation,
			});
		} catch (error) {
			console.error("rotate journal element error:", error);
		}
	};

	// moves an element to the highest z-index so it appears above every other element
	const handleBringToFront = async (elementId) => {
		const highestZIndex = elements.reduce(
			(highest, element) => Math.max(highest, element.zIndex ?? 0),
			0,
		);

		const currentElement = elements.find(
			(element) => element.id === elementId,
		);

		if (!currentElement) {
			return;
		}

		if ((currentElement.zIndex ?? 0) >= highestZIndex) {
			return;
		}

		try {
			await updateJournalElement(elementId, {
				zIndex: highestZIndex + 1,
			});
		} catch (error) {
			console.error("bring journal element to front error:", error);
		}
	};

	// saves the renamed page title to supabase
	const handleSaveTitle = async () => {
		const trimmedTitle = pageTitle.trim() || "Scrapbook Page";

		setPageTitle(trimmedTitle);

		setTitleSaving(true);

		try {
			await updateJournalPage(page.id, {
				title: trimmedTitle,
			});

			setEditingTitle(false);
			Keyboard.dismiss();
		} catch (error) {
			console.error("update journal page title error:", error);
		} finally {
			setTitleSaving(false);
		}
	};

	// removes the journal page from supabase and returns to the page list
	const handleDeletePage = async () => {
		setShowOptions(false);
		Keyboard.dismiss();
		setEditingElementId(null);

		try {
			await deleteJournalPage(page.id);

			navigation.goBack();
		} catch (error) {
			console.error("delete journal page error:", error);
		}
	};

	// removes every element from the current page while keeping the page itself
	const handleResetPage = async () => {
		setShowOptions(false);
		Keyboard.dismiss();
		setEditingElementId(null);

		try {
			const pageElements = [...(page.elements || [])];

			for (const element of pageElements) {
				await deleteJournalElement(element.id);
			}
		} catch (error) {
			console.error("reset journal page error:", error);
		}
	};

	// removes the selected journal element from supabase and local state
	const handleDeleteElement = async (elementId) => {
		Keyboard.dismiss();
		setEditingElementId(null);

		try {
			await deleteJournalElement(elementId);
		} catch (error) {
			console.error("delete journal element error:", error);
		}
	};

	// deselects the current element and dismisses the keyboard when the page itself is tapped
	const handleCanvasPress = () => {
		Keyboard.dismiss();
	};

	// dismisses the keyboard before leaving the scrapbook page
	const handleGoBack = () => {
		Keyboard.dismiss();
		setEditingElementId(null);
		navigation.goBack();
	};

	return (
		<View
			style={[
				styles.screen,
				{
					paddingTop: insets.top,
				},
			]}
		>
			<View style={styles.header}>
				<Pressable
					onPress={handleGoBack}
					style={styles.headerButton}
					accessibilityRole="button"
					accessibilityLabel="go back"
				>
					<Text style={styles.backText}>‹</Text>
				</Pressable>

				<View style={styles.headerCenter}>
					{editingTitle ? (
						<View style={styles.titleEditRow}>
							<TextInput
								value={pageTitle}
								onChangeText={setPageTitle}
								onBlur={() => {
									if (!titleSaving) {
										handleSaveTitle();
									}
								}}
								autoFocus
								selectTextOnFocus
								maxLength={40}
								style={styles.titleInput}
								returnKeyType="done"
								onSubmitEditing={handleSaveTitle}
								accessibilityLabel="edit scrapbook page title"
							/>

							<Pressable
								onPress={handleSaveTitle}
								style={styles.titleSaveButton}
								accessibilityRole="button"
								accessibilityLabel="save scrapbook page title"
							>
								<Text style={styles.titleSaveText}>✓</Text>
							</Pressable>
						</View>
					) : (
						<Pressable
							onPress={() => {
								Keyboard.dismiss();
								setPageTitle(page.title || "Scrapbook Page");
								setEditingTitle(true);
							}}
							accessibilityRole="button"
							accessibilityLabel="rename scrapbook page"
						>
							<Text style={styles.headerTitle} numberOfLines={1}>
								{page.title || "Scrapbook Page"}
							</Text>
						</Pressable>
					)}

					<Text style={styles.headerDate}>
						{formatJournalDate(trip.startDate)}
					</Text>
				</View>

				<Pressable
					style={styles.headerButton}
					accessibilityRole="button"
					accessibilityLabel="journal page options"
					onPress={() => {
						Keyboard.dismiss();
						setEditingElementId(null);
						setShowOptions(true);
					}}
				>
					<Text style={styles.moreText}>•••</Text>
				</Pressable>
			</View>

			<View style={styles.canvasArea}>
				<View style={styles.paper}>
					<Pressable
						style={styles.canvasDismissLayer}
						onPress={handleCanvasPress}
						accessibilityLabel="scrapbook canvas"
					/>

					{elements.length === 0 ? (
						<View pointerEvents="none" style={styles.emptyCanvas}>
							<Text style={styles.emptyCanvasIcon}>✦</Text>

							<Text style={styles.emptyCanvasTitle}>
								Your story starts here
							</Text>

							<Text style={styles.emptyCanvasText}>
								Add photos, words, and stickers to create your
								scrapbook page.
							</Text>
						</View>
					) : (
						elements.map((element) => {
							if (element.type === "text") {
								return (
									<ScrapbookTextElement
										key={element.id}
										element={element}
										isEditing={
											editingElementId === element.id
										}
										onSelect={() => {
											Keyboard.dismiss();

											setEditingElementId(element.id);

											handleBringToFront(element.id);
										}}
										onChangeText={handleTextChange}
										onChangeColor={handleTextColorChange}
										onDelete={handleDeleteElement}
										onMove={handleMoveElement}
										onResize={handleResizeText}
										onRotate={handleRotateElement}
										onBringToFront={handleBringToFront}
										onFinishEditing={() =>
											setEditingElementId(null)
										}
									/>
								);
							}

							if (element.type === "image") {
								return (
									<ScrapbookImageElement
										key={element.id}
										element={element}
										isSelected={
											editingElementId === element.id
										}
										onSelect={() =>
											setEditingElementId(element.id)
										}
										onChange={updateJournalElement}
										onDelete={deleteJournalElement}
										onBringToFront={handleBringToFront}
									/>
								);
							}
						})
					)}
				</View>
			</View>

			<View
				style={[
					styles.toolbar,
					{
						paddingBottom: insets.bottom + theme.spacing.sm,
					},
				]}
			>
				<ToolbarButton
					icon="T"
					label="Text"
					onPress={handleAddText}
					accessibilityLabel="add text"
				/>

				<ToolbarButton
					icon="▣"
					label="Photo"
					accessibilityLabel="add photo"
					onPress={handleAddPhoto}
				/>

				<ToolbarButton
					icon="✎"
					label="Paint"
					accessibilityLabel="paint"
					onPress={() => {
						Keyboard.dismiss();
						setEditingElementId(null);
						setPaintMode((current) => !current);
						setPaintTool("brush");
					}}
					disabled
				/>

				<ToolbarButton
					icon="✦"
					label="Sticker"
					accessibilityLabel="add sticker"
					disabled
				/>
			</View>

			<Modal
				visible={showOptions}
				transparent
				animationType="fade"
				onRequestClose={() => setShowOptions(false)}
			>
				<Pressable
					style={styles.optionsOverlay}
					onPress={() => setShowOptions(false)}
				>
					<Pressable
						style={styles.optionsMenu}
						onPress={(event) => event.stopPropagation()}
					>
						<Text style={styles.optionsTitle}>Page options</Text>

						<Pressable
							style={styles.optionButton}
							onPress={handleResetPage}
						>
							<Text style={styles.optionText}>Reset page</Text>
						</Pressable>

						<Pressable
							style={styles.optionButton}
							onPress={handleDeletePage}
						>
							<Text
								style={[
									styles.optionText,
									styles.deleteOptionText,
								]}
							>
								Delete page
							</Text>
						</Pressable>

						<Pressable
							style={styles.cancelOptionButton}
							onPress={() => setShowOptions(false)}
						>
							<Text style={styles.cancelOptionText}>Cancel</Text>
						</Pressable>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}

// formats a trip date for the scrapbook header
function formatJournalDate(date) {
	if (!date) {
		return "";
	}

	const parsedDate = new Date(`${date}T12:00:00`);

	if (Number.isNaN(parsedDate.getTime())) {
		return date;
	}

	return parsedDate.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

// renders a text element that can be selected, edited, moved, resized, rotated, and deleted
function ScrapbookTextElement({
	element,
	isEditing,
	onSelect,
	onChangeText,
	onDelete,
	onMove,
	onResize,
	onRotate,
	onBringToFront,
	onFinishEditing,
	onChangeColor,
}) {
	const [position, setPosition] = React.useState({
		x: element.x,
		y: element.y,
	});

	const [rotation, setRotation] = React.useState(element.rotation || 0);

	const [size, setSize] = React.useState({
		width: element.width || null,
		height: element.height || null,
		fontSize: element.fontSize || 18,
	});

	const [editingContent, setEditingContent] = React.useState(
		element.content || "",
	);

	const [displayedContent, setDisplayedContent] = React.useState(
		element.content || "",
	);

	// keeps the latest position available to gesture callbacks
	const positionRef = React.useRef({
		x: element.x,
		y: element.y,
	});

	// keeps the latest size available to gesture callbacks
	const sizeRef = React.useRef({
		width: element.width || null,
		height: element.height || null,
		fontSize: element.fontSize || 18,
	});

	// keeps the latest rotation available to gesture callbacks
	const rotationRef = React.useRef(element.rotation || 0);

	// stores all values from the beginning of the current gesture
	const gestureStartRef = React.useRef(null);

	// tracks whether the current gesture is a one or two finger gesture
	const gestureModeRef = React.useRef(null);

	// prevents deletion from triggering a second text save
	const isDeletingRef = React.useRef(false);

	// to save after gesture is done
	const isSavingGestureRef = React.useRef(false);

	// save text without pressing chekcmark
	const editingContentRef = React.useRef(element.content || "");

	// color states
	const [textColor, setTextColor] = React.useState(
		element.textColor || "#000000",
	);

	const [showColorPicker, setShowColorPicker] = React.useState(false);

	React.useEffect(() => {
		if (isSavingGestureRef.current) {
			return;
		}

		const nextPosition = {
			x: element.x,
			y: element.y,
		};

		const nextSize = {
			width: element.width || null,
			height: element.height || null,
			fontSize: element.fontSize || 18,
		};

		const nextRotation = element.rotation || 0;
		const nextTextColor = element.textColor || "#000000";

		positionRef.current = nextPosition;

		sizeRef.current = nextSize;

		rotationRef.current = nextRotation;

		setPosition(nextPosition);

		setSize(nextSize);

		setRotation(nextRotation);

		setTextColor(nextTextColor);

		if (!isEditing) {
			setEditingContent(element.content || "");
		}

		if (!isEditing) {
			setDisplayedContent(element.content || "");
		}
	}, [
		element.x,
		element.y,
		element.width,
		element.height,
		element.fontSize,
		element.rotation,
		element.content,
		element.textColor,
		isEditing,
	]);

	// gets the distance between two fingers
	const getTouchDistance = (touches) => {
		if (touches.length < 2) {
			return 0;
		}

		const first = touches[0];

		const second = touches[1];

		const dx = second.pageX - first.pageX;

		const dy = second.pageY - first.pageY;

		return Math.sqrt(dx * dx + dy * dy);
	};

	// gets the angle between two fingers
	const getTouchAngle = (touches) => {
		if (touches.length < 2) {
			return 0;
		}

		const first = touches[0];

		const second = touches[1];

		return (
			(Math.atan2(
				second.pageY - first.pageY,
				second.pageX - first.pageX,
			) *
				180) /
			Math.PI
		);
	};

	// normalizes rotation so it stays between -180 and 180 degrees
	const normalizeRotation = (value) => {
		return ((value + 180) % 360) - 180;
	};

	// saves the text after the user finishes editing
	const finishTextEditing = async () => {
		if (isDeletingRef.current) {
			onFinishEditing();
			return;
		}

		const finalContent = editingContentRef.current;

		try {
			await onChangeText(element.id, finalContent);
		} catch (error) {
			console.error("finish journal text error:", error);
		}

		onFinishEditing();
	};

	// handles one finger movement and two finger resize/rotation
	const panResponder = React.useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,

				onMoveShouldSetPanResponder: (event) =>
					event.nativeEvent.touches.length > 0,

				onPanResponderGrant: (event) => {
					const touches = event.nativeEvent.touches;

					onBringToFront(element.id);

					if (touches.length >= 2) {
						const distance = getTouchDistance(touches);

						const angle = getTouchAngle(touches);

						gestureModeRef.current = "transform";

						gestureStartRef.current = {
							distance: distance || 1,
							angle,
							x: positionRef.current.x,
							y: positionRef.current.y,
							width: sizeRef.current.width || 180,
							height: sizeRef.current.height || 50,
							fontSize: sizeRef.current.fontSize,
							rotation: rotationRef.current,
						};
					} else {
						gestureModeRef.current = "move";

						gestureStartRef.current = {
							x: positionRef.current.x,
							y: positionRef.current.y,
						};
					}
				},

				onPanResponderMove: (event, gestureState) => {
					const touches = event.nativeEvent.touches;

					if (touches.length >= 2) {
						if (gestureModeRef.current !== "transform") {
							const distance = getTouchDistance(touches);

							const angle = getTouchAngle(touches);

							gestureModeRef.current = "transform";

							gestureStartRef.current = {
								distance: distance || 1,
								angle,
								x: positionRef.current.x,
								y: positionRef.current.y,
								width: sizeRef.current.width || 180,
								height: sizeRef.current.height || 50,
								fontSize: sizeRef.current.fontSize,
								rotation: rotationRef.current,
							};
						}

						const start = gestureStartRef.current;

						if (!start) {
							return;
						}

						const distance = getTouchDistance(touches);

						const angle = getTouchAngle(touches);

						if (!distance) {
							return;
						}

						// calculates how much the fingers have spread or pinched
						const scale = distance / start.distance;

						const nextWidth = Math.max(
							80,
							Math.min(500, start.width * scale),
						);

						const nextHeight = Math.max(
							35,
							Math.min(500, start.height * scale),
						);

						const nextFontSize = Math.max(
							10,
							Math.min(60, start.fontSize * scale),
						);

						// calculates how much the fingers have twisted
						const nextRotation = normalizeRotation(
							start.rotation + (angle - start.angle),
						);

						const nextSize = {
							width: nextWidth,
							height: nextHeight,
							fontSize: nextFontSize,
						};

						sizeRef.current = nextSize;

						rotationRef.current = nextRotation;

						setSize(nextSize);

						setRotation(nextRotation);

						return;
					}

					if (gestureModeRef.current === "transform") {
						return;
					}

					if (!gestureStartRef.current) {
						return;
					}

					const start = gestureStartRef.current;

					const nextPosition = {
						x: start.x + gestureState.dx,
						y: start.y + gestureState.dy,
					};

					positionRef.current = nextPosition;

					setPosition(nextPosition);
				},

				onPanResponderRelease: async (event) => {
					const mode = gestureModeRef.current;

					if (mode === "move") {
						const finalPosition = positionRef.current;

						await onMove(
							element.id,
							finalPosition.x,
							finalPosition.y,
						);
					}

					if (mode === "transform") {
						const finalSize = sizeRef.current;

						const finalRotation = rotationRef.current;

						isSavingGestureRef.current = true;

						try {
							await onResize(element.id, {
								width: finalSize.width,
								height: finalSize.height,
								fontSize: finalSize.fontSize,
							});

							await onRotate(element.id, finalRotation);
						} finally {
							isSavingGestureRef.current = false;
						}
					}

					gestureStartRef.current = null;

					gestureModeRef.current = null;
				},

				onPanResponderTerminate: async () => {
					const mode = gestureModeRef.current;

					if (mode === "move") {
						const finalPosition = positionRef.current;

						await onMove(
							element.id,
							finalPosition.x,
							finalPosition.y,
						);
					}

					if (mode === "transform") {
						const finalSize = sizeRef.current;

						const finalRotation = rotationRef.current;

						await onResize(element.id, {
							width: finalSize.width,
							height: finalSize.height,
							fontSize: finalSize.fontSize,
						});

						await onRotate(element.id, finalRotation);
					}

					gestureStartRef.current = null;

					gestureModeRef.current = null;
				},
			}),
		[element.id, onMove, onResize, onRotate, onBringToFront],
	);

	return (
		<View
			{...panResponder.panHandlers}
			style={[
				styles.textElement,
				{
					left: position.x,
					top: position.y,
					zIndex: element.zIndex ?? 0,
					transform: [
						{
							rotate: `${rotation}deg`,
						},
					],
				},
				isEditing && styles.textElementEditing,
			]}
		>
			{isEditing ? (
				<TextInput
					value={editingContent}
					onChangeText={(content) => {
						editingContentRef.current = content;

						setEditingContent(content);
					}}
					onBlur={finishTextEditing}
					onEndEditing={(event) => {
						const finalContent = event.nativeEvent.text;

						editingContentRef.current = finalContent;

						setEditingContent(finalContent);
					}}
					multiline
					autoFocus
					style={[
						styles.textInput,
						{
							color: element.textColor || textColor || "#000000",
							fontSize: size.fontSize,
						},
					]}
					placeholder="write something..."
					placeholderTextColor={theme.colors.earth}
					textAlignVertical="top"
					accessibilityLabel={`edit journal text ${element.id}`}
				/>
			) : (
				<Pressable
					onPress={() => {
						onBringToFront(element.id);
						onSelect();
					}}
					style={styles.savedTextContainer}
					accessibilityRole="button"
					accessibilityLabel={`select journal text ${element.id}`}
				>
					<Text
						style={[
							styles.savedText,
							{
								color:
									element.textColor || textColor || "#000000",
								fontSize: size.fontSize,
								maxWidth: size.width || 250,
							},
						]}
					>
						{displayedContent || "Double tap to write"}
					</Text>
				</Pressable>
			)}

			{isEditing ? (
				<Pressable
					onPress={() => setShowColorPicker(!showColorPicker)}
					style={[
						styles.colorButton,
						{
							backgroundColor: textColor,
						},
					]}
					accessibilityRole="button"
					accessibilityLabel="change text color"
				>
					<Text style={styles.colorButtonText}>A</Text>
				</Pressable>
			) : null}

			{isEditing ? (
				<Pressable
					onPress={finishTextEditing}
					style={styles.finishButton}
					accessibilityRole="button"
					accessibilityLabel="finish editing journal text"
				>
					<Text style={styles.finishButtonText}>✓</Text>
				</Pressable>
			) : null}

			{isEditing ? (
				<Pressable
					onPress={async () => {
						isDeletingRef.current = true;

						Keyboard.dismiss();

						await onDelete(element.id);
					}}
					style={styles.deleteButton}
					accessibilityRole="button"
					accessibilityLabel={`delete journal text ${element.id}`}
				>
					<Text style={styles.deleteButtonText}>×</Text>
				</Pressable>
			) : null}

			{isEditing && showColorPicker ? (
				<View style={styles.colorPalette}>
					{[
						"#000000",
						"#5C4033",
						"#7A4E3A",
						"#8B3A62",
						"#B85C75",
						"#D88C9A",
						"#C77D2B",
						"#D4A72C",
						"#557A55",
						"#78966B",
						"#426B7A",
						"#53689A",
						"#FFFFFF",
					].map((color) => (
						<Pressable
							key={color}
							onPress={async () => {
								setTextColor(color);

								setShowColorPicker(false);

								await onChangeColor(element.id, color);
							}}
							style={[
								styles.colorSwatch,
								{
									backgroundColor: color,
								},
								textColor === color &&
									styles.selectedColorSwatch,
							]}
							accessibilityRole="button"
							accessibilityLabel={`set text color ${color}`}
						/>
					))}
				</View>
			) : null}
		</View>
	);
}

// displays and transforms a photo on the scrapbook canvas
function ScrapbookImageElement({
	element,
	onSelect,
	onChange,
	onBringToFront,
	onDelete,
	isSelected,
}) {
	const [position, setPosition] = React.useState({
		x: element.x || 0,
		y: element.y || 0,
	});

	const [size, setSize] = React.useState({
		width: element.width || 240,
		height: element.height || 180,
	});

	const [rotation, setRotation] = React.useState(element.rotation || 0);

	const positionRef = React.useRef(position);

	const sizeRef = React.useRef(size);

	const rotationRef = React.useRef(rotation);

	const gestureRef = React.useRef({
		mode: null,
	});

	React.useEffect(() => {
		const nextPosition = {
			x: element.x || 0,
			y: element.y || 0,
		};

		const nextSize = {
			width: element.width || 240,
			height: element.height || 180,
		};

		const nextRotation = element.rotation || 0;

		positionRef.current = nextPosition;

		sizeRef.current = nextSize;

		rotationRef.current = nextRotation;

		setPosition(nextPosition);

		setSize(nextSize);

		setRotation(nextRotation);
	}, [element.x, element.y, element.width, element.height, element.rotation]);

	const getDistance = (touches) => {
		const first = touches[0];

		const second = touches[1];

		const dx = second.pageX - first.pageX;

		const dy = second.pageY - first.pageY;

		return Math.sqrt(dx * dx + dy * dy);
	};

	const getAngle = (touches) => {
		const first = touches[0];

		const second = touches[1];

		return Math.atan2(
			second.pageY - first.pageY,
			second.pageX - first.pageX,
		);
	};

	const saveTransform = async (nextPosition, nextSize, nextRotation) => {
		positionRef.current = nextPosition;

		sizeRef.current = nextSize;

		rotationRef.current = nextRotation;

		setPosition(nextPosition);

		setSize(nextSize);

		setRotation(nextRotation);

		try {
			await onChange(element.id, {
				x: nextPosition.x,
				y: nextPosition.y,
				width: nextSize.width,
				height: nextSize.height,
				rotation: nextRotation,
			});
		} catch (error) {
			console.error("update journal image transform error:", error);
		}
	};

	const panResponder = React.useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,

				onMoveShouldSetPanResponder: () => true,

				onPanResponderGrant: (event) => {
					const touches = event.nativeEvent.touches;

					onSelect();

					onBringToFront(element.id);

					if (touches.length >= 2) {
						gestureRef.current = {
							mode: "transform",
							startDistance: getDistance(touches),
							startAngle: getAngle(touches),
							startWidth: sizeRef.current.width,
							startHeight: sizeRef.current.height,
							startRotation: rotationRef.current,
							startX: positionRef.current.x,
							startY: positionRef.current.y,
						};
					} else {
						gestureRef.current = {
							mode: "move",
							startX: event.nativeEvent.pageX,
							startY: event.nativeEvent.pageY,
							startElementX: positionRef.current.x,
							startElementY: positionRef.current.y,
						};
					}
				},

				onPanResponderMove: (event) => {
					const touches = event.nativeEvent.touches;

					const gesture = gestureRef.current;

					if (touches.length >= 2 && gesture.mode === "transform") {
						const distance = getDistance(touches);

						const angle = getAngle(touches);

						const scale =
							distance / Math.max(gesture.startDistance, 1);

						const nextWidth = Math.max(
							80,
							Math.min(600, gesture.startWidth * scale),
						);

						const aspectRatio =
							gesture.startHeight /
							Math.max(gesture.startWidth, 1);

						const nextHeight = Math.max(
							60,
							Math.min(600, nextWidth * aspectRatio),
						);

						const angleDelta = angle - gesture.startAngle;

						const nextRotation =
							gesture.startRotation +
							angleDelta * (180 / Math.PI);

						const nextSize = {
							width: nextWidth,
							height: nextHeight,
						};

						sizeRef.current = nextSize;

						rotationRef.current = nextRotation;

						setSize(nextSize);

						setRotation(nextRotation);

						return;
					}

					if (touches.length === 1 && gesture.mode === "move") {
						const touch = touches[0];

						const deltaX = touch.pageX - gesture.startX;

						const deltaY = touch.pageY - gesture.startY;

						const nextPosition = {
							x: gesture.startElementX + deltaX,
							y: gesture.startElementY + deltaY,
						};

						positionRef.current = nextPosition;

						setPosition(nextPosition);
					}
				},

				onPanResponderRelease: async () => {
					const gesture = gestureRef.current;

					if (
						gesture.mode === "move" ||
						gesture.mode === "transform"
					) {
						await saveTransform(
							positionRef.current,
							sizeRef.current,
							rotationRef.current,
						);
					}

					gestureRef.current = {
						mode: null,
					};
				},

				onPanResponderTerminate: async () => {
					await saveTransform(
						positionRef.current,
						sizeRef.current,
						rotationRef.current,
					);

					gestureRef.current = {
						mode: null,
					};
				},
			}),
		[element.id, onSelect, onChange],
	);

	return (
		<View
			{...panResponder.panHandlers}
			style={[
				styles.imageElement,
				{
					left: position.x,
					top: position.y,
					width: size.width,
					height: size.height,
					transform: [
						{
							rotate: `${rotation}deg`,
						},
					],
				},
			]}
		>
			<Image
				source={{
					uri: element.imageUrl,
				}}
				style={styles.journalImage}
				resizeMode="cover"
			/>

			{isSelected ? (
				<Pressable
					style={styles.imageDeleteButton}
					onPress={async () => {
						try {
							await onDelete(element.id);
						} catch (error) {
							console.error("delete journal image error:", error);
						}
					}}
					accessibilityRole="button"
					accessibilityLabel="delete photo"
				>
					<Text style={styles.imageDeleteButtonText}>×</Text>
				</Pressable>
			) : null}
		</View>
	);
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
				disabled && styles.toolbarButtonDisabled,
			]}
			onPress={onPress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
		>
			<View style={styles.toolbarIcon}>
				<Text style={styles.toolbarIconText}>{icon}</Text>
			</View>

			<Text style={styles.toolbarLabel}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	screen: {
		backgroundColor: theme.colors.parchment,
		flex: 1,
	},

	header: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		minHeight: 58,
		paddingHorizontal: theme.spacing.sm,
	},

	headerButton: {
		alignItems: "center",
		height: 42,
		justifyContent: "center",
		width: 42,
	},

	backText: {
		color: theme.colors.forest,
		fontSize: 36,
		fontWeight: "300",
	},

	headerCenter: {
		alignItems: "center",
		flex: 1,
	},

	headerTitle: {
		color: theme.colors.ink,
		fontSize: 17,
		fontWeight: "700",
	},

	headerDate: {
		color: theme.colors.earth,
		fontSize: 10,
		marginTop: 2,
	},

	titleEditRow: {
		alignItems: "center",
		flexDirection: "row",
		maxWidth: 230,
	},

	titleInput: {
		borderBottomColor: theme.colors.forest,
		borderBottomWidth: 1,
		color: theme.colors.ink,
		fontSize: 17,
		fontWeight: "700",
		maxWidth: 190,
		minWidth: 100,
		paddingHorizontal: 2,
		paddingVertical: 2,
		textAlign: "center",
	},

	titleSaveButton: {
		alignItems: "center",
		backgroundColor: theme.colors.forest,
		borderRadius: 12,
		height: 24,
		justifyContent: "center",
		marginLeft: 5,
		width: 24,
	},

	titleSaveText: {
		color: theme.colors.parchment,
		fontSize: 15,
		fontWeight: "700",
	},

	moreText: {
		color: theme.colors.forest,
		fontSize: 18,
		fontWeight: "700",
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
		overflow: "hidden",
		padding: theme.spacing.lg,
		position: "relative",
		...theme.shadows.card,
	},

	canvasDismissLayer: {
		...StyleSheet.absoluteFillObject,
	},

	emptyCanvas: {
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: theme.spacing.xl,
	},

	emptyCanvasIcon: {
		color: theme.colors.forest,
		fontSize: 34,
	},

	emptyCanvasTitle: {
		color: theme.colors.ink,
		fontSize: 17,
		fontWeight: "700",
		marginTop: theme.spacing.md,
		textAlign: "center",
	},

	emptyCanvasText: {
		color: theme.colors.earth,
		fontSize: 12,
		lineHeight: 18,
		marginTop: theme.spacing.xs,
		textAlign: "center",
	},

	textElementEditing: {
		backgroundColor: "rgba(255,255,255,0.45)",
		borderColor: theme.colors.forest,
		borderRadius: theme.radii.sm,
		borderWidth: 1,
		borderStyle: "dashed",
	},

	textElement: {
		alignSelf: "flex-start",
		position: "absolute",
	},

	savedTextContainer: {
		alignSelf: "flex-start",
		padding: 4,
	},

	savedText: {
		color: theme.colors.ink,
		flexShrink: 1,
	},

	textInput: {
		color: theme.colors.ink,
		minHeight: 30,
		padding: 4,
		textAlignVertical: "top",
	},

	deleteButton: {
		alignItems: "center",
		backgroundColor: theme.colors.forest,
		borderRadius: 12,
		height: 24,
		justifyContent: "center",
		position: "absolute",
		right: -10,
		top: -10,
		width: 24,
	},

	deleteButtonText: {
		color: theme.colors.parchment,
		fontSize: 18,
		fontWeight: "700",
		lineHeight: 20,
	},

	finishButton: {
		alignItems: "center",
		backgroundColor: theme.colors.forest,
		borderRadius: 12,
		height: 24,
		justifyContent: "center",
		position: "absolute",
		right: 18,
		top: -10,
		width: 24,
	},

	finishButtonText: {
		color: theme.colors.parchment,
		fontSize: 15,
		fontWeight: "700",
		lineHeight: 18,
	},

	resizeHandle: {
		alignItems: "center",
		backgroundColor: theme.colors.forest,
		borderRadius: 10,
		bottom: -9,
		height: 20,
		justifyContent: "center",
		position: "absolute",
		right: -9,
		width: 20,
	},

	resizeHandleText: {
		color: theme.colors.parchment,
		fontSize: 12,
		fontWeight: "700",
	},

	rotationHandle: {
		alignItems: "center",
		backgroundColor: theme.colors.forest,
		borderRadius: 10,
		height: 20,
		justifyContent: "center",
		position: "absolute",
		right: -9,
		top: 18,
		width: 20,
	},

	rotationHandleText: {
		color: theme.colors.parchment,
		fontSize: 13,
		fontWeight: "700",
	},

	toolbar: {
		alignItems: "flex-start",
		backgroundColor: theme.colors.parchment,
		borderTopColor: theme.colors.sage,
		borderTopWidth: 1,
		flexDirection: "row",
		justifyContent: "space-around",
		paddingHorizontal: theme.spacing.md,
		paddingTop: theme.spacing.sm,
	},

	toolbarButton: {
		alignItems: "center",
		minWidth: 72,
	},

	toolbarButtonDisabled: {
		opacity: 0.35,
	},

	toolbarIcon: {
		alignItems: "center",
		backgroundColor: theme.colors.sage,
		borderRadius: 22,
		height: 44,
		justifyContent: "center",
		width: 44,
	},

	toolbarIconText: {
		color: theme.colors.forest,
		fontSize: 19,
		fontWeight: "700",
	},

	toolbarLabel: {
		color: theme.colors.earth,
		fontSize: 10,
		fontWeight: "600",
		marginTop: 4,
	},

	optionsOverlay: {
		alignItems: "flex-end",
		backgroundColor: "rgba(0,0,0,0.2)",
		flex: 1,
		justifyContent: "flex-start",
		paddingRight: theme.spacing.md,
		paddingTop: theme.spacing.xl + theme.spacing.lg,
	},

	optionsMenu: {
		backgroundColor: theme.colors.parchment,
		borderColor: theme.colors.sage,
		borderRadius: theme.radii.md,
		borderWidth: 1,
		minWidth: 190,
		padding: theme.spacing.sm,
		...theme.shadows.card,
	},

	optionsTitle: {
		color: theme.colors.ink,
		fontSize: 14,
		fontWeight: "700",
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
	},

	optionButton: {
		borderRadius: theme.radii.sm,
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.md,
	},

	optionText: {
		color: theme.colors.ink,
		fontSize: 14,
		fontWeight: "600",
	},

	deleteOptionText: {
		color: theme.colors.forest,
	},

	cancelOptionButton: {
		borderTopColor: theme.colors.sage,
		borderTopWidth: 1,
		marginTop: theme.spacing.xs,
		paddingHorizontal: theme.spacing.sm,
		paddingTop: theme.spacing.md,
	},

	cancelOptionText: {
		color: theme.colors.earth,
		fontSize: 14,
		fontWeight: "600",
		textAlign: "center",
	},

	errorText: {
		color: theme.colors.earth,
		fontSize: 15,
		margin: theme.spacing.xl,
		textAlign: "center",
	},

	colorButton: {
		alignItems: "center",
		backgroundColor: theme.colors.parchment,
		borderColor: theme.colors.forest,
		borderRadius: 12,
		borderWidth: 2,
		height: 24,
		justifyContent: "center",
		position: "absolute",
		right: 46,
		top: -10,
		width: 24,
	},

	colorButtonText: {
		color: theme.colors.ink,
		fontSize: 15,
		fontWeight: "800",
	},

	colorPalette: {
		alignItems: "center",
		backgroundColor: theme.colors.parchment,
		borderColor: theme.colors.sage,
		borderRadius: theme.radii.sm,
		borderWidth: 1,
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		padding: 8,
		position: "absolute",
		right: 0,
		top: 22,
		width: 190,
		zIndex: 100,
	},

	colorSwatch: {
		borderColor: theme.colors.earth,
		borderRadius: 12,
		borderWidth: 1,
		height: 24,
		width: 24,
	},

	selectedColorSwatch: {
		borderColor: theme.colors.forest,
		borderWidth: 3,
	},

	imageElement: {
		position: "absolute",
	},

	journalImage: {
		height: "100%",
		width: "100%",
	},

	imageDeleteButton: {
		alignItems: "center",
		backgroundColor: "#ffffff",
		borderRadius: 14,
		height: 28,
		justifyContent: "center",
		position: "absolute",
		right: -10,
		top: -10,
		width: 28,
	},

	imageDeleteButtonText: {
		color: "#000000",
		fontSize: 20,
		fontWeight: "600",
		lineHeight: 22,
	},

	imageElement: {
		position: "absolute",
	},

	journalImage: {
		height: "100%",
		width: "100%",
	},
});
