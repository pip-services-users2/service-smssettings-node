import { IdentifiableMemoryPersistence } from 'pip-services3-data-nodex';
import { SmsSettingsV1 } from '../data/version1/SmsSettingsV1';
import { ISmsSettingsPersistence } from './ISmsSettingsPersistence';
export declare class SmsSettingsMemoryPersistence extends IdentifiableMemoryPersistence<SmsSettingsV1, string> implements ISmsSettingsPersistence {
    constructor();
    getOneByPhoneSettings(correlationId: string, phone: string): Promise<SmsSettingsV1>;
}
