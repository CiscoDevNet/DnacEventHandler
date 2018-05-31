/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const Ajv = require('ajv');


class Rule {
    constructor(id, obj) {
        this['class'] = this.constructor.name;
        if(typeof(id) === 'object') {
            obj = id;
            this.id = obj.id;
        } else {
            this.id = id;
        }
        if(obj) {
            this.name = obj.name;
            this.condition = obj.condition;
            this.enabled = obj.enabled;
            this['if'] = obj['if'];
            this['else'] = obj['else'];
        }
    }

    normalize() {
        let rule = this;
        if(rule['if']) {
            rule['if'] = JSON.stringify(rule['if']);
        }
        if(rule['else']) {
            rule['else'] = JSON.stringify(rule['else']);
        }
        if(rule.enabled === undefined || rule.enabled === null) {
            rule.enabled = true
        }
        return rule;
    }

    denormalize() {
        let rule = this;
        if(rule['if']) {
            rule['if'] = JSON.parse(rule['if']);
        }
        if(rule['else']) {
            rule['else'] = JSON.parse(rule['else']);
        }
        return rule;
    }

    evaluate(event) {
        let code = this.condition;
        return function() { return eval(code); }.call(event);
    }
}

Rule.indexes = [
];

Rule.schema = {
    required: [
        "id"
    ],
    properties: {
        "id"            : { type: "string"},
        "name"          : { type: "string"},
        "condition"     : { type: "string"},
        "if"            : { type: "object"},
        "else"          : { type: "object"},
        "enabled"       : { type: "boolean"}
    }
};

let ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
Rule.validate = ajv.compile(Rule.schema);

module.exports = exports = Rule;
