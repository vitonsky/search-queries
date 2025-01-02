import { escapeRegex, escapeString } from './utils/regex';

export interface ParsedItem {
	keyword?: string;
	value: string;
	modifier?: string;
}

export const getOptionalModifier = (modifiers: string[]) => {
	if (escapeString.length === 0) return '';

	return `(?:${modifiers.map(escapeRegex).join('|')})?`;
};

export const formatSegment = (item: ParsedItem) => {
	const newItem: ParsedItem = { value: item.value };

	if (item.keyword) {
		newItem.keyword = item.keyword;
	}
	if (item.modifier) {
		newItem.modifier = item.modifier;
	}

	return newItem;
};

type Options = {
	modifiers?: string[];
};

export class QueryParser {
	private readonly options;
	constructor(options?: Options) {
		this.options = options ?? {};
	}

	// Parse a key-value pair with optional modifier, handling quoted values correctly
	private parseKeyValuePair(pair: string): ParsedItem {
		// Match for key-value pair with possible modifier and quoted value
		const modifiers = getOptionalModifier(this.options.modifiers ?? []);
		const regex = new RegExp(`^(${modifiers})(\\w+):"(.*)"$`);
		let match = pair.match(regex);

		if (match) {
			const [_, modifier, keyword, value] = match;
			return {
				keyword,
				value: escapeString(value),
				modifier: modifier || undefined,
			};
		}

		// Match for key-value pair with possible modifier and simple value
		const simpleRegex = new RegExp(`^(${modifiers})(\\w+):(\\S+)$`);
		match = pair.match(simpleRegex);

		if (match) {
			const [_, modifier, keyword, value] = match;
			return { keyword, value, modifier: modifier || undefined };
		}

		throw new Error(`Invalid query pair: ${pair}`);
	}

	// Parse raw text, capturing everything that's not part of a key-value pair
	private parseRawText(text: string): string {
		// Remove leading and trailing quotes if they exist
		const unquoted = text.replace(/^"|"$/g, '');
		return escapeString(unquoted.trim()); // Trim and escape text
	}

	// Helper method to split text by spaces while preserving quoted sections
	private splitByQuotes(
		text: string,
		prepareText?: (text: string) => string,
	): ParsedItem[] {
		const result: ParsedItem[] = [];
		let currentWord = '';
		let inQuotes = false;
		let currentModifier = '';

		for (let i = 0; i < text.length; i++) {
			if (
				this.options.modifiers &&
				this.options.modifiers.includes(text[i]) &&
				!inQuotes &&
				currentWord === ''
			) {
				currentModifier = text[i];
			} else if (text[i] === '"' && (i === 0 || text[i - 1] !== '\\')) {
				// If we're not in quotes, start; if we are, end
				inQuotes = !inQuotes;
				currentWord += text[i];
			} else if (text[i] === ' ' && !inQuotes) {
				if (currentWord) {
					result.push(
						formatSegment({
							value: prepareText ? prepareText(currentWord) : currentWord,
							modifier: currentModifier,
						}),
					);
					currentWord = '';
					currentModifier = '';
				}
			} else {
				currentWord += text[i];
			}
		}

		if (currentWord)
			result.push(
				formatSegment({
					value: prepareText ? prepareText(currentWord) : currentWord,
					modifier: currentModifier,
				}),
			);
		return result;
	}

	// Main parsing method that processes the entire query string
	public parse(query: string): ParsedItem[] {
		const result: ParsedItem[] = [];
		let lastIndex = 0; // Keep track of the last processed index in the string

		// Regex to capture key-value pairs (including quoted values)
		const modifiers = getOptionalModifier(this.options.modifiers ?? []);
		const pairRegex = new RegExp(
			`(${modifiers}\\w+:"(?:[^"\\\\]|\\\\.)*"|${modifiers}\\w+:\\S+)`,
			'g',
		);

		let match;
		while ((match = pairRegex.exec(query)) !== null) {
			// Capture raw text before this match
			if (match.index > lastIndex) {
				const rawSegment = query.slice(lastIndex, match.index).trim();
				if (rawSegment) {
					result.push(...this.splitByQuotes(rawSegment, this.parseRawText));
				}
			}

			// Process the key-value pair
			result.push(this.parseKeyValuePair(match[0]));
			lastIndex = pairRegex.lastIndex;
		}

		// Add any remaining raw text after the last key-value pair
		if (lastIndex < query.length) {
			const remainingRawText = query.slice(lastIndex).trim();
			if (remainingRawText) {
				result.push(...this.splitByQuotes(remainingRawText, this.parseRawText));
			}
		}

		return result;
	}
}
