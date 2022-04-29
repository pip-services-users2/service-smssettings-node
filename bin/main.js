let SmsSettingsProcess = require('../obj/src/container/SmsSettingsProcess').SmsSettingsProcess;

try {
    new SmsSettingsProcess().run(process.argv);
} catch (ex) {
    console.error(ex);
}
