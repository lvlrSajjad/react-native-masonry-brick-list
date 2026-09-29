# Changelog

## 2.1.0

No breaking changes. Existing lists lay out as before.

### Added

- `gap` prop: even spacing between cells, with the outer edges kept flush with
  the container. Replaces margins inside `renderItem`.
- `dense` prop (and `computeLayout(data, columns, { dense })`): backfills holes
  left by larger items, like CSS `grid-auto-flow: dense`.
- `onEndReached` / `onEndReachedThreshold` for infinite scroll. Fires once per
  content height, and also when the first page doesn't fill the screen.
- `ListEmptyComponent`, rendered in place of the grid when `data` is empty.
- `ref` is forwarded to the underlying `ScrollView`, for `scrollTo` and friends.
- `renderItem` receives the placed cell as a third argument:
  `{ row, col, colSpan, rowSpan, width, height }`, with the size in points.
- `numColumns` is accepted as an alias for `columns`, for FlatList familiarity.
- RTL support: cells are positioned with `start` instead of `left`, so the grid
  mirrors in right-to-left layouts.
- Development warnings for a `span` wider than `columns` and for the
  unsupported `horizontal` prop. Every warning now prints once instead of on
  each render.
- `example/` Expo app, which renders the library from source. Its web build is
  deployed to GitHub Pages as a
  [live demo](https://lvlrsajjad.github.io/react-native-masonry-brick-list/).
- `llms.txt` and `context7.json`, so coding agents use the API correctly.
- CI type-checks `index.d.ts` against real React Native types, including
  checks that common misuses are rejected.

### Changed

- The default `rowHeight` is now derived from the grid's measured width, not
  the window's. Full-width lists are unaffected; lists inside padding or a
  narrower parent now get square 1×1 cells as intended.
- Layout is memoized, so a re-render that doesn't change `data`, `columns` or
  `dense` skips placement.

### Fixed

- A `null` entry in `data` no longer crashes layout; it is placed as a 1×1
  cell.

## 2.0.0

First release since 2019. Existing lists lay out exactly as before — the
breaking change is the raised React Native floor, not the rendering.

### Breaking

- Requires React 16.8+ and React Native 0.61+ (previously RN 0.41). The
  component is now a function component using `useWindowDimensions`.
- An item whose `span` is wider than `columns` is clamped to a full row instead
  of overflowing the grid.

### Added

- **Vertical spans.** Items accept a `rowSpan` to occupy several rows; later
  items flow around the space taken. ([#3](https://github.com/lvlrSajjad/react-native-masonry-brick-list/issues/3))
- `ListHeaderComponent` and `ListFooterComponent`, as an element or a component.
  ([#1](https://github.com/lvlrSajjad/react-native-masonry-brick-list/issues/1))
- Unrecognised props are forwarded to the underlying `ScrollView`, so
  `refreshControl`, `onScroll`, `contentContainerStyle` and the rest now work.
- `keyExtractor` and `containerStyle` props.
- `renderItem` receives the item's index as a second argument.
- Bundled TypeScript definitions (`index.d.ts`).
- `computeLayout` is exported for building custom renderers.
- Development-time warnings for a non-array `data`, a missing `renderItem`, and
  items without an `id`. Thanks to [@bsoung](https://github.com/bsoung) for
  [#2](https://github.com/lvlrSajjad/react-native-masonry-brick-list/pull/2),
  which prompted this; warnings are used instead of thrown errors so a single
  malformed item cannot take down a screen.
- Test suite (`npm test`) and GitHub Actions CI on Node 18/20/22.

### Fixed

- A missing or non-array `data` prop no longer crashes on render.
- `rowHeight` now tracks window size, so the default height is correct after a
  rotation or resize instead of being frozen at the first-render width.
- A full-width cell resolves to exactly `100%` rather than a float just over it.
- Published tarball no longer ships the 790 KB demo GIF; it is referenced from
  GitHub in the README instead.
- Removed the npm-internal `_npmUser` field and the two dead CodeClimate badges
  (both pointed at the repository's old name and returned 404).
- Added `repository`, `bugs` and `description` fields to `package.json`.

## 1.0.3

- Initial published versions.
