import {
    type ApiError,
    type OrganizationAccess,
    type ApiOrganizationAccessResponse,
} from '@lightdash/common';
import { useQuery } from '@tanstack/react-query';
import { lightdashApi } from '../../api';

const getOrganizationAccess = async (): Promise<OrganizationAccess> => {
    const response = await lightdashApi<ApiOrganizationAccessResponse>({
        url: '/organization-access',
        method: 'GET',
        body: undefined,
    });

    return response.results;
};

export const useOrganizationAccess = (enabled: boolean = true) =>
    useQuery<OrganizationAccess, ApiError>({
        queryKey: ['organization-access'],
        queryFn: getOrganizationAccess,
        enabled,
        retry: false,
        refetchOnMount: false,
    });
