import { Descriptor } from 'pip-services3-commons-nodex';
import { CommandableHttpService } from 'pip-services3-rpc-nodex';

export class SmsSettingsHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super('v1/sms_settings');
        this._dependencyResolver.put('controller', new Descriptor('service-smssettings', 'controller', 'default', '*', '1.0'));
    }
}