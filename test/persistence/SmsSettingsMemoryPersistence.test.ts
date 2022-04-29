import { SmsSettingsMemoryPersistence } from '../../src/persistence/SmsSettingsMemoryPersistence';
import { SmsSettingsPersistenceFixture } from './SmsSettingsPersistenceFixture';

suite('SmsSettingsMemoryPersistence', ()=> {
    let persistence: SmsSettingsMemoryPersistence;
    let fixture: SmsSettingsPersistenceFixture;
    
    setup(async () => {
        persistence = new SmsSettingsMemoryPersistence();
        fixture = new SmsSettingsPersistenceFixture(persistence);
        
        await persistence.open(null);
    });
    
    teardown(async () => {
        await persistence.close(null);
    });
        
    test('CRUD Operations', async () => {
        await fixture.testCrudOperations();
    });

});