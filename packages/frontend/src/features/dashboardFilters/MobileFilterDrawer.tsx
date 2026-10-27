import {
    ActionIcon,
    Divider,
    Drawer,
    Group,
    Indicator,
    ScrollArea,
    Stack,
    Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFilter } from '@tabler/icons-react';
import { type FC } from 'react';
import { DashboardRefreshButton } from '../../components/common/Dashboard/DashboardRefreshButton';
import MantineIcon from '../../components/common/MantineIcon';
import { useDashboardAllFilters } from '../dashboard/store';
import { DateZoom } from '../dateZoom';
import DashboardFilters from './index';

type Props = {
    activeTabUuid: string | undefined;
};

export const MobileFilterDrawer: FC<Props> = ({ activeTabUuid }) => {
    const [opened, { open, close }] = useDisclosure(false);

    const allFilters = useDashboardAllFilters();
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
                <Stack gap="md">
                    <Group gap="xs" wrap="wrap">
                        <DashboardRefreshButton onIntervalChange={() => {}} />
                        <DateZoom isEditMode={false} />
                    </Group>

                    <Divider />

                    <Group align="flex-start" gap="xs" wrap="wrap">
                        <DashboardFilters
                            isEditMode={false}
                            activeTabUuid={activeTabUuid}
                        />
                    </Group>
                </Stack>
            </Drawer>
        </>
    );
};
