const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';

import { SmsSettingsV1 } from '../../src/data/version1/SmsSettingsV1';
import { SmsSettingsLambdaFunction } from '../../src/container/SmsSettingsLambdaFunction';

let SETTINGS = <SmsSettingsV1> {
    id: '1',
    name: 'User 1',
    phone: '+1234567890',
    language: 'en',
    verified: false
};

suite('SmsSettingsLambdaFunction', ()=> {
    let lambda: SmsSettingsLambdaFunction;

    suiteSetup(async () => {
        let config = ConfigParams.fromTuples(
            'logger.descriptor', 'pip-services:logger:console:default:1.0',
            'persistence.descriptor', 'service-smssettings:persistence:memory:default:1.0',
            'controller.descriptor', 'service-smssettings:controller:default:default:1.0',
            'smsdelivery.descriptor', 'service-sms:client:null:default:1.0'
        );

        lambda = new SmsSettingsLambdaFunction();
        lambda.configure(config);
        await lambda.open(null);
    });
    
    suiteTeardown(async () => {
        await lambda.close(null);
    });
    

    test('CRUD Operations', async () => {
        let settings1: SmsSettingsV1;

        // Create sms settings
        let settings = await lambda.act(
            {
                role: 'sms_settings',
                cmd: 'set_settings',
                settings: SETTINGS
            }
        );

        assert.isObject(settings);
        assert.equal(settings.id, SETTINGS.id);
        assert.equal(settings.phone, SETTINGS.phone);
        assert.isFalse(settings.verified);

        settings1 = settings;

        // Update the settings
        settings1.subscriptions.engagement = true;
        
        settings = await lambda.act(
            {
                role: 'sms_settings',
                cmd: 'set_settings',
                settings: settings1
            }
        );


        // Delete settings
        await lambda.act(
            {
                role: 'sms_settings',
                cmd: 'delete_settings_by_id',
                recipient_id: SETTINGS.id
            }
        );

        // Try to get deleted settings
        settings = await lambda.act(
            {
                role: 'sms_settings',
                cmd: 'get_settings_by_id',
                recipient_id: SETTINGS.id
            }
        );

        assert.isNull(settings);

    });
    
});