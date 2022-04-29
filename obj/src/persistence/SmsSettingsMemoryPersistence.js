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
exports.SmsSettingsMemoryPersistence = void 0;
const pip_services3_data_nodex_1 = require("pip-services3-data-nodex");
class SmsSettingsMemoryPersistence extends pip_services3_data_nodex_1.IdentifiableMemoryPersistence {
    constructor() {
        super();
    }
    getOneByPhoneSettings(correlationId, phone) {
        return __awaiter(this, void 0, void 0, function* () {
            let items = this._items.filter((x) => { return x.phone == phone; });
            let item = items.length > 0 ? items[0] : null;
            if (item != null)
                this._logger.trace(correlationId, "Retrieved %s by %s", item, phone);
            else
                this._logger.trace(correlationId, "Cannot find item by %s", phone);
            return item;
        });
    }
}
exports.SmsSettingsMemoryPersistence = SmsSettingsMemoryPersistence;
//# sourceMappingURL=SmsSettingsMemoryPersistence.js.map