/** Configuration Object for Store Submission API */
var config = {
    version : "1",
    // unpackagedApplicationId : "9fc13ffa-51cd-49e3-a1e3-fd81cd3e58e5",
    unpackagedApplicationId : "TODO_AddYourUnpackagedApplicationIdHere", 
    packagedApplicationId : "TODO_AddYourPackagedApplicationIdHere",    
    clientId : "TODO_AddYourClientIdHere",
    clientSecret : "TODO_AdddYourClientSecretHere",
    serviceEndpoint : "https://api.store.microsoft.com",
    // tokenEndpoint : "https://login.microsoftonline.com/TODO_AddYourTenantIdHere/oauth2/token",
    tokenEndpoint : "https://login.microsoftonline.com/TODO_AddYourTenantIdHere/oauth2/v2.0/token", 
    scope : "https://api.store.microsoft.com/.default",
    sellerId : "TODO_AddYourSellerIdHere",
    jsonContentType : "application/json",
    pngContentType : "image/png",
    binaryStreamContentType : "application/octet-stream",

    // DevCenter API configuration (for packaged MSIX apps)
    devCenterEndpoint : "https://manage.devcenter.microsoft.com/v1.0/my",
    devCenterTokenEndpoint : "https://login.microsoftonline.com/TODO_AddYourTenantIdHere/oauth2/token",
    devCenterResource : "https://manage.devcenter.microsoft.com",
    packageFilePath : "./Package.zip", 
    printRequests : true 
};

module.exports = config; 