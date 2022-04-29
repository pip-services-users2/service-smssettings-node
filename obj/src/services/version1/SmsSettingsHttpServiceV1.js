"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsSettingsHttpServiceV1 = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_rpc_nodex_1 = require("pip-services3-rpc-nodex");
class SmsSettingsHttpServiceV1 extends pip_services3_rpc_nodex_1.CommandableHttpService {
    constructor() {
        super('v1/sms_settings');
        this._dependencyResolver.put('controller', new pip_services3_commons_nodex_1.Descriptor('service-smssettings', 'controller', 'default', '*', '1.0'));
    }
}
exports.SmsSettingsHttpServiceV1 = SmsSettingsHttpServiceV1;
//# sourceMappingURL=SmsSettingsHttpServiceV1.js.map