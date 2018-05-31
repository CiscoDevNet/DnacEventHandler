/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const fs = require("fs");
const UriPath = require("./uri_path");

function stripPlaceholderNames(url) {
    if(url.endsWith('/')) {
        url = url.substr(0, url.length - 1);
    }
    return url.replace(/{[a-zA-Z_][a-zA-Z_\-]+?}/g, "{}")
}

function splitRoute(route) {
    let uriPath = new UriPath(route);
    return {
        base: uriPath.base,
        params: Object.keys(uriPath.params),
    };
}

function lookup(url, inPolicies) {
    inPolicies = inPolicies || allPolicies;
    url = stripPlaceholderNames(url);
    let uri = new UriPath(url);
    // Maybe the uri contained parameters, e.g. /foo/{id}/bar so don't use uri.Path
    let routePath = uri.strip(uri.base, "/");
    let policies = inPolicies[routePath] || [];

    // There may be many matches for a given endpoint with the same base url.
    // This is because /foo/bar?zoo is treated as distinct from /foo/bar.
    // So we implement a greedy match by choosing the endpoint which matches the most
    // params from the request.
    let match = null;
    PolicyLoop:
    for (let policy of policies) {
        policy.params = policy.params || [];
        if(policy.params.length !== 0) {
            let queryParams = uri.params;
            for(let param of policy.params) {
                if(!queryParams[param]) {
                    continue PolicyLoop;
                }
            }
        }
        if(!match || (policy.params.length > match.params.length)) {
            match = policy;
        }
    }
    return match;
}

let allPolicies = {};

let file = "policy.json";
if (fs.existsSync(file)) {
    try {
        let policy = JSON.parse(fs.readFileSync(file, 'utf8'));
        let policies = policy['policies'];
        for(let route of Object.keys(policies)) {
            let endpointPolicy = splitRoute(route);
            endpointPolicy.policy = policies[route];
            let eps = allPolicies[endpointPolicy.base];
            if(!eps) {
                eps = [];
                allPolicies[endpointPolicy.base] = eps;
            }
            eps.push(endpointPolicy);
        }
    } catch(e) {
        console.error(`Failed to load policy file ${file}: ${e.message}`);
        process.exit(1);
    }
} else {
    console.info(`File '${file}' not found, ignore policy`)
}

module.exports = {
    defaultPolicy: {'read': [{"":"*"}], 'write': [{"":"*"}], 'delete': [{"":"*"}]},
    policies: allPolicies,
    lookup: lookup,
};
