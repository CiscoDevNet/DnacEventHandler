/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const config = require('./config');
const fs = require('fs');
const express = require('express');
require("./db/init");

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const user = require('./middleware/user');

let corsOptions = {
    origin: function (origin, callback) {
        let result = config.corsList.length === 0 || config.corsList.indexOf(origin) !== -1;
        callback(null, result);
    }
};

const app = express();
app.options('*', cors());
app.use(cors(corsOptions));
app.use(bodyParser.json({ strict: false }));
app.use(cookieParser());

app.use(config.public.path, express.static(config.public.directory, {redirect: false}));

app.use("/v1/", user(app));

fs.readdirSync("./endpoints/").forEach(file => {
    let name = file.split(".")[0];
    let ep = require("./endpoints/" + name);
    if(Array.isArray(ep)) {
        for(let route of ep) {
            if(route.attach) {
                route.attach(app)
            }
        }
    } else {
        ep(app);
    }
});

module.exports.handler = serverless(app);
