import React from 'react';
import renderer, { act } from 'react-test-renderer';
import BrickList from '../index';

// Host element used only to tag header/footer output.
const View = 'View';

const data = [
    { id: '1', span: 1 },
    { id: '2', span: 2 },
    { id: '3', span: 3 },
];

const render = (props) => {
    let tree;
    act(() => {
        tree = renderer.create(<BrickList data={data} renderItem={() => null} {...props} />);
    });
    return tree;
};

// Same expression the component uses, so the test asserts the layout rather
// than re-deriving float formatting.
const pct = (columnCount, span) => (span / columnCount) * 100 + '%';

const gridOf = (tree) => tree.root.findAll((node) => node.props.onLayout && node.type === 'View')[0];

const layoutEvent = (width, height = 0) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height } } });

const cellsOf = (tree) =>
    tree.root.findAllByType('View').filter((node) => node.props.style.position === 'absolute');

describe('BrickList', () => {
    it('renders one cell per item inside a ScrollView', () => {
        const tree = render();

        expect(tree.root.findAllByType('ScrollView')).toHaveLength(1);
        expect(cellsOf(tree)).toHaveLength(3);
    });

    it('sizes and positions cells from the grid', () => {
        // 360pt window / 3 columns = 120pt default row height.
        const styles = cellsOf(render()).map((node) => node.props.style);

        expect(styles[0]).toMatchObject({ left: pct(3, 0), top: 0, width: pct(3, 1), height: 120 });
        expect(styles[1]).toMatchObject({ left: pct(3, 1), top: 0, width: pct(3, 2) });
        expect(styles[2]).toMatchObject({ left: pct(3, 0), top: 120, width: pct(3, 3) });
    });

    it('honours rowHeight and rowSpan', () => {
        const tree = render({
            data: [{ id: 'a', rowSpan: 2 }, { id: 'b' }],
            rowHeight: 50,
        });
        const styles = cellsOf(tree).map((node) => node.props.style);

        expect(styles[0]).toMatchObject({ top: 0, height: 100 });
        expect(styles[1]).toMatchObject({ left: pct(3, 1), top: 0, height: 50 });
    });

    it('gives the grid the full height of its rows', () => {
        const tree = render({ rowHeight: 40 });

        expect(gridOf(tree).props.style).toMatchObject({ height: 80, margin: 0 });
    });

    it('passes the item and its index to renderItem', () => {
        const renderItem = jest.fn(() => null);
        render({ renderItem });

        expect(renderItem).toHaveBeenCalledTimes(3);
        expect(renderItem).toHaveBeenNthCalledWith(1, data[0], 0, expect.anything());
        expect(renderItem).toHaveBeenNthCalledWith(3, data[2], 2, expect.anything());
    });

    it('passes the placed cell to renderItem', () => {
        const renderItem = jest.fn(() => null);
        render({ renderItem });

        expect(renderItem.mock.calls[2][2]).toMatchObject({ row: 1, col: 0, colSpan: 3, rowSpan: 1 });
    });

    it('renders header and footer, as elements or as components', () => {
        const tree = render({
            ListHeaderComponent: <View testID="header" />,
            ListFooterComponent: () => <View testID="footer" />,
        });

        expect(tree.root.findAllByProps({ testID: 'header' })).not.toHaveLength(0);
        expect(tree.root.findAllByProps({ testID: 'footer' })).not.toHaveLength(0);
    });

    it('forwards unknown props to the ScrollView', () => {
        const onScroll = () => {};
        const tree = render({ onScroll, horizontal: false, testID: 'grid' });

        expect(tree.root.findByType('ScrollView').props).toMatchObject({
            onScroll,
            horizontal: false,
            testID: 'grid',
        });
    });

    it('uses keyExtractor when items have no id', () => {
        expect(() =>
            render({
                data: [{ span: 1 }, { span: 1 }],
                keyExtractor: (item, index) => 'k' + index,
            }),
        ).not.toThrow();
    });

    it('renders nothing rather than crashing on missing data', () => {
        const tree = render({ data: undefined });

        expect(cellsOf(tree)).toHaveLength(0);
    });

    it('spaces cells by gap while keeping outer cells flush', () => {
        const tree = render({ gap: 10 });
        const styles = cellsOf(tree).map((node) => node.props.style);

        // (360 - 2 * 10) / 3 = 113.33… per cell; each row step adds the gap.
        const unit = (360 - 20) / 3;
        expect(styles[0]).toMatchObject({ top: 0, height: unit + 10, padding: 5 });
        expect(styles[2]).toMatchObject({ top: unit + 10, width: pct(3, 3) });
        expect(gridOf(tree).props.style).toMatchObject({ margin: -5, height: 2 * (unit + 10) });
    });

    it('derives square rows from the measured grid width', () => {
        const tree = render({ gap: 10 });

        // The grid box is drawn gap/2 wider on each side, so a 330pt box is
        // 320pt of content: (320 - 2 * 10) / 3 = 100 per row.
        act(() => gridOf(tree).props.onLayout(layoutEvent(330)));

        expect(cellsOf(tree)[0].props.style).toMatchObject({ height: 100 + 10 });
    });

    it('backfills gaps when dense', () => {
        const tree = render({ data: [{ id: 'a', span: 2 }, { id: 'b', span: 2 }, { id: 'c' }], dense: true });
        const styles = cellsOf(tree).map((node) => node.props.style);

        expect(styles[2]).toMatchObject({ left: pct(3, 2), top: 0 });
    });

    it('renders ListEmptyComponent only when there is nothing to show', () => {
        const empty = render({ data: [], ListEmptyComponent: <View testID="empty" /> });
        const full = render({ ListEmptyComponent: <View testID="empty" /> });

        expect(empty.root.findAllByProps({ testID: 'empty' })).not.toHaveLength(0);
        expect(full.root.findAllByProps({ testID: 'empty' })).toHaveLength(0);
    });

    it('forwards a ref to the ScrollView', () => {
        const scrollView = { scrollTo: jest.fn() };
        const ref = React.createRef();
        act(() => {
            renderer.create(<BrickList ref={ref} data={data} renderItem={() => null} />, {
                createNodeMock: (element) => (element.type === 'ScrollView' ? scrollView : null),
            });
        });

        expect(ref.current).toBe(scrollView);
    });

    describe('onEndReached', () => {
        const scrollEvent = (offset, content = 1000, visible = 400) => ({
            nativeEvent: {
                contentOffset: { x: 0, y: offset },
                contentSize: { width: 360, height: content },
                layoutMeasurement: { width: 360, height: visible },
            },
        });

        it('fires once per content height when scrolled past the threshold', () => {
            const onEndReached = jest.fn();
            const onScroll = jest.fn();
            const scrollView = render({ onEndReached, onScroll }).root.findByType('ScrollView');

            act(() => scrollView.props.onScroll(scrollEvent(100)));
            expect(onEndReached).not.toHaveBeenCalled();

            // 1000 - 400 - 450 = 150 from the end, inside 0.5 * 400.
            act(() => scrollView.props.onScroll(scrollEvent(450)));
            act(() => scrollView.props.onScroll(scrollEvent(500)));
            expect(onEndReached).toHaveBeenCalledTimes(1);
            expect(onEndReached).toHaveBeenCalledWith({ distanceFromEnd: 150 });

            // More data arrived, so the next approach to the end fires again.
            act(() => scrollView.props.onScroll(scrollEvent(1500, 2000)));
            expect(onEndReached).toHaveBeenCalledTimes(2);

            expect(onScroll).toHaveBeenCalledTimes(4);
        });

        it('fires when the content is shorter than the viewport', () => {
            const onEndReached = jest.fn();
            const scrollView = render({ onEndReached }).root.findByType('ScrollView');

            act(() => scrollView.props.onLayout(layoutEvent(360, 640)));
            act(() => scrollView.props.onContentSizeChange(360, 240));

            expect(onEndReached).toHaveBeenCalledTimes(1);
        });

        it('leaves onScroll untouched when not used', () => {
            const onScroll = () => {};
            const scrollView = render({ onScroll }).root.findByType('ScrollView');

            expect(scrollView.props.onScroll).toBe(onScroll);
            expect(scrollView.props.scrollEventThrottle).toBeUndefined();
        });
    });
});
