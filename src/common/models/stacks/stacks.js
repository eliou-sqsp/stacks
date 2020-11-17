"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.Stacks = void 0;
var stack_1 = require("../stack/stack");
var POSSIBLE_STACKS = ['core', 'serviceMesh', 'echo', 'elastic', 'kafka'];
var Stacks = /** @class */ (function () {
    function Stacks(props) {
        var core = props.core, echo = props.echo, elastic = props.elastic, kafka = props.kafka, serviceMesh = props.serviceMesh;
        this.core = core;
        this.serviceMesh = serviceMesh;
        this.echo = echo;
        this.elastic = elastic;
        this.kafka = kafka;
    }
    Stacks.fromJSON = function (stacksJS) {
        var stacks = stacksJS.stacks;
        if (!stacks) {
            throw new Error("Malformed JSON: no 'stacks' property");
        }
        var params = {};
        POSSIBLE_STACKS.forEach(function (stackName) {
            if (stacks[stackName]) {
                params[stackName] = stack_1.Stack.fromJSON(stacks[stackName]);
            }
            if (stackName === 'serviceMesh' && stacks['servicemesh']) {
                params['serviceMesh'] = stack_1.Stack.fromJSON(stacks['servicemesh']);
            }
        });
        return new Stacks(params);
    };
    Stacks.computeDisabledDiff = function (original, other) {
        var diff = [];
        POSSIBLE_STACKS.forEach(function (stackName) {
            var originalStack = original.get(stackName);
            var otherStack = other.get(stackName);
            if (!!originalStack.disabled !== !!otherStack.disabled) {
                var newState = otherStack.disabled ? 'disabled' : 'enabled';
                diff = diff.concat({ name: stackName, newState: newState });
            }
        });
        return diff;
    };
    Stacks.prototype.get = function (stackName) {
        return this[stackName];
    };
    Stacks.prototype.change = function (prop, propValue) {
        var newValue = {};
        newValue[prop] = propValue;
        return new Stacks(__assign({ core: this.core, serviceMesh: this.serviceMesh, echo: this.echo, elastic: this.elastic, kafka: this.kafka }, newValue));
    };
    Stacks.prototype.setCore = function (core) {
        return this.change('core', core);
    };
    Stacks.prototype.setServiceMesh = function (serviceMesh) {
        return this.change('serviceMesh', serviceMesh);
    };
    Stacks.prototype.setMongoOK = function (rest) {
        return this.setCore(this.core.setMongoOK(rest));
    };
    Stacks.prototype.setMongoError = function (err, rest) {
        return this.setCore(this.core.setMongoError(err, rest));
    };
    Stacks.prototype.setRedisOK = function (rest) {
        return this.setCore(this.core.setRedisOK(rest));
    };
    Stacks.prototype.setRedisError = function (err, rest) {
        return this.setCore(this.core.setRedisError(err, rest));
    };
    Stacks.prototype.setConsulOK = function (rest) {
        var coreOk = this.setCore(this.core.setConsulOK(rest));
        return coreOk;
    };
    Stacks.prototype.setConsulError = function (err, rest) {
        var coreError = this.setCore(this.core.setConsulError(err, rest));
        return coreError;
    };
    Stacks.prototype.setEnvoyOK = function (rest) {
        return this.setServiceMesh(this.serviceMesh.setEnvoyOK(rest));
    };
    Stacks.prototype.setEnvoyError = function (err, rest) {
        return this.setServiceMesh(this.serviceMesh.setEnvoyError(err, rest));
    };
    Stacks.prototype.setWardenOK = function (rest) {
        return this.setCore(this.core.setWardenOK(rest));
    };
    Stacks.prototype.setWardenError = function (err, rest) {
        return this.setCore(this.core.setWardenError(err, rest));
    };
    Stacks.prototype.setZookeeperOK = function (rest) {
        return this.setCore(this.core.setZookeeperOK(rest));
    };
    Stacks.prototype.setZookeeperError = function (err, rest) {
        return this.setCore(this.core.setZookeeperError(err, rest));
    };
    Stacks.prototype.setRabbitOK = function (rest) {
        return this.setCore(this.core.setRabbitOK(rest));
    };
    Stacks.prototype.setRabbitError = function (err, rest) {
        return this.setCore(this.core.setRabbitError(err, rest));
    };
    Stacks.prototype.toggleDisabled = function (stackName) {
        var stack = this.get(stackName);
        return this.change(stackName, stack.toggleDisabled());
    };
    return Stacks;
}());
exports.Stacks = Stacks;
