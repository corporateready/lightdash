export enum OrganizationAccessStatus {
    ACTIVE = 'active',
    TRIAL_WARNING = 'trial_warning',
    TRIAL_BLOCKED = 'trial_blocked',
}

export enum OrganizationAccessReason {
    TRIAL_EXPIRED = 'trial_expired',
}

export type OrganizationAccess =
    | {
          status: OrganizationAccessStatus.ACTIVE;
      }
    | {
          status: OrganizationAccessStatus.TRIAL_WARNING;
          reason: OrganizationAccessReason.TRIAL_EXPIRED;
          message: string;
          ctaUrl: string;
      }
    | {
          status: OrganizationAccessStatus.TRIAL_BLOCKED;
          reason: OrganizationAccessReason.TRIAL_EXPIRED;
          message: string;
          ctaUrl: string;
          apiCliBlocked: boolean;
      };

export type ApiOrganizationAccessResponse = {
    status: 'ok';
    results: OrganizationAccess;
};
