import { IGetter } from 'pip-services3-data-nodex';
import { IWriter } from 'pip-services3-data-nodex';
import { SmsSettingsV1 } from '../data/version1/SmsSettingsV1';
export interface ISmsSettingsPersistence extends IGetter<SmsSettingsV1, string>, IWriter<SmsSettingsV1, string> {
    getListByIds(correlationId: string, ids: string[]): Promise<SmsSettingsV1[]>;
    getOneById(correlation_id: string, id: string): Promise<SmsSettingsV1>;
    getOneByPhoneSettings(correlation_id: string, phone: string): Promise<SmsSettingsV1>;
    set(correlation_id: string, item: SmsSettingsV1): Promise<SmsSettingsV1>;
    deleteById(correlation_id: string, id: string): Promise<SmsSettingsV1>;
}
