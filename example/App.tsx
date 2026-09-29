import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    LayoutAnimation,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import BrickList, { BrickCell, BrickListItem } from 'react-native-masonry-brick-list';

type Brick = BrickListItem & { id: string; color: string };

const COLORS = [
    '#EF5350', '#EC407A', '#AB47BC', '#7E57C2', '#5C6BC0', '#42A5F5',
    '#29B6F6', '#26C6DA', '#26A69A', '#66BB6A', '#9CCC65', '#FFCA28',
    '#FFA726', '#FF7043',
];
// Fixed sequences rather than Math.random so the demo is the same every run.
const SPANS = [1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 1, 1];
const ROW_SPANS = [1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1];
const PAGE = 18;

const makePage = (start: number): Brick[] =>
    Array.from({ length: PAGE }, (_, i) => {
        const n = start + i;
        const span = SPANS[n % SPANS.length];
        return {
            id: String(n),
            color: COLORS[(n * 5) % COLORS.length],
            span,
            // Keep full-width bricks one row tall so they read as banners.
            rowSpan: span === 3 ? 1 : ROW_SPANS[n % ROW_SPANS.length],
        };
    });

const Toggle = ({
    label,
    active,
    onPress,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
}) => (
    <Pressable onPress={onPress} style={[styles.toggle, active && styles.toggleActive]}>
        <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{label}</Text>
    </Pressable>
);

// Animate the reflow when a toggle changes the layout.
const animated = (update: () => void) => () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    update();
};

// `EXPO_PUBLIC_DEMO=1 npx expo run:ios` plays a scripted tour instead of
// waiting for input. That's how the README GIF is recorded.
const AUTOPLAY = process.env.EXPO_PUBLIC_DEMO === '1';

export default function App() {
    const [data, setData] = useState<Brick[]>(() => makePage(0));
    const [gap, setGap] = useState(true);
    const [dense, setDense] = useState(false);
    const [columns, setColumns] = useState(3);
    const [loading, setLoading] = useState(false);
    const listRef = useRef<ScrollView>(null);

    const loadMore = useCallback(() => {
        if (data.length >= PAGE * 5) {
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setData((prev) => [...prev, ...makePage(prev.length)]);
            setLoading(false);
        }, 600);
    }, [data.length]);

    useEffect(() => {
        if (!AUTOPLAY) {
            return;
        }
        const scrollTo = (y: number) => () => listRef.current?.scrollTo({ y });
        const steps: Array<[number, () => void]> = [
            [1800, animated(() => setDense(true))],
            [3400, animated(() => setGap(false))],
            [4600, animated(() => setGap(true))],
            [6000, animated(() => setColumns(4))],
            [7800, scrollTo(600)],
            [9200, scrollTo(1400)],
            [11200, scrollTo(2200)],
            [12800, scrollTo(0)],
            [14300, animated(() => setColumns(3))],
            [15600, animated(() => setDense(false))],
        ];
        const timers = steps.map(([at, run]) => setTimeout(run, at));
        return () => timers.forEach(clearTimeout);
    }, []);

    const renderItem = (item: Brick, index: number, cell: BrickCell<Brick>) => (
        <View style={[styles.brick, { backgroundColor: item.color }]}>
            <Text style={styles.brickIndex}>{index + 1}</Text>
            <Text style={styles.brickSize}>
                {cell.colSpan}×{cell.rowSpan}
            </Text>
        </View>
    );

    return (
        <SafeAreaProvider style={styles.page}>
            <SafeAreaView style={styles.screen} edges={['top']}>
                <StatusBar style="dark" />
                <Pressable onPress={() => listRef.current?.scrollTo({ y: 0 })}>
                    <Text style={styles.title}>Masonry Brick List</Text>
                </Pressable>
                <View style={styles.toolbar}>
                    <Toggle label="gap" active={gap} onPress={animated(() => setGap((v) => !v))} />
                    <Toggle label="dense" active={dense} onPress={animated(() => setDense((v) => !v))} />
                    <Toggle
                        label={columns + ' columns'}
                        active={columns !== 3}
                        onPress={animated(() => setColumns((c) => (c === 3 ? 4 : 3)))}
                    />
                </View>
                <BrickList
                    ref={listRef}
                    data={data}
                    columns={columns}
                    gap={gap ? 8 : 0}
                    dense={dense}
                    renderItem={renderItem}
                    onEndReached={loadMore}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        <View style={styles.footer}>
                            {loading ? <ActivityIndicator color="#5C6BC0" /> : null}
                        </View>
                    }
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#F4F1EC',
    },
    // Phone-width column, so the web demo doesn't stretch across a desktop
    // monitor. A no-op on phones.
    screen: {
        flex: 1,
        width: '100%',
        maxWidth: 520,
        alignSelf: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1F1B16',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    toolbar: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    toggle: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: '#E4DED4',
    },
    toggleActive: {
        backgroundColor: '#1F1B16',
    },
    toggleText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4A4238',
    },
    toggleTextActive: {
        color: '#FFFFFF',
    },
    content: {
        paddingHorizontal: 12,
    },
    brick: {
        flex: 1,
        borderRadius: 10,
        padding: 10,
        justifyContent: 'space-between',
    },
    brickIndex: {
        color: 'rgba(255,255,255,0.95)',
        fontSize: 18,
        fontWeight: '800',
    },
    brickSize: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        fontWeight: '600',
        alignSelf: 'flex-end',
    },
    footer: {
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
