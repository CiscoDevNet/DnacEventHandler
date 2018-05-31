/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const config = require('../config');
const { routes } = require("../middleware/route");

module.exports = function(app) {
    app.get("/apidocs.json", (req, res) => {
        let paths = {};
        let definitions = {};

        for(let route of routes) {
            let routes = paths[route.path];
            if(!routes) {
                routes = {};
                paths[route.path] = routes;
            }
            routes[route.method] = route.definitions;

            for(let name of Object.keys(route.models)) {
                definitions[name] = route.models[name].schema;
            }
        }
        res.json({
            "swagger": "2.0",
            "info": {
                "title": `DevNet ${config.serviceName}`,
                "description": `DevNet CoCreate ${config.serviceName} Microservice`,
                "termsOfService": "https://developer.cisco.com/site/terms-and-conditions/",
                "contact": {
                    "name": "CoCreate Team",
                    "email": "devnet-cloud-engineering@cisco.com"
                },
                "license": {
                    "name": "Apache 2.0",
                    "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
                },
                "version": "1.0.0"
            },
            "externalDocs": {
                "description": "Visit Cisco DevNet",
                "url": "https://developer.cisco.com"
            },
            "host": config.serviceHost + ":" + config.servicePort,
            "schemes": [
                "http"
            ],
            "consumes": [
                "application/json"
            ],
            "produces": [
                "application/json"
            ],
            "paths": paths,
            "definitions": definitions
        });
    });
};
