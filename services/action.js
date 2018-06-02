/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const request = require("request");
const CiscoSpark = require('ciscospark');
const format = require("string-template");

let r = function(option) {
    request(option, function (error, response, body) {
        if(error) {
            console.error(option.method, option.url, ':', error)
        }
        if(body) {
            console.log(option.method, option.url, ':', body);
        }
    });
};

const executors = {
    http: async function(event, parameters) {
        let opts = {
            url: format(parameters.url, event),
            method: (parameters.method || "get").toUpperCase(),
            headers: parameters.headers || {}
        };
        if(opts.method.startsWith("P")) {
            if(parameters.body || parameters.text) {
                opts.json = parameters.json || false;
                opts.body = format(parameters.body || parameters.text, event);
            } else {
                opts.json = true;
                opts.body = event;
            }
        }
        r(opts);
    },
    spark: async function(event, parameters) {
        const spark = new CiscoSpark({
            credentials: parameters.token || process.env.CISCOSPARK_ACCESS_TOKEN
        });
        for(let to of parameters.to.split(",")) {
            spark.messages.create({
                text: format(parameters.text || JSON.stringify(event), event),
                toPersonEmail: to
            })
        }
    },
    tropo: async function(event, parameters) {
        r({
            url: 'https://api.tropo.com/1.0/sessions',
            method: 'POST',
            json: true,
            body: {
                token: parameters.token || process.env.TROPO_TOKEN,
                numberToDial: parameters.to,
                msg: format(parameters.text || '', event),
            }
        });
    },
};

let callAction = function(rule, event, parameters, evaluation, executed) {
    if(parameters) {
        let action = parameters['action'];
        let executor = executors[action];
        if(executor) {
            console.log(`executing rule ${rule.name || rule.id} action ${action} - ${JSON.stringify(parameters)}`);
            executor(event, parameters);
            executed.push({
                rule: rule.id,
                evaluation: evaluation,
                parameters: parameters,
            });
        } else {
            console.log(`invalid ${rule.name || rule.id} action ${action} - (${JSON.stringify(parameters)})`)
        }
    }
};

module.exports = {
    execute: async function(rules, event) {
        let executed = [];
        for(let rule of rules) {
            if(rule.evaluate(event)) {
                callAction(rule, event, rule['if'], true, executed);
            } else {
                callAction(rule, event, rule['else'], false, executed);
            }
        }
        return executed;
    },
};
