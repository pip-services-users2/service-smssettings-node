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
exports.SmsSettingsController = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_5 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_6 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const client_activities_node_1 = require("client-activities-node");
const client_msgtemplates_node_1 = require("client-msgtemplates-node");
const SmsSettingsActivityTypeV1_1 = require("../data/version1/SmsSettingsActivityTypeV1");
const SmsSettingsCommandSet_1 = require("./SmsSettingsCommandSet");
class SmsSettingsController {
    constructor() {
        this._verifyOnCreate = true;
        this._verifyOnUpdate = true;
        this._expireTimeout = 24 * 60; // in minutes
        this._magicCode = null;
        this._config = new pip_services3_commons_nodex_1.ConfigParams();
        this._dependencyResolver = new pip_services3_commons_nodex_2.DependencyResolver(SmsSettingsController._defaultConfig);
        this._templatesResolver = new client_msgtemplates_node_1.MessageTemplatesResolverV1();
        this._logger = new pip_services3_components_nodex_1.CompositeLogger();
    }
    configure(config) {
        config = config.setDefaults(SmsSettingsController._defaultConfig);
        this._dependencyResolver.configure(config);
        this._templatesResolver.configure(config);
        this._logger.configure(config);
        this._verifyOnCreate = config.getAsBooleanWithDefault('options.verify_on_create', this._verifyOnCreate);
        this._verifyOnUpdate = config.getAsBooleanWithDefault('options.verify_on_update', this._verifyOnUpdate);
        this._expireTimeout = config.getAsIntegerWithDefault('options.verify_expire_timeout', this._expireTimeout);
        this._magicCode = config.getAsStringWithDefault('options.magic_code', this._magicCode);
        this._config = config;
    }
    setReferences(references) {
        this._dependencyResolver.setReferences(references);
        this._templatesResolver.setReferences(references);
        this._logger.setReferences(references);
        this._persistence = this._dependencyResolver.getOneRequired('persistence');
        this._activitiesClient = this._dependencyResolver.getOneOptional('activities');
        this._smsClient = this._dependencyResolver.getOneOptional('smsdelivery');
    }
    getCommandSet() {
        if (this._commandSet == null)
            this._commandSet = new SmsSettingsCommandSet_1.SmsSettingsCommandSet(this);
        return this._commandSet;
    }
    settingsToPublic(settings) {
        if (settings == null)
            return null;
        delete settings.ver_code;
        delete settings.ver_expire_time;
        return settings;
    }
    getSettingsByIds(correlationId, recipientIds) {
        return __awaiter(this, void 0, void 0, function* () {
            let settings = yield this._persistence.getListByIds(correlationId, recipientIds);
            if (settings)
                settings = settings.map(s => this.settingsToPublic(s));
            return settings;
        });
    }
    getSettingsById(correlationId, recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            let settings = yield this._persistence.getOneById(correlationId, recipientId);
            settings = this.settingsToPublic(settings);
            return settings;
        });
    }
    getSettingsByPhoneSettings(correlationId, phone) {
        return __awaiter(this, void 0, void 0, function* () {
            let settings = yield this._persistence.getOneByPhoneSettings(correlationId, phone);
            return this.settingsToPublic(settings);
        });
    }
    verifyAndSaveSettings(correlationId, oldSettings, newSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            let verify = false;
            // Check if verification is needed
            verify = (oldSettings == null && this._verifyOnCreate)
                || (oldSettings.phone != newSettings.phone && this._verifyOnUpdate);
            if (verify) {
                newSettings.verified = false;
                let code = pip_services3_commons_nodex_6.IdGenerator.nextShort();
                newSettings.ver_code = code.substr(-4, 4);
                newSettings.ver_expire_time = new Date(new Date().getTime() + this._expireTimeout * 60000);
            }
            // Set new settings
            newSettings = yield this._persistence.set(correlationId, newSettings);
            // Send verification if needed
            if (verify)
                // Send verification message and do not wait
                this.sendVerificationMessage(correlationId, newSettings);
            return newSettings;
        });
    }
    sendVerificationMessage(correlationId, newSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            let err = null;
            let template = null;
            try {
                template = yield this._templatesResolver.resolve('verify_phone');
            }
            catch (e) {
                err = e;
            }
            if (err == null && template == null) {
                err = new pip_services3_commons_nodex_4.ConfigException(correlationId, 'MISSING_VERIFY_PHONE', 'Message template "verify_phone" is missing');
            }
            if (err) {
                this._logger.error(correlationId, err, 'Cannot find verify_phone message template');
                return;
            }
            let message = {
                subject: template.subject,
                text: template.text,
                html: template.html
            };
            let recipient = {
                id: newSettings.id,
                name: newSettings.name,
                phone: newSettings.phone,
                language: newSettings.language
            };
            let parameters = pip_services3_commons_nodex_1.ConfigParams.fromTuples('code', newSettings.ver_code);
            if (this._smsClient) {
                try {
                    yield this._smsClient.sendMessageToRecipient(correlationId, recipient, message, parameters);
                }
                catch (err) {
                    this._logger.error(correlationId, err, 'Failed to send phone verification message');
                }
            }
        });
    }
    setSettings(correlationId, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (settings.id == null) {
                throw new pip_services3_commons_nodex_3.BadRequestException(correlationId, 'NO_RECIPIENT_ID', 'Missing recipient id');
            }
            if (settings.phone == null) {
                throw new pip_services3_commons_nodex_3.BadRequestException(correlationId, 'NO_PHONE', 'Missing phone');
            }
            if (!SmsSettingsController._phoneRegex.test(settings.phone)) {
                throw new pip_services3_commons_nodex_3.BadRequestException(correlationId, 'WRONG_PHONE', 'Invalid phone ' + settings.phone).withDetails('phone', settings.phone);
            }
            let newSettings = Object.assign({}, settings);
            newSettings.verified = false;
            newSettings.ver_code = null;
            newSettings.ver_expire_time = null;
            newSettings.subscriptions = newSettings.subscriptions || {};
            let oldSettings;
            // Get existing settings
            let data = yield this._persistence.getOneById(correlationId, newSettings.id);
            if (data != null) {
                oldSettings = data;
                // Override
                newSettings.verified = data.verified;
                newSettings.ver_code = data.ver_code;
                newSettings.ver_expire_time = data.ver_expire_time;
            }
            // Verify and save settings
            newSettings = yield this.verifyAndSaveSettings(correlationId, oldSettings, newSettings);
            // remove ver_code from returned data
            delete newSettings.ver_code;
            return newSettings;
        });
    }
    setVerifiedSettings(correlationId, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (settings.id == null) {
                throw new pip_services3_commons_nodex_3.BadRequestException(correlationId, 'NO_RECIPIENT_ID', 'Missing recipient id');
            }
            if (settings.phone == null) {
                throw new pip_services3_commons_nodex_3.BadRequestException(correlationId, 'NO_PHONE', 'Missing phone');
            }
            if (!SmsSettingsController._phoneRegex.test(settings.phone)) {
                throw new pip_services3_commons_nodex_3.BadRequestException(correlationId, 'WRONG_PHONE', 'Invalid phone ' + settings.phone).withDetails('phone', settings.phone);
            }
            let newSettings = Object.assign({}, settings);
            newSettings.verified = true;
            newSettings.ver_code = null;
            newSettings.ver_expire_time = null;
            newSettings.subscriptions = newSettings.subscriptions || {};
            return yield this._persistence.set(correlationId, newSettings);
        });
    }
    setRecipient(correlationId, recipientId, name, phone, language) {
        return __awaiter(this, void 0, void 0, function* () {
            if (recipientId == null) {
                throw new pip_services3_commons_nodex_3.BadRequestException(correlationId, 'NO_RECIPIENT_ID', 'Missing recipient id');
            }
            if (phone != null && !SmsSettingsController._phoneRegex.test(phone)) {
                throw new pip_services3_commons_nodex_3.BadRequestException(correlationId, 'WRONG_PHONE', 'Invalid phone ' + phone).withDetails('phone', phone);
            }
            let oldSettings;
            let newSettings;
            // Get existing settings
            let data = yield this._persistence.getOneById(correlationId, recipientId);
            if (data != null) {
                // Copy and modify existing settings
                oldSettings = data;
                newSettings = Object.assign({}, data);
                newSettings.name = name || data.name;
                newSettings.phone = phone || data.phone;
                newSettings.language = language || data.language;
            }
            else {
                // Create new settings if they are not exist
                oldSettings = null;
                newSettings = {
                    id: recipientId,
                    name: name,
                    phone: phone,
                    language: language
                };
            }
            // Verify and save settings
            newSettings = yield this.verifyAndSaveSettings(correlationId, oldSettings, newSettings);
            // remove ver_code from returned data
            delete newSettings.ver_code;
            return newSettings;
        });
    }
    setSubscriptions(correlationId, recipientId, subscriptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (recipientId == null) {
                throw new pip_services3_commons_nodex_3.BadRequestException(correlationId, 'NO_ID', 'Missing id');
            }
            let oldSettings;
            let newSettings;
            // Get existing settings
            let data = yield this._persistence.getOneById(correlationId, recipientId);
            if (data != null) {
                // Copy and modify existing settings
                oldSettings = data;
                newSettings = Object.assign({}, data);
                newSettings.subscriptions = subscriptions || data.subscriptions;
            }
            else {
                // Create new settings if they are not exist
                oldSettings = null;
                newSettings = {
                    id: recipientId,
                    name: null,
                    phone: null,
                    language: null,
                    subscriptions: subscriptions
                };
            }
            // Verify and save settings
            newSettings = yield this.verifyAndSaveSettings(correlationId, oldSettings, newSettings);
            // remove ver_code from returned data
            delete newSettings.ver_code;
            return newSettings;
        });
    }
    deleteSettingsById(correlationId, recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._persistence.deleteById(correlationId, recipientId);
        });
    }
    resendVerification(correlationId, recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (recipientId == null) {
                throw new pip_services3_commons_nodex_3.BadRequestException(correlationId, 'NO_RECIPIENT_ID', 'Missing recipient id');
            }
            let settings;
            // Get existing settings
            settings = yield this._persistence.getOneById(correlationId, recipientId);
            if (settings == null) {
                throw new pip_services3_commons_nodex_5.NotFoundException(correlationId, 'RECIPIENT_NOT_FOUND', 'Recipient ' + recipientId + ' was not found').withDetails('recipient_id', recipientId);
            }
            // Check if verification is needed
            settings.verified = false;
            let code = pip_services3_commons_nodex_6.IdGenerator.nextShort();
            settings.ver_code = code.substr(-4, 4);
            settings.ver_expire_time = new Date(new Date().getTime() + this._expireTimeout * 60000);
            // Send verification
            settings = yield this._persistence.set(correlationId, settings);
            // Send verification message and do not wait
            this.sendVerificationMessage(correlationId, settings);
        });
    }
    logActivity(correlationId, settings, activityType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._activitiesClient) {
                try {
                    yield this._activitiesClient.logPartyActivity(correlationId, new client_activities_node_1.PartyActivityV1(null, activityType, {
                        id: settings.id,
                        type: 'account',
                        name: settings.name
                    }));
                }
                catch (err) {
                    this._logger.error(correlationId, err, 'Failed to log user activity');
                }
            }
        });
    }
    verifyPhone(correlationId, recipientId, code) {
        return __awaiter(this, void 0, void 0, function* () {
            let settings;
            // Read settings
            settings = yield this._persistence.getOneById(correlationId, recipientId);
            if (settings == null) {
                throw new pip_services3_commons_nodex_5.NotFoundException(correlationId, 'RECIPIENT_NOT_FOUND', 'Recipient ' + recipientId + ' was not found').withDetails('recipient_id', recipientId);
            }
            // Check and update verification code
            let verified = settings.ver_code == code;
            verified = verified || (this._magicCode != null && code == this._magicCode);
            verified = verified && new Date().getTime() < settings.ver_expire_time.getTime();
            if (!verified) {
                throw new pip_services3_commons_nodex_3.BadRequestException(correlationId, 'INVALID_CODE', 'Invalid sms verification code ' + code).withDetails('recipient_id', recipientId)
                    .withDetails('code', code);
            }
            // Check and update verification code
            settings.verified = true;
            settings.ver_code = null;
            settings.ver_expire_time = null;
            if (!verified)
                return;
            // Save user
            yield this._persistence.set(correlationId, settings);
            // Asynchronous post-processing
            yield this.logActivity(correlationId, settings, SmsSettingsActivityTypeV1_1.SmsSettingsActivityTypeV1.PhoneVerified);
        });
    }
}
exports.SmsSettingsController = SmsSettingsController;
SmsSettingsController._phoneRegex = /^\+[0-9]{10,15}$/;
SmsSettingsController._defaultConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples('dependencies.persistence', 'service-smssettings:persistence:*:*:1.0', 'dependencies.activities', 'service-activities:client:*:*:1.0', 'dependencies.msgtemplates', 'service-msgtemplates:client:*:*:1.0', 'dependencies.smsdelivery', 'service-sms:client:*:*:1.0', 'message_templates.verify_phone.subject', 'Verify phone number', 'message_templates.verify_phone.text', 'Verification code for {{phone}} is {{ code }}.', 'options.magic_code', null, 'options.signature_length', 100, 'options.verify_on_create', true, 'options.verify_on_update', true);
//# sourceMappingURL=SmsSettingsController.js.map