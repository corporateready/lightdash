import { getObjectValue } from '@lightdash/common';
import express, { type Router } from 'express';
import {
    allowApiKeyAuthentication,
    enforceOrganizationAccess,
    isAuthenticated,
    unauthorisedInDemo,
} from '../controllers/authentication';

export const savedChartRouter: Router = express.Router();

savedChartRouter.use(
    allowApiKeyAuthentication,
    isAuthenticated,
    enforceOrganizationAccess,
);

savedChartRouter.get('/:savedQueryUuidOrSlug', async (req, res, next) => {
    req.services
        .getSavedChartService()
        .get(getObjectValue(req.params, 'savedQueryUuidOrSlug'), req.account!, {
            projectUuid:
                typeof req.query.projectUuid === 'string'
                    ? req.query.projectUuid
                    : undefined,
        })
        .then((results) => {
            res.json({
                status: 'ok',
                results,
            });
        })
        .catch(next);
});

savedChartRouter.get('/:savedQueryUuid/views', async (req, res, next) => {
    req.services
        .getSavedChartService()
        .getViewStats(req.user!, getObjectValue(req.params, 'savedQueryUuid'))
        .then((results) => {
            res.json({
                status: 'ok',
                results,
            });
        })
        .catch(next);
});

savedChartRouter.get(
    '/:savedQueryUuid/availableFilters',
    async (req, res, next) =>
        req.services
            .getProjectService()
            .getAvailableFiltersForSavedQuery(
                req.account!,
                getObjectValue(req.params, 'savedQueryUuid'),
            )
            .then((results) => {
                res.json({
                    status: 'ok',
                    results,
                });
            })
            .catch(next),
);

savedChartRouter.delete(
    '/:savedQueryUuid',
    unauthorisedInDemo,
    async (req, res, next) => {
        req.services
            .getSavedChartService()
            .delete(req.user!, getObjectValue(req.params, 'savedQueryUuid'))
            .then(() => {
                res.json({
                    status: 'ok',
                    results: undefined,
                });
            })
            .catch(next);
    },
);

savedChartRouter.patch(
    '/:savedQueryUuid',
    unauthorisedInDemo,
    async (req, res, next) => {
        req.services
            .getSavedChartService()
            .update(
                req.user!,
                getObjectValue(req.params, 'savedQueryUuid'),
                req.body,
            )
            .then((results) => {
                res.json({
                    status: 'ok',
                    results,
                });
            })
            .catch(next);
    },
);

savedChartRouter.patch(
    '/:savedQueryUuid/pinning',
    unauthorisedInDemo,
    async (req, res, next) => {
        req.services
            .getSavedChartService()
            .togglePinning(
                req.user!,
                getObjectValue(req.params, 'savedQueryUuid'),
            )
            .then((results) => {
                res.json({
                    status: 'ok',
                    results,
                });
            })
            .catch(next);
    },
);

savedChartRouter.post(
    '/:savedQueryUuid/version',
    unauthorisedInDemo,
    async (req, res, next) => {
        req.services
            .getSavedChartService()
            .createVersion(
                req.user!,
                getObjectValue(req.params, 'savedQueryUuid'),
                req.body,
            )
            .then((results) => {
                res.json({
                    status: 'ok',
                    results,
                });
            })
            .catch(next);
    },
);
