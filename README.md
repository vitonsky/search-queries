[![](https://img.shields.io/npm/v/search-queries.svg)](https://www.npmjs.com/package/search-queries) ![](https://github.com/vitonsky/search-queries/actions/workflows/codeql-analysis.yml/badge.svg)

Simple and powerful parser for advanced search queries like [GitHub search queries](https://docs.github.com/en/search-github/getting-started-with-searching-on-github/understanding-the-search-syntax).

# Usage

```ts
import { QueryParser } from 'search-queries';

const parser = new QueryParser({ modifiers: ['!', '-'] });

const query = parser.parse(`fancy words label:foo -label:bar and "multiple words string" -"excluded phrase"`);

// Yield object equal to
expect(query).toEqual([
  { value: 'fancy' },
  { value: 'words' },
  { keyword: 'label', value: 'foo' },
  { keyword: 'label', value: 'bar', modifier: '-' },
  { value: 'and' },
  { value: 'multiple words string' },
  { value: 'excluded phrase', modifier: '-' },
]);
```

# API

TODO: add docs

# Development

`search-queries` is an truth open source project, so you are welcome on [project github repository](https://github.com/vitonsky/search-queries/) to contribute a code, [make issues](https://github.com/vitonsky/search-queries/issues/new/choose) with feature requests and bug reports.

You may contribute to a project if you tell about `search-queries` to your friends.