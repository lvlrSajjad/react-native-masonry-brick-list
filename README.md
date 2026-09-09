# react-native-masonry-brick-list

[![npm version](https://img.shields.io/npm/v/react-native-masonry-brick-list.svg)](https://www.npmjs.com/package/react-native-masonry-brick-list)
[![CI](https://github.com/lvlrSajjad/react-native-masonry-brick-list/actions/workflows/ci.yml/badge.svg)](https://github.com/lvlrSajjad/react-native-masonry-brick-list/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/react-native-masonry-brick-list.svg)](./LICENSE)

A staggered / masonry list view for React Native, written in pure JS. No native
modules, no linking — works on iOS, Android, Web and Expo.

<img src="https://raw.githubusercontent.com/lvlrSajjad/react-native-masonry-brick-list/master/screen.gif" width="300">

## Installation

```bash
npm install react-native-masonry-brick-list
```

Requires React 16.8+ and React Native 0.61+ (for `useWindowDimensions`).
TypeScript definitions are bundled — nothing extra to install.

## Usage

Each item is placed on a grid `columns` wide. Give it a `span` to make it wider
and a `rowSpan` to make it taller; both default to `1`.

```jsx
import React from 'react';
import { View, Text } from 'react-native';
import BrickList from 'react-native-masonry-brick-list';

const data = [
    { id: '1', name: 'Red', color: '#f44336', span: 1 },
    { id: '2', name: 'Pink', color: '#E91E63', span: 2 },
    { id: '3', name: 'Purple', color: '#9C27B0', span: 3 },
    { id: '4', name: 'Deep Purple', color: '#673AB7', span: 1, rowSpan: 2 },
    { id: '5', name: 'Indigo', color: '#3F51B5', span: 1 },
    { id: '6', name: 'Blue', color: '#2196F3', span: 1 },
];

const renderItem = (item) => (
    <View
        style={{
            flex: 1,
            margin: 2,
            borderRadius: 2,
            backgroundColor: item.color,
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <Text style={{ color: 'white' }}>{item.name}</Text>
    </View>
);

export default function App() {
    return <BrickList data={data} renderItem={renderItem} columns={3} />;
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Array<object>` | `[]` | Items to render. Each should have a unique `id`. |
| `renderItem` | `(item, index) => ReactNode` | — | **Required.** Renders one item into its cell. |
| `columns` | `number` | `3` | Number of grid columns. |
| `rowHeight` | `number` | window width / `columns` | Height of one grid row, in points. |
| `keyExtractor` | `(item, index) => string` | `item.id`, else the index | Key for each cell. |
| `containerStyle` | `ViewStyle` | — | Style for the grid container. |
| `ListHeaderComponent` | element or component | — | Rendered above the grid. |
| `ListFooterComponent` | element or component | — | Rendered below the grid. |

Any other prop is forwarded to the underlying `ScrollView`, so
`refreshControl`, `onScroll`, `showsVerticalScrollIndicator`,
`contentContainerStyle` and friends all work.

### Item shape

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string \| number` | — | Unique key. Falls back to the array index. |
| `span` | `number` | `1` | Columns the item occupies, clamped to `columns`. |
| `rowSpan` | `number` | `1` | Rows the item occupies. |

## How placement works

Items are placed row by row with a cursor that only moves forward — the same
rule CSS grid uses for non-dense auto placement. An item that doesn't fit in
the space left on the current row moves to the next one, leaving the remainder
empty rather than pulling a later item back to fill it. That keeps your data
order and the visual order identical.

`rowSpan` makes an item occupy several rows; later items flow around the space
it takes.

```
data:  [A rowSpan 2] [B] [C] [D] [E span 2]

┌─────┬─────┬─────┐
│     │  B  │  C  │
│  A  ├─────┼─────┤   A takes two rows, so D shifts
│     │  D  │     │   right. E needs two columns and
├─────┴─────┼─────┤   only one is left, so it starts
│     E     │     │   a new row.
└───────────┴─────┘
```

## Header and footer

```jsx
<BrickList
    data={data}
    renderItem={renderItem}
    ListHeaderComponent={<Text>Colors</Text>}
    ListFooterComponent={() => <Button title="Load more" onPress={loadMore} />}
/>
```

## Custom layouts

The placement algorithm is exported on its own if you want to build a different
renderer on top of it:

```js
import { computeLayout } from 'react-native-masonry-brick-list';

const { cells, rows } = computeLayout(data, 3);
// cells: [{ item, index, row, col, colSpan, rowSpan }, ...]
```

## Notes

- The grid is rendered inside a `ScrollView`, so every item is mounted at once.
  For very long lists (thousands of items), paginate your `data`.
- `rowHeight` defaults to a value derived from the window width and updates on
  rotation and on window resize.

## Contributing

```bash
npm install --legacy-peer-deps
npm test
```

`--legacy-peer-deps` keeps npm from installing the peer dependencies. The tests
mock `react-native` (see `test-utils/react-native-mock.js`), so pulling in the
real thing only drags in whichever React version the newest RN peers on.

## License

MIT © [Sajjad Asadi](https://github.com/lvlrSajjad)
