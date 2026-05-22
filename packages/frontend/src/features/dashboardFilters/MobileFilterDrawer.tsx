import {
    ActionIcon,
    Drawer,
    Group,
    Indicator,
    ScrollArea,
    Text,
} from '@mantine-8/core';
import { useDisclosure } from '@mantine-8/hooks';
import { IconFilter } from '@tabler/icons-react';
import { type FC } from 'react';
import MantineIcon from '../../components/common/MantineIcon';
import useDashboardContext from '../../providers/Dashboard/useDashboardContext';
import DashboardFilters from './index';
import './mobileFilters.css';

type Props = {
    activeTabUuid: string | undefined;
};

export const MobileFilterDrawer: FC<Props> = ({ activeTabUuid }) => {
    const [opened, { open, close }] = useDisclosure(false);

    const allFilters = useDashboardContext((c) => c.allFilters);
    const activeCount =
        allFilters.dimensions.length +
        allFilters.metrics.length +
        allFilters.tableCalculations.length;

    return (
        <>
            <Indicator
                label={activeCount}
                size={16}
                disabled={activeCount === 0}
                offset={4}
                style={{
                    position: 'fixed',
                    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
                    right: 16,
                    zIndex: 100,
                }}
            >
                <ActionIcon
                    size="xl"
                    radius="xl"
                    variant="filled"
                    color="blue"
                    onClick={open}
                    aria-label="Open filters"
                >
                    <MantineIcon icon={IconFilter} size="lg" />
                </ActionIcon>
            </Indicator>

            <Drawer
                opened={opened}
                onClose={close}
                position="bottom"
                size="80%"
                title={<Text fw={600}>Filters</Text>}
                scrollAreaComponent={ScrollArea.Autosize}
                styles={{ body: { paddingBottom: 24 } }}
            >
                <Group align="flex-start" gap="xs" wrap="wrap">
                    <DashboardFilters
                        isEditMode={false}
                        activeTabUuid={activeTabUuid}
                    />
                </Group>
            </Drawer>
        </>
    );
};
