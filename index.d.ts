import * as React from 'react';
import { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';

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

export interface Layout<ItemT> {
    cells: Array<PlacedCell<ItemT>>;
    /** Total number of grid rows the layout occupies. */
    rows: number;
}

export interface BrickListProps<ItemT extends BrickListItem = BrickListItem>
    extends ScrollViewProps {
    /** Items to lay out. */
    data: ReadonlyArray<ItemT>;
    /** Renders a single item into its grid cell. */
    renderItem: (item: ItemT, index: number) => React.ReactNode;
    /** Number of grid columns. Defaults to 3. */
    columns?: number;
    /** Height of one grid row in points. Defaults to window width / columns. */
    rowHeight?: number;
    /** Key for each cell. Defaults to `item.id`, then the array index. */
    keyExtractor?: (item: ItemT, index: number) => string;
    /** Style applied to the grid container. */
    containerStyle?: StyleProp<ViewStyle>;
    /** Rendered above the grid, inside the ScrollView. */
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    /** Rendered below the grid, inside the ScrollView. */
    ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
}

/**
 * Places items on a `columns`-wide grid, honouring each item's `span` and
 * `rowSpan`. Exported for testing and for building custom renderers.
 */
export function computeLayout<ItemT extends BrickListItem = BrickListItem>(
    data: ReadonlyArray<ItemT>,
    columns: number,
): Layout<ItemT>;

declare function BrickList<ItemT extends BrickListItem = BrickListItem>(
    props: BrickListProps<ItemT>,
): React.ReactElement | null;

export { BrickList };
export default BrickList;
