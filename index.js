import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { computeLayout } from './layout';

// Read on each render rather than at import, so tests can flip it.
const isDev = () => typeof __DEV__ !== 'undefined' && __DEV__;

// Each distinct warning is printed once, not on every render.
const warned = new Set();
const warnOnce = (message) => {
    if (!warned.has(message)) {
        warned.add(message);
        console.warn(message);
    }
};

const renderExtra = (Component) => {
    if (!Component) {
        return null;
    }
    if (React.isValidElement(Component)) {
        return Component;
    }
    return typeof Component === 'function' ? <Component /> : null;
};

const defaultKeyExtractor = (item, index) =>
    item && item.id !== undefined && item.id !== null ? String(item.id) : String(index);

const BrickList = React.forwardRef(function BrickList(
    {
        data = [],
        renderItem,
        columns,
        numColumns,
        rowHeight,
        gap = 0,
        dense = false,
        keyExtractor = defaultKeyExtractor,
        containerStyle,
        ListHeaderComponent,
        ListFooterComponent,
        ListEmptyComponent,
        onEndReached,
        onEndReachedThreshold = 0.5,
        ...scrollViewProps
    },
    ref,
) {
    const { width: windowWidth } = useWindowDimensions();
    // Width of the grid itself, measured once it has laid out. Until then the
    // window width stands in, which is exact for the common full-width list.
    const [measuredWidth, setMeasuredWidth] = React.useState(null);
    // `numColumns` is accepted for anyone arriving from FlatList.
    const requestedColumns = columns !== undefined ? columns : numColumns !== undefined ? numColumns : 3;
    const columnCount = Math.max(1, Math.floor(requestedColumns) || 1);
    const spacing = Math.max(0, Number(gap) || 0);
    const gridWidth = measuredWidth === null ? windowWidth : measuredWidth;
    const unitWidth = Math.max(0, (gridWidth - (columnCount - 1) * spacing) / columnCount);
    const unitHeight = rowHeight === undefined ? unitWidth : rowHeight;

    if (isDev()) {
        if (!Array.isArray(data)) {
            warnOnce('BrickList: `data` must be an array, received ' + typeof data + '.');
        }
        if (typeof renderItem !== 'function') {
            warnOnce('BrickList: `renderItem` must be a function.');
        }
        if (scrollViewProps.horizontal) {
            warnOnce('BrickList: `horizontal` is not supported; the grid only scrolls vertically.');
        }
        if (Array.isArray(data)) {
            if (keyExtractor === defaultKeyExtractor) {
                const missing = data.some((item) => !item || item.id === undefined || item.id === null);
                if (missing) {
                    warnOnce(
                        'BrickList: every item needs a unique `id`, or pass a `keyExtractor` prop. ' +
                            'Falling back to the array index, which breaks reordering.',
                    );
                }
            }
            const wideIndex = data.findIndex((item) => item && Math.floor(item.span) > columnCount);
            if (wideIndex !== -1) {
                warnOnce(
                    'BrickList: item ' +
                        JSON.stringify(keyExtractor(data[wideIndex], wideIndex)) +
                        ' has span ' +
                        data[wideIndex].span +
                        ' but there are only ' +
                        columnCount +
                        ' columns; it is clamped to a full row.',
                );
            }
        }
    }

    const { cells, rows } = React.useMemo(
        () => computeLayout(data, columnCount, { dense }),
        [data, columnCount, dense],
    );

    // The grid is drawn gap/2 larger than its box on every side and each cell
    // is inset by gap/2, so neighbours end up exactly `gap` apart while the
    // outer cells sit flush with the container. That keeps horizontal
    // positions in percentages, correct before the first layout pass.
    // Divide before scaling so a full-width cell lands on exactly '100%'
    // instead of a float a hair over it.
    const pct = (span) => (span / columnCount) * 100 + '%';
    const pitch = unitHeight + spacing;
    const inset = spacing / 2;

    const handleGridLayout = (event) => {
        const next = event.nativeEvent.layout.width - spacing;
        setMeasuredWidth((prev) => (prev === next ? prev : next));
    };

    // onEndReached bookkeeping. `firedAt` is the content height the callback
    // last fired for, so it fires once per page of data rather than on every
    // scroll event past the threshold.
    const metrics = React.useRef({ offset: 0, visible: 0, content: 0, firedAt: null });
    const checkEndReached = () => {
        const m = metrics.current;
        if (!onEndReached || m.visible <= 0 || m.content <= 0) {
            return;
        }
        const distanceFromEnd = m.content - m.visible - m.offset;
        if (distanceFromEnd <= onEndReachedThreshold * m.visible && m.firedAt !== m.content) {
            m.firedAt = m.content;
            onEndReached({ distanceFromEnd });
        }
    };

    const endReachedProps = {};
    if (onEndReached) {
        const { onScroll, onLayout, onContentSizeChange } = scrollViewProps;
        endReachedProps.scrollEventThrottle =
            scrollViewProps.scrollEventThrottle === undefined ? 16 : scrollViewProps.scrollEventThrottle;
        endReachedProps.onScroll = (event) => {
            const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
            metrics.current.offset = contentOffset.y;
            metrics.current.content = contentSize.height;
            metrics.current.visible = layoutMeasurement.height;
            checkEndReached();
            if (onScroll) {
                onScroll(event);
            }
        };
        endReachedProps.onLayout = (event) => {
            metrics.current.visible = event.nativeEvent.layout.height;
            checkEndReached();
            if (onLayout) {
                onLayout(event);
            }
        };
        endReachedProps.onContentSizeChange = (contentWidth, contentHeight) => {
            metrics.current.content = contentHeight;
            checkEndReached();
            if (onContentSizeChange) {
                onContentSizeChange(contentWidth, contentHeight);
            }
        };
    }

    const isEmpty = cells.length === 0;

    return (
        <ScrollView ref={ref} {...scrollViewProps} {...endReachedProps}>
            {renderExtra(ListHeaderComponent)}
            {isEmpty && ListEmptyComponent ? (
                renderExtra(ListEmptyComponent)
            ) : (
                <View style={[styles.container, containerStyle]}>
                    <View
                        onLayout={handleGridLayout}
                        style={{
                            alignSelf: 'stretch',
                            height: rows * pitch,
                            margin: rows > 0 && inset > 0 ? -inset : 0,
                        }}
                    >
                        {cells.map((cell) => (
                            <View
                                key={keyExtractor(cell.item, cell.index)}
                                style={{
                                    position: 'absolute',
                                    // `start` rather than `left`, so the grid mirrors in RTL.
                                    start: pct(cell.col),
                                    top: cell.row * pitch,
                                    width: pct(cell.colSpan),
                                    height: cell.rowSpan * pitch,
                                    padding: inset,
                                }}
                            >
                                {typeof renderItem === 'function'
                                    ? renderItem(cell.item, cell.index, {
                                          ...cell,
                                          width: cell.colSpan * unitWidth + (cell.colSpan - 1) * spacing,
                                          height: cell.rowSpan * unitHeight + (cell.rowSpan - 1) * spacing,
                                      })
                                    : null}
                            </View>
                        ))}
                    </View>
                </View>
            )}
            {renderExtra(ListFooterComponent)}
        </ScrollView>
    );
});

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
});

const MemoizedBrickList = React.memo(BrickList);
MemoizedBrickList.displayName = 'BrickList';

export default MemoizedBrickList;
export { MemoizedBrickList as BrickList, computeLayout };
