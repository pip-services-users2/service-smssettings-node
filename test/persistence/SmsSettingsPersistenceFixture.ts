const assert = require('chai').assert;

import { SmsSettingsV1 } from '../../src/data/version1/SmsSettingsV1';
import { ISmsSettingsPersistence } from '../../src/persistence/ISmsSettingsPersistence';

let SETTINGS = <SmsSettingsV1> {
    id: '1',
    name: 'User 1',
    phone: '+1234567890',
    language: 'en',
    verified: false,
    ver_code: null,
    subscriptions: { notifications: true, ads: false }
};

export class SmsSettingsPersistenceFixture {
    private _persistence: ISmsSettingsPersistence;
    
    constructor(persistence: ISmsSettingsPersistence) {
        assert.isNotNull(persistence);
        this._persistence = persistence;
    }
                
    public async testCrudOperations() {
        let settings1: SmsSettingsV1;

        // Create items
        let settings = await this._persistence.set(null, SETTINGS);

        assert.isObject(settings);
        assert.equal(settings.id, SETTINGS.id);
        assert.equal(settings.phone, SETTINGS.phone);
        assert.isFalse(settings.verified);
        assert.isNull(settings.ver_code || null);

        // Get settings by sms
        settings = await this._persistence.getOneByPhoneSettings(null, SETTINGS.phone);
        
        assert.isObject(settings);
        assert.equal(settings.id, SETTINGS.id);

        settings1 = settings;

        // Update settings
        settings1.phone = '+1234567432';
        settings = await this._persistence.set(null, settings1);

        assert.isObject(settings);
        assert.equal(settings.id, SETTINGS.id)
        assert.isFalse(settings.verified);
        assert.equal(settings.phone, '+1234567432');

        // Try to get deleted settings
        let settingsList = await this._persistence.getListByIds(null, [SETTINGS.id]);

        assert.lengthOf(settingsList, 1);

        // Delete settings
        await this._persistence.deleteById(null, SETTINGS.id);

        // Try to get deleted settings
        settings = await this._persistence.getOneById(null, SETTINGS.id);

        assert.isNull(settings || null);
    }
}
