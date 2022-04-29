import { IdentifiableMemoryPersistence } from 'pip-services3-data-nodex';

import { SmsSettingsV1 } from '../data/version1/SmsSettingsV1';
import { ISmsSettingsPersistence } from './ISmsSettingsPersistence';

export class SmsSettingsMemoryPersistence 
    extends IdentifiableMemoryPersistence<SmsSettingsV1, string> 
    implements ISmsSettingsPersistence {

    constructor() {
        super();
    }

    public async getOneByPhoneSettings(correlationId: string, phone: string): Promise<SmsSettingsV1> {
        
        let items = this._items.filter((x) => {return x.phone == phone;});
        let item = items.length > 0 ? items[0] : null;

        if (item != null)
            this._logger.trace(correlationId, "Retrieved %s by %s", item, phone);
        else
            this._logger.trace(correlationId, "Cannot find item by %s", phone);

        return item;
    }
}
