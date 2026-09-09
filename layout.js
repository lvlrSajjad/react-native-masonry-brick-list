/**
 * Grid placement for BrickList.
 *
 * Kept free of any react-native import so it stays a plain, unit-testable
 * function.
 */

const cellKey = (row, col) => row + ':' + col;

/**
 * Places every item on a `columns`-wide grid, honouring its horizontal span
 * (`span`) and vertical span (`rowSpan`).
 *
 * Placement is row-major with a cursor that only ever moves forward, which is
 * the same rule CSS grid uses for non-dense auto placement. When every item
 * has a `rowSpan` of 1 this produces exactly the flex-wrap layout that
 * versions <= 1.0.3 produced, so upgrading does not reflow existing lists.
 *
 * @param {Array<object>} data items to place
 * @param {number} columns number of grid columns
 * @returns {{cells: Array<object>, rows: number}} placed cells and the total
 *   number of grid rows the layout occupies
 */
export const computeLayout = (data, columns) => {
    const columnCount = Math.max(1, Math.floor(columns) || 1);
    const occupied = new Set();
    const cells = [];
    let rows = 0;
    let cursorRow = 0;
    let cursorCol = 0;

    const fits = (row, col, colSpan, rowSpan) => {
        for (let r = row; r < row + rowSpan; r++) {
            for (let c = col; c < col + colSpan; c++) {
                if (occupied.has(cellKey(r, c))) {
                    return false;
                }
            }
        }
        return true;
    };

    (Array.isArray(data) ? data : []).forEach((item, index) => {
        // An item wider than the grid is clamped to a full row rather than
        // overflowing it.
        const colSpan = Math.min(columnCount, Math.max(1, Math.floor(item.span) || 1));
        const rowSpan = Math.max(1, Math.floor(item.rowSpan) || 1);

        while (true) {
            if (cursorCol + colSpan > columnCount) {
                cursorRow++;
                cursorCol = 0;
            } else if (fits(cursorRow, cursorCol, colSpan, rowSpan)) {
                break;
            } else {
                cursorCol++;
            }
        }

        for (let r = cursorRow; r < cursorRow + rowSpan; r++) {
            for (let c = cursorCol; c < cursorCol + colSpan; c++) {
                occupied.add(cellKey(r, c));
            }
        }

        cells.push({
            item,
            index,
            row: cursorRow,
            col: cursorCol,
            colSpan,
            rowSpan,
        });

        rows = Math.max(rows, cursorRow + rowSpan);
        cursorCol += colSpan;
    });

    return { cells, rows };
};

export default computeLayout;
