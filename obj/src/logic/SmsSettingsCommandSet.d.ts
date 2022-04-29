import { CommandSet } from 'pip-services3-commons-nodex';
import { ISmsSettingsController } from './ISmsSettingsController';
export declare class SmsSettingsCommandSet extends CommandSet {
    private _logic;
    constructor(logic: ISmsSettingsController);
    private makeGetSettingsByIdsCommand;
    private makeGetSettingsByIdCommand;
    private makeGetSettingsBySmsSettingsCommand;
    private makeSetSettingsCommand;
    private makeSetVerifiedSettingsCommand;
    private makeSetRecipientCommand;
    private makeSetSubscriptionsCommand;
    private makeDeleteSettingsByIdCommand;
    private makeResendVerificationCommand;
    private makeVerifySmsCommand;
}
