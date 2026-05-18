import {
    FeatureFlags,
    ForbiddenError,
    OrganizationAccessStatus,
    type Account,
} from '@lightdash/common';
import { type FeatureFlagService } from '../FeatureFlag/FeatureFlagService';
import { OrganizationAccessService } from './OrganizationAccessService';

const account = {
    organization: {
        organizationUuid: 'org-uuid',
        name: 'Acme',
    },
    user: {
        id: 'user-uuid',
    },
    authentication: {
        type: 'session',
    },
} as Account;

const apiAccount = {
    ...account,
    authentication: {
        type: 'pat',
    },
} as Account;

const buildService = (
    enabledFlags: Set<string>,
    args?: { enabled?: boolean },
) => {
    const featureFlagService = {
        get: jest.fn(async ({ featureFlagId }: { featureFlagId: string }) => ({
            id: featureFlagId,
            enabled: enabledFlags.has(featureFlagId),
        })),
    } as unknown as FeatureFlagService;

    return new OrganizationAccessService({
        featureFlagService,
        cacheTtlMs: 0,
        enabled: args?.enabled,
    });
};

describe('OrganizationAccessService', () => {
    it('returns active when no trial flags are enabled', async () => {
        const service = buildService(new Set());

        await expect(service.getOrganizationAccess(account)).resolves.toEqual({
            status: OrganizationAccessStatus.ACTIVE,
        });
    });

    it('returns active without resolving flags when service is disabled', async () => {
        const service = buildService(
            new Set([FeatureFlags.OrganizationTrialBlocked]),
            { enabled: false },
        );

        await expect(service.getOrganizationAccess(account)).resolves.toEqual({
            status: OrganizationAccessStatus.ACTIVE,
        });
    });

    it('returns trial warning when the warning flag is enabled', async () => {
        const service = buildService(
            new Set([FeatureFlags.OrganizationTrialWarning]),
        );

        const access = await service.getOrganizationAccess(account);

        expect(access.status).toBe(OrganizationAccessStatus.TRIAL_WARNING);
    });

    it('gives blocked precedence over warning', async () => {
        const service = buildService(
            new Set([
                FeatureFlags.OrganizationTrialWarning,
                FeatureFlags.OrganizationTrialBlocked,
            ]),
        );

        const access = await service.getOrganizationAccess(account);

        expect(access.status).toBe(OrganizationAccessStatus.TRIAL_BLOCKED);
    });

    it('blocks product web requests for trial-blocked orgs', async () => {
        const service = buildService(
            new Set([FeatureFlags.OrganizationTrialBlocked]),
        );

        await expect(service.assertProductAccess(account)).rejects.toThrow(
            ForbiddenError,
        );
    });

    it('allows API/CLI accounts during grace period', async () => {
        const service = buildService(
            new Set([FeatureFlags.OrganizationTrialBlocked]),
        );

        await expect(service.assertProductAccess(apiAccount)).resolves.toEqual(
            expect.objectContaining({
                status: OrganizationAccessStatus.TRIAL_BLOCKED,
            }),
        );
    });

    it('blocks API/CLI accounts after grace period flag is enabled', async () => {
        const service = buildService(
            new Set([
                FeatureFlags.OrganizationTrialBlocked,
                FeatureFlags.OrganizationTrialApiCliBlocked,
            ]),
        );

        await expect(service.assertProductAccess(apiAccount)).rejects.toThrow(
            ForbiddenError,
        );
    });
});
