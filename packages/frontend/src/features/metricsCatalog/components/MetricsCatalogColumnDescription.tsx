import { type CatalogField } from '@lightdash/common';
import { Box, Text, useMantineTheme } from '@mantine/core';
import MarkdownPreview, {
    type MarkdownPreviewProps,
} from '@uiw/react-markdown-preview';
import {
    useCallback,
    useRef,
    useState,
    type FC,
    type KeyboardEvent,
} from 'react';
import {
    type MRT_Row,
    type MRT_TableInstance,
} from '../../../components/common/ContentTable';
import { useAppDispatch, useAppSelector } from '../../sqlRunner/store/hooks';
import { setDescriptionPopoverIsClosing } from '../store/metricsCatalogSlice';
import { MetricCatalogCellOverlay } from './MetricCatalogCellOverlay';

type Props = {
    row: MRT_Row<CatalogField>;
    table: MRT_TableInstance<CatalogField>;
};

export const MetricsCatalogColumnDescription: FC<Props> = ({ row, table }) => {
    const theme = useMantineTheme();
    const dispatch = useAppDispatch();
    const cellRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const canOpen = Boolean(row.original.description);

    const isCategoryPopoverClosing = useAppSelector(
        (state) => state.metricsCatalog.popovers.category.isClosing,
    );
    const isDescriptionPopoverClosing = useAppSelector(
        (state) => state.metricsCatalog.popovers.description.isClosing,
    );

    const markdownPreviewProps: MarkdownPreviewProps = {
        style: {
            fontSize: theme.fontSizes.sm,
            color: theme.colors.ldGray[6],
            backgroundColor: 'inherit',
        },
        components: {
            h1: ({ children }) => (
                <h1 style={{ fontWeight: 600 }}>{children}</h1>
            ),
            h2: ({ children }) => (
                <h2 style={{ fontWeight: 600 }}>{children}</h2>
            ),
            h3: ({ children }) => (
                <h3 style={{ fontWeight: 600 }}>{children}</h3>
            ),
            p: ({ children }) => <p style={{ fontWeight: 400 }}>{children}</p>,
            li: ({ children }) => (
                <li style={{ fontWeight: 400 }}>{children}</li>
            ),
        },
    };

    const handleOpen = useCallback(() => {
        if (
            canOpen &&
            !(isCategoryPopoverClosing || isDescriptionPopoverClosing)
        ) {
            setIsOpen(true);
        }
    }, [canOpen, isCategoryPopoverClosing, isDescriptionPopoverClosing]);

    return (
        <Box
            ref={cellRef}
            w="100%"
            role={canOpen ? 'button' : undefined}
            tabIndex={canOpen ? 0 : undefined}
            onClick={handleOpen}
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                if (!canOpen) return;
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleOpen();
                }
            }}
            sx={{
                cursor: canOpen ? 'pointer' : 'default',
            }}
        >
            <Text
                c={row.original.description ? 'ldGray.6' : 'ldGray.4'}
                fz="sm"
                fw={400}
                lh="150%"
                lineClamp={2}
                sx={{
                    color: row.original.description ? 'ldGray.6' : 'ldGray.4',
                }}
            >
                <MarkdownPreview
                    source={row.original.description ?? '\\-'}
                    {...markdownPreviewProps}
                />
            </Text>

            <MetricCatalogCellOverlay
                isOpen={isOpen}
                setIsOpen={(newIsOpen) => {
                    if (!newIsOpen) {
                        dispatch(setDescriptionPopoverIsClosing(true));
                        setIsOpen(false);

                        // Reset the closing state after a short delay
                        setTimeout(() => {
                            dispatch(setDescriptionPopoverIsClosing(false));
                        }, 100);
                    } else {
                        setIsOpen(true);
                    }
                }}
                content={row.original.description || ''}
                cellRef={cellRef}
                table={table}
                markdownPreviewProps={markdownPreviewProps}
            />
        </Box>
    );
};
