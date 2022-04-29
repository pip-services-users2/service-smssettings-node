import { SmsSettingsV1 } from '../data/version1/SmsSettingsV1';

export interface ISmsSettingsController {
    getSettingsByIds(correlationId: string, recipientIds: string[]): Promise<SmsSettingsV1[]>;

    getSettingsById(correlationId: string, recipientId: string): Promise<SmsSettingsV1>;

    getSettingsByPhoneSettings(correlationId: string, phone: string): Promise<SmsSettingsV1>;

    setSettings(correlationId: string, settings: SmsSettingsV1): Promise<SmsSettingsV1>;

    setVerifiedSettings(correlationId: string, settings: SmsSettingsV1): Promise<SmsSettingsV1>;
            
    setRecipient(correlationId: string, recipientId: string,
        name: string, phone: string, language: string): Promise<SmsSettingsV1>;
    
    setSubscriptions(correlationId: string, recipientId: string, subscriptions: any): Promise<SmsSettingsV1>;
    
    deleteSettingsById(correlationId: string, recipientId: string,
        callback?: (err: any) => void): Promise<void>;

    resendVerification(correlationId: string, recipientId: string): Promise<void>;
    
    verifyPhone(correlationId: string, recipientId: string, code: string): Promise<void>;
}
