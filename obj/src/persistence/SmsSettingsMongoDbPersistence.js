"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsSettingsMongoDbPersistence = void 0;
const pip_services3_mongodb_nodex_1 = require("pip-services3-mongodb-nodex");
class SmsSettingsMongoDbPersistence extends pip_services3_mongodb_nodex_1.IdentifiableMongoDbPersistence {
    constructor() {
        super('sms_settings');
    }
    getOneByPhoneSettings(correlationId, phone) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                this._collection.findOne({
                    phone: phone
                }, (err, item) => {
                    if (err != null)
                        reject(err);
                    this._logger.trace(correlationId, "Retrieved from %s by %s", this._collection, phone);
                    item = this.convertToPublic(item);
                    resolve(item);
                });
            });
        });
    }
}
exports.SmsSettingsMongoDbPersistence = SmsSettingsMongoDbPersistence;
//# sourceMappingURL=SmsSettingsMongoDbPersistence.js.map