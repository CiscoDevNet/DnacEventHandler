/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

console.info = console.log;

module.exports = {
    serviceName: "DnacEventHandler",
    serviceHost: process.env.DNACEVENTHANDLER_HOST || "0.0.0.0",
    servicePort: process.env.DNACEVENTHANDLER_PORT || 3000,
    ruleFile: process.env.DNACEVENTHANDLER_RULEFILE || 'rules.json',
    public: {
        directory: "public",
        path: '/',
        index: 'index.html',
    },
    log: {
        name: "DnacEventHandler",
        level: process.env.LOG_LEVEL || 'debug',
        src: true
    },
};
