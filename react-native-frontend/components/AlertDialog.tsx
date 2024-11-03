import type { ReactNode } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";

export const AlertDialog = ({
	actionText,
	triggerElement,
	descriptionElement,
	action,
	title,
	isVisible,
	onClose,
}: {
	actionText: string;
	triggerElement: ReactNode;
	descriptionElement: ReactNode;
	action: () => void;
	title: string;
	isVisible: boolean;
	onClose: () => void;
}) => {
	return (
		<View>
			<TouchableOpacity onPress={onClose}>{triggerElement}</TouchableOpacity>
			<Modal
				animationType="fade"
				transparent={true}
				visible={isVisible}
				onRequestClose={onClose}
			>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<Text style={styles.modalTitle}>{title}</Text>
						<View style={styles.modalDescription}>{descriptionElement}</View>
						<View style={styles.buttonContainer}>
							<TouchableOpacity style={styles.button} onPress={onClose}>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.button, styles.actionButton]}
								onPress={() => {
									action();
									onClose();
								}}
							>
								<Text style={[styles.buttonText, styles.actionButtonText]}>
									{actionText}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalView: {
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		width: "80%",
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 15,
	},
	modalDescription: {
		marginBottom: 20,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "flex-end",
		width: "100%",
	},
	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
		marginLeft: 10,
	},
	actionButton: {
		backgroundColor: "#FF0000",
	},
	buttonText: {
		color: "#000000",
		fontWeight: "bold",
		textAlign: "center",
	},
	actionButtonText: {
		color: "white",
	},
});
