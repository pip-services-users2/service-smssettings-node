import { ConfigParams } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { IReferenceable } from 'pip-services3-commons-nodex';
import { DependencyResolver } from 'pip-services3-commons-nodex';
import { ICommandable } from 'pip-services3-commons-nodex';
import { CommandSet } from 'pip-services3-commons-nodex';
import { BadRequestException } from 'pip-services3-commons-nodex';
import { ConfigException } from 'pip-services3-commons-nodex';
import { NotFoundException } from 'pip-services3-commons-nodex';
import { IdGenerator } from 'pip-services3-commons-nodex';
import { CompositeLogger } from 'pip-services3-components-nodex';

import { PartyActivityV1 } from 'client-activities-node';
import { IActivitiesClientV1 } from 'client-activities-node';
import { MessageTemplatesResolverV1, MessageTemplateV1 } from 'client-msgtemplates-node';
import { SmsMessageV1 } from 'client-sms-node';
import { SmsRecipientV1 } from 'client-sms-node';
import { ISmsClientV1 } from 'client-sms-node';

import { SmsSettingsV1 } from '../data/version1/SmsSettingsV1';
import { SmsSettingsActivityTypeV1 } from '../data/version1/SmsSettingsActivityTypeV1';
import { ISmsSettingsPersistence } from '../persistence/ISmsSettingsPersistence';
import { ISmsSettingsController } from './ISmsSettingsController';
import { SmsSettingsCommandSet } from './SmsSettingsCommandSet';

export class SmsSettingsController implements IConfigurable, IReferenceable, ICommandable, ISmsSettingsController {
    private static _phoneRegex = /^\+[0-9]{10,15}$/;
    private static _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        'dependencies.persistence', 'service-smssettings:persistence:*:*:1.0',
        'dependencies.activities', 'service-activities:client:*:*:1.0',
        'dependencies.msgtemplates', 'service-msgtemplates:client:*:*:1.0',
        'dependencies.smsdelivery', 'service-sms:client:*:*:1.0',

        'message_templates.verify_phone.subject', 'Verify phone number',
        'message_templates.verify_phone.text', 'Verification code for {{phone}} is {{ code }}.',

        'options.magic_code', null,
        'options.signature_length', 100,
        'options.verify_on_create', true,
        'options.verify_on_update', true
    );

    private _verifyOnCreate: boolean = true;
    private _verifyOnUpdate: boolean = true;
    private _expireTimeout: number = 24 * 60; // in minutes
    private _magicCode: string = null;
    private _config: ConfigParams = new ConfigParams();

    private _dependencyResolver: DependencyResolver = new DependencyResolver(SmsSettingsController._defaultConfig);
    private _templatesResolver: MessageTemplatesResolverV1 = new MessageTemplatesResolverV1();
    private _logger: CompositeLogger = new CompositeLogger();
    private _activitiesClient: IActivitiesClientV1;
    private _smsClient: ISmsClientV1;
    private _persistence: ISmsSettingsPersistence;
    private _commandSet: SmsSettingsCommandSet;

    public configure(config: ConfigParams): void {
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

    public setReferences(references: IReferences): void {
        this._dependencyResolver.setReferences(references);
        this._templatesResolver.setReferences(references);
        this._logger.setReferences(references);

        this._persistence = this._dependencyResolver.getOneRequired<ISmsSettingsPersistence>('persistence');
        this._activitiesClient = this._dependencyResolver.getOneOptional<IActivitiesClientV1>('activities');
        this._smsClient = this._dependencyResolver.getOneOptional<ISmsClientV1>('smsdelivery');
    }

    public getCommandSet(): CommandSet {
        if (this._commandSet == null)
            this._commandSet = new SmsSettingsCommandSet(this);
        return this._commandSet;
    }

    private settingsToPublic(settings: SmsSettingsV1): SmsSettingsV1 {
        if (settings == null) return null;
        delete settings.ver_code;
        delete settings.ver_expire_time;
        return settings;
    }

    public async getSettingsByIds(correlationId: string, recipientIds: string[]): Promise<SmsSettingsV1[]> {
        let settings = await this._persistence.getListByIds(correlationId, recipientIds);

        if (settings)
            settings = settings.map(s => this.settingsToPublic(s));
        
        return settings;
    }

    public async getSettingsById(correlationId: string, recipientId: string): Promise<SmsSettingsV1> {
        let settings = await this._persistence.getOneById(correlationId, recipientId);
        settings = this.settingsToPublic(settings);

        return settings;
    }

    public async getSettingsByPhoneSettings(correlationId: string, phone: string): Promise<SmsSettingsV1> {
        let settings = await this._persistence.getOneByPhoneSettings(correlationId, phone);

        return this.settingsToPublic(settings);
    }

    private async verifyAndSaveSettings(correlationId: string,
        oldSettings: SmsSettingsV1, newSettings: SmsSettingsV1): Promise<SmsSettingsV1> {

        let verify = false;
        // Check if verification is needed
        verify = (oldSettings == null && this._verifyOnCreate)
            || (oldSettings.phone != newSettings.phone && this._verifyOnUpdate);
        if (verify) {
            newSettings.verified = false;
            let code = IdGenerator.nextShort();
            newSettings.ver_code = code.substr(-4, 4);
            newSettings.ver_expire_time = new Date(new Date().getTime() + this._expireTimeout * 60000);
        }

        // Set new settings
        newSettings = await this._persistence.set(correlationId, newSettings);

        // Send verification if needed
        if (verify)
            // Send verification message and do not wait
            this.sendVerificationMessage(correlationId, newSettings);
            
        return newSettings;
    }

    private async sendVerificationMessage(correlationId: string, newSettings: SmsSettingsV1): Promise<void> {
        let err: Error = null;
        let template: MessageTemplateV1 = null;

        try {
            template = await this._templatesResolver.resolve('verify_phone');
        } catch (e) {
            err = e;
        }

        if (err == null && template == null) {
            err = new ConfigException(
                correlationId,
                'MISSING_VERIFY_PHONE',
                'Message template "verify_phone" is missing'
            );
        }

        if (err) {
            this._logger.error(correlationId, err, 'Cannot find verify_phone message template');
            return;
        }

        let message = <SmsMessageV1>{
            subject: template.subject,
            text: template.text,
            html: template.html
        };

        let recipient = <SmsRecipientV1>{
            id: newSettings.id,
            name: newSettings.name,
            phone: newSettings.phone,
            language: newSettings.language
        };

        let parameters = ConfigParams.fromTuples(
            'code', newSettings.ver_code
        );

        if (this._smsClient) {
            try {
                await this._smsClient.sendMessageToRecipient(correlationId, recipient, message, parameters);
            } catch (err) {
                this._logger.error(correlationId, err, 'Failed to send phone verification message');
            }
        }
    }

    public async setSettings(correlationId: string, settings: SmsSettingsV1): Promise<SmsSettingsV1> {
        if (settings.id == null) {
            throw new BadRequestException(correlationId, 'NO_RECIPIENT_ID', 'Missing recipient id')
        }
        if (settings.phone == null) {
            throw new BadRequestException(correlationId, 'NO_PHONE', 'Missing phone');
        }
        if (!SmsSettingsController._phoneRegex.test(settings.phone)) {
            throw new BadRequestException(
                    correlationId,
                    'WRONG_PHONE',
                    'Invalid phone ' + settings.phone
                ).withDetails('phone', settings.phone)
        }

        let newSettings: SmsSettingsV1 = Object.assign({}, settings);
        newSettings.verified = false;
        newSettings.ver_code = null;
        newSettings.ver_expire_time = null;
        newSettings.subscriptions = newSettings.subscriptions || {};

        let oldSettings: SmsSettingsV1;

        // Get existing settings
        let data = await this._persistence.getOneById(correlationId, newSettings.id);

        if (data != null) {
            oldSettings = data;

            // Override
            newSettings.verified = data.verified;
            newSettings.ver_code = data.ver_code;
            newSettings.ver_expire_time = data.ver_expire_time;
        }

        // Verify and save settings
        newSettings = await this.verifyAndSaveSettings(correlationId, oldSettings, newSettings)

        // remove ver_code from returned data
        delete newSettings.ver_code;

        return newSettings;
    }


    public async setVerifiedSettings(correlationId: string, settings: SmsSettingsV1): Promise<SmsSettingsV1> {
        if (settings.id == null) {
            throw new BadRequestException(correlationId, 'NO_RECIPIENT_ID', 'Missing recipient id')
        }
        if (settings.phone == null) {
            throw new BadRequestException(correlationId, 'NO_PHONE', 'Missing phone')
        }
        if (!SmsSettingsController._phoneRegex.test(settings.phone)) {
            throw new BadRequestException(
                    correlationId,
                    'WRONG_PHONE',
                    'Invalid phone ' + settings.phone
                ).withDetails('phone', settings.phone);
        }

        let newSettings: SmsSettingsV1 = Object.assign({}, settings);
        newSettings.verified = true;
        newSettings.ver_code = null;
        newSettings.ver_expire_time = null;
        newSettings.subscriptions = newSettings.subscriptions || {};

        return await this._persistence.set(correlationId, newSettings);
    }


    public async setRecipient(correlationId: string, recipientId: string,
        name: string, phone: string, language: string): Promise<SmsSettingsV1> {

        if (recipientId == null) {
            throw new BadRequestException(correlationId, 'NO_RECIPIENT_ID', 'Missing recipient id')
        }
        if (phone != null && !SmsSettingsController._phoneRegex.test(phone)) {
            throw new BadRequestException(
                    correlationId,
                    'WRONG_PHONE',
                    'Invalid phone ' + phone
                ).withDetails('phone', phone)
        }

        let oldSettings: SmsSettingsV1;
        let newSettings: SmsSettingsV1;

        // Get existing settings
        let data = await this._persistence.getOneById(correlationId, recipientId);

        if (data != null) {
            // Copy and modify existing settings
            oldSettings = data;
            newSettings = Object.assign({}, data);
            newSettings.name = name || data.name;
            newSettings.phone = phone || data.phone;
            newSettings.language = language || data.language;
        } else {
            // Create new settings if they are not exist
            oldSettings = null;
            newSettings = <SmsSettingsV1>{
                id: recipientId,
                name: name,
                phone: phone,
                language: language
            };
        }

        // Verify and save settings
        newSettings = await this.verifyAndSaveSettings(correlationId, oldSettings, newSettings)

        // remove ver_code from returned data
        delete newSettings.ver_code;

        return newSettings;
    }

    public async setSubscriptions(correlationId: string, recipientId: string, subscriptions: any): Promise<SmsSettingsV1> {

        if (recipientId == null) {
            throw new BadRequestException(correlationId, 'NO_ID', 'Missing id')
        }

        let oldSettings: SmsSettingsV1;
        let newSettings: SmsSettingsV1;

        // Get existing settings
        let data = await this._persistence.getOneById(correlationId, recipientId);

        if (data != null) {
            // Copy and modify existing settings
            oldSettings = data;
            newSettings = Object.assign({}, data);
            newSettings.subscriptions = subscriptions || data.subscriptions;
        } else {
            // Create new settings if they are not exist
            oldSettings = null;
            newSettings = <SmsSettingsV1>{
                id: recipientId,
                name: null,
                phone: null,
                language: null,
                subscriptions: subscriptions
            };
        }

        // Verify and save settings
        newSettings = await this.verifyAndSaveSettings(correlationId, oldSettings, newSettings);

        // remove ver_code from returned data
        delete newSettings.ver_code;

        return newSettings;
    }

    public async deleteSettingsById(correlationId: string, recipientId: string): Promise<void> {
        await this._persistence.deleteById(correlationId, recipientId);
    }

    public async resendVerification(correlationId: string, recipientId: string): Promise<void> {

        if (recipientId == null) {
            throw new BadRequestException(correlationId, 'NO_RECIPIENT_ID', 'Missing recipient id');
        }

        let settings: SmsSettingsV1;

        // Get existing settings
        settings = await this._persistence.getOneById(correlationId, recipientId);

        if (settings == null) {
            throw new NotFoundException(
                correlationId,
                'RECIPIENT_NOT_FOUND',
                'Recipient ' + recipientId + ' was not found'
            ).withDetails('recipient_id', recipientId);
        }

        // Check if verification is needed
        settings.verified = false;
        let code = IdGenerator.nextShort();
        settings.ver_code = code.substr(-4, 4);
        settings.ver_expire_time = new Date(new Date().getTime() + this._expireTimeout * 60000);

        // Send verification
        settings = await this._persistence.set(correlationId, settings)
        
        // Send verification message and do not wait
        this.sendVerificationMessage(correlationId, settings);
    }

    private async logActivity(correlationId: string, settings: SmsSettingsV1, activityType: string) {
        if (this._activitiesClient) {
            try {
                await this._activitiesClient.logPartyActivity(
                    correlationId,
                    new PartyActivityV1(
                        null,
                        activityType,
                        {
                            id: settings.id,
                            type: 'account',
                            name: settings.name
                        }
                    )
                );
            } catch (err) {
                this._logger.error(correlationId, err, 'Failed to log user activity');
            }
        }
    }

    public async verifyPhone(correlationId: string, recipientId: string, code: string): Promise<void> {
        let settings: SmsSettingsV1;

        // Read settings
        settings = await this._persistence.getOneById(correlationId, recipientId);

        if (settings == null) {
            throw new NotFoundException(
                correlationId,
                'RECIPIENT_NOT_FOUND',
                'Recipient ' + recipientId + ' was not found'
            ).withDetails('recipient_id', recipientId);
        }

        // Check and update verification code
        let verified = settings.ver_code == code;
        verified = verified || (this._magicCode != null && code == this._magicCode);
        verified = verified && new Date().getTime() < settings.ver_expire_time.getTime();

        if (!verified) {
            throw new BadRequestException(
                correlationId,
                'INVALID_CODE',
                'Invalid sms verification code ' + code
            ).withDetails('recipient_id', recipientId)
             .withDetails('code', code);
        }

        // Check and update verification code
        settings.verified = true;
        settings.ver_code = null;
        settings.ver_expire_time = null;

        if (!verified) return;

        // Save user
        await this._persistence.set(
            correlationId,
            settings
        );

        // Asynchronous post-processing
        await this.logActivity(
            correlationId,
            settings,
            SmsSettingsActivityTypeV1.PhoneVerified
        );
    }

}
