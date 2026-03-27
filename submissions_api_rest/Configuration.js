/** Configuration Object for Store Submission API */
var config = {
    version : "1",
    serviceEndpoint : "https://api.store.microsoft.com",    
    scope : "https://api.store.microsoft.com/.default",
    jsonContentType : "application/json",
    pngContentType : "image/png",
    binaryStreamContentType : "application/octet-stream",
    devCenterEndpoint : "https://manage.devcenter.microsoft.com/v1.0/my",
    devCenterResource : "https://manage.devcenter.microsoft.com",
    packageFilePath : "./Package.zip", 
    printRequests : true, 
    
    sellerId : "TODO_AddYourSellerIdHere",
    unpackagedApplicationId : "TODO_AddYourUnpackagedApplicationIdHere", 
    packagedApplicationId : "TODO_AddYourPackagedApplicationIdHere",    
    clientId : "TODO_AddYourClientIdHere",
    clientSecret : "TODO_AdddYourClientSecretHere",    
    tokenEndpoint : "https://login.microsoftonline.com/TODO_AddYourTenantIdHere/oauth2/v2.0/token", 
    devCenterTokenEndpoint : "https://login.microsoftonline.com/TODO_AddYourTenantIdHere/oauth2/token",
    
};

module.exports = config; 