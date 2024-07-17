import React, { useState } from 'react';
import { moduleConfig } from '../Module/constants.ts';

import CrossIcon from '@mui/icons-material/Clear';
import PagedTable from '../../common/PagedTable.tsx';
import Link from '@mui/material/Link';
import MdOpenInNew from '@mui/icons-material/OpenInNew';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const ViromeSummaryTable = ({ activeModule, selectedItem, onClose, rows, maxWidth }) => {
    const [page, setPage] = useState(0);
    const isRun = selectedItem?.type === 'run';
    const isVirus = selectedItem?.type === 'virus';
    const isEdge = selectedItem?.isNode === false;

    let title = '';
    const renderTitle = () => {
        if (isRun) {
            title = `Run: ${selectedItem?.id}`;
        }
        if (isVirus) {
            title = `Virus: ${selectedItem?.id}`;
        }
        if (isEdge) {
            title = `${selectedItem?.source} ⇔ ${selectedItem?.target}`;
        }
        return <Typography variant='h6'>{title}</Typography>;
    };

    if (!selectedItem) {
        return null;
    }

    const getResultTableRows = () => {
        if (isRun) {
            return rows.filter((row) => row['run'] === selectedItem?.id);
        }
        if (isVirus) {
            const virusKey = moduleConfig[activeModule].groupByKey;
            return rows.filter((row) => row[virusKey] === selectedItem?.id);
        }
        if (isEdge) {
            const virusKey = moduleConfig[activeModule].groupByKey;
            return rows.filter((row) => row['run'] === selectedItem?.source && row[virusKey] === selectedItem?.target);
        }
        return [];
    };

    const renderBlastLink = () => {
        const filteredRows = getResultTableRows();
        const topPalmId = filteredRows.sort((a, b) => b['node_pid'] - a['node_pid'])[0];
        const topGenBankId = filteredRows.sort((a, b) => b['gb_pid'] - a['gb_pid'])[0];
        return (
            <>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        width: '100%',
                        height: '100%',
                        mt: 1,
                    }}
                >
                    <Box sx={{ mr: 10 }}>
                        <Typography sx={{ flex: 1 }} variant='body'>{`Top palmId Hit:`}</Typography>
                        <Typography
                            sx={{ flex: 1 }}
                            variant='body2'
                        >{`${topPalmId['palm_id']} - ${topPalmId['nickname']}`}</Typography>
                        <Link
                            sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'row',
                                textDecoration: 'none',
                            }}
                            href={`https://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&USER_FORMAT_DEFAULTS=on&SET_SAVED_SEARCH=true&PAGE=Proteins&PROGRAM=blastp&QUERY=${topPalmId?.node_seq}&JOB_TITLE=palmID_${topPalmId?.palm_id}&GAPCOSTS=11%201&DATABASE=nr&BLAST_PROGRAMS=blastp&MAX_NUM_SEQ=100&SHORT_QUERY_ADJUST=on&EXPECT=0.05&WORD_SIZE=6&MATRIX_NAME=BLOSUM62&COMPOSITION_BASED_STATISTICS=2&PROG_DEFAULTS=on&SHOW_OVERVIEW=on&SHOW_LINKOUT=on&ALIGNMENT_VIEW=Pairwise&MASK_CHAR=2&MASK_COLOR=1&GET_SEQUENCE=on&NEW_VIEW=on&NUM_OVERVIEW=100&DESCRIPTIONS=100&ALIGNMENTS=100&FORMAT_OBJECT=Alignment&FORMAT_TYPE=HTML`}
                            target='_blank'
                        >
                            <Typography variant='body2'>BLAST</Typography>
                            <MdOpenInNew fontSize='small' sx={{ mb: 0.5, ml: 0.5 }} />
                        </Link>
                    </Box>
                    <Box>
                        <Typography sx={{ flex: 1 }} variant='body'>{`Top GenBank Hit:`}</Typography>
                        <Typography sx={{ flex: 1 }} variant='body2'>
                            <div
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '800px',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {`${topPalmId['tax_species']} ${topGenBankId['tax_family'] ? `(${topGenBankId['tax_family']}` : ''})`}
                            </div>
                        </Typography>
                        <Link
                            sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'row',
                                textDecoration: 'none',
                            }}
                            href={`https://www.ncbi.nlm.nih.gov/nuccore/${topGenBankId?.gb_acc}`}
                            target='_blank'
                        >
                            <Typography variant='body2'>{topGenBankId['gb_acc']}</Typography>
                            <MdOpenInNew fontSize='small' sx={{ mb: 0.5, ml: 0.5 }} />
                        </Link>
                    </Box>
                </Box>
            </>
        );
    };

    const onPageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const getPagedRows = () => {
        const startIndex = page * 5;
        const endIndex = startIndex + 5;
        return getResultTableRows().slice(startIndex, endIndex);
    };

    const renderTable = () => {
        const filteredRows = getResultTableRows();
        return (
            <Box sx={{ mt: 4, maxWidth: maxWidth - 32 }}>
                <PagedTable
                    page={page}
                    onPageChange={onPageChange}
                    total={filteredRows.length}
                    rows={getPagedRows()}
                    headers={Object.keys(filteredRows[0])}
                    pageRows={5}
                />
            </Box>
        );
    };

    return !getResultTableRows()?.length > 0 ? (
        <Typography variant='h6'>No data available</Typography>
    ) : (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(81, 81, 81, 1)',
                borderRadius: 2,
                padding: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    mb: 2,
                }}
            >
                {renderTitle()}
                <Button
                    onClick={onClose}
                    sx={{
                        'minWidth': 12,
                        'justifySelf': 'flex-end',
                        'alignSelf': 'flex-end',
                        'backgroundColor': 'transparent',
                        '&:hover': {
                            backgroundColor: 'transparent',
                        },
                    }}
                >
                    <CrossIcon />
                </Button>
            </Box>

            <Box sx={{ width: '100%' }}>
                {renderBlastLink()}
                {renderTable()}
            </Box>
        </Box>
    );
};

export default ViromeSummaryTable;
