/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const fs = require('fs');
const eventBus = require('../common/event');
const Rule = require("../models/rule");

eventBus.on("Rule.ready", function() {
    fs.readFile("./mockups/rule_data.json", (err, data) => {
        if (err) return;
        let rules = JSON.parse(data);
        const rule_dao = require('./rule_ssheet');
        for(let rule of rules) {
            rule_dao.create(new Rule(rule));
        }
        
        console.info(`mockup data loaded from rule_data.json`);
    });
});
