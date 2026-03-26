const path = require('path');
const config = require('./Configuration');
const PackagedSubmissionClient = require('./PackagedSubmissionClient');
const fs = require('fs');

var client = new PackagedSubmissionClient(config);

/**
 * Main entry method to Run the DevCenter Packaged Submission API Node.js Sample
 */
async function RunPackagedSubmission() {
    // Step 1: Authenticate
    print('Getting Access Token');
    await client.getAccessToken();

    // Step 2: Get App Info
    print('Getting App Info');
    var appInfo = await client.callDevCenterAPI(client.appUrl, 'get');
    print(appInfo);
  
    // Step 3: Delete Pending Submission (if exists)
    if (appInfo.pendingApplicationSubmission) {
        var pendingSubId = appInfo.pendingApplicationSubmission.id;
        print(`Deleting Pending Submission: ${pendingSubId}`);
        var deleteUrl = client.deleteUrl.replace('{submissionId}', pendingSubId);
        var deleteResponse = await client.callDevCenterAPI(deleteUrl, 'delete');
        print(deleteResponse);
    } else {
        print('No pending submission to delete');
    }

    // Step 4: Create New Submission
    print('Creating New Submission');
    var submission = await client.callDevCenterAPI(client.submissionsUrl, 'post');
    print(submission);

    var submissionId = submission.id;
    var fileUploadUrl = submission.fileUploadUrl;
    print(`Submission ID: ${submissionId}`);
    print(`File Upload URL: ${fileUploadUrl}`);

    // Step 5: Update Submission (modify listings/packages as needed)
    print('Updating Submission');
    // Mark new packages with PendingUpload status
    if (submission.applicationPackages && submission.applicationPackages.length > 0) {
        submission.applicationPackages.forEach(function (pkg) {
            pkg.fileStatus = "PendingUpload";
        });
    }
    // Example: Update description in listings
    if (submission.listings) {
        var listingKeys = Object.keys(submission.listings);
        if (listingKeys.length > 0) {
            var firstListing = submission.listings[listingKeys[0]];
            if (firstListing.baseListing) {
                firstListing.baseListing.description = 'Updated by Node.js Packaged Submission Sample';
            }
        }
    }

    var submissionUrl = client.submissionUrl.replace('{submissionId}', submissionId);
    var updateResponse = await client.callDevCenterAPI(submissionUrl, 'put', submission);
    print(updateResponse);

    // Step 6: Upload Package ZIP
    print('Uploading Package ZIP');
    var packageFilePath = config.packageFilePath;
    if (!fs.existsSync(packageFilePath)) {
        packageFilePath = path.join('node', 'Package.zip');
        if (!fs.existsSync(packageFilePath)) {
            print('Package ZIP file does not exist in the specified path. Please provide a valid path.');
            print('Exiting without uploading package.');
            return;
        }
    }

    var stats = fs.statSync(packageFilePath);
    var fileSize = stats.size;
    var fileStream = fs.createReadStream(packageFilePath);
    await client.uploadPackage(fileUploadUrl, fileStream, fileSize);
    print('Package ZIP uploaded successfully');

    // Step 7: Commit Submission
    print('Committing Submission');
    var commitUrl = client.commitUrl.replace('{submissionId}', submissionId);
    var commitResponse = await client.callDevCenterAPI(commitUrl, 'post');
    print(commitResponse);

    // Step 8: Poll Status
    var statusUrl = client.statusUrl.replace('{submissionId}', submissionId);
    await poll(async () => {
        print('Polling Submission Status');
        return await client.callDevCenterAPI(statusUrl, 'get');
    }, 10);

    print('Submission process complete');
}

/**
 * Utility Method to Poll using a given function and time interval in seconds
 * Polls until status is "Published" or a failure status is detected.
 * @param {*} func
 * @param {*} intervalInSeconds
 * @returns
 */
async function poll(func, intervalInSeconds) {
    var result = await func();
    print(result);

    var status = result.status;
    if (status === 'Published') {
        print('Submission Published Successfully');
        return Promise.resolve(true);
    } else if (status && status.toLowerCase().includes('failed')) {
        throw new Error(`Submission failed with status: ${status}`);
    } else {
        await new Promise(resolve => setTimeout(resolve, intervalInSeconds * 1000));
        return await poll(func, intervalInSeconds);
    }
}

/**
 * Utility function to Print a Json or normal string
 * @param {*} json
 */
function print(json) {
    if (typeof(json) == 'string') {
        console.log(json);
    } else {
        console.log(JSON.stringify(json));
    }
    console.log("\n");
}

/** Run the Packaged Submission Sample */
RunPackagedSubmission();
