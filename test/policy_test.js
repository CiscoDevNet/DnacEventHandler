/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const service = require('../common/policy');

module.exports = {
    'test policy lookup': function(beforeExit, assert) {
        let policies = {
            "foo/bar": [
                {base: "1"},
                {base: "3", params: ["param1"]},
                {base: "4", params: ["param1", "param2"]},
                {base: "5", params: ["param3", "param2", "param1"]},
            ],
            "foo/{}/bar": [
                {base: "2"},
            ]
        };

        let tests = [
            {route: "foo/bar", endpoint: "1"},
            {route: "/foo/bar", endpoint: "1"}, // ignore leading slashes
            {route: "foo/bar/", endpoint: "1"}, // ignore trailing slashes
            {route: "foo/{id}/bar", endpoint: "2"},
            {route: "foo/bar?param1", endpoint: "3"},
            {route: "foo/bar?param1=val1", endpoint: "3"},
            {route: "foo/bar?param1=val1&param4=val2", endpoint: "3"},
            {route: "foo/bar?param1=val1&param2=val2", endpoint: "4"},
            {route: "foo/bar?param1=val1&param2=val2&param4", endpoint: "4"}, // ignore extra param
            {route: "foo/bar?param1=val1&param2=val2&param3", endpoint: "5"},
            {route: "foo/bar?param4", endpoint: "1"}, // ignore extra param
            {route: "foo/bar/notexists", endpoint: ""},
        ];

        for(let test of tests) {
            let endpoint = service.lookup(test.route, policies);
            if(test.endpoint === "") {
                assert.isNull(endpoint, "endpoint should be null")
            } else if(endpoint) {
                assert.equal(test.endpoint, endpoint.base, `expected ${test.endpoint}, not ${endpoint.base}`)
            } else {
                throw ("no match for: " + test.route)
            }
        }
    }
};
