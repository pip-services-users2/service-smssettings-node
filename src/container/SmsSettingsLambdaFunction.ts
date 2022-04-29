import { Descriptor } from 'pip-services3-commons-nodex';
import { CommandableLambdaFunction } from 'pip-services3-aws-nodex';
import { SmsSettingsServiceFactory } from '../build/SmsSettingsServiceFactory';

import { SmsClientFactory } from 'client-sms-node';
import { MessageTemplatesClientFactory } from 'client-msgtemplates-node';
import { ActivitiesClientFactory } from 'client-activities-node';

export class SmsSettingsLambdaFunction extends CommandableLambdaFunction {
    public constructor() {
        super("sms_settings", "Sms settings function");
        this._dependencyResolver.put('controller', new Descriptor('service-smssettings', 'controller', 'default', '*', '*'));
        this._factories.add(new SmsSettingsServiceFactory());
        this._factories.add(new SmsClientFactory());
        this._factories.add(new MessageTemplatesClientFactory());
        this._factories.add(new ActivitiesClientFactory());
    }
}

export const handler = new SmsSettingsLambdaFunction().getHandler();