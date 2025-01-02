export interface ParsedItem {
	keyword?: string;
	value: string;
	modifier?: string;
}

export class QueryParser {
	// Escape function to handle escaped characters like \"
	private escapeString(value: string): string {
		return value.replace(/\\"/g, '"'); // Unescape escaped quotes
	}

	// Parse a key-value pair with optional modifier, handling quoted values correctly
	private parseKeyValuePair(pair: string): ParsedItem {
		// Match for key-value pair with possible modifier and quoted value
		const regex = /^(!?)(\w+):"(.*)"$/;
		let match = pair.match(regex);

		if (match) {
			const [_, modifier, keyword, value] = match;
			return {
				keyword,
				value: this.escapeString(value),
				modifier: modifier || undefined,
			};
		}

		// Match for key-value pair with possible modifier and simple value
		const simpleRegex = /^(!?)(\w+):(\S+)$/;
		match = pair.match(simpleRegex);

		if (match) {
			const [_, modifier, keyword, value] = match;
			return { keyword, value, modifier: modifier || undefined };
		}

		throw new Error(`Invalid query pair: ${pair}`);
	}

	// Parse raw text, capturing everything that's not part of a key-value pair
	private parseRawText(text: string): ParsedItem {
		// Remove leading and trailing quotes if they exist
		const unquoted = text.replace(/^"|"$/g, '');
		return { value: this.escapeString(unquoted.trim()) }; // Trim and escape text
	}

	// Helper method to split text by spaces while preserving quoted sections
	private splitByQuotes(text: string): string[] {
		const result = [];
		let currentWord = '';
		let inQuotes = false;

		for (let i = 0; i < text.length; i++) {
			if (text[i] === '"' && (i === 0 || text[i - 1] !== '\\')) {
				// If we're not in quotes, start; if we are, end
				inQuotes = !inQuotes;
				currentWord += text[i];
			} else if (text[i] === ' ' && !inQuotes) {
				if (currentWord) {
					result.push(currentWord);
					currentWord = '';
				}
			} else {
				currentWord += text[i];
			}
		}

		if (currentWord) result.push(currentWord);
		return result;
	}

	// Main parsing method that processes the entire query string
	public parse(query: string): ParsedItem[] {
		const result: ParsedItem[] = [];
		let lastIndex = 0; // Keep track of the last processed index in the string

		// Regex to capture key-value pairs (including quoted values)
		const pairRegex = /(!?\w+:"(?:[^"\\]|\\.)*"|!?\w+:\S+)/g;

		let match;
		while ((match = pairRegex.exec(query)) !== null) {
			// Capture raw text before this match
			if (match.index > lastIndex) {
				const rawSegment = query.slice(lastIndex, match.index).trim();
				if (rawSegment) {
					const rawWords = this.splitByQuotes(rawSegment);
					for (const word of rawWords) {
						result.push(this.parseRawText(word));
					}
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
				const rawWords = this.splitByQuotes(remainingRawText);
				for (const word of rawWords) {
					result.push(this.parseRawText(word));
				}
			}
		}

		return result;
	}
}
