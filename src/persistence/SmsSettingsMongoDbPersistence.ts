import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-nodex';

import { SmsSettingsV1 } from '../data/version1/SmsSettingsV1';
import { ISmsSettingsPersistence } from './ISmsSettingsPersistence';

export class SmsSettingsMongoDbPersistence 
    extends IdentifiableMongoDbPersistence<SmsSettingsV1, string> 
    implements ISmsSettingsPersistence {

    constructor() {
        super('sms_settings');
    }

    public async getOneByPhoneSettings(correlationId: string, phone: string): Promise<SmsSettingsV1> {
        return await new Promise<any>((resolve, reject) => { 
            this._collection.findOne(
                {
                    phone: phone
                },
                (err, item) => {
                    if (err != null) reject(err)

                    this._logger.trace(correlationId, "Retrieved from %s by %s", this._collection, phone);

                    item = this.convertToPublic(item);
                    resolve(item);
                }
            );
        });
        
    }
}
