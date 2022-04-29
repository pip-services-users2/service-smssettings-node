const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';

import { SmsNullClientV1 } from 'client-sms-node';

import { SmsSettingsV1 } from '../../src/data/version1/SmsSettingsV1';
import { SmsSettingsMemoryPersistence } from '../../src/persistence/SmsSettingsMemoryPersistence';
import { SmsSettingsController } from '../../src/logic/SmsSettingsController';

let SETTINGS = <SmsSettingsV1> {
    id: '1',
    name: 'User 1',
    phone: '+1234567890',
    language: 'en',
    verified: false
};

suite('SmsSettingsController', ()=> {
    let persistence: SmsSettingsMemoryPersistence;
    let controller: SmsSettingsController;

    setup(() => {
        persistence = new SmsSettingsMemoryPersistence();

        controller = new SmsSettingsController();
        controller.configure(new ConfigParams());

        let references: References = References.fromTuples(
            new Descriptor('service-smssettings', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('service-smssettings', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('service-sms', 'client', 'null', 'default', '1.0'), new SmsNullClientV1()
        );
        controller.setReferences(references);
    });
    
    test('CRUD Operations', async () => {
        let settings1: SmsSettingsV1;

        // Create sms settings
        let settings = await controller.setSettings(null, SETTINGS);

        assert.isObject(settings);
        assert.equal(settings.id, SETTINGS.id);
        assert.equal(settings.phone, SETTINGS.phone);
        assert.isFalse(settings.verified);

        settings1 = settings;

        // Update the settings
        settings1.subscriptions.engagement = true;

        settings = await controller.setSettings(null, settings1);

        assert.isObject(settings);
        assert.equal(settings.id, settings1.id)
        assert.isTrue(settings.subscriptions.engagement);

        // Get settings
        let settingsList = await controller.getSettingsByIds(null, [settings1.id]);
        
        assert.lengthOf(settingsList, 1);

        // Delete settings
        await controller.deleteSettingsById(null, settings1.id);
        
        // Try to get deleted settings
        settings = await controller.getSettingsById(null, settings1.id);

        assert.isNull(settings);
    });

    test('Verify Phone', async () => {
        let settings1: SmsSettingsV1;

        // Create new settings
        settings1 = Object.assign({}, SETTINGS);
        settings1.ver_code = '123';
        settings1.verified = false;
        settings1.ver_expire_time = new Date(new Date().getTime() + 10000*1000);

        let settings = await persistence.set(null, settings1);

        assert.isObject(settings);
        settings1 = settings;

        assert.isFalse(settings.verified);
        assert.isDefined(settings.ver_code);

        // Verify phone
        await controller.verifyPhone(null, settings1.id, settings1.ver_code);

        // Check settings
        settings = await persistence.getOneById(null, settings1.id);

        assert.isObject(settings);
        settings1 = settings;

        assert.isTrue(settings.verified);
        assert.isNull(settings.ver_code);

    });

    test('Resend Verification Sms', async () => {
        let settings1: SmsSettingsV1;

        // Create new settings
        let settings = await persistence.set(null, SETTINGS);

        assert.isObject(settings);
        settings1 = settings;

        assert.isFalse(settings.verified);
        assert.isUndefined(settings.ver_code);

        // Verify sms
        await controller.resendVerification(null, settings1.id);

        // Check settings
        settings = await persistence.getOneById(null, settings1.id);

        assert.isObject(settings);
        settings1 = settings;

        assert.isFalse(settings.verified);
        assert.isNotNull(settings.ver_code);
    });
    
});