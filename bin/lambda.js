let SmsSettingsLambdaFunction = require('../obj/src/container/SmsSettingsLambdaFunction').SmsSettingsLambdaFunction;

module.exports = new SmsSettingsLambdaFunction().getHandler();