# react-native-masonry-brick-list

[![npm version](https://img.shields.io/npm/v/react-native-masonry-brick-list.svg)](https://www.npmjs.com/package/react-native-masonry-brick-list)
[![CI](https://github.com/lvlrSajjad/react-native-masonry-brick-list/actions/workflows/ci.yml/badge.svg)](https://github.com/lvlrSajjad/react-native-masonry-brick-list/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/react-native-masonry-brick-list.svg)](./LICENSE)

A masonry / staggered grid for React Native, written in pure JS. Items can span
several columns **and** several rows ("bricks"). No native modules and no
linking, so it works on iOS, Android, Web and Expo Go.

<img src="https://raw.githubusercontent.com/lvlrSajjad/react-native-masonry-brick-list/master/screen.gif" width="300" alt="BrickList demo: a three-column grid of colored bricks with mixed column and row spans, toggling gap, dense packing and column count, and loading more on scroll">

- **Column and row spans**: `span: 2` makes an item two columns wide,
  `rowSpan: 2` makes it two rows tall.
- **`gap`**: even spacing between bricks, with the outer edges kept flush.
- **`dense` packing**: backfills holes, like CSS `grid-auto-flow: dense`.
- **Infinite scroll**: `onEndReached` and `onEndReachedThreshold`.
- **Header, footer and empty state**: `ListHeaderComponent`, `ListFooterComponent`, `ListEmptyComponent`.
- **ScrollView passthrough**: `refreshControl`, `onScroll`, `contentContainerStyle`, and a `ref` for `scrollTo`.
- **RTL**: the grid mirrors automatically in right-to-left layouts.
- **TypeScript** types bundled, generic over your item type.

## Installation

```bash
npm install react-native-masonry-brick-list
```

Requires React 16.8+ and React Native 0.61+. Works in Expo Go.

## Usage

Each item is placed on a grid `columns` wide. Give it a `span` to make it wider
and a `rowSpan` to make it taller; both default to `1`.

```jsx
import React from 'react';
import { View, Text } from 'react-native';
import BrickList from 'react-native-masonry-brick-list';

const data = [
    { id: '1', name: 'Red', color: '#f44336' },
    { id: '2', name: 'Pink', color: '#E91E63', span: 2 },
    { id: '3', name: 'Purple', color: '#9C27B0', span: 3 },
    { id: '4', name: 'Deep Purple', color: '#673AB7', rowSpan: 2 },
    { id: '5', name: 'Indigo', color: '#3F51B5' },
    { id: '6', name: 'Blue', color: '#2196F3' },
];

const renderItem = (item) => (
    <View
        style={{
            flex: 1, // fill the cell
            borderRadius: 8,
            backgroundColor: item.color,
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <Text style={{ color: 'white' }}>{item.name}</Text>
    </View>
);

export default function App() {
    return <BrickList data={data} renderItem={renderItem} columns={3} gap={8} />;
}
```

> `renderItem` gets **positional** arguments, `(item, index, cell)`. It does
> not get FlatList's `({ item, index })` object.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Array<object>` | `[]` | Items to render. Each should have a unique `id`. |
| `renderItem` | `(item, index, cell) => ReactNode` | — | **Required.** Renders one item into its cell. `cell` is `{ row, col, colSpan, rowSpan, width, height }`; `width` and `height` are the cell's size in points. |
| `columns` | `number` | `3` | Number of grid columns. `numColumns` also works, as in FlatList. |
| `rowHeight` | `number` | one column's width | Height of one grid row, in points. The default keeps 1×1 items square. |
| `gap` | `number` | `0` | Space between cells, in points. Outer cells stay flush with the container. |
| `dense` | `boolean` | `false` | Backfill holes left by larger items. Visual order can then differ from data order. |
| `keyExtractor` | `(item, index) => string` | `item.id`, else the index | Key for each cell. |
| `containerStyle` | `ViewStyle` | — | Style for the grid container. |
| `ListHeaderComponent` | element or component | — | Rendered above the grid. |
| `ListFooterComponent` | element or component | — | Rendered below the grid. |
| `ListEmptyComponent` | element or component | — | Rendered instead of the grid when `data` is empty. |
| `onEndReached` | `({ distanceFromEnd }) => void` | — | Called once per content height when the scroll position nears the end. |
| `onEndReachedThreshold` | `number` | `0.5` | Distance from the end that triggers `onEndReached`, in multiples of the visible height. |

Any other prop is forwarded to the underlying `ScrollView`, so
`refreshControl`, `onScroll`, `showsVerticalScrollIndicator`,
`contentContainerStyle` and friends all work. A `ref` is the `ScrollView`.

### Item shape

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string \| number` | — | Unique key. Falls back to the array index. |
| `span` | `number` | `1` | Columns the item occupies, clamped to `columns`. |
| `rowSpan` | `number` | `1` | Rows the item occupies. |

## Recipes

### Spacing

```jsx
<BrickList data={data} renderItem={renderItem} gap={8} contentContainerStyle={{ padding: 12 }} />
```

Use `gap` rather than margins inside `renderItem`: it spaces neighbours evenly
and still lines the outer bricks up with the container edge. Row height is
worked out from the grid's measured width, so bricks stay square inside
padding too.

### Infinite scroll

```jsx
const [data, setData] = useState(firstPage);

<BrickList
    data={data}
    renderItem={renderItem}
    onEndReached={() => fetchNextPage().then((page) => setData((d) => [...d, ...page]))}
    onEndReachedThreshold={0.5}
    ListFooterComponent={loading ? <ActivityIndicator /> : null}
/>;
```

`onEndReached` fires once for each content height, so it doesn't fire again
until the new page has rendered. It also fires when the first page is too
short to fill the screen.

### Pull to refresh and scroll to top

```jsx
const ref = useRef(null);

<BrickList
    ref={ref}
    data={data}
    renderItem={renderItem}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
/>;

ref.current.scrollTo({ y: 0 });
```

### Styling by position and size

```jsx
const renderItem = (item, index, { colSpan, rowSpan, width, height }) => (
    <Card item={item} large={colSpan > 1 || rowSpan > 1} imageSize={{ width, height }} />
);
```

`width` and `height` are the cell's size in points, after `gap`. They're
handy for asking an image CDN for the right resolution. Before the grid's
first layout they're based on the window width, and they update once it has
been measured.

### TypeScript

```tsx
import BrickList, { BrickCell, BrickListItem } from 'react-native-masonry-brick-list';

type Photo = BrickListItem & { id: string; uri: string };

<BrickList<Photo>
    data={photos}
    renderItem={(photo, index, cell: BrickCell<Photo>) => <Image source={{ uri: photo.uri }} style={{ flex: 1 }} />}
/>;
```

## How placement works

Items are placed row by row with a cursor that only moves forward. CSS grid
uses the same rule for non-dense auto placement. If an item doesn't fit in the
space left on the current row, it moves to the next row and leaves the rest of
the current row empty. Later items never move back to fill that space. That
keeps your data order and the visual order identical.

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

With `dense`, every item is placed in the first hole it fits, counting from the
top. That removes gaps like the one after `D`, but an item can then appear
before items that come earlier in `data`.

### Is this the right kind of masonry?

This is a **grid** masonry: every brick is a whole number of columns wide and
rows tall, like a photo-gallery mosaic or a dashboard of tiles. If you want a
Pinterest-style **waterfall**, where every item is one column wide with its own
free height, a column-based list such as FlashList's `masonry` mode fits better.

## Custom layouts

The placement algorithm is exported on its own if you want to build a different
renderer on top of it:

```js
import { computeLayout } from 'react-native-masonry-brick-list';

const { cells, rows } = computeLayout(data, 3, { dense: false });
// cells: [{ item, index, row, col, colSpan, rowSpan }, ...]
```

## Notes

- The grid is rendered inside a `ScrollView`, so every item is mounted at once.
  For very long lists (thousands of items), paginate with `onEndReached`.
- The grid only scrolls vertically; `horizontal` is not supported.
- In development, BrickList warns (once per message) about a non-array `data`,
  a missing `renderItem`, items without an `id`, a `span` wider than
  `columns`, and `horizontal`.

## Example app

[`example/`](./example) is an Expo app that renders the library straight from
source. It was used to record the GIF above.

```bash
cd example
npm install
npx expo start
```

To replay the scripted tour used for the GIF, build with `EXPO_PUBLIC_DEMO=1`:

```bash
EXPO_PUBLIC_DEMO=1 npx expo run:ios --configuration Release
```

## Contributing

```bash
npm install --legacy-peer-deps
npm test
```

`--legacy-peer-deps` stops npm from installing the peer dependencies. The tests
mock `react-native` (see `test-utils/react-native-mock.js`), so installing the
real package would only pull in whatever React version the newest RN needs.

## License

MIT © [Sajjad Asadi](https://github.com/lvlrSajjad)
