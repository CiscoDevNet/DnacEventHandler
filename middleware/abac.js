/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const abac = require('../common/abac');
const service = require('../common/policy');

module.exports = exports = (handler, policy) => {
    policy = policy || service.defaultPolicy;
    return async (req, res) => {
        let routePath = req.url;
        console.debug(`Enter ABAC middleware for request: ${req.method} ${routePath}`);

        let userClaims = req.user;
        let userPerms = abac.AnonymousPermissions;
        if(userClaims) {
            userPerms = userClaims.perms;
        }
        if(!abac.canAccessREST(userPerms, policy, req.method)) {
            console.info(`Access denied based on ABAC policy(${JSON.stringify(policy)}) for request: ${req.method} ${routePath}`);
            res.status(403).send("Forbidden");
        } else {
            const result = await handler(req, res);
            if (result || res.headersSent) return result;
        }
    };
};
