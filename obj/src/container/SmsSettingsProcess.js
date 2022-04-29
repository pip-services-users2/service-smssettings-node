"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsSettingsProcess = void 0;
const pip_services3_container_nodex_1 = require("pip-services3-container-nodex");
const client_activities_node_1 = require("client-activities-node");
const client_msgtemplates_node_1 = require("client-msgtemplates-node");
const client_sms_node_1 = require("client-sms-node");
const pip_services3_rpc_nodex_1 = require("pip-services3-rpc-nodex");
const SmsSettingsServiceFactory_1 = require("../build/SmsSettingsServiceFactory");
const pip_services3_swagger_nodex_1 = require("pip-services3-swagger-nodex");
class SmsSettingsProcess extends pip_services3_container_nodex_1.ProcessContainer {
    constructor() {
        super("sms_settings", "Sms settings microservice");
        this._factories.add(new SmsSettingsServiceFactory_1.SmsSettingsServiceFactory());
        this._factories.add(new client_activities_node_1.ActivitiesClientFactory());
        this._factories.add(new client_msgtemplates_node_1.MessageTemplatesClientFactory());
        this._factories.add(new client_sms_node_1.SmsClientFactory());
        this._factories.add(new pip_services3_rpc_nodex_1.DefaultRpcFactory());
        this._factories.add(new pip_services3_swagger_nodex_1.DefaultSwaggerFactory());
    }
}
exports.SmsSettingsProcess = SmsSettingsProcess;
//# sourceMappingURL=SmsSettingsProcess.js.map