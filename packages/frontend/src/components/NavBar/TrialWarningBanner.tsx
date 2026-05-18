import {
    OrganizationAccessStatus,
    type OrganizationAccess,
} from '@lightdash/common';
import { Button, Group, Text } from '@mantine-8/core';
import { BANNER_HEIGHT } from '../common/Page/constants';

type Props = {
    access: OrganizationAccess;
};

export const TrialWarningBanner = ({ access }: Props) => {
    if (access.status !== OrganizationAccessStatus.TRIAL_WARNING) {
        return null;
    }

    return (
        <Group
            h={BANNER_HEIGHT}
            px="md"
            justify="center"
            gap="sm"
            bg="yellow.7"
            c="gray.9"
        >
            <Text size="sm" fw={600}>
                {access.message}
            </Text>
            <Button
                component="a"
                href={access.ctaUrl}
                target="_blank"
                variant="filled"
                color="dark"
                size="compact-xs"
            >
                Contact sales
            </Button>
        </Group>
    );
};
