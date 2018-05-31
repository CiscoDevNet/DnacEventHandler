/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const { get } = require("../middleware/route");

class Health {
    constructor(status) {
        this.status = status;
    }
}

Health.schema = {
    required: [
        "status"
    ],
    properties: {
        "status" : { type: "string"}
    }
};
let checkHealth = (req, res) => {
    res.json(new Health("OK"));
};

module.exports = [
  get("/v1/healthz")
    .description("health check")
    .returns(Health, 200)
    .to(checkHealth)
];
