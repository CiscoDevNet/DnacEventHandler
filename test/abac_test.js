/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const abac = require('../common/abac');

function getIndices(objs, selectedObjs) {
    let indices = [];
    for(let i = 0; i < objs.length; i ++) {
        for(let so of selectedObjs) {
            if(so === objs[i]) {
                indices.push(i);
            }
        }
    }
    return indices;
}

module.exports = {
    'test abac access': function(beforeExit, assert) {
        let tests = [
            {subject: [{"user": "mike"}], target: [{"user": "mike"}], expected: true, message: "symmetric attr match"},
            {subject: [{"user": "*"}], target: [{"user": "mike"}], expected: true, message: "subject wildcard match"},
            {subject: [{"user": "mike"}], target: [{"user": "*"}], expected: true, message: "target wildcard match"},
            {subject: [{}], target: [{"user": "*"}], expected: true, message: "wildcard matches missing attr"},
            {subject: [{"user": "*"}], target: [{}], expected: true, message: "wildcard matches empty target attrs"},
            {subject: [{"user": "*", "role": "*"}], target: [{}], expected: true, message: "multiple wildcard matches empty target attrs"},
            {subject: [{"user": "*", "role": "*"}], target: [], expected: true, message: "multiple wildcard matches empty target permissions"},
            {subject: [{"role": "member", "user": "*"}], target: [{}], expected: false, message: "wildcard matches empty target attrs, but only if all subject attrs are wildcard"},
            {subject: [{"user": "mike"}], target: [{"user": "mike", "company": "cisco"}], expected: false, message: "denied for partial target attr match"},
            {subject: [{"user": "mike", "company": "cisco"}], target: [{"user": "mike"}], expected: true, message: "extra attrs on subject are ignored"},
            {subject: [{"user": "mike"}], target: [{"user": "dan"}, {"user": "mike"}], expected: true, message: "match any target permission set"},
            {subject: [{"company": "microsoft"}, {"company": "cisco"}], target: [{"company": "cisco"}], expected: true, message: "match any subject permission set"},
            {subject: [{"user": "mike"}], target: [{"user": "mike", "company": "cisco"}, {"user": "mike"}], expected: true, message: "match any target permission set"},
            {subject: [{"company": "microsoft"}, {"company": "cisco"}], target: [{"company": "microsoft", "user": "dan"}, {"company": "cisco"}], expected: true, message: "match any subject permission set"},
        ];
        for(let test of tests) {
            assert.equal(test.expected, abac.canAccess(test.subject, test.target), test.message)
        }
    },
    'test abac access rest': function(beforeExit, assert) {
        let policy = {
            'read':   [{"user": "read"}],
            'write':  [{"user": "write"}],
            'delete': [{"user": "delete"}],
        };
        let tests = [
            {method: 'GET', user: 'read'},
            {method: 'PUT', user: 'write'},
            {method: 'POST', user: 'write'},
            {method: 'DELETE', user: 'delete'},
        ];
        for(let test of tests) {
            let subject = [{"user": test.user}];
            assert.equal(true, abac.canAccessREST(subject, policy, test.method));
            for(let other of tests) {
                if(test.user !== other.user) {
                    assert.equal(false, abac.canAccessREST(subject, policy, other.method))
                }
            }
        }
    },
    'test permissioned object': function(beforeExit, assert) {
        let obj = {
            'read':   [{"user": "read"}],
            'write':  [{"user": "write"}],
            'delete': [{"user": "delete"}],
        };

        let users = [
            new abac.PermissionedObject([{"user": "read"}]),
            new abac.PermissionedObject([{"user": "write"}]),
            new abac.PermissionedObject([{"user": "delete"}]),
        ];

        for(let user of users) {
            switch(user.perms[0]["user"]) {
                case "read":
                    assert.equal(true, user.isReadableBy(obj));
                    assert.equal(false, user.isWriteableBy(obj));
                    assert.equal(false, user.isDeleteableBy(obj));
                    assert.equal(true, user.isAccessibleBy(obj, abac.AccessRead));
                    assert.equal(false, user.isAccessibleBy(obj, abac.AccessWrite));
                    assert.equal(false, user.isAccessibleBy(obj, abac.AccessDelete));
                    break;
                case "write":
                    assert.equal(false, user.isReadableBy(obj));
                    assert.equal(true, user.isWriteableBy(obj));
                    assert.equal(false, user.isDeleteableBy(obj));
                    assert.equal(false, user.isAccessibleBy(obj, abac.AccessRead));
                    assert.equal(true, user.isAccessibleBy(obj, abac.AccessWrite));
                    assert.equal(false, user.isAccessibleBy(obj, abac.AccessDelete));
                    break;
                case "delete":
                    assert.equal(false, user.isReadableBy(obj));
                    assert.equal(false, user.isWriteableBy(obj));
                    assert.equal(true, user.isDeleteableBy(obj));
                    assert.equal(false, user.isAccessibleBy(obj, abac.AccessRead));
                    assert.equal(false, user.isAccessibleBy(obj, abac.AccessWrite));
                    assert.equal(true, user.isAccessibleBy(obj, abac.AccessDelete));
                    break;
            }
            assert.equal(false, (user.isAccessibleBy(obj, abac.AccessRead|abac.AccessWrite|abac.AccessDelete)));
        }

        obj = {
            'read':   [{"r": "read"}],
            'write':  [{"w": "write"}],
            'delete': [{"d": "delete"}],
        };
        assert.equal(true, new abac.PermissionedObject([{"r": "read", "w": "write", "d": "delete"}]).isAccessibleBy(obj, abac.AccessRead|abac.AccessWrite|abac.AccessDelete));
    },
    'test filter objects': function(beforeExit, assert) {
        let objs = [
            {
                'read':   [{"user": "bob"}],
                'delete': [{"role": "admin"}],
            },
            {
                'read':   [{"user": "john", "company": "oracle"}],
                'write':  [{"user": "bob", "company": "oracle"}],
                'delete': [{"role": "admin", "company": "cisco"}]
            },
            {
                'read':  [{"user": "john"}],
                'write': [{"company": "any"}],
            },
            {
                'read':   [{"user": "*"}],
                'write':  [{"user": "bob", "company": "*"}],
                'delete': [{"user": "bob", "company": "cisco", "role": "*"}]
            },
            {
                'read':   [{"user": "bob", "company": "cisco", "role": "admin"}],
                'delete': [{"user": "bob", "extra": "deny"}]
            },
            {
                'read': [{"role": "member"}]
            },
        ];

        let tests = [
            {
                'user': new abac.PermissionedObject([{"user": "bob", "company": "cisco", "role": "admin"}]),
                'read':  [0, 3, 4],
                'write': [3],
                'delete': [0, 1, 3],
            },
            {
                'user': new abac.PermissionedObject([{"user": "john", "company": "*", "role": "member"}]),
                'read':  [1, 2, 3, 5],
                'write': [2],
                'delete': [],
            }
        ];

        for( let test of tests) {
            assert.eql(test['read'], getIndices(objs, test.user.filterReadableObjects(objs)));
            assert.eql(test['write'], getIndices(objs, test.user.filterWriteableObjects(objs)));
            assert.eql(test['delete'], getIndices(objs, test.user.filterDeleteableObjects(objs)));
        }
    },
};
