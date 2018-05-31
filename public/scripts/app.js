var rulesApiUrl = 'https://6v4niwpb7b.execute-api.ap-southeast-1.amazonaws.com/dev/v1/rules';

Vue.component('ipt-field', {
    template: '#ipt-field',
    props: ['type', 'label', 'value'],
    methods: {
        update: function (value) {
            this.$emit('input', value);
        }
    }
});

Vue.component('rule-action', {
    template: '#rule-action',
    props: ['action'],
    methods: {
        changeType: function (value) {
            this.$emit('change', value);
        },
        /*
        changeField: function (action, field, value) {
            this.$emit('input', {
                action: action,
                field: field,
                value: value
            });
        },*/
        changeField: function (action, value) {
            this.$emit('input', {
                action: action,
                value: value
            });
        }
    }
});

Vue.component('rule-form', {
    template: '#rule-form',
    props: ['rule'],
    methods: {
        updateField: function (field, value) {
            this.$emit('input', {
                field: field,
                value: value
            });
        },
        changeActionType: function (field, value) {
            this.$emit('actiontype', {
                field: field,
                value: value
            });
        },
        changeActionField: function (field, value) {
            this.$emit('actionfield', {
                field: field,
                value: value
            });
        },
    }
});

Vue.component('rule-dialog', {
    template: '#rule-dialog',
    props: ['busy'],
    methods: {
        onClose: function () {
            this.$emit('close');
        },
        onOK: function () {
            this.$emit('ok');
        }
    }
});

Vue.component('application', {
    template: '#application',
    data: function () {
        return {
            rules: [],
            loading: true,
            deletingRule: null,
            editingRuleModel: null,
            blinkRuleId: null,
            busy: false,
        }
    },
    created: function () {
        this.$http.get(rulesApiUrl).then(function (response) {
            this.loading = false;
            this.rules = response.body;
        }, function () {
            this.loading = false;
        });
    },
    methods: {
        createRule: function () {
            this.blinkRuleId = null;
            this.updateEditingRuleModel();
        },
        editRule: function (rule) {
            this.blinkRuleId = null;
            this.updateEditingRuleModel(rule);
        },
        setDeletingRule: function (rule) {
            this.deletingRule = rule;
        },
        cancelDeleting: function () {
            this.deletingRule = null;
        },
        confirmDeleting: function () {
            var id = this.deletingRule.id;
            var index = this.rules.findIndex(function (i) { return i.id == id });
            this.rules.splice(index, 1);
            this.deletingRule = null;
            this.$http.delete(rulesApiUrl + '/' + id);
        },
        updateEditingRuleModel: function (rule) {
            var r = rule ? JSON.parse(JSON.stringify(rule)) : null;
            this.editingRuleModel = {
                id: r ? r.id : '',
                name: r ? r.name : '',
                condition: r ? r.condition : '',
                If: this.buildActionsForModel(r ? r['if'] : null),
                Else: this.buildActionsForModel(r ? r['else'] : null),
            }
        },
        /*
        buildActions: function (action) {
            var actions = {
                type: 'tropo',
                tropo: {
                    action: 'tropo',
                    to: '',
                    text: '',
                },
                spark: {
                    action: 'spark',
                    to: '',
                    text: '',
                },
                email: {
                    action: 'email',
                    to: '',
                    subject: '',
                    content: ''
                },
                http: {
                    action: 'http',
                    url: '',
                    method: ''
                }
            }

            if (action) {
                actions.type = action.action;
                actions[action.action] = action;
            }

            return actions;
        },*/
        buildActionsForModel: function (action) {
            var actions = {
                type: 'tropo',
                tropo: {
                    action: 'tropo',
                    json: JSON.stringify({
                        to: '',
                        text: ''
                    }, null, 2)
                },
                spark: {
                    action: 'spark',
                    json: JSON.stringify({
                        to: '',
                        text: ''
                    }, null, 2)
                },
                email: {
                    action: 'email',
                    json: JSON.stringify({
                        to: '',
                        subject: '',
                        content: ''
                    }, null, 2)
                },
                http: {
                    action: 'http',
                    json: JSON.stringify({
                        url: '',
                        method: ''
                    }, null, 2)
                }
            }

            if (action) {
                if (!action.action) {
                    actions.type = '';
                } else {
                    actions.type = action.action;
                    actions[action.action].action = action.action;
                    actions[action.action].json = JSON.stringify(action, function (k, v) {
                        if (k == 'action') {
                            return undefined
                        }
                        return v;
                    }, 2);
                }
            }

            return actions;
        },
        toActionJson: function (action) {
            if (!action) {
                return {}
            }

            var obj = {
                action: action.action
            }
            var json = JSON.parse(action.json);
            return Object.assign({}, obj, json);
        },
        onChangeField: function (value) {
            this.editingRuleModel[value.field] = value.value;
        },
        onChangeActionType: function (value) {
            this.editingRuleModel[value.field]['type'] = value.value;
        },
        /*
        onChangeActionField: function (value) {
            this.editingRuleModel[value.field][value.value.action][value.value.field] = value.value.value;
        },
        */
        onChangeActionContent: function (value) {
            this.editingRuleModel[value.field][value.value.action]['json'] = value.value.value;
        },
        onSubmitRule: function () {
            if (this.busy) {
                return;
            }
            this.busy = true;

            var model = JSON.parse(JSON.stringify(this.editingRuleModel));
            var rule = {
                id: model.id,
                name: model.name,
                condition: model.condition,
                'if': this.toActionJson(model.If[model.If.type]),//model.If[model.If.type],
                'else': this.toActionJson(model.Else[model.Else.type])//model.Else[model.Else.type],
            }

            if (rule.id) {
                var index = this.rules.findIndex(function (i) {
                    return i.id == rule.id;
                });
                var oldRule = this.ruleToDataString(this.rules[index]);
                var newRule = this.ruleToDataString(rule);
                if (oldRule == newRule) {
                    this.busy = false;
                    this.blinkRuleId = null;
                    this.editingRuleModel = null;
                } else {
                    this.$http.put(rulesApiUrl + '/' + rule.id, rule).then(function (response) {
                        this.rules.splice(index, 1, rule);
                        this.busy = false;
                        this.blinkRuleId = rule.id;
                        this.editingRuleModel = null;
                    });
                }
            } else {
                this.$http.post(rulesApiUrl, rule).then(function (response) {
                    rule.id = response.body.id;
                    this.rules.push(rule);
                    this.busy = false;
                    this.blinkRuleId = rule.id;
                    this.editingRuleModel = null;
                });
            }
        },
        onCancelEditing: function () {
            this.editingRuleModel = null;
        },
        ruleToDataString: function (rule) {
            var r = {
                id: rule.id,
                name: rule.name,
                condition: rule.condition,
                'if': rule['if'],
                'else': rule['else']
            }

            return JSON.stringify(r);
        }
    }
});

new Vue({
    el: '#app',
    data: {}
})
