import {
    OrganizationAccessStatus,
    type OrganizationAccess,
} from '@lightdash/common';
import { Button, Center, Stack, Text, Title } from '@mantine/core';

type Props = {
    access: OrganizationAccess;
};

export const TrialExpiredPage = ({ access }: Props) => {
    if (access.status !== OrganizationAccessStatus.TRIAL_BLOCKED) {
        return null;
    }

    return (
        <Center h="100vh" px="md">
            <Stack spacing="md" maw={520} align="center">
                <Title order={2} ta="center">
                    Trial expired
                </Title>
                <Text ta="center" color="dimmed">
                    {access.message}
                </Text>
                <Button component="a" href={access.ctaUrl} target="_blank">
                    Contact sales
                </Button>
            </Stack>
        </Center>
    );
};
