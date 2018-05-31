/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const Rule = require("../models/rule");
const SmartSheetClient = require("../services/ssheet");
const sheetName = process.env.RULES_SHEET;
const ssheet = new SmartSheetClient(process.env.SMARTSHEET_WORKSPACE, sheetName, Rule);

module.exports = exports = {
    get: async function(id) {
        return ssheet.get(id).then((res) => {
            if(res) {
                return new Rule(res);
            } else {
                return null;
            }
        });
    },
    remove: async function(id) {
        return ssheet.delete(id);
    },
    update: async function(rule) {
        return ssheet.update(rule.normalize()).then(()=>rule.denormalize());
    },
    create: async function(rule) {
        return ssheet.create(rule.normalize()).then(()=>rule.denormalize());
    },
    list: async function(opts) {
        const params = {filters: []};
        if(opts.limit) {
            params.limit = parseInt(opts.limit);
        }
        if(opts.offset) {
            params.from = {
                id: opts.offset,
            };
        }
        for(let index of Rule.indexes) {
            if(opts[index]) {
                params.filters.push({
                    field: index,
                    value: opts[index]
                });
            }
        }
        return ssheet.scan(params).then((res) => res.map((r) => new Rule(r).denormalize()));
    }
};
