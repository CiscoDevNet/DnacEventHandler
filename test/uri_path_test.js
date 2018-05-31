/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const UriPath = require("../common/uri_path");

module.exports = {
    'test uri params': function(beforeExit, assert) {
        let tests = [
            { uri: "foo/bar?param1=val1&param4=val2", params: ['param1', "param4"]},
            { uri: "foo/bar?param1=val1&param4=val1&param4=val2", params: ['param1', "param4"]},
            { uri: "foo/bar?param1=val1&param4", params: ['param1', "param4"]},
            { uri: "foo/bar?param1&param4=val2", params: ['param1', "param4"]},
            { uri: "foo/bar?param1", params: ['param1']},
        ];
        for(let test of tests) {
            let uri = new UriPath(test.uri);
            for(let param of test.params) {
                assert.isNotNull(uri.params[param]);
            }
        }
    },
    'test empty uri params': function(beforeExit, assert) {
        let tests = [
            { uri: "foo/bar?"},
            { uri: "foo/bar"},
        ];
        for(let test of tests) {
            let uri = new UriPath(test.uri);
            assert.equal(0, Object.keys(uri.params));
        }
    }
};
