import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';

import { SmsSettingsMongoDbPersistence } from '../persistence/SmsSettingsMongoDbPersistence';
import { SmsSettingsFilePersistence } from '../persistence/SmsSettingsFilePersistence';
import { SmsSettingsMemoryPersistence } from '../persistence/SmsSettingsMemoryPersistence';
import { SmsSettingsController } from '../logic/SmsSettingsController';
import { SmsSettingsCommandableServiceV1 } from '../services/version1/SmsSettingsCommandableServiceV1';

export class SmsSettingsServiceFactory extends Factory {
	public static Descriptor = new Descriptor("service-smssettings", "factory", "default", "default", "1.0");
	public static MemoryPersistenceDescriptor = new Descriptor("service-smssettings", "persistence", "memory", "*", "1.0");
	public static FilePersistenceDescriptor = new Descriptor("service-smssettings", "persistence", "file", "*", "1.0");
	public static MongoDbPersistenceDescriptor = new Descriptor("service-smssettings", "persistence", "mongodb", "*", "1.0");
	public static ControllerDescriptor = new Descriptor("service-smssettings", "controller", "default", "*", "1.0");
	public static CommandableHttpServiceDescriptor = new Descriptor("service-smssettings", "service", "commandable-http", "*", "1.0");
	
	constructor() {
		super();
		this.registerAsType(SmsSettingsServiceFactory.MemoryPersistenceDescriptor, SmsSettingsMemoryPersistence);
		this.registerAsType(SmsSettingsServiceFactory.FilePersistenceDescriptor, SmsSettingsFilePersistence);
		this.registerAsType(SmsSettingsServiceFactory.MongoDbPersistenceDescriptor, SmsSettingsMongoDbPersistence);
		this.registerAsType(SmsSettingsServiceFactory.ControllerDescriptor, SmsSettingsController);
		this.registerAsType(SmsSettingsServiceFactory.CommandableHttpServiceDescriptor, SmsSettingsCommandableServiceV1);
	}
	
}
