/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const Ajv = require('ajv');


class Event {
    constructor(id, obj) {
        this['class'] = this.constructor.name;
        if(typeof(id) === 'object') {
            obj = id;
            this.id = obj.id;
        } else {
            this.id = id;
        }
        if(obj) {
            this.condition = obj.condition;
        }
    }
}

Event.indexes = [
];

Event.schema = {
    required: [
    ],
    properties: {
        "id"                       : { type: "string"},
        "name"                     : { type: "string"},
        "description"              : { type: "string"},
        "category"                 : { type: "string"},
        "status"                   : { type: "string"},
        "severity"                 : { type: "string"},
        "priority"                 : { type: "string"},
        "thresholdDefinitions"     : { type: "string"},
        "assignedTo"               : { type: "string"},
        "actualServiceId"          : { type: "string"},
        "workflowIndicatorTrigger" : { type: "string"},
        "timestamp"                : { type: "number"}
    }
};

let ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
Event.validate = ajv.compile(Event.schema);

module.exports = exports = Event;
