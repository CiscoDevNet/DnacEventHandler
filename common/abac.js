/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const EmptyPermissions = [{}];
const AnonymousPermissions = [{"user": "__anonymous__"}];
const SudoPermissions = [{"user": "*", "company": "*", "role": "*", "domain": "*"}];
const AccessRead = 1;
const AccessWrite = 2;
const AccessDelete = 4;

function canAccessREST(userPerms, abac, httpVerb) {
    switch (httpVerb) {
        case 'GET':
            return canAccess(userPerms, abac['read']);
        case 'PUT':
        case 'POST':
        case 'PATCH':
            return canAccess(userPerms, abac['write']);
        case 'DELETE':
            return canAccess(userPerms, abac['delete']);
        default:
            return false;
    }
}

function canAccess(subjectPerms, targetPerms) {
    if (!subjectPerms || subjectPerms.length === 0) {
        subjectPerms = AnonymousPermissions;
    }
    if (!targetPerms || targetPerms.length === 0) {
        targetPerms = EmptyPermissions;
    }

    // If the subject has no permissions, or the target has no permissions,
    // or the target has an empty PermList we do the safe thing and deny access.
    for (let subject of subjectPerms) {
        TargetLoop:
            for (let target of targetPerms) {
                if (Object.keys(target).length === 0) {
                    // target PermList is empty, ignore it rather than treat it as full access.
                    // However, if subject permissions are ALL wildcard, then make an exception
                    for (let v of Object.values(subject)) {
                        if ("*" !== v) {
                            continue TargetLoop;
                        }
                    }
                    return true; // subject is all wildcards, allow access
                }
                for (let key of Object.keys(target)) {
                    let targetVal = target[key];
                    if (targetVal !== "") {
                        if ("*" === targetVal) {
                            continue; // target accepts any value for the attribute
                        }
                        let subjectVal = subject[key];
                        if (subjectVal && (subjectVal === targetVal || "*" === subjectVal)) {
                            // Subject value matches or it's a wildcard
                            continue;
                        }
                    }
                    continue TargetLoop; // this doesn't match, try the next one
                }
                return true; // subject fully matches target, we can access this
            }
    }
    return false;
}

class PermissionedObject {
    constructor(perms) {
        this.perms = perms;
    }

    isReadableBy(abac) {
        return canAccess(this.perms, abac['read']);
    }

    isWriteableBy(abac) {
        return canAccess(this.perms, abac['write']);
    }

    isDeleteableBy(abac) {
        return canAccess(this.perms, abac['delete']);
    }

    isAccessibleBy(abac, access) {
        return ((access&AccessRead) === 0 || canAccess(this.perms, abac['read'])) &&
            ((access&AccessWrite) === 0 || canAccess(this.perms, abac['write'])) &&
            ((access&AccessDelete) === 0 || canAccess(this.perms, abac['delete']))
    }

    filterObjects(objs, access) {
        if(objs.constructor === Array) {
            let ret = [];
            for(let i=0;i<objs.length;i++) {
                let value = objs[i];
                if(this.isAccessibleBy(value, access)) {
                    ret.push(value);
                }
            }
            return ret;
        } else if(typeof objs === "object") {
            let ret = {};
            for(let key of Object.keys(objs)) {
                let value = objs[key];
                if(this.isAccessibleBy(value, access)) {
                    ret[key] = value;
                }
            }
            return ret;
        } else {
            throw `Expected an array or object, not: ${typeof objs}`
        }
    }

    filterReadableObjects(objs) {
        return this.filterObjects(objs, AccessRead)
    }

    filterWriteableObjects(objs) {
        return this.filterObjects(objs, AccessWrite)
    }

    filterDeleteableObjects(objs) {
        return this.filterObjects(objs, AccessDelete)
    }
}

class ABAC {
    constructor(_read, _write, _delete) {
        this['read'] = _read;
        this['write'] = _write;
        this['delete'] = _delete;
    }
};

module.exports = {
    ABAC: ABAC,

    AccessRead: AccessRead,
    AccessWrite: AccessWrite,
    AccessDelete: AccessDelete,

    AnonymousPermissions: AnonymousPermissions,
    EmptyPermissions: EmptyPermissions,
    SudoPermissions: SudoPermissions,

    PermissionedObject: PermissionedObject,

    canAccessREST: canAccessREST,
    canAccess: canAccess,
};
