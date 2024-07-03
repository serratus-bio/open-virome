import * as React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';

interface Data {
    name: string;
    count: number;
    selected?: boolean;
}

interface ColumnData {
    dataKey: keyof Data;
    label: string;
    numeric?: boolean;
    width: number;
}

const defaultColumns: ColumnData[] = [
    {
        width: 120,
        label: 'Name',
        dataKey: 'name',
    },
    {
        width: 120,
        label: 'Count',
        dataKey: 'count',
        numeric: true,
    },
];

const VirtuosoTableComponents: TableComponents<Data> = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
        <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
    TableHead,
    TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => <TableBody {...props} ref={ref} />),
};

const fixedHeaderContent = (columns: ColumnData[], rows, onSelectAllClick) => {
    const disableSelectAll = rows.length === 0 || rows.length > 100;
    const isChecked = !disableSelectAll && rows.length > 0 && rows.every((row) => row.selected);

    return (
        <TableRow>
            <TableCell padding='checkbox' sx={{ width: '16px', backgroundColor: '#121212' }}>
                <Checkbox
                    color='primary'
                    checked={isChecked}
                    onChange={onSelectAllClick}
                    inputProps={{
                        'aria-label': 'select all rows',
                    }}
                    disabled={disableSelectAll}
                />
            </TableCell>
            {columns.map((column) => (
                <TableCell
                    key={column.dataKey}
                    variant='head'
                    align={column.numeric || false ? 'right' : 'left'}
                    style={{ width: column.width }}
                    sx={{ backgroundColor: 'background.paper' }}
                >
                    {column.label}
                </TableCell>
            ))}
        </TableRow>
    );
};

const VirtualizedTable = ({ rows = [], columns = defaultColumns, onRowClick }) => {
    const rowContent = (_index: number, row: Data) => {
        const labelId = `enhanced-table-checkbox-${_index}`;
        return (
            <React.Fragment>
                <TableCell padding='checkbox'>
                    <Checkbox
                        color='primary'
                        checked={row.selected}
                        inputProps={{
                            'aria-labelledby': labelId,
                        }}
                        onChange={() => onRowClick(row)}
                    />
                </TableCell>
                {defaultColumns.map((column) => (
                    <TableCell
                        key={column.dataKey}
                        align={column.numeric || false ? 'right' : 'left'}
                        onClick={() => onRowClick(row)}
                        sx={{
                            cursor: 'pointer',
                        }}
                    >
                        {row[column.dataKey]}
                    </TableCell>
                ))}
            </React.Fragment>
        );
    };

    const onSelectAllClick = (event) => {
        if (event.target.checked) {
            rows.forEach((row) => {
                if (!row.selected) {
                    onRowClick(row);
                }
            });
        } else {
            rows.forEach((row) => {
                if (row.selected) {
                    onRowClick(row);
                }
            });
        }
    };

    const sortRowsBySelected = (rows) =>
        rows.sort((a, b) => {
            if (a.selected && !b.selected) {
                return -1;
            }
            if (!a.selected && b.selected) {
                return 1;
            }
            return 0;
        });

    return (
        <Paper style={{ height: 400, width: '100%', maxWidth: 800 }}>
            <TableVirtuoso
                data={sortRowsBySelected(rows)}
                components={VirtuosoTableComponents}
                fixedHeaderContent={() => fixedHeaderContent(columns, rows, onSelectAllClick)}
                itemContent={rowContent}
            />
        </Paper>
    );
};

export default VirtualizedTable;
