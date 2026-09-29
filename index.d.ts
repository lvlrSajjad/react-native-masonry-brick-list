import * as React from 'react';
import { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from 'react-native';

export interface BrickListItem {
    /** Unique key for the item. Falls back to the array index when absent. */
    id?: string | number;
    /** How many columns the item occupies. Defaults to 1, clamped to `columns`. */
    span?: number;
    /** How many rows the item occupies. Defaults to 1. */
    rowSpan?: number;
    [key: string]: any;
}

export interface PlacedCell<ItemT> {
    item: ItemT;
    index: number;
    row: number;
    col: number;
    colSpan: number;
    rowSpan: number;
}

/** What `renderItem` receives as its third argument. */
export interface BrickCell<ItemT> extends PlacedCell<ItemT> {
    /** Width of the cell's content box, in points. */
    width: number;
    /** Height of the cell's content box, in points. */
    height: number;
}

export interface Layout<ItemT> {
    cells: Array<PlacedCell<ItemT>>;
    /** Total number of grid rows the layout occupies. */
    rows: number;
}

export interface LayoutOptions {
    /**
     * Backfill holes left by earlier, larger items (CSS `grid-auto-flow:
     * dense`). Visual order may then differ from data order. Defaults to false.
     */
    dense?: boolean;
}

export interface BrickListProps<ItemT extends BrickListItem = BrickListItem>
    extends ScrollViewProps {
    /** Items to lay out. */
    data: ReadonlyArray<ItemT>;
    /**
     * Renders a single item into its grid cell. The third argument says where
     * the item was placed and how big its cell is in points.
     */
    renderItem: (item: ItemT, index: number, cell: BrickCell<ItemT>) => React.ReactNode;
    /** Number of grid columns. Defaults to 3. */
    columns?: number;
    /** Alias for `columns`, for FlatList familiarity. `columns` wins if both are set. */
    numColumns?: number;
    /**
     * Height of one grid row in points. Defaults to the width of one column,
     * so 1x1 items are square.
     */
    rowHeight?: number;
    /** Space between cells, in points. Outer cells stay flush. Defaults to 0. */
    gap?: number;
    /** Backfill holes left by earlier, larger items. Defaults to false. */
    dense?: boolean;
    /** Key for each cell. Defaults to `item.id`, then the array index. */
    keyExtractor?: (item: ItemT, index: number) => string;
    /** Style applied to the grid container. */
    containerStyle?: StyleProp<ViewStyle>;
    /** Rendered above the grid, inside the ScrollView. */
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    /** Rendered below the grid, inside the ScrollView. */
    ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
    /** Rendered instead of the grid when `data` is empty. */
    ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
    /** Called once each time the scroll position gets within `onEndReachedThreshold` of the end. */
    onEndReached?: (info: { distanceFromEnd: number }) => void;
    /**
     * How far from the end, in multiples of the visible height, to call
     * `onEndReached`. Defaults to 0.5.
     */
    onEndReachedThreshold?: number;
}

/**
 * Places items on a `columns`-wide grid, honouring each item's `span` and
 * `rowSpan`. Exported for testing and for building custom renderers.
 */
export function computeLayout<ItemT extends BrickListItem = BrickListItem>(
    data: ReadonlyArray<ItemT>,
    columns: number,
    options?: LayoutOptions,
): Layout<ItemT>;

/** A ref to BrickList is a ref to its underlying ScrollView. */
declare const BrickList: <ItemT extends BrickListItem = BrickListItem>(
    props: BrickListProps<ItemT> & React.RefAttributes<ScrollView>,
) => React.ReactElement | null;

export { BrickList };
export default BrickList;
