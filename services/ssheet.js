/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

const smartsheet = require('smartsheet');
const AWS = require('aws-sdk');
const IS_OFFLINE = process.env.IS_OFFLINE;
const eventBus = require('../common/event');

function getPrimaryKeyId(sheet) {
    const col = sheet.columns.find(c => c.title === "id");
    return col ? col.id : "";
}

function rowToObject(sheet, row) {
    if(!row) return null;
    const mapping = {};
    for(let col of sheet.columns) {
        mapping[col.id] = col.title;
    }
    const obj = {};
    for(let cell of row.cells) {
        let key = mapping[cell.columnId];
        if(key) {
            obj[key] = cell.value;
        }
    }
    return obj;
}

function findSheet(sheets, sheetName) {
    return sheets.find(s => s.name === sheetName);
}

function findRow(sheet, id) {
    const pkId = getPrimaryKeyId(sheet);
    const row = sheet.rows.find(r => r.cells.find(c => c.columnId === pkId && c.value == id) !== undefined)
    return {sheet: sheet, row: row}
}

function objectToRow(sheet, obj) {
    const mapping = {};
    for(let col of sheet.columns) {
        mapping[col.title] = col.id;
    }
    const cells = [];
    for(let m of Object.keys(mapping)) {
        cells.push({
            "columnId": mapping[m],
            "value": obj[m]
        });
    }
    return {
        "cells": cells
    };
}

function sheetToObjects(sheet) {
    const mapping = {};
    for(let col of sheet.columns) {
        mapping[col.id] = col.title;
    }
    const result = [];
    for(let row of sheet.rows) {
        let obj = {};
        for(let cell of row.cells) {
            let key = mapping[cell.columnId];
            if(key) {
                obj[key] = cell.value;
            }
        }
        if(obj.id !== null) {
            result.push(obj);
        }
    }
    return result;
}

class SmartSheetClient {
    constructor(workspaceId, sheetName, model) {
        this.workspaceId = workspaceId;
        this.sheetName = sheetName;
        this.model = model;
        console.log(`smartsheet client initialized - ${sheetName}(${model.name})`)
    }

    async _client() {
        if(!this.client) {
            let token = process.env.SMARTSHEET_TOKEN;
            if(!IS_OFFLINE) {
                const kms = new AWS.KMS();
                const data = await kms.decrypt({
                    CiphertextBlob: Buffer(process.env.SMARTSHEET_TOKEN, 'base64')
                }).promise();
                token = data.Plaintext.toString('ascii');
            }
            this.client = smartsheet.createClient({accessToken: token, logLevel: 'info'});
        }
        return this.client;
    }

    async _load() {
        if(!this.sheet) {
            const client = await this._client();
            const options = {
                queryParameters: {
                    includeAll: true
                }
            };
            const result = await client.sheets.listSheets(options);
            const sheet = findSheet(result.data, this.sheetName);
            if(sheet) {
                console.log(`smartsheet '${this.sheetName}' loaded: ${sheet.id}`)
                this.sheet = sheet;
            } else {
                console.log(`smartsheet '${this.sheetName}' not found, creating a new one...`);
                this.sheet = await this._createSheet(client);
            }
        }
        return this.sheet;
    }

    async _createSheet(client) {
        const sheetName = this.sheetName;
        const opts = {
            "name": sheetName,
            "columns": []
        };
        for(let prop of Object.keys(this.model.schema.properties)) {
            let ptype = this.model.schema.properties[prop].type;
            opts.columns.push({
                "title": prop,
                "type": ptype === "boolean" ? "CHECKBOX" : "TEXT_NUMBER",
                "primary": prop === "id"
            });
        }
        if(this.workspaceId) {
            const result = await client.sheets.createSheetInWorkspace({body: opts, workspaceId: this.workspaceId});
            this.sheet = result.result;
            console.log(`smartsheet '${sheetName}' created in ${this.workspaceId}: ${this.sheet.id}`);
        } else {
            const result = await client.sheets.createSheet({body: opts});
            this.sheet = result.result;
            console.log(`smartsheet '${sheetName}' created: ${this.sheet.id}`);
        }
        return this.sheet;
    }

    async _getSheet() {
        return this._load()
            .then(sheet => this.client.sheets.getSheet({id: sheet.id}));
    }

    async _getRow(id) {
        return this._load()
            .then(sheet => this.client.sheets.getSheet({id: sheet.id}))
            .then(result => findRow(result, id));
    }

    async _deleteRow(sheet, row) {
        if(row) {
            const req = {
                sheetId: sheet.id,
                rowId:   row.id,
            };
            return this.client.sheets.deleteRow(req).then(true);
        } else {
            return Promise.resolve(false);
        }
    }

    async _addRow(sheet, data) {
        const req = {
            sheetId: sheet.id,
            body:    objectToRow(sheet, data)
        };
        return this.client.sheets.addRow(req).then(data);
    }

    async _updateRow(sheet, row, data) {
        const req = {
            sheetId: sheet.id,
            id:      '/' + row.id,
            body:    objectToRow(sheet, data)
        };
        return this.client.sheets.updateRow(req).then(data);
    }

    async get(id) {
        return this._getRow(id).then(({sheet, row}) => rowToObject(sheet, row));
    }

    async delete(id) {
        return this._getRow(id).then(({sheet, row}) => this._deleteRow(sheet, row));
    }

    async create(data) {
        return this._getSheet().then(sheet => this._addRow(sheet, data));
    }

    async update(data) {
        return this._getRow(data.id).then(({sheet, row}) => this._updateRow(sheet, row, data));
    }

    async scan(params) {
        return this._load()
            .then(sheet => this.client.sheets.getSheet({id: sheet.id}))
            .then(result => sheetToObjects(result));
    }
}

module.exports = exports = SmartSheetClient;
