export const escapeRegex = (input: string) =>
	input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Escape function to handle escaped characters like \"
 */
export const escapeString = (value: string) => {
	return value.replace(/\\('|")/g, '$1'); // Unescape escaped quotes
};
