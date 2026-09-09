import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { computeLayout } from './layout';

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

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

const BrickList = ({
    data = [],
    renderItem,
    columns = 3,
    rowHeight,
    keyExtractor = defaultKeyExtractor,
    containerStyle,
    ListHeaderComponent,
    ListFooterComponent,
    ...scrollViewProps
}) => {
    const { width } = useWindowDimensions();
    const columnCount = Math.max(1, Math.floor(columns) || 1);
    const unitHeight = rowHeight === undefined ? width / columnCount : rowHeight;

    if (isDev) {
        if (!Array.isArray(data)) {
            console.warn('BrickList: `data` must be an array, received ' + typeof data + '.');
        }
        if (typeof renderItem !== 'function') {
            console.warn('BrickList: `renderItem` must be a function.');
        }
        if (Array.isArray(data) && keyExtractor === defaultKeyExtractor) {
            const missing = data.some((item) => !item || item.id === undefined || item.id === null);
            if (missing) {
                console.warn(
                    'BrickList: every item needs a unique `id`, or pass a `keyExtractor` prop. ' +
                        'Falling back to the array index, which breaks reordering.',
                );
            }
        }
    }

    const { cells, rows } = computeLayout(data, columnCount);
    // Divide before scaling so a full-width cell lands on exactly '100%'
    // instead of a float a hair over it.
    const pct = (span) => (span / columnCount) * 100 + '%';

    return (
        <ScrollView {...scrollViewProps}>
            {renderExtra(ListHeaderComponent)}
            <View style={[styles.container, { height: rows * unitHeight }, containerStyle]}>
                {cells.map(({ item, index, row, col, colSpan, rowSpan }) => (
                    <View
                        key={keyExtractor(item, index)}
                        style={{
                            position: 'absolute',
                            left: pct(col),
                            top: row * unitHeight,
                            width: pct(colSpan),
                            height: rowSpan * unitHeight,
                        }}
                    >
                        {typeof renderItem === 'function' ? renderItem(item, index) : null}
                    </View>
                ))}
            </View>
            {renderExtra(ListFooterComponent)}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
});

const MemoizedBrickList = React.memo(BrickList);
MemoizedBrickList.displayName = 'BrickList';

export default MemoizedBrickList;
export { MemoizedBrickList as BrickList, computeLayout };
