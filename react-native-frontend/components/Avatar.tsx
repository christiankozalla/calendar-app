import {
	Image,
	type TextStyle,
	type ImageStyle,
	type StyleProp,
} from "react-native";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { Fragment } from "react";

const sizes = {
	small: {
		image: {
			length: 30,
		},
		icon: {
			fontSize: 24,
		},
	},
	large: {
		image: {
			length: 120,
		},
		icon: {
			fontSize: 96,
		},
	},
	xlarge: {
		image: {
			length: 180,
		},
		icon: {
			fontSize: 124,
		},
	},
};

export const Avatar = ({
	uri,
	size,
	style,
}: {
	uri?: string | null;
	size: keyof typeof sizes;
	style?: StyleProp<ImageStyle> & StyleProp<TextStyle>;
}) => {
	return (
		<Fragment>
			{uri ? (
				<Image
					style={style}
					source={{ uri }}
					width={sizes[size].image.length}
					height={sizes[size].image.length}
					borderRadius={sizes[size].image.length / 2}
				/>
			) : (
				<TabBarIcon name="person-circle" style={[sizes[size].icon, style]} />
			)}
		</Fragment>
	);
};
