import { SmsSettingsFilePersistence } from '../../src/persistence/SmsSettingsFilePersistence';
import { SmsSettingsPersistenceFixture } from './SmsSettingsPersistenceFixture';

suite('SmsSettingsFilePersistence', ()=> {
    let persistence: SmsSettingsFilePersistence;
    let fixture: SmsSettingsPersistenceFixture;
    
    setup(async () => {
        persistence = new SmsSettingsFilePersistence('./data/sms_settings.test.json');

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