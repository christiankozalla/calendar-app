import { StyleSheet } from "react-native";

export const bottomsheetStyles = StyleSheet.create({
    container: {
        marginTop: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4.65,
        elevation: 4,
    },
    paddingTop: {
        paddingTop: 12,
    },
    paddingHorizontal: {
        paddingHorizontal: 16,
    },
    paddingBottom: {
        paddingBottom: 24,
    },
    marginHorizontal: {
        marginHorizontal: 16
    }
});