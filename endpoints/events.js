/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const { post } = require("../middleware/route");
const Event = require("../models/event");
const dao = require('../db/rule_local');
const action = require('../services/action');


let createEvent = async (req, res) => {
    let event = req.body;
    console.log(event);
    let rules = await dao.list({});
    res.send(await action.execute(rules, event));
};

module.exports = [
    post("/v1/events")
        .description("post an event")
        .tags("events")
        .returns(Event, 200)
        .returns(null, 401, 500)
        .reads([Event])
        .to(createEvent),
];
