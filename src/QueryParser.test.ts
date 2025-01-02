import { QueryParser } from './QueryParser';

const parser = new QueryParser({
	modifiers: ['!', '-'],
});

test('Single word', () => {
	expect(parser.parse(`foo`)).toEqual([{ value: 'foo' }]);
});

test('Many words', () => {
	expect(parser.parse(`foo bar`)).toEqual([{ value: 'foo' }, { value: 'bar' }]);

	expect(parser.parse(`foo bar baz`)).toEqual([
		{ value: 'foo' },
		{ value: 'bar' },
		{ value: 'baz' },
	]);
});

test('Single term with many words', () => {
	expect(parser.parse(`"foo bar"`)).toEqual([{ value: 'foo bar' }]);
});

test('Many terms with many words', () => {
	expect(parser.parse(`"foo bar" and "baz qux"`)).toEqual([
		{ value: 'foo bar' },
		{ value: 'and' },
		{ value: 'baz qux' },
	]);
});

test('Single keyword', () => {
	expect(parser.parse(`label:foo`)).toEqual([{ keyword: 'label', value: 'foo' }]);
});
test('Single keyword term with multiple words', () => {
	expect(parser.parse(`label:"foo bar"`)).toEqual([
		{ keyword: 'label', value: 'foo bar' },
	]);
});

test('Many keywords', () => {
	expect(parser.parse(`label:foo label:bar`)).toEqual([
		{ keyword: 'label', value: 'foo' },
		{ keyword: 'label', value: 'bar' },
	]);
});

test('Many keyword terms with multiple words', () => {
	expect(parser.parse(`label:"foo bar" label:"baz qux"`)).toEqual([
		{ keyword: 'label', value: 'foo bar' },
		{ keyword: 'label', value: 'baz qux' },
	]);
});

test('Keywords with modifiers', () => {
	expect(parser.parse(`!label:foo label:bar`)).toEqual([
		{ keyword: 'label', value: 'foo', modifier: '!' },
		{ keyword: 'label', value: 'bar' },
	]);
});

test(
	'Words with escaped quotes',
	() => {
		expect(parser.parse(`\\"foo\\"`)).toEqual([{ value: '\\"foo\\"' }]);
	},
	{ fails: true },
);

test('Custom modifiers', () => {
	expect(parser.parse(`-label:foo`)).toEqual([
		{ keyword: 'label', value: 'foo', modifier: '-' },
	]);
});

test('Complex query', () => {
	expect(
		parser.parse(
			`label:foo !label:"bar with space" some text text:"bug fix and \\" symbol" "both foo and bar and even \\"\\"\\" symbol" fancy "py"j"am\'a w\'ear"`,
		),
	).toEqual([
		{
			keyword: 'label',
			value: 'foo',
		},
		{
			keyword: 'label',
			modifier: '!',
			value: 'bar with space',
		},
		{
			value: 'some',
		},
		{
			value: 'text',
		},
		{
			keyword: 'text',
			value: 'bug fix and " symbol',
		},
		{
			value: 'both foo and bar and even """ symbol',
		},
		{
			value: 'fancy',
		},
		{
			value: 'py"j"am\'a w\'ear',
		},
	]);
});
