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
exports.Stack = void 0;
var service_1 = require("../service/service");
var Stack = /** @class */ (function () {
    function Stack(props) {
        var _this = this;
        this.getMongo = function () { return _this.get('mongo'); };
        this.getConsul = function () { return _this.get('consul'); };
        this.getWarden = function () { return _this.get('warden'); };
        this.getRedis = function () { return _this.get('redis'); };
        this.getZookeeper = function () { return _this.get('zookeeper'); };
        this.getEnvoy = function () { return _this.get('envoy'); };
        this.getRabbitMQ = function () { return _this.get('rabbitMQ'); };
        this.name = props.name;
        this.status = props.status;
        this.disabled = props.disabled;
        this.error = props.error;
        this.services = props.services;
    }
    Stack.fromJSON = function (params) {
        if (params.services) {
            var serviceNames = Object.keys(params.services);
            serviceNames.forEach(function (serviceName) {
                params.services[serviceName] = new service_1.Service(params.services[serviceName]);
            });
        }
        return new Stack(params);
    };
    Stack.prototype.setService = function (service) {
        this.services[service.name] = service;
        return this;
    };
    Stack.prototype.withCheckResponse = function (props) {
        var serviceName = props.serviceName, status = props.status, error = props.error, rest = props.rest;
        var services = this.services;
        if (!status) {
            status = error ? 'failed' : 'ok';
        }
        var newServices = services;
        return new Stack({
            name: this.name,
            disabled: !!this.disabled,
            error: this.error,
            services: newServices
        });
    };
    Stack.prototype.get = function (serviceName) {
        var services = this.services;
        if (!services) {
            throw new Error("No services for " + this.name);
        }
        var component = services[serviceName];
        if (!component) {
            throw new Error("Could not find service: " + serviceName + " (stack: " + JSON.stringify(services) + ")");
        }
        return component;
    };
    Stack.prototype.setMongoOK = function (rest) {
        var mongo = this.getMongo();
        return this.withCheckResponse(__assign(__assign({}, mongo), { serviceName: 'mongo', status: 'ok', rest: rest }));
    };
    Stack.prototype.setMongoError = function (err, rest) {
        var mongo = this.getMongo();
        return this.withCheckResponse(__assign(__assign({}, mongo), { serviceName: 'mongo', status: 'failed', error: err, rest: rest }));
    };
    Stack.prototype.setRedisOK = function (rest) {
        var redis = this.getRedis();
        return this.withCheckResponse(__assign(__assign({}, redis), { serviceName: 'redis', status: 'ok', rest: rest }));
    };
    Stack.prototype.setRedisError = function (err, rest) {
        var redis = this.getRedis();
        return this.withCheckResponse(__assign(__assign({}, redis), { serviceName: 'redis', status: 'failed', error: err, rest: rest }));
    };
    Stack.prototype.setConsulOK = function (rest) {
        var consul = this.getConsul();
        return this.withCheckResponse(__assign(__assign({}, consul), { serviceName: 'consul', status: 'ok', rest: rest }));
    };
    Stack.prototype.setConsulError = function (err, rest) {
        var consul = this.getConsul();
        return this.withCheckResponse(__assign(__assign({}, consul), { serviceName: 'consul', status: 'failed', error: err, rest: rest }));
    };
    Stack.prototype.setEnvoyOK = function (rest) {
        var envoy = this.getEnvoy();
        return this.withCheckResponse(__assign(__assign({}, envoy), { serviceName: 'envoy', status: 'ok', rest: rest }));
    };
    Stack.prototype.setEnvoyError = function (err, rest) {
        var envoy = this.getEnvoy();
        return this.withCheckResponse(__assign(__assign({}, envoy), { serviceName: 'envoy', status: 'failed', error: err, rest: rest }));
    };
    Stack.prototype.setWardenOK = function (rest) {
        var warden = this.getConsul();
        return this.withCheckResponse(__assign(__assign({}, warden), { serviceName: 'warden', status: 'ok', rest: rest }));
    };
    Stack.prototype.setWardenError = function (err, rest) {
        var warden = this.getConsul();
        return this.withCheckResponse(__assign(__assign({}, warden), { serviceName: 'warden', status: 'failed', error: err, rest: rest }));
    };
    Stack.prototype.setZookeeperOK = function (rest) {
        var zookeeper = this.getZookeeper();
        return this.withCheckResponse(__assign(__assign({}, zookeeper), { serviceName: 'zookeeper', status: 'ok', rest: rest }));
    };
    Stack.prototype.setZookeeperError = function (err, rest) {
        var zookeeper = this.getZookeeper();
        return this.withCheckResponse(__assign(__assign({}, zookeeper), { serviceName: 'zookeeper', status: 'failed', error: err, rest: rest }));
    };
    Stack.prototype.setRabbitOK = function (rest) {
        return this.withCheckResponse({ serviceName: 'rabbitMQ', status: 'ok', rest: rest });
    };
    Stack.prototype.setRabbitError = function (err, rest) {
        return this.withCheckResponse({ serviceName: 'rabbitMQ', status: 'failed', error: err, rest: rest });
    };
    Stack.prototype.toggleDisabled = function () {
        return new Stack({
            name: this.name,
            status: this.status,
            statusDate: this.statusDate,
            disabled: !this.disabled,
            error: this.error,
            services: this.services
        });
    };
    Stack.prototype.getServicesAsList = function () {
        var _this = this;
        return Object.keys(this.services).map(function (services) {
            return __assign({}, _this.get(services));
        });
    };
    return Stack;
}());
exports.Stack = Stack;
