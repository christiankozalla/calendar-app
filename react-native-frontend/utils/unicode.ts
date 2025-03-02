export function encode(base: string, bytes: Uint8Array): string {
	let result = base;
	for (const byte of bytes) {
		result += byteToVariationSelector(byte);
	}
	return result;
}

export function decode(variationSelectors: string): number[] {
	const result: number[] = [];
	let started = false;

	for (const char of variationSelectors) {
		if (char === "\n") {
			continue; // Skip newlines
		}
		const byte = variationSelectorToByte(char);
		if (byte !== null) {
			result.push(byte);
			started = true;
		} else if (started) {
			break;
		}
	}

	return result;
}

function byteToVariationSelector(byte: number): string {
	if (byte < 16) {
		return String.fromCodePoint(0xfe00 + byte);
	} else {
		return String.fromCodePoint(0xe0100 + (byte - 16));
	}
}

function variationSelectorToByte(variationSelector: string): number | null {
	const codePoint = variationSelector.codePointAt(0);
	if (codePoint === undefined) return null;
	if (codePoint >= 0xfe00 && codePoint <= 0xfe0f) {
		return codePoint - 0xfe00;
	} else if (codePoint >= 0xe0100 && codePoint <= 0xe01ef) {
		return codePoint - 0xe0100 + 16;
	} else {
		return null;
	}
}

// Example usage
//   const baseEmoji: string = '😀';
//   const data: Uint8Array = new Uint8Array([1, 15, 16, 31]);
//   const encoded: string = encode(baseEmoji, data);
//   console.log('Encoded:', encoded);
//   const decoded: number[] = decode(encoded.slice(1));
//   console.log('Decoded:', decoded);
