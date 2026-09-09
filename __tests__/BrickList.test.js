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

    it('gives the container the full height of the grid', () => {
        const tree = render({ rowHeight: 40 });
        const container = tree.root
            .findAllByType('View')
            .find((node) => node.props.style.some && node.props.style.some((s) => s && s.height));

        expect(container.props.style).toContainEqual({ height: 80 });
    });

    it('passes the item and its index to renderItem', () => {
        const renderItem = jest.fn(() => null);
        render({ renderItem });

        expect(renderItem).toHaveBeenCalledTimes(3);
        expect(renderItem).toHaveBeenNthCalledWith(1, data[0], 0);
        expect(renderItem).toHaveBeenNthCalledWith(3, data[2], 2);
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
});
