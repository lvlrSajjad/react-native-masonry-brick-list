import { computeLayout } from '../layout';

const at = (cells, index) => {
    const cell = cells.find((c) => c.index === index);
    return [cell.row, cell.col, cell.colSpan, cell.rowSpan];
};

describe('computeLayout', () => {
    it('fills a row left to right', () => {
        const { cells, rows } = computeLayout([{}, {}, {}], 3);

        expect(at(cells, 0)).toEqual([0, 0, 1, 1]);
        expect(at(cells, 1)).toEqual([0, 1, 1, 1]);
        expect(at(cells, 2)).toEqual([0, 2, 1, 1]);
        expect(rows).toBe(1);
    });

    it('wraps to the next row when an item does not fit in the remainder', () => {
        const { cells, rows } = computeLayout([{ span: 2 }, { span: 2 }], 3);

        expect(at(cells, 0)).toEqual([0, 0, 2, 1]);
        // Only one column is left on row 0, so the second item starts row 1
        // and the trailing cell of row 0 stays empty, as flex-wrap did.
        expect(at(cells, 1)).toEqual([1, 0, 2, 1]);
        expect(rows).toBe(2);
    });

    it('never backfills an earlier gap', () => {
        const { cells } = computeLayout([{ span: 2 }, { span: 2 }, { span: 1 }], 3);

        expect(at(cells, 1)).toEqual([1, 0, 2, 1]);
        expect(at(cells, 2)).toEqual([1, 2, 1, 1]);
    });

    it('flows later items around a vertically spanned item', () => {
        const { cells, rows } = computeLayout(
            [{ rowSpan: 2 }, {}, {}, {}, {}],
            3,
        );

        expect(at(cells, 0)).toEqual([0, 0, 1, 2]);
        expect(at(cells, 1)).toEqual([0, 1, 1, 1]);
        expect(at(cells, 2)).toEqual([0, 2, 1, 1]);
        // Row 1 column 0 is taken by the tall item, so these shift right.
        expect(at(cells, 3)).toEqual([1, 1, 1, 1]);
        expect(at(cells, 4)).toEqual([1, 2, 1, 1]);
        expect(rows).toBe(2);
    });

    it('pushes an item down when a tall neighbour blocks the row', () => {
        const { cells, rows } = computeLayout(
            [{ rowSpan: 3 }, { span: 2, rowSpan: 2 }, { span: 2 }],
            3,
        );

        expect(at(cells, 0)).toEqual([0, 0, 1, 3]);
        expect(at(cells, 1)).toEqual([0, 1, 2, 2]);
        // Rows 0-1 are full to the right of the tall item, so span-2 lands on
        // row 2 — where column 0 is still occupied.
        expect(at(cells, 2)).toEqual([2, 1, 2, 1]);
        expect(rows).toBe(3);
    });

    it('clamps a span wider than the grid to a full row', () => {
        const { cells, rows } = computeLayout([{ span: 9 }, {}], 3);

        expect(at(cells, 0)).toEqual([0, 0, 3, 1]);
        expect(at(cells, 1)).toEqual([1, 0, 1, 1]);
        expect(rows).toBe(2);
    });

    it('treats missing, zero and fractional spans as 1', () => {
        const { cells } = computeLayout([{}, { span: 0 }, { span: 1.9 }], 3);

        expect(cells.map((c) => c.colSpan)).toEqual([1, 1, 1]);
    });

    it('reproduces the README example layout', () => {
        const data = [1, 2, 3, 1, 1, 1, 3, 2, 1, 1, 2, 3, 2, 1, 3].map((span, i) => ({
            id: String(i + 1),
            span,
        }));
        const { cells, rows } = computeLayout(data, 3);

        // Rows are filled greedily; an item only wraps when it cannot fit.
        expect(at(cells, 0)).toEqual([0, 0, 1, 1]);
        expect(at(cells, 1)).toEqual([0, 1, 2, 1]);
        expect(at(cells, 2)).toEqual([1, 0, 3, 1]);
        expect(at(cells, 3)).toEqual([2, 0, 1, 1]);
        expect(rows).toBe(9);
    });

    it('survives empty and non-array data', () => {
        expect(computeLayout([], 3)).toEqual({ cells: [], rows: 0 });
        expect(computeLayout(undefined, 3)).toEqual({ cells: [], rows: 0 });
        expect(computeLayout(null, 3)).toEqual({ cells: [], rows: 0 });
    });

    it('falls back to a single column for an invalid column count', () => {
        expect(computeLayout([{ span: 2 }, {}], 0).cells.map((c) => c.col)).toEqual([0, 0]);
        expect(computeLayout([{}, {}], undefined).rows).toBe(2);
    });
});
