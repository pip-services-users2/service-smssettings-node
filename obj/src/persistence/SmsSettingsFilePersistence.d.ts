import { ConfigParams } from 'pip-services3-commons-nodex';
import { JsonFilePersister } from 'pip-services3-data-nodex';
import { SmsSettingsMemoryPersistence } from './SmsSettingsMemoryPersistence';
import { SmsSettingsV1 } from '../data/version1/SmsSettingsV1';
export declare class SmsSettingsFilePersistence extends SmsSettingsMemoryPersistence {
    protected _persister: JsonFilePersister<SmsSettingsV1>;
    constructor(path?: string);
    configure(config: ConfigParams): void;
}
