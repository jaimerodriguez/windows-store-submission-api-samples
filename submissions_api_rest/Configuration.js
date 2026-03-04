/** Configuration Object for Store Submission API */
var config = {
    version : "1",
    // unpackagedApplicationId : "9fc13ffa-51cd-49e3-a1e3-fd81cd3e58e5",
    unpackagedApplicationId : "e9eee9fc-b68b-400f-9a47-7447d444aa85", 
    packagedApplicationId : "9N6MK2GQBD58",    
    clientId : "1930e4ec-4a36-450a-a668-ca3379e39528",
    clientSecret : "Q888Q\~vwdP07hKICWoq-Cdzhl4SwBfdEv6yb5cwr",
    serviceEndpoint : "https://api.store.microsoft.com",
    // tokenEndpoint : "https://login.microsoftonline.com/2f962db5-d360-4ba5-a6da-b7a0f23c5834/oauth2/token",
    tokenEndpoint : "https://login.microsoftonline.com/2f962db5-d360-4ba5-a6da-b7a0f23c5834/oauth2/v2.0/token", 
    scope : "https://api.store.microsoft.com/.default",
    sellerId : "91274190",
    jsonContentType : "application/json",
    pngContentType : "image/png",
    binaryStreamContentType : "application/octet-stream",

    // DevCenter API configuration (for packaged MSIX apps)
    devCenterEndpoint : "https://manage.devcenter.microsoft.com/v1.0/my",
    devCenterTokenEndpoint : "https://login.microsoftonline.com/2f962db5-d360-4ba5-a6da-b7a0f23c5834/oauth2/token",
    devCenterResource : "https://manage.devcenter.microsoft.com",
    packageFilePath : "./Package.zip", 
    printRequests : true 
};

module.exports = config; 