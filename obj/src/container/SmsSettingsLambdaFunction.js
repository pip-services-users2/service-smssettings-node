"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.SmsSettingsLambdaFunction = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_aws_nodex_1 = require("pip-services3-aws-nodex");
const SmsSettingsServiceFactory_1 = require("../build/SmsSettingsServiceFactory");
const client_sms_node_1 = require("client-sms-node");
const client_msgtemplates_node_1 = require("client-msgtemplates-node");
const client_activities_node_1 = require("client-activities-node");
class SmsSettingsLambdaFunction extends pip_services3_aws_nodex_1.CommandableLambdaFunction {
    constructor() {
        super("sms_settings", "Sms settings function");
        this._dependencyResolver.put('controller', new pip_services3_commons_nodex_1.Descriptor('service-smssettings', 'controller', 'default', '*', '*'));
        this._factories.add(new SmsSettingsServiceFactory_1.SmsSettingsServiceFactory());
        this._factories.add(new client_sms_node_1.SmsClientFactory());
        this._factories.add(new client_msgtemplates_node_1.MessageTemplatesClientFactory());
        this._factories.add(new client_activities_node_1.ActivitiesClientFactory());
    }
}
exports.SmsSettingsLambdaFunction = SmsSettingsLambdaFunction;
exports.handler = new SmsSettingsLambdaFunction().getHandler();
//# sourceMappingURL=SmsSettingsLambdaFunction.js.map