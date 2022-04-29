import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-nodex';
import { SmsSettingsV1 } from '../data/version1/SmsSettingsV1';
import { ISmsSettingsPersistence } from './ISmsSettingsPersistence';
export declare class SmsSettingsMongoDbPersistence extends IdentifiableMongoDbPersistence<SmsSettingsV1, string> implements ISmsSettingsPersistence {
    constructor();
    getOneByPhoneSettings(correlationId: string, phone: string): Promise<SmsSettingsV1>;
}
