# Submissions API REST Samples

This folder stitches together the Node.js samples from the [Microsoft Store Submission API for MSI or EXE apps page](https://learn.microsoft.com/en-us/windows/apps/publish/store-submission-api).
It is useful for inspecting payloads.


## Pre-requisites

- [Install Node.js](https://nodejs.org/en/download) runtime. _I used v24.0.1, but any version should work_.
- You need your Azure tenant to be associated with your AppDev Partner Center account.  You also need an Entra Application configured to access Partner Center. This is used for authentication.  Follow [these instructions](https://learn.microsoft.com/en-us/windows/apps/publish/store-submission-api#step-1-complete-prerequisites-for-using-the-microsoft-store-submission-api) to complete these requirements.
- You will also need your Partner Seller Id. You can get it from Partner Center → Account Settings → Legal Info → Developer.
- The applications you want to update, or experiment with, need to be submitted and published (once) to the Microsoft Store.

> **Security Note:** The `Configuration.js` file contains placeholder credentials. Replace them with your own and make sure you do not commit secrets to a public repository. Consider using environment variables instead.


## Quick Start

1. Run **npm install** to install the dependencies.

2. **Replace the following identifiers in the Configuration.js file:**

   - `unpackagedApplicationId`: The GUID for the .exe or .msi application in the store.

   - `packagedApplicationId`: The ID for the MSIX in the store.

   - `clientId` and `clientSecret` were created to connect Partner Center to your Entra Application. These steps were completed in the pre-requisites.

   - `sellerId`: your Partner Center Seller Id.

3. **node clientPackaged.js**
Will run a sample that makes calls to retrieve and update an application packaged as MSIX.

4. **node clientUnpackaged.js**
Will run a sample that makes calls to retrieve and update a .exe application in the store.


## Sample Output

If you don't want to set up the environment, just read the code and map it to these two output files:
[unpackaged_output.txt](./sample_output/unpackaged_output.txt) and [packaged_output.txt](./sample_output/packaged_output.txt)

## Known Issues

- Neither sample has error handling. If you run it when there is a submission in certification, you will see errors.
- The packaged sample dealing with MSIX was AI-generated. I did not review it in depth.
- If you need help, file an issue or a pull request.

## Contributing

Contributions and suggestions are welcome. Feel free to submit a pull request or [file an issue](../../issues) if you find inaccuracies, have suggestions, or need help.




## License

This project is licensed under the MIT License — see the [LICENSE](../LICENSE) file for details.
