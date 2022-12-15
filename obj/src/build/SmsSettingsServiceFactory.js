"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsSettingsServiceFactory = void 0;
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const SmsSettingsMongoDbPersistence_1 = require("../persistence/SmsSettingsMongoDbPersistence");
const SmsSettingsFilePersistence_1 = require("../persistence/SmsSettingsFilePersistence");
const SmsSettingsMemoryPersistence_1 = require("../persistence/SmsSettingsMemoryPersistence");
const SmsSettingsController_1 = require("../logic/SmsSettingsController");
const SmsSettingsCommandableServiceV1_1 = require("../services/version1/SmsSettingsCommandableServiceV1");
class SmsSettingsServiceFactory extends pip_services3_components_nodex_1.Factory {
    constructor() {
        super();
        this.registerAsType(SmsSettingsServiceFactory.MemoryPersistenceDescriptor, SmsSettingsMemoryPersistence_1.SmsSettingsMemoryPersistence);
        this.registerAsType(SmsSettingsServiceFactory.FilePersistenceDescriptor, SmsSettingsFilePersistence_1.SmsSettingsFilePersistence);
        this.registerAsType(SmsSettingsServiceFactory.MongoDbPersistenceDescriptor, SmsSettingsMongoDbPersistence_1.SmsSettingsMongoDbPersistence);
        this.registerAsType(SmsSettingsServiceFactory.ControllerDescriptor, SmsSettingsController_1.SmsSettingsController);
        this.registerAsType(SmsSettingsServiceFactory.CommandableHttpServiceDescriptor, SmsSettingsCommandableServiceV1_1.SmsSettingsCommandableServiceV1);
    }
}
exports.SmsSettingsServiceFactory = SmsSettingsServiceFactory;
SmsSettingsServiceFactory.Descriptor = new pip_services3_commons_nodex_1.Descriptor("service-smssettings", "factory", "default", "default", "1.0");
SmsSettingsServiceFactory.MemoryPersistenceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-smssettings", "persistence", "memory", "*", "1.0");
SmsSettingsServiceFactory.FilePersistenceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-smssettings", "persistence", "file", "*", "1.0");
SmsSettingsServiceFactory.MongoDbPersistenceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-smssettings", "persistence", "mongodb", "*", "1.0");
SmsSettingsServiceFactory.ControllerDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-smssettings", "controller", "default", "*", "1.0");
SmsSettingsServiceFactory.CommandableHttpServiceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-smssettings", "service", "commandable-http", "*", "1.0");
//# sourceMappingURL=SmsSettingsServiceFactory.js.map