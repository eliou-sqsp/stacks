"use strict";
exports.__esModule = true;
exports.Service = void 0;
var Service = /** @class */ (function () {
    function Service(props) {
        var name = props.name, status = props.status, url = props.url, containerName = props.containerName, statusDate = props.statusDate, rest = props.rest, error = props.error, ports = props.ports;
        this.name = name;
        this.status = status;
        this.url = url;
        this.containerName = containerName;
        this.statusDate = statusDate;
        this.rest = rest;
        this.error = error;
        this.ports = ports;
    }
    Service.prototype.getUrl = function () {
        if (!this.ports) {
            return null;
        }
        var host;
        if (this.name === 'mongo') {
            host = 'mongodb://localhost';
        }
        else {
            host = 'http://localhost';
        }
        var port;
        if (this.name === 'warden' && this.ports.includes('8061:8081')) {
            port = '8061';
        }
        else {
            port = this.ports[0].split(':')[0];
        }
        return host + ":" + port;
    };
    Service.prototype.withCheckResponse = function (checkResponse) {
        this.error = checkResponse.error;
        this.rest = checkResponse.rest;
        this.statusDate = new Date().toISOString();
        var status = checkResponse.status;
        if (!status) {
            status = checkResponse.error ? 'failed' : 'ok';
        }
        this.status = status;
        return this;
    };
    return Service;
}());
exports.Service = Service;
