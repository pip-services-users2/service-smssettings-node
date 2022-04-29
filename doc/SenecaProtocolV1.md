# Seneca Protocol (version 1) <br/> Sms Settings Microservice

Sms settings microservice implements a Seneca compatible API. 
Seneca port and protocol can be specified in the microservice [configuration](Configuration.md/#api_seneca). 

```javascript
var seneca = require('seneca')();

seneca.client({
    connection: {
        protocol: 'tcp', // Microservice seneca protocol
        host: 'localhost', // Microservice localhost
        port: 8805, // Microservice seneca port
    }
});
```

The microservice responds on the following requests:

```javascript
seneca.act(
    {
        role: 'sms_settings',
        version: 1,
        cmd: ...cmd name....
        ... Arguments ...
    },
    function (err, result) {
        ...
    }
);
```
* [SmsSettingsV1 class](#class1)
* [cmd: 'get_settings_by_id'](#operation1)
* [cmd: 'get_settings_by_phone'](#operation2)
* [cmd: 'set_settings'](#operation3)
* [cmd: 'set_recipient'](#operation4)
* [cmd: 'set_subscriptions'](#operation5)
* [cmd: 'delete_settings_by_id'](#operation6)
* [cmd: 'resend_verification'](#operation7)
* [cmd: 'verify_phone'](#operation8)

## Data types

### <a name="class1"></a> SmsSettingsV1 class

Represents a user sms settings with his ID, primary sms and key settings.

**Properties:**
- id: string - unique user id
- name: string - user full name
- phone: string - primary user phone
- language: string - user preferred language
- verified: boolean - true if sms was verified
- ver_code: - sms verification code that was sent in sms message to the user
- ver\_expire\_time: Date - expiration time for sms verification code
- subscriptions: Object - subscriptions to enable or disable certain types of sms messages
- custom_hdr: Object - custom data summary that is always returned (in list and details)
- custom_dat: Object - custom data details that is returned only when a single object is returned (details)


## Operations

### <a name="operation1"></a> Cmd: 'get\_settings\_by_id'

Retrieves sms settings by recipient unique id. 

**Arguments:** 
- recipient_id: string - unique receipient id

**Returns:**
- err: Error - occured error or null for success
- result: SmsSettingsV1 - retrieved SmsSettings object

### <a name="operation2"></a> Cmd: 'get\_settings\_by_sms'

Retrieves sms settings by recipient phone. 

**Arguments:** 
- phone: string - phone number

**Returns:**
- err: Error - occured error or null for success
- result: SmsSettingsV1 - retrieved SmsSettings object

### <a name="operation3"></a> Cmd: 'set_settings'

Sets recipient sms settings

**Arguments:** 
- settings: SmsSettingsV1 -  sms settings to be set

**Returns:**
- err: Error - occured error or null for success
- result: SmsSettingsV1 - set SmsSettings object

### <a name="operation4"></a> Cmd: 'set_recipient'

Sets recipient information into sms settings.
If some properties are not set, they keep their old values.

**Arguments:** 
- recipient_id: string - recipient unique id
- name: string - recipient full name
- phone: string - recipient phone number
- language: string - recipient preferred language

**Returns:**
- err: Error - occured error or null for success
- result: SmsSettingsV1 - set SmsSettings object

### <a name="operation5"></a> Cmd: 'set_subscriptions'

Sets subscriptions to specific sms types.

**Arguments:** 
- recipient_id: string - recipient unique id
- subscriptions: any - subscriptions hashmap where sms types are enabled or disabled

**Returns:**
- err: Error - occured error or null for success
- result: SmsSettingsV1 - set SmsSettings object

### <a name="operation6"></a> Cmd: 'delete\_settings\_by_id'

Deletes sms settings from the system (use it carefully!)

**Arguments:** 
- recipient_id: string - recipient unique id

**Returns:**
- err: Error - occured error or null for success

### <a name="operation7"></a> Cmd: 'resend_verification'

Generates a new sms verification code and sends it to recipient via sms message.
Initial verification code is send in welcome message during user registration.

**Arguments:** 
- recipient_id: string - recipient unique id

**Returns:**
- err: Error - occured error or null for success

### <a name="operation8"></a> Cmd: 'verify_phone'

Confirms (verifies) primary phone number using verification code.

**Arguments:** 
- recipient_id: string - recipient unique id
- code: string - password recovery code

**Returns:**
- err: Error - occured error or null for success
