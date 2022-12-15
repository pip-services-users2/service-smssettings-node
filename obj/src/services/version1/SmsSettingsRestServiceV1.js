"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsSettingsRestServiceV1 = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_rpc_nodex_1 = require("pip-services3-rpc-nodex");
class SmsSettingsRestServiceV1 extends pip_services3_rpc_nodex_1.CommandableHttpService {
    constructor() {
        super('v1/sms_settings');
        this._dependencyResolver.put('controller', new pip_services3_commons_nodex_1.Descriptor('service-smssettings', 'controller', 'default', '*', '1.0'));
    }
}
exports.SmsSettingsRestServiceV1 = SmsSettingsRestServiceV1;
//# sourceMappingURL=SmsSettingsRestServiceV1.js.map