import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';

interface Data {
    name: string;
    count: number;
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

const fixedHeaderContent = (columns: ColumnData[]) => {
    return (
        <TableRow>
            {columns.map((column) => (
                <TableCell
                    key={column.dataKey}
                    variant='head'
                    align={column.numeric || false ? 'right' : 'left'}
                    style={{ width: column.width }}
                    sx={{
                        backgroundColor: 'background.paper',
                    }}
                >
                    {column.label}
                </TableCell>
            ))}
        </TableRow>
    );
};

const VirtualizedTable = ({ rows = [], columns = defaultColumns, onRowClick }) => {
    const rowContent = (_index: number, row: Data) => {
        return (
            <React.Fragment>
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

    return (
        <Paper style={{ height: 400, width: '100%', maxWidth: 800 }}>
            <TableVirtuoso
                data={rows}
                components={VirtuosoTableComponents}
                fixedHeaderContent={() => fixedHeaderContent(columns)}
                itemContent={rowContent}
            />
        </Paper>
    );
};

export default VirtualizedTable;
