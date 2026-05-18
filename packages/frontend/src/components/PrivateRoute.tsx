import { OrganizationAccessStatus } from '@lightdash/common';
import React, { useEffect, useState, type FC } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useOrganizationAccess } from '../hooks/organization/useOrganizationAccess';
import { useEmailStatus } from '../hooks/useEmailVerification';
import { useAbilityContext } from '../providers/Ability/useAbilityContext';
import useApp from '../providers/App/useApp';
import { TrialExpiredPage } from './OrganizationAccess/TrialExpiredPage';
import PageSpinner from './PageSpinner';

const PrivateRoute: FC<React.PropsWithChildren> = ({ children }) => {
    const {
        health,
        user: { data, isInitialLoading },
    } = useApp();
    const location = useLocation();
    const ability = useAbilityContext();
    const emailStatus = useEmailStatus(!!health.data?.isAuthenticated);
    const isEmailServerConfigured = health.data?.hasEmailClient;
    const organizationAccess = useOrganizationAccess(
        !!health.data?.isAuthenticated && !!data?.organizationUuid,
    );
    // Initialize based on whether ability already has rules (e.g., from previous navigation)
    // This prevents a loading flash when navigating between pages
    const [abilityInitialized, setAbilityInitialized] = useState(
        () => ability.rules.length > 0,
    );

    useEffect(() => {
        if (data) {
            ability.update(data.abilityRules);
            setAbilityInitialized(true);
        }
    }, [ability, data]);

    if (health.isInitialLoading || health.error) {
        return <PageSpinner />;
    }

    if (!health.data?.isAuthenticated) {
        return (
            <Navigate
                to={{
                    pathname: '/login',
                }}
                state={{ from: location }}
            />
        );
    }

    if (
        isInitialLoading ||
        emailStatus.isInitialLoading ||
        (data && !abilityInitialized)
    ) {
        return <PageSpinner />;
    }

    if (isEmailServerConfigured && !emailStatus.data?.isVerified) {
        return (
            <Navigate
                to={{
                    pathname: '/verify-email',
                }}
                state={{ from: location }}
            />
        );
    }

    if (!data?.organizationUuid) {
        return (
            <Navigate
                to={{
                    pathname: '/join-organization',
                }}
                state={{ from: location }}
            />
        );
    }

    if (organizationAccess.isInitialLoading) {
        return <PageSpinner />;
    }

    if (
        organizationAccess.data?.status ===
            OrganizationAccessStatus.TRIAL_BLOCKED &&
        !location.pathname.startsWith('/generalSettings')
    ) {
        return <TrialExpiredPage access={organizationAccess.data} />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
