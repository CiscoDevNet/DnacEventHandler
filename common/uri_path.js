/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

class UriPath {
    constructor(uri) {
        this.params = {};
        let index = uri.indexOf("?");
        if(index !== -1) {
            this.base = uri.substring(0, index);
            let line = uri.substring(index + 1);
            if(line.length !== 0) {
                for(let part of line.split("&")) {
                    let li = part.indexOf("=");
                    let key = part;
                    let value = "";
                    if(li !== -1) {
                        key = part.substring(0, li);
                        value = part.substring(li + 1);
                    }
                    let values = this.params[key];
                    if(!values) {
                        values = [];
                        this.params[key] = values;
                    }
                    values.push(value);
                }
            }
        } else {
            this.base = uri;
        }
        this.base = this.strip(this.base, '/');
    }

    strip(str, stripChars) {
        if(str.startsWith(stripChars)) {
            str = str.substr(stripChars.length);
        }
        if(str.endsWith(stripChars)) {
            str = str.substr(0, str.length - stripChars.length);
        }
        return str;
    }
}

module.exports = UriPath;
