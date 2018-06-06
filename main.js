/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const config = require('./config');
const fs = require('fs');
const express = require('express');

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.options('*', cors());
app.use(cors());
app.use(bodyParser.json({ strict: false }));
app.use(cookieParser());

app.use(config.public.path, express.static(config.public.directory, {redirect: false}));

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
