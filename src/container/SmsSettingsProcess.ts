import { ProcessContainer } from 'pip-services3-container-nodex';
import { ActivitiesClientFactory } from 'client-activities-node';
import { MessageTemplatesClientFactory } from 'client-msgtemplates-node';
import { SmsClientFactory } from 'client-sms-node';
import { DefaultRpcFactory } from 'pip-services3-rpc-nodex';

import { SmsSettingsServiceFactory } from '../build/SmsSettingsServiceFactory';
import { DefaultSwaggerFactory } from 'pip-services3-swagger-nodex';

export class SmsSettingsProcess extends ProcessContainer {

    public constructor() {
        super("sms_settings", "Sms settings microservice");
        this._factories.add(new SmsSettingsServiceFactory());
        this._factories.add(new ActivitiesClientFactory());
        this._factories.add(new MessageTemplatesClientFactory());
        this._factories.add(new SmsClientFactory());
        this._factories.add(new DefaultRpcFactory());
        this._factories.add(new DefaultSwaggerFactory());
    }

}
