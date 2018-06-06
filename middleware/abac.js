/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

module.exports = exports = (handler) => {
    return async (req, res) => {
        const result = await handler(req, res);
        if (result || res.headersSent) return result;
    };
};
