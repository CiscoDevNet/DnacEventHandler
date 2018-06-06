/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const http = require('http');
const abac = require('./abac');

let isClass = function(func) {
    return typeof func === 'function' && /^class\s/.test(Function.prototype.toString.call(func));
};

let detectSchema = function(model, modelMap) {
    if(typeof(model) === "string") {
        return {
            type: "string"
        }
    } else if(Array.isArray(model)) {
        if(typeof(model[0]) === "string") {
            return {
                type: "array",
                items: {
                    type: "string"
                }
            }
        } else if(isClass(model[0])) {
            modelMap[model[0].name] = model[0];
            return {
                type: "array",
                $ref: `#/definitions/${model[0].name}`
            }
        } else if(typeof(model[0]) === "object" && isClass(model[0].constructor)) {
            model = model[0].constructor;
            modelMap[model.name] = model;
            return {
                type: "array",
                $ref: `#/definitions/${model.name}`
            }
        }
    } else if(isClass(model)) {
        modelMap[model.name] = model;
        return {
            $ref: `#/definitions/${model.name}`
        }
    } else if(typeof(model) === "object" && isClass(model.constructor)) {
        model = model.constructor;
        modelMap[model.name] = model;
        return {
            $ref: `#/definitions/${model.name}`
        }
    }
    return {
        type: "string"
    }
};

let routes = [];

class Parameter {
    constructor(def) {
        this.def = Object.assign({
            name: "",
            in: "path",
            default: "",
            description: "",
            required: false,
        }, def);
    }

    name(name) {
        this.def.name = name;
        return this;
    }

    description(description) {
        this.def.description = description;
        return this;
    }

    where(in_value) {
        this.def['in'] = in_value;
        return this;
    }

    type(type) {
        this.def.type = type;
        return this;
    }

    required(required) {
        this.def.required = required;
        return this;
    }

    value(def_value) {
        this.def['default'] = def_value;
        return this;
    }

    schema(reference) {
        this.def['schema'] = reference;
        return this;
    }

    items(items) {
        this.def['items'] = items;
        return this;
    }

    definitions() {
        if(this.def['in'] !== 'body' && !this.def['type']) {
            this.type('string')
        }
        return this.def;
    }
}

class Router {
    constructor() {
        this.def = {
            responses: {},
            parameters: [],
            produces: ["application/json"],
            consumes: ["application/json"],
            tags: []
        };
        this.meta = {
            method: 'get',
            path: '/',
            models: {}
        };
    }

    get(path) {
        this.meta.method = "get";
        this.meta.path = path;
        return this;
    }

    post(path) {
        this.meta.method = "post";
        this.meta.path = path;
        return this;
    }

    put(path) {
        this.meta.method = "put";
        this.meta.path = path;
        return this;
    }

    head(path) {
        this.meta.method = "head";
        this.meta.path = path;
        return this;
    }

    del(path) {
        this.meta.method = "del";
        this.meta.path = path;
        return this;
    }

    patch(path) {
        this.meta.method = "patch";
        this.meta.path = path;
        return this;
    }

    tags(...tags) {
        this.def.tags = tags;
        return this;
    }

    to(fn) {
        this.fn = fn;
        if(!this.def.operationId) {
            this.operation(fn.name);
        }
        return this;
    }

    operation(operationId) {
        this.def.operationId = operationId;
        return this;
    }

    produces(...mimeTypes) {
        this.def.produces = mimeTypes;
        return this;
    }

    consumes(...mimeTypes) {
        this.def.consumes = mimeTypes;
        return this;
    }

    description(description) {
        this.def.description = description;
        if(!this.def.summary) {
            this.summary(description);
        }
        return this;
    }

    summary(summary) {
        this.def.summary = summary;
        if(!this.def.description) {
            this.description(summary);
        }
        return this;
    }

    parameter(name, type, where, description, required, is_default) {
        this.def.parameters.push({
            name: name,
            type: type || "string",
            in: where || "path",
            required: required || false,
            default: is_default || "",
            description: description || ""
        });
        return this;
    }

    authRequired(tokenType) {
        this.def.parameters.push({
            name: "Authorization",
            type: "string",
            in: "header",
            required: true,
            default: `${tokenType || 'Bearer'} `,
            description: "authorization header"
        });
        return this;
    }

    reads(model) {
        let p = new Parameter();
        p.name("body").where('body').required(true);
        p.schema(detectSchema(model, this.meta.models));
        this.def.parameters.push(p.definitions());
        return this;
    }

    returns(model, ...codes) {
        for(let code of codes) {
            this.def.responses[code] = {
                description: http.STATUS_CODES[code]
            };
            if(model) {
                this.def.responses[code]['schema'] = detectSchema(model, this.meta.models);
            }
        }
        return this;
    }

    metadata(key, value) {
        if(!this.def.metadata) {
            this.def.metadata = {};
        }
        this.def.metadata[key] = value;
        return this;
    }

    attach(app) {
        let normalizedPath = this.meta.path;
        for(let param of this.def.parameters) {
            let pname = param['name'];
            if(param['in'] === 'path') {
                normalizedPath = normalizedPath.replace(`{${pname}}`, `:${pname}`);
                this.meta.path = this.meta.path.replace(`:${pname}`, `{${pname}}`);
            }
        }

        let methodFn = app[this.meta.method];
        if(this.meta.method === 'del' && app['delete']) {
            methodFn = app['delete'];
        }
        let route = methodFn.call(app, normalizedPath, abac(this.fn));
        routes.push({
            path: this.meta.path,
            models: this.meta.models,
            method: this.meta.method === 'del' ? 'delete' : this.meta.method,
            definitions: this.def
        });
        return route;
    }
}

module.exports = {
    Parameter: Parameter,
    routes: routes,
    get: function(path) {
        return new Router().get(path);
    },
    post: function(path) {
        return new Router().post(path);
    },
    put: function(path) {
        return new Router().put(path);
    },
    del: function(path) {
        return new Router().del(path);
    },
    head: function(path) {
        return new Router().head(path);
    },
    patch: function(path) {
        return new Router().patch(path);
    }
};
