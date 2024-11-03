import { useEffect, useCallback, Children, type ReactNode } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	ScrollView,
} from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	runOnJS,
	Easing,
	ReduceMotion,
} from "react-native-reanimated";
import { PanResponder } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MIN_DRAWER_HEIGHT = 200;
const MAX_DRAWER_HEIGHT = SCREEN_HEIGHT - 20;
const HANDLE_HEIGHT = 45;

const timingConfigs = {
	toggle: {
		duration: 400,
		easing: Easing.bezier(0.33, 1, 0.68, 1),
		reduceMotion: ReduceMotion.System,
	},
	gesture: {
		duration: 300,
		easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		reduceMotion: ReduceMotion.System,
	},
} as const;

type Props = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	description?: string;
	upperLeftSlot?: ReactNode;
	height?: "full" | number;
	children: ReactNode;
};

export const SlidingDrawer = ({
	isOpen,
	onOpenChange,
	title,
	description,
	upperLeftSlot,
	height,
	children,
}: Props) => {
	if (height === "full") {
		height = SCREEN_HEIGHT;
	}
	const isAnimating = useSharedValue(false);
	const translateY = useSharedValue(MAX_DRAWER_HEIGHT);
	const drawerHeight = useSharedValue(MAX_DRAWER_HEIGHT);
	const isDraggingHandle = useSharedValue(false);

	const updateDrawerHeight = useCallback(
		(contentHeight: number) => {
			const totalHeight = height || contentHeight + HANDLE_HEIGHT;
			const newHeight = Math.max(
				MIN_DRAWER_HEIGHT,
				Math.min(totalHeight, MAX_DRAWER_HEIGHT),
			);

			if (Math.abs(drawerHeight.value - newHeight) > 1) {
				drawerHeight.value = newHeight;
				// If drawer is open, update position to match new height
				if (translateY.value < 0) {
					translateY.value = -newHeight;
				}
			}
		},
		[height],
	);

	const handleContentSizeChange = useCallback(
		(w: number, h: number) => {
			updateDrawerHeight(h);
		},
		[updateDrawerHeight],
	);

	const panResponder = PanResponder.create({
		onMoveShouldSetPanResponder: (_, gestureState) => {
			const isVerticalGesture =
				Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
			return isVerticalGesture;
		},
		onPanResponderGrant: (event) => {
			isDraggingHandle.value = event.nativeEvent.locationY < HANDLE_HEIGHT;
		},
		onPanResponderMove: (_, gestureState) => {
			if (isDraggingHandle.value) {
				const newTranslateY = translateY.value + gestureState.dy;
				translateY.value = Math.min(
					MAX_DRAWER_HEIGHT,
					Math.max(-drawerHeight.value, newTranslateY),
				);
			}
		},
		onPanResponderRelease: (_, gestureState) => {
			if (isDraggingHandle.value) {
				const shouldClose =
					gestureState.vy > 0.5 ||
					(gestureState.vy >= 0 && translateY.value > -drawerHeight.value / 2);

				isAnimating.value = true;
				if (shouldClose) {
					translateY.value = withTiming(
						MAX_DRAWER_HEIGHT,
						timingConfigs.gesture,
						() => {
							isAnimating.value = false;
							runOnJS(onOpenChange)(false);
						},
					);
				} else {
					translateY.value = withTiming(
						-drawerHeight.value,
						timingConfigs.gesture,
						() => {
							isAnimating.value = false;
							runOnJS(onOpenChange)(true);
						},
					);
				}
			}
			isDraggingHandle.value = false;
		},
	});

	useEffect(() => {
		if (isAnimating.value) return;

		isAnimating.value = true;
		translateY.value = withTiming(
			isOpen ? -drawerHeight.value : MAX_DRAWER_HEIGHT,
			timingConfigs.toggle,
			() => {
				isAnimating.value = false;
			},
		);
	}, [isOpen, drawerHeight.value]);

	const rBottomSheetStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		height: drawerHeight.value,
	}));

	return (
		<Animated.View
			style={[styles.bottomSheetContainer, rBottomSheetStyle]}
			{...panResponder.panHandlers}
		>
			<View style={styles.handleArea}>
				<View style={styles.header}>
					{upperLeftSlot ?? (
						<View style={{ ...styles.closeButton, width: 32 }} />
					)}
					<View style={styles.line} />
					<TouchableOpacity
						onPress={() => onOpenChange(false)}
						style={styles.closeButton}
					>
						<Text style={styles.closeButtonText}>✕</Text>
					</TouchableOpacity>
				</View>
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				onContentSizeChange={handleContentSizeChange}
				bounces={false}
				showsVerticalScrollIndicator={true}
			>
				{title && <Text style={styles.title}>{title}</Text>}
				{description && <Text style={styles.description}>{description}</Text>}
				{children}
			</ScrollView>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	bottomSheetContainer: {
		width: "100%",
		backgroundColor: "white",
		position: "absolute",
		bottom: -MAX_DRAWER_HEIGHT,
		left: 0,
		right: 0,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -3,
		},
		shadowOpacity: 0.27,
		shadowRadius: 4.65,
		elevation: 6,
	},
	handleArea: {
		paddingTop: 10,
		paddingHorizontal: 10,
		height: HANDLE_HEIGHT,
	},
	line: {
		width: 75,
		height: 4,
		backgroundColor: "grey",
		alignSelf: "center",
		marginVertical: 15,
		borderRadius: 2,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 20,
		paddingTop: 0,
	},
	closeButton: {
		padding: 10,
	},
	closeButtonText: {
		fontSize: 20,
		color: "#333",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
	},
	description: {
		fontSize: 14,
		marginBottom: 20,
		color: "#666",
	},
});
