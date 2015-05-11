cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.ionic.keyboard/www/keyboard.js",
        "id": "com.ionic.keyboard.keyboard",
        "clobbers": [
            "cordova.plugins.Keyboard"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.google.playservices": "23.0.0",
    "com.ionic.keyboard": "1.0.4",
    "cordova-plugin-geolocation": "1.0.1-dev",
    "org.apache.cordova.console": "0.2.13",
    "org.apache.cordova.device": "0.3.0"
}
// BOTTOM OF METADATA
});