export const getTextColorBasedOnBg = (hex: string) => {
	// Ensure the hex code is in the correct format
	if (hex.charAt(0) === "#") {
		hex = hex.slice(1);
	}

	// Convert 3-digit hex to 6-digit hex
	if (hex.length === 3) {
		hex = hex
			.split("")
			.map((char) => char + char)
			.join("");
	}

	const r = Number.parseInt(hex.slice(0, 2), 16);
	const g = Number.parseInt(hex.slice(2, 4), 16);
	const b = Number.parseInt(hex.slice(4, 6), 16);

	// Calculate the relative luminance (using the sRGB color space)
	const luminance =
		0.2126 * getRelativeChannel(r) +
		0.7152 * getRelativeChannel(g) +
		0.0722 * getRelativeChannel(b);

	return luminance > 0.5 ? "#000000" : "#ffffff";
};

// Helper function to convert RGB values to a linear scale
const getRelativeChannel = (value: number) => {
	value /= 255;
	return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};
