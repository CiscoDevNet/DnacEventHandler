/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const { get, post, del, put } = require("../middleware/route");
const dao = require('../db/rule_ssheet');
const Rule = require("../models/rule");
const uuid = require('uuid');

let getRule = async (req, res) => {
    let ret = await dao.get(req.params.id);
    if(ret) {
        res.send(ret);
    } else {
        res.status(404).end();
    }
};

let deleteRule = async (req, res) => {
    let result = await dao.remove(req.params.id);
    res.status(result ? 204 : 404).end();
};

let updateRule = async (req, res) => {
    let rule = new Rule(req.body);
    rule.id = req.params.id;
    if(!Rule.validate(rule)) {
        res.status(400).end();
    } else {
        res.send(await dao.update(rule));
    }
};

let createRule = async (req, res) => {
    let rule = new Rule(req.body);
    rule.id = uuid.v1();
    if(!Rule.validate(rule)) {
        res.status(400).end();
    } else {
        res.send(await dao.create(rule));
    }
};

let listRules = async (req, res) => {
    res.send(await dao.list(req.query));
};

module.exports = [
    get("/v1/rules/{id}")
    .description("retrieve a specific rule")
    .tags("rules")
    .parameter("id")
    .returns(Rule, 200)
    .returns(null, 401, 500)
    .to(getRule),

  del("/v1/rules/{id}")
    .description("delete a specific rule")
    .tags("rules")
    .authRequired()
    .parameter("id")
    .returns(null, 204, 401, 500)
    .to(deleteRule),

  put("/v1/rules/{id}")
    .description("update a specific rule")
    .tags("rules")
    .authRequired()
    .parameter("id")
    .returns(Rule, 200)
    .returns(null, 401, 500)
    .reads(Rule)
    .to(updateRule),

  post("/v1/rules")
    .description("create new rule")
    .tags("rules")
    .authRequired()
    .returns(Rule, 200)
    .returns(null, 401, 500)
    .reads([Rule])
    .to(createRule),

  get("/v1/rules")
    .description("list all rules")
    .tags("rules")
    .returns([Rule], 200)
    .returns(null, 401, 500)
    .parameter("limit", "integer", "query", "max items to return at one time")
    .parameter("offset", "string", "query", "starting offset")
    .to(listRules)
];
