/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const fs = require("fs");

console.info = console.log;

let corsFileList = process.env.CORS_WHITELIST_FILEPATH || "/etc/cors/cors.list";
let corsList = [];
if(fs.existsSync(corsFileList)) {
    let content = fs.readFileSync(corsFileList, 'utf8');
    corsList = content.split("\n")
} else {
    corsList = [
        "https://developer.cisco.com",
        "https://devnet.cisco.com",
        "https://learninglabs.cisco.com",
        "https://www.devnetcreate.io",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000"
    ]
}

module.exports = {
    serviceName: "DnacEventHandler",
    serviceHost: process.env.DNACEVENTHANDLER_HOST || "0.0.0.0",
    servicePort: process.env.DNACEVENTHANDLER_PORT || 8080,
    corsList: corsList,
    vault: {
        jwtSecretValue: '',
    },
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
