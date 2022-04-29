import { CommandSet } from 'pip-services3-commons-nodex';
import { ICommand } from 'pip-services3-commons-nodex';
import { Command } from 'pip-services3-commons-nodex';
import { Parameters } from 'pip-services3-commons-nodex';
import { ObjectSchema } from 'pip-services3-commons-nodex';
import { ArraySchema } from 'pip-services3-commons-nodex';
import { TypeCode } from 'pip-services3-commons-nodex';

import { SmsSettingsV1Schema } from '../data/version1/SmsSettingsV1Schema';
import { ISmsSettingsController } from './ISmsSettingsController';

export class SmsSettingsCommandSet extends CommandSet {
    private _logic: ISmsSettingsController;

    constructor(logic: ISmsSettingsController) {
        super();

        this._logic = logic;

		this.addCommand(this.makeGetSettingsByIdsCommand());
		this.addCommand(this.makeGetSettingsByIdCommand());
		this.addCommand(this.makeGetSettingsBySmsSettingsCommand());
		this.addCommand(this.makeSetSettingsCommand());
		this.addCommand(this.makeSetVerifiedSettingsCommand());
		this.addCommand(this.makeSetRecipientCommand());
		this.addCommand(this.makeSetSubscriptionsCommand());
		this.addCommand(this.makeDeleteSettingsByIdCommand());
		this.addCommand(this.makeResendVerificationCommand());
		this.addCommand(this.makeVerifySmsCommand());
    }

	private makeGetSettingsByIdsCommand(): ICommand {
		return new Command(
			"get_settings_by_ids",
			new ObjectSchema(true)
				.withRequiredProperty('recipient_ids', new ArraySchema(TypeCode.String)),
            async (correlationId: string, args: Parameters) => {
                let recipientIds = args.get("recipient_ids");
                return await this._logic.getSettingsByIds(correlationId, recipientIds);
            }
		);
	}

	private makeGetSettingsByIdCommand(): ICommand {
		return new Command(
			"get_settings_by_id",
			new ObjectSchema(true)
				.withRequiredProperty('recipient_id', TypeCode.String),
			async (correlationId: string, args: Parameters) => {
                let recipientId = args.getAsNullableString("recipient_id");
                return await this._logic.getSettingsById(correlationId, recipientId);
            }
		);
	}

	private makeGetSettingsBySmsSettingsCommand(): ICommand {
		return new Command(
			"get_settings_by_phone",
			new ObjectSchema(true)
				.withRequiredProperty('phone', TypeCode.String),
			async (correlationId: string, args: Parameters) => {
                let phone = args.getAsNullableString("phone");
                return await this._logic.getSettingsByPhoneSettings(correlationId, phone);
            }
		);
	}

	private makeSetSettingsCommand(): ICommand {
		return new Command(
			"set_settings",
			new ObjectSchema(true)
				.withRequiredProperty('settings', new SmsSettingsV1Schema()),
			async (correlationId: string, args: Parameters) => {
                let settings = args.get("settings");
				return await this._logic.setSettings(correlationId, settings);
            }
		);
	}

	private makeSetVerifiedSettingsCommand(): ICommand {
		return new Command(
			"set_verified_settings",
			new ObjectSchema(true)
				.withRequiredProperty('settings', new SmsSettingsV1Schema()),
			async (correlationId: string, args: Parameters) => {
                let settings = args.get("settings");
				return await this._logic.setVerifiedSettings(correlationId, settings);
            }
		);
	}

	private makeSetRecipientCommand(): ICommand {
		return new Command(
			"set_recipient",
			new ObjectSchema(true)
				.withRequiredProperty('recipient_id', TypeCode.String)
				.withOptionalProperty('name', TypeCode.String)
				.withOptionalProperty('phone', TypeCode.String)
				.withOptionalProperty('language', TypeCode.String),
			async (correlationId: string, args: Parameters) => {
                let recipientId = args.getAsString("recipient_id");
                let name = args.getAsString("name");
                let phone = args.getAsString("phone");
                let language = args.getAsString("language");
				return await this._logic.setRecipient(correlationId, recipientId, name, phone, language);
            }
		);
	}

	private makeSetSubscriptionsCommand(): ICommand {
		return new Command(
			"set_subscriptions",
			new ObjectSchema(true)
				.withRequiredProperty('recipient_id', TypeCode.String)
				.withRequiredProperty('subscriptions', TypeCode.Map),
			async (correlationId: string, args: Parameters) => {
                let recipientId = args.getAsString("recipient_id");
                let subscriptions = args.get("subscriptions");
				return await this._logic.setSubscriptions(correlationId, recipientId, subscriptions);
            }
		);
	}
	
	private makeDeleteSettingsByIdCommand(): ICommand {
		return new Command(
			"delete_settings_by_id",
			new ObjectSchema(true)
				.withRequiredProperty('recipient_id', TypeCode.String),
			async (correlationId: string, args: Parameters) => {
                let recipientId = args.getAsNullableString("recipient_id");
				await this._logic.deleteSettingsById(correlationId, recipientId);
			}
		);
	}

	private makeResendVerificationCommand(): ICommand {
		return new Command(
			"resend_verification",
			null,
			async (correlationId: string, args: Parameters) => {
                let recipientId = args.getAsString("recipient_id");
				await this._logic.resendVerification(correlationId, recipientId);
            }
		);
	}

	private makeVerifySmsCommand(): ICommand {
		return new Command(
			"verify_phone",
			new ObjectSchema(true)
				.withRequiredProperty('recipient_id', TypeCode.String),
			async (correlationId: string, args: Parameters) => {
                let recipientId = args.getAsString("recipient_id");
                let code = args.getAsString("code");
                await this._logic.verifyPhone(correlationId, recipientId, code);
            }
		);
	}

}