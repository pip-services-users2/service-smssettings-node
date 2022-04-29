import { ConfigParams } from 'pip-services3-commons-nodex';

import { SmsSettingsMongoDbPersistence } from '../../src/persistence/SmsSettingsMongoDbPersistence';
import { SmsSettingsPersistenceFixture } from './SmsSettingsPersistenceFixture';

suite('SmsSettingsMongoDbPersistence', ()=> {
    let persistence: SmsSettingsMongoDbPersistence;
    let fixture: SmsSettingsPersistenceFixture;

    setup(async () => {
        var MONGO_DB = process.env["MONGO_DB"] || "test";
        var MONGO_COLLECTION = process.env["MONGO_COLLECTION"] || "sms_settings";
        var MONGO_SERVICE_HOST = process.env["MONGO_SERVICE_HOST"] || "localhost";
        var MONGO_SERVICE_PORT = process.env["MONGO_SERVICE_PORT"] || "27017";
        var MONGO_SERVICE_URI = process.env["MONGO_SERVICE_URI"];

        var dbConfig = ConfigParams.fromTuples(
            "collection", MONGO_COLLECTION,
            "connection.database", MONGO_DB,
            "connection.host", MONGO_SERVICE_HOST,
            "connection.port", MONGO_SERVICE_PORT,
            "connection.uri", MONGO_SERVICE_URI
        );

        persistence = new SmsSettingsMongoDbPersistence();
        persistence.configure(dbConfig);

        fixture = new SmsSettingsPersistenceFixture(persistence);

        await persistence.open(null);
        await persistence.clear(null);
    });
    
    teardown(async () => {
        await persistence.close(null);
    });

    test('CRUD Operations', async () => {
        await fixture.testCrudOperations();
    });
});