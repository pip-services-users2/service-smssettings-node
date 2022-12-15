const restify = require('restify');
const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';

import { SmsNullClientV1 } from 'client-sms-node';

import { SmsSettingsV1 } from '../../../src/data/version1/SmsSettingsV1';
import { SmsSettingsMemoryPersistence } from '../../../src/persistence/SmsSettingsMemoryPersistence';
import { SmsSettingsController } from '../../../src/logic/SmsSettingsController';
import { SmsSettingsCommandableServiceV1 } from '../../../src/services/version1/SmsSettingsCommandableServiceV1';

let httpConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

let SETTINGS = <SmsSettingsV1> {
    id: '1',
    name: 'User 1',
    phone: '+1234567890',
    language: 'en',
    verified: false
};

suite('SmsSettingsCommandableServiceV1', ()=> {
    let service: SmsSettingsCommandableServiceV1;

    let rest: any;

    suiteSetup(async () => {
        let persistence = new SmsSettingsMemoryPersistence();

        let controller = new SmsSettingsController();
        controller.configure(new ConfigParams());

        service = new SmsSettingsCommandableServiceV1();
        service.configure(httpConfig);

        let references: References = References.fromTuples(
            new Descriptor('service-smssettings', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('service-smssettings', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('service-sms', 'client', 'null', 'default', '1.0'), new SmsNullClientV1(),
            new Descriptor('service-smssettings', 'service', 'rest-http', 'default', '1.0'), service
        );
        controller.setReferences(references);
        service.setReferences(references);

        await service.open(null);
    });
    
    suiteTeardown(async () => {
        await service.close(null);
    });

    setup(() => {
        let url = 'http://localhost:3000';
        rest = restify.createJsonClient({ url: url, version: '*' });
    });

    test('CRUD Operations', async () => {
        let settings1: SmsSettingsV1;

        // Create sms settings
        let settings = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/sms_settings/set_settings',
                {
                    settings: SETTINGS
                },
                (err, req, res, settings) => {
                    if (err == null) resolve(settings);
                    else reject(err);
                }
            );
        });

        assert.isObject(settings);
        assert.equal(settings.id, SETTINGS.id);
        assert.equal(settings.phone, SETTINGS.phone);
        assert.isFalse(settings.verified);

        settings1 = settings;
        
        // Update the settings
        settings1.subscriptions.engagement = true;

        settings = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/sms_settings/set_settings',
                {
                    settings: settings1
                },
                (err, req, res, settings) => {
                    if (err == null) resolve(settings);
                    else reject(err);
                }
            );
        });

        assert.isObject(settings);
        assert.equal(settings.id, settings1.id)
        assert.isTrue(settings.subscriptions.engagement);

        // Delete settings
        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/sms_settings/delete_settings_by_id',
                {
                    recipient_id: settings1.id
                },
                (err, req, res, settings) => {
                    if (err == null) resolve(settings);
                    else reject(err);
                }
            );
        });

        // Try to get deleted settings
        settings = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/sms_settings/get_settings_by_id',
                {
                    recipient_id: settings1.id
                },
                (err, req, res, settings) => {
                    if (err == null) resolve(settings);
                    else reject(err);
                }
            );
        });

        // assert.isNull(settings);
    });
        
});