[![](https://img.shields.io/npm/v/search-queries.svg)](https://www.npmjs.com/package/search-queries) ![](https://github.com/vitonsky/search-queries/actions/workflows/codeql-analysis.yml/badge.svg)

Simple and powerful parser for advanced search queries like [GitHub search queries](https://docs.github.com/en/search-github/getting-started-with-searching-on-github/understanding-the-search-syntax).

# Usage

```ts
import { QueryParser } from 'search-queries';

const query = QueryParser.parse(`label:foo !label:bar`);

// Yield object equal to
expect(query).toEqual([
  { keyword: 'label', value: 'foo' },
  { keyword: 'label', value: 'bar', modifier: '!' },
]);
```

# API

TODO: add docs

# Development

`search-queries` is an truth open source project, so you are welcome on [project github repository](https://github.com/vitonsky/search-queries/) to contribute a code, [make issues](https://github.com/vitonsky/search-queries/issues/new/choose) with feature requests and bug reports.

You may contribute to a project if you tell about `search-queries` to your friends.