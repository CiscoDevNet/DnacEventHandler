/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const Rule = require("../models/rule");
const fs = require("fs");

const filename = "rules.json";

let readJsonSync = function () {
    try {
        return JSON.parse(fs.readFileSync(filename, 'utf8'));
    } catch(e) {
        return []
    }
};

let writeJsonSync = function (obj) {
    fs.writeFileSync(filename, JSON.stringify(obj, null, '\t'));
};

module.exports = exports = {
    get: async function(id) {
        let rules = readJsonSync();
        for(let r of rules) {
            if(r.id === id) {
                return new Rule(r);
            }
        }
        return null;
    },
    remove: async function(id) {
        let results = [];
        let rules = readJsonSync();
        for(let r of rules) {
            if(r.id !== id) {
                results.push(r);
            }
        }
        writeJsonSync(results);
    },
    update: async function(rule) {
        let results = [];
        let rules = readJsonSync();
        for(let r of rules) {
            if(r.id !== id) {
                results.push(r);
            } else {
                results.push(rule);
            }
        }
        writeJsonSync(results);
    },
    create: async function(rule) {
        let rules = readJsonSync();
        rules.push(rule);
        writeJsonSync(rules);
    },
    list: async function(opts) {
        return readJsonSync();
    }
};
