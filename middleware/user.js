/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const jwt = require("../services/jwt");

module.exports = function(app) {
    return async function (req, res, next) {
        if(req.method === "OPTIONS") {
            next();
            return;
        }
        console.debug(`Enter user middleware for request: ${req.method} ${req.url}`);
        let token = req.headers.authorization;
        if(token) {
            token = token.replace("Bearer ", "");
            try {
                req.user = await jwt.verify(token);
                if(req.user.perms && req.user.perms.length) {
                    console.debug(`Authorized as user with permissions: ${JSON.stringify(req.user.perms)}`);
                } else {
                    console.debug("Authorized as user with NO permissions!");
                }
            } catch(e) {
                res.status(401).send("Unauthorized");
                console.error(`Could not get claims from JWT: '${e.message}'!`);
                return
            }
        } else {
            console.debug("No authorization header, request will be anonymous");
        }
        next();
    };
};
