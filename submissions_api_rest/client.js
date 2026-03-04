const path = require('path');
const config = require('./Configuration');
const submissionClient = require('./UnPackagedSubmissionClient');
const fs = require('fs');

var client = new submissionClient(config);

/**
 * Main entry method to Run the Store Submission API Node.js Sample
 */
async function RunNodeJsSample(){
    print('Getting Access Token');
    await client.getAccessToken();
    
    print('Getting Current Application Draft Status');
    var currentDraftStatus = await client.callStoreAPI(client.productDraftStatusPollingUrlTemplate, 'get');
    print(currentDraftStatus);

    print('Getting Application Packages');
    var currentPackages = await client.callStoreAPI(client.packagesUrlTemplate, 'get');
    print(currentPackages);

    print('Getting Single Package');
    var packageId = currentPackages.responseData.packages[0].packageId;
    var packageIdUrl = `${client.packageByIdUrlTemplate}`.replace('{packageId}', packageId);
    var singlePackage = await client.callStoreAPI(packageIdUrl, 'get');
    print(singlePackage);

    print('Updating Entire Package Set');
    // Update data in Packages list to have final set of updated Packages
    currentPackages.responseData.packages[0].installerParameters = "/s /r new-args";
    var packagesUpdateRequest = {
        'packages': currentPackages.responseData.packages
    };
    print(packagesUpdateRequest);
    var packagesUpdateResponse = await client.callStoreAPI(client.packagesUrlTemplate, 'put', packagesUpdateRequest);
    print(packagesUpdateResponse);

    print('Updating Single Package\'s Download Url');
    // Update data in the SinglePackage object
    singlePackage.responseData.packages[0].installerParameters = "/s /r /t new-args";
    var singlePackageUpdateResponse = await client.callStoreAPI(packageIdUrl, 'patch', singlePackage.responseData.packages[0]);
    print(singlePackageUpdateResponse);

    print('Committing Packages');
    var commitPackagesResponse = await client.callStoreAPI(client.packagesCommitUrlTemplate, 'post');
    print(commitPackagesResponse);

    await poll(async ()=>{
        print('Waiting for Upload to finish');
        return await client.callStoreAPI(client.productDraftStatusPollingUrlTemplate, 'get');
    }, 2);

    print('Getting Application Metadata - All Modules');
    var appMetadata = await client.callStoreAPI(client.appMetadataUrlTemplate, 'get');
    print(appMetadata);

    print('Getting Application Metadata - Listings');
    var appListingMetadata = await client.callStoreAPI(client.appListingsFetchMetadataUrlTemplate, 'get');
    print(appListingMetadata);

    print('Updating Listings Metadata - Description');   
    // Update Required Fields in Listings Metadata Object - Per Language. For eg. AppListingsMetadata.responseData.listings[0]
    // Example - Updating Description
    appListingMetadata.responseData.listings[0].description = 'New Description Updated By Node.js Sample Code';
    var listingsUpdateRequest = {
        'listings': appListingMetadata.responseData.listings[0]
    };
    var listingsMetadataUpdateResponse = await client.callStoreAPI(client.appMetadataUrlTemplate, 'put', listingsUpdateRequest);
    print(listingsMetadataUpdateResponse);

    print('Getting All Listings Assets');
    var listingAssets = await client.callStoreAPI(client.listingAssetsUrlTemplate, 'get');
    print(listingAssets);

    print('Creating Listing Assets for 1 Screenshot');
    var listingAssetCreateRequest = {
        'language': listingAssets.responseData.listingAssets[0].language,
        'createAssetRequest': {
            'Screenshot': 1,
            'Logo': 0
        }
    };
    var listingAssetCreateResponse = await client.callStoreAPI(client.listingAssetsCreateUrlTemplate, 'post', listingAssetCreateRequest);
    print(listingAssetCreateResponse);

    print('Uploading Listing Assets');
    let pathToFile = './Image.png'; 

    if ( !fs.existsSync(pathToFile) ) {
        pathToFile = path.join("node", 'Image.png');      
        if ( !fs.existsSync(pathToFile) ) {
            print ("Image file does not exist in the specified path. Please provide a valid path to the image file.");
            print ("Exiting without uploading listing asset.");
            return; 
        }
    }


    const stats = fs.statSync(pathToFile);
    const fileSize = stats.size;
    const fileStream = fs.createReadStream(pathToFile);
    await client.uploadAssets(listingAssetCreateResponse.responseData.listingAssets.screenshots[0].primaryAssetUploadUrl, fileStream, fileSize);

    print('Committing Listing Assets');
    var assetCommitRequest = {
        'listingAssets': {
            'language': listingAssets.responseData.listingAssets[0].language,
            'storeLogos': listingAssets.responseData.listingAssets[0].storeLogos,
            'screenshots': [{
                'id': listingAssetCreateResponse.responseData.listingAssets.screenshots[0].id,
                'assetUrl': listingAssetCreateResponse.responseData.listingAssets.screenshots[0].primaryAssetUploadUrl
            }]
        }
    };
    var assetCommitResponse = await client.callStoreAPI(client.listingAssetsCommitUrlTemplate, 'put', assetCommitRequest);
    print(assetCommitResponse);

    print('Getting Current Application Draft Status before Submission');
    currentDraftStatus = await client.callStoreAPI(client.productDraftStatusPollingUrlTemplate, 'get');
    print(currentDraftStatus);
    if(!currentDraftStatus.responseData.isReady){
        throw new Error('Application Current Status is not in Ready Status for All Modules');
    }

    print('Creating Submission');
    var submissionCreationResponse = await client.callStoreAPI(client.createSubmissionUrlTemplate, 'post');
    print(submissionCreationResponse);

    print('Current Submission Status');
    var submissionStatusUrl = `${client.submissionStatusPollingUrlTemplate}`.replace('{submissionId}', submissionCreationResponse.responseData.submissionId);
    var submissionStatusResponse = await client.callStoreAPI(submissionStatusUrl, 'get');
    print(submissionStatusResponse);

    // User can Poll on this API to know if Submission Status is INPROGRESS, PUBLISHED or FAILED.
    // This Process involves File Scanning, App Certification and Publishing and can take more than a day.
}

/**
 * Utility Method to Poll using a given function and time interval in seconds
 * @param {*} func 
 * @param {*} intervalInSeconds 
 * @returns 
 */
async function poll(func, intervalInSeconds){
var result = await func();
if(result.responseData.isReady){
    Promise.resolve(true);
}
else if(result.errors && result.errors.length > 0 && result.errors.find(element => element.code == 'packageuploaderror') != undefined){
throw new Error('Package Upload Failed');
}
else{
    await new Promise(resolve => setTimeout(resolve, intervalInSeconds*1000));
    return await poll(func, intervalInSeconds); 
}
}

/**
 * Utility function to Print a Json or normal string
 * @param {*} json 
 */
function print(json){
    if(typeof(json) == 'string'){
        console.log(json);
    }
    else{
        console.log(JSON.stringify(json));
    }
    console.log("\n");
}

/** Run the Node.js Sample Application */
RunNodeJsSample();