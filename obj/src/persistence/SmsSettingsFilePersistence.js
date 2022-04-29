"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsSettingsFilePersistence = void 0;
const pip_services3_data_nodex_1 = require("pip-services3-data-nodex");
const SmsSettingsMemoryPersistence_1 = require("./SmsSettingsMemoryPersistence");
class SmsSettingsFilePersistence extends SmsSettingsMemoryPersistence_1.SmsSettingsMemoryPersistence {
    constructor(path) {
        super();
        this._persister = new pip_services3_data_nodex_1.JsonFilePersister(path);
        this._loader = this._persister;
        this._saver = this._persister;
    }
    configure(config) {
        super.configure(config);
        this._persister.configure(config);
    }
}
exports.SmsSettingsFilePersistence = SmsSettingsFilePersistence;
//# sourceMappingURL=SmsSettingsFilePersistence.js.map