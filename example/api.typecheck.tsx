// Compile-time checks for index.d.ts, run in CI with `npm run typecheck`.
// Nothing imports this file; it only has to type-check. Each
// `@ts-expect-error` asserts that a misuse is rejected, and fails the check
// if the types ever start accepting it.
import { useRef } from 'react';
import { Image, ScrollView, View } from 'react-native';
import BrickList, {
    BrickCell,
    BrickList as NamedBrickList,
    BrickListItem,
    computeLayout,
    Layout,
} from 'react-native-masonry-brick-list';

type Photo = BrickListItem & { id: string; uri: string };
const photos: Photo[] = [{ id: '1', uri: 'https://example.com/1.jpg', span: 2, rowSpan: 2 }];

export function EveryProp() {
    const ref = useRef<ScrollView>(null);
    return (
        <BrickList<Photo>
            ref={ref}
            data={photos}
            renderItem={(photo, index, cell) => {
                const uri: string = photo.uri;
                const size: number = cell.width + cell.height + cell.colSpan + cell.rowSpan + index;
                return <Image source={{ uri }} style={{ width: size, height: cell.height }} />;
            }}
            columns={3}
            numColumns={3}
            rowHeight={120}
            gap={8}
            dense
            keyExtractor={(photo) => photo.id}
            containerStyle={{ padding: 4 }}
            ListHeaderComponent={<View />}
            ListFooterComponent={() => <View />}
            ListEmptyComponent={null}
            onEndReached={({ distanceFromEnd }) => distanceFromEnd.toFixed()}
            onEndReachedThreshold={0.5}
            // Forwarded ScrollView props.
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 12 }}
        />
    );
}

export function Minimal() {
    return <NamedBrickList data={[{ id: 1 }]} renderItem={() => null} />;
}

// A callback typed against the narrower PlacedCell still fits renderItem.
export function OlderCallbackTyping() {
    const render = (_item: BrickListItem, _index: number, cell: { colSpan: number }) =>
        cell.colSpan > 1 ? <View /> : null;
    return <BrickList data={[]} renderItem={render} />;
}

export const layout: Layout<Photo> = computeLayout(photos, 3, { dense: true });
export const cellWidth = (cell: BrickCell<Photo>): number => cell.width;

export function Misuse() {
    const viewRef = useRef<View>(null);
    return (
        <>
            {/* @ts-expect-error renderItem is required */}
            <BrickList data={photos} />
            {/* @ts-expect-error data must be an array */}
            <BrickList data={photos[0]} renderItem={() => null} />
            {/* @ts-expect-error the ref is a ScrollView, not a View */}
            <BrickList ref={viewRef} data={photos} renderItem={() => null} />
            {/* @ts-expect-error gap is a number of points */}
            <BrickList data={photos} renderItem={() => null} gap="8" />
        </>
    );
}
