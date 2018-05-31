/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

class Error {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }
}

Error.schema = {
    required: [
        "code",
        "message"
    ],
    properties: {
        "code"    : { type: "integer"},
        "message" : { type: "string"}
    }
};

module.exports = exports = Error;
