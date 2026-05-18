import {
    FeatureFlags,
    ForbiddenError,
    OrganizationAccessReason,
    OrganizationAccessStatus,
    type Account,
    type OrganizationAccess,
} from '@lightdash/common';
import { BaseService } from '../BaseService';
import { type FeatureFlagService } from '../FeatureFlag/FeatureFlagService';

const DEFAULT_CACHE_TTL_MS = 60 * 1000;
const TRIAL_EXPIRED_CTA_URL = 'https://www.lightdash.com/contact-sales';
const TRIAL_WARNING_MESSAGE =
    'Your Lightdash trial has expired. Contact sales to keep using this workspace.';
const TRIAL_BLOCKED_MESSAGE =
    'Your Lightdash trial has expired. Contact sales to restore access to this workspace.';

type OrganizationAccessServiceArguments = {
    featureFlagService: FeatureFlagService;
    cacheTtlMs?: number;
    enabled?: boolean;
};

type CacheEntry = {
    access: OrganizationAccess;
    expiresAt: number;
};

const isApiCliAccount = (account?: Account) =>
    account?.authentication.type === 'pat' ||
    account?.authentication.type === 'oauth' ||
    account?.authentication.type === 'service-account';

export class OrganizationAccessService extends BaseService {
    private readonly featureFlagService: FeatureFlagService;

    private readonly cacheTtlMs: number;

    private readonly enabled: boolean;

    private readonly cache = new Map<string, CacheEntry>();

    constructor(args: OrganizationAccessServiceArguments) {
        super();
        this.featureFlagService = args.featureFlagService;
        this.cacheTtlMs = args.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
        this.enabled = args.enabled ?? true;
    }

    async getOrganizationAccess(
        account?: Account,
    ): Promise<OrganizationAccess> {
        if (!this.enabled) {
            return { status: OrganizationAccessStatus.ACTIVE };
        }

        const organizationUuid = account?.organization.organizationUuid;
        if (!organizationUuid) {
            return { status: OrganizationAccessStatus.ACTIVE };
        }

        const cached = this.cache.get(organizationUuid);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.access;
        }

        const access = await this.resolveOrganizationAccess(account);
        this.cache.set(organizationUuid, {
            access,
            expiresAt: Date.now() + this.cacheTtlMs,
        });
        return access;
    }

    async assertProductAccess(account?: Account): Promise<OrganizationAccess> {
        const access = await this.getOrganizationAccess(account);
        if (access.status === OrganizationAccessStatus.TRIAL_BLOCKED) {
            if (isApiCliAccount(account)) {
                if (!access.apiCliBlocked) {
                    return access;
                }
                throw new ForbiddenError(
                    'Your Lightdash trial has expired. API and CLI access is blocked.',
                );
            }

            if (account) {
                throw new ForbiddenError(TRIAL_BLOCKED_MESSAGE);
            }
        }

        return access;
    }

    clearCache(organizationUuid?: string) {
        if (organizationUuid) {
            this.cache.delete(organizationUuid);
            return;
        }
        this.cache.clear();
    }

    private async resolveOrganizationAccess(
        account: Account,
    ): Promise<OrganizationAccess> {
        const user = {
            userUuid: account.user.id,
            organizationUuid: account.organization.organizationUuid,
            organizationName: account.organization.name,
        };

        const [isBlocked, isWarning, isApiCliBlocked] = await Promise.all([
            this.featureFlagService.get({
                user,
                featureFlagId: FeatureFlags.OrganizationTrialBlocked,
            }),
            this.featureFlagService.get({
                user,
                featureFlagId: FeatureFlags.OrganizationTrialWarning,
            }),
            this.featureFlagService.get({
                user,
                featureFlagId: FeatureFlags.OrganizationTrialApiCliBlocked,
            }),
        ]);

        if (isBlocked.enabled) {
            return {
                status: OrganizationAccessStatus.TRIAL_BLOCKED,
                reason: OrganizationAccessReason.TRIAL_EXPIRED,
                message: TRIAL_BLOCKED_MESSAGE,
                ctaUrl: TRIAL_EXPIRED_CTA_URL,
                apiCliBlocked: isApiCliBlocked.enabled,
            };
        }

        if (isWarning.enabled) {
            return {
                status: OrganizationAccessStatus.TRIAL_WARNING,
                reason: OrganizationAccessReason.TRIAL_EXPIRED,
                message: TRIAL_WARNING_MESSAGE,
                ctaUrl: TRIAL_EXPIRED_CTA_URL,
            };
        }

        return { status: OrganizationAccessStatus.ACTIVE };
    }
}
