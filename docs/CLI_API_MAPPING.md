

# MSStore CLI to API Schema Mapping

This document maps MSStore CLI commands to their underlying API calls and shows the JSON schemas used.
To contextualize the document, please [read this first](../README.md).



## Quick Reference

| CLI Command | Package Type | API Method | Request Schema | Response Schema |
|-------------|:------------:|------------|----------------|-----------------|
| `apps list` | MSIX only | GET /applications | - | [ApplicationsResponse](#applicationsresponse) |
| `apps get` | MSIX only | GET /applications/{id} | - | [Packaged Application](#packaged-application) |
| `submission get` | Both | GET /submissions/{id} | - | [Packaged Submission](#packaged-submission)<br>[Unpackaged Submission](#unpackaged-submission) |
| `submission update` | Both | PUT /submissions/{id} | [Packaged Submission](#packaged-submission)<br/>[Unpackaged Submission](#unpackaged-submission) | [Packaged Submission](#packaged-submission)<br>[Unpackaged Submission](#unpackaged-submission) |
| `submission publish` | Both | POST /submissions/{id}/commit | - | [CommitResponse](#commitresponse) |
| `submission status` | Both | GET /submissions/{id}/status | - | [Packaged Status](#packaged-status) [Unpackaged Status](#unpackaged-status) |
| `submission delete` | MSIX only | DELETE /submissions/{id} | - | [Packaged Delete](#packaged-delete) |


- **MSIX only**: Works only with Store IDs (e.g., `9NBLGGH4R315`)
- **Both**: Works with Store IDs and GUID IDs (unpackaged apps use different API endpoints and schemas)

---



## Sample Responses

There are no official, comprehensive schemas for the submissions API. However, the below responses might point you in the right direction for fields you may want to update in your submissions.

Also, if you want to see raw REST API responses, try the [Node.js REST API sample](../submisions_api_rest/README.md) in this repo.



### Packaged Apps

###### Packaged Application

Returned by `msstore apps get <productId>`

```json
{
  "Id": "TODO_AddYourPackagedApplicationIdHere",
  "PrimaryName": "MSStore Dev CLI Test",
  "PackageFamilyName": "JaimeRodriguezLLC.pipelinemsixtest_9393n9ncvh2my",
  "PackageIdentityName": "JaimeRodriguezLLC.pipelinemsixtest",
  "PublisherName": "CN=0BE04A07-4250-427B-B4BC-FF652AB3A0FD",
  "FirstPublishedDate": "2025-09-23T17:11:10Z",
  "PendingApplicationSubmission": {
    "Id": "1152921505700612698",
    "ResourceLocation": "applications/TODO_AddYourPackagedApplicationIdHere/submissions/1152921505700612698"
  },
  "HasAdvancedListingPermission": true,
  "LastPublishedApplicationSubmission": {
    "Id": "1152921505700612396",
    "ResourceLocation": "applications/TODO_AddYourPackagedApplicationIdHere/submissions/1152921505700612396"
  }
}
```

If your app is not published, the response looks like the one above, with exception of LastPublishedApplicationSubmission being null.  Check for this, since the API only supports updates.

```json
...
{
  "PendingApplicationSubmission": {
    "Id": "1152921505700618964",
    "ResourceLocation": "applications/9NJ2PTXLFVP6/submissions/1152921505700618964"
  },
  "HasAdvancedListingPermission": true,
  "LastPublishedApplicationSubmission": null
}
```



###### Packaged Submission

Response from *msstore submissions get <PackageAppId>*. This is the input to *msstore submissions update <PackageAppId>*

```json
{
  "id": "1152921504621243540",
  "applicationCategory": "BooksAndReference_EReader",
  "pricing": {
    "trialPeriod": "FifteenDays",
    "marketSpecificPricings": {
      "US": "Tier4",
      "RU": "Tier3"
    },
    "sales": [],
    "priceId": "Tier2",
    "isAdvancedPricingModel": true
  },
  "visibility": "Public",
  "targetPublishMode": "Manual",
  "targetPublishDate": "2024-03-15T00:00:00Z",
  "listings": {
    "en-us": {
      "baseListing": {
        "copyrightAndTrademarkInfo": "Copyright 2024 Contoso",
        "keywords": ["epub", "reader", "ebook"],
        "licenseTerms": "License terms...",
        "privacyPolicy": "https://example.com/privacy",
        "supportContact": "support@example.com",
        "websiteUrl": "https://example.com",
        "description": "Full app description (max 10,000 chars)",
        "features": ["Feature 1", "Feature 2"],
        "releaseNotes": "What's new in this version",
        "images": [
          {
            "fileName": "screenshot1.png",
            "fileStatus": "Uploaded",
            "id": "1152921504672272757",
            "description": "Main screen",
            "imageType": "Screenshot"
          }
        ],
        "recommendedHardware": ["Touch screen"],
        "title": "App Title",
        "shortDescription": "Short description (max 500 chars)",
        "shortTitle": "Short title",
        "sortTitle": "Sort title",
        "voiceTitle": "Voice title",
        "devStudio": "Developer Studio Name"
      },
      "platformOverrides": {
        "Windows81": {
          "description": "Description for Windows 8.1"
        }
      }
    }
  },
  "hardwarePreferences": ["Touch", "Keyboard"],
  "automaticBackupEnabled": true,
  "canInstallOnRemovableMedia": true,
  "isGameDvrEnabled": false,
  "gamingOptions": [
    {
      "genres": ["Games_ActionAndAdventure"],
      "isLocalMultiplayer": false,
      "isLocalCooperative": false,
      "isOnlineMultiplayer": true,
      "isOnlineCooperative": false,
      "localMultiplayerMinPlayers": 0,
      "localMultiplayerMaxPlayers": 0,
      "localCooperativeMinPlayers": 0,
      "localCooperativeMaxPlayers": 0,
      "isBroadcastingPrivilegeGranted": true,
      "isCrossPlayEnabled": false,
      "kinectDataForExternal": "NotSet"
    }
  ],
  "hasExternalInAppProducts": false,
  "meetAccessibilityGuidelines": true,
  "notesForCertification": "Test account: user@test.com / password123",
  "status": "PendingCommit",
  "statusDetails": {
    "errors": [],
    "warnings": [
      {
        "code": "ListingOptOutWarning",
        "details": "You have removed listing language(s): []"
      }
    ],
    "certificationReports": []
  },
  "fileUploadUrl": "https://productingestionbin1.blob.core.windows.net/ingestion/...",
  "applicationPackages": [
    {
      "fileName": "app.msix",
      "fileStatus": "PendingUpload",
      "id": "1152921504620138797",
      "version": "1.0.0.0",
      "architecture": "x64",
      "languages": ["en-US", "es-ES"],
      "capabilities": ["internetClient", "microphone"],
      "minimumDirectXVersion": "None",
      "minimumSystemRam": "None",
      "targetDeviceFamilies": ["Windows.Desktop min version 10.0.17763.0"]
    }
  ],
  "packageDeliveryOptions": {
    "packageRollout": {
      "isPackageRollout": false,
      "packageRolloutPercentage": 0.0,
      "packageRolloutStatus": "PackageRolloutNotStarted",
      "fallbackSubmissionId": "0"
    },
    "isMandatoryUpdate": false,
    "mandatoryUpdateEffectiveDate": "1601-01-01T00:00:00.0000000Z"
  },
  "enterpriseLicensing": "Online",
  "allowMicrosoftDecideAppAvailabilityToFutureDeviceFamilies": true,
  "allowTargetFutureDeviceFamilies": {
    "Desktop": true,
    "Mobile": false,
    "Holographic": true,
    "Xbox": false,
    "Team": true
  },
  "friendlyName": "Submission 2",
  "trailers": [
    {
      "id": "1152921504620139498",
      "videoFileName": "trailer.mp4",
      "videoFileId": "1152921504620139498",
      "trailerAssets": {
        "en-us": {
          "title": "Official Trailer",
          "imageList": [
            {
              "fileName": "thumbnail.png",
              "id": "1152921504620139499",
              "description": "Trailer thumbnail"
            }
          ]
        }
      }
    }
  ]
}
```



###### Packaged Status

The sequence if you look at the REST API responses, looks like this:

```json
// The first status
{"status":"CommitStarted"}


{"status":"PreProcessing","statusDetails":{"errors":[],"warnings":[{"code":"SalesUnsupportedWarning","details":"The sales resource is no longer supported. To view or edit the sales data for this submission, use the Dev Center dashboard."}],"certificationReports":[]}}


{"status":"Certification","statusDetails":{"errors":[],"warnings":[{"code":"SalesUnsupportedWarning","details":"The sales resource is no longer supported. To view or edit the sales data for this submission, use the Dev Center dashboard."}],"certificationReports":[]}}

{"status":"Release","statusDetails":{"errors":[],"warnings":[{"code":"SalesUnsupportedWarning","details":"The sales resource is no longer supported. To view or edit the sales data for this submission, use the Dev Center dashboard."}],"certificationReports":[]}}


{"status":"Publishing","statusDetails":{"errors":[],"warnings":[{"code":"SalesUnsupportedWarning","details":"The sales resource is no longer supported. To view or edit the sales data for this submission, use the Dev Center dashboard."}],"certificationReports":[]}}

{"status":"Published","statusDetails":{"errors":[],"warnings":[{"code":"SalesUnsupportedWarning","details":"The sales resource is no longer supported. To view or edit the sales data for this submission, use the Dev Center dashboard."}],"certificationReports":[]}}
```

However, the Microsoft Dev CLI wraps those, so your responses might be strings that look like these:

```json
"Retrieving submission status. Found Pending Submission. Retrieving Pending Submission. Submission Status = Publishing"

"Retrieving submission status. Found Pending Submission. Retrieving Pending Submission. Submission Status = Certification"

"Retrieving submission status. Could not find a Pending Submission, but found the Last Published Submission. Retrieving Last Published Submission. Submission Status = Published"
```



###### Packaged Delete

The REST API returns very different JSON status. See HTTP error codes below for interpretation.
```json
{"status":204}  //OK -- Nothing to delete.
-or-
{"code":"ResourceNotFound","data":[],"details":[],"message":"Submission not found","source":"Ingestion Api","target":"submissionId"}
-or-
{"code":"InvalidOperation","data":[],"details":[],"message":"Ingestion API can only update, delete, and commit submissions that are created through the API. Please delete the current in-progress submission and create one using the API","source":"Ingestion Api","target":"applicationSubmission"}
```

The CLI parses the HTTP error codes and converts them to strings.

```text
"No pending submission found"

Here is the output of "msstore submission delete TODO_AddYourPackagedApplicationIdHere --no-confirm".
Notice that the CLI still confirms. Our scripts work around this in PowerShell.
✅ Found Pending Submission.
Found Pending Submission with Id '1152921505700621357'
Ingestion API can only update, delete, and commit submissions that are created through the API. Please delete the current in-progress submission and create
one using the APIng Submission

⣾ Deleting existing Submission
Press Enter to open the browser at this page: https://partner.microsoft.com/dashboard/products/TODO_AddYourPackagedApplicationIdHere/submissions/11529
⣷ Deleting existing Submission"
```





## Unpackaged Apps

Response from *msstore submission get TODO_AddYourUnpackagedApplicationIdHere*

###### Unpackaged Submission

```json
{
  "Packages": [
    {
      "PackageUrl": "https://msstorefasteast.blob.core.windows.net/msstoreclitest/v2_0/MSCLIPipelineSetup.exe",
      "Languages": [
        "en"
      ],
      "Architectures": [
        "X64"
      ],
      "InstallerParameters": "/SILENT ",
      "IsSilentInstall": false,
      "GenericDocUrl": null,
      "ErrorDetails": [
        {
          "ErrorScenario": "installationCancelledByUser",
          "ErrorScenarioDetails": []
        },
        {
          "ErrorScenario": "applicationAlreadyExists",
          "ErrorScenarioDetails": []
        },
        {
          "ErrorScenario": "installationAlreadyInProgress",
          "ErrorScenarioDetails": []
        },
        {
          "ErrorScenario": "diskSpaceIsFull",
          "ErrorScenarioDetails": []
        },
        {
          "ErrorScenario": "rebootRequired",
          "ErrorScenarioDetails": []
        },
        {
          "ErrorScenario": "networkFailure",
          "ErrorScenarioDetails": []
        },
        {
          "ErrorScenario": "packageRejectedDuringInstallation",
          "ErrorScenarioDetails": []
        },
        {
          "ErrorScenario": "installationSuccessful",
          "ErrorScenarioDetails": []
        },
        {
          "ErrorScenario": "miscellaneous",
          "ErrorScenarioDetails": []
        }
      ],
      "PackageType": "exe",
      "PackageId": "72541436"
    }
  ]
}
```


Response from *msstore submission getListingAssets TODO_AddYourUnpackagedApplicationIdHere*

```json
{
  "ListingAssets": [
    {
      "Language": "en",
      "StoreLogos": [
        {
          "Id": "683820cf-9894-41a4-b8e8-b4ccfd74461c",
          "AssetUrl":
"https://yoururl.blob.core.windows.net/listingassets/bc051dd7-9dfb-4f3c-b757-305ef4964cff_683820cf-9894-
41a4-b8e8-b4ccfd74461c",
          "ImageSize": {
            "Width": 1080,
            "Height": 1080
          }
        }
      ],
      "Screenshots": [
        {
          "Id": "a912ee15-3f57-4be5-b3f1-bd145f9afddc",
          "AssetUrl":
"https://yoururl.blob.core.windows.net/listingassets/bc051dd7-9dfb-4f3c-b757-305ef4964cff_a912ee15-3f57-
4be5-b3f1-bd145f9afddc",
          "ImageSize": {
            "Width": 1366,
            "Height": 768
          }
        }
      ]
    }
  ]
}
```



The rest of the unpackaged app metadata is below.
*Note: This is not available via msstore CLI; you can access it by querying the REST endpoints directly.*

```json
{
    "listings":[
        {"language":"en",
         "description":"App Description",
         "whatsNew":"Lots of new features",
         "productFeatures":["feature #1","feature #2"],
         "shortDescription":"test metadata 4",
         "searchTerms":["term","other term"],
         "additionalLicenseTerms":"this is required",
         "copyright":"test metadata 4",
         "developedBy":"Jaime Rodriguez",
         "sortTitle":"My Title",
         "requirements":[{}],
         "contactInfo":"me@youknowwhere.com",
         "heroArts":[],
         "trailers":[]
        }
    ]
}
```

###### Unpackaged Status

Response from *msstore submission status TODO_AddYourUnpackagedApplicationIdHere* when there is a submission under review

```json
{
  "ResponseData": {
    "IsReady": false,
    "OngoingSubmissionId": "1152921505700517065"
  },
  "IsSuccess": true,
  "Errors": [
    {
      "Code": "error",
      "Message": "Product already has One Active Submission In-Progress.
SubmissionId: 1152921505700517065",
      "Target": "submission"
    }
  ]
}
```

Response from *msstore submission status TODO_AddYourUnpackagedApplicationIdHere* when there is no submission

```json
{
  "ResponseData": {
    "IsReady": true,
    "OngoingSubmissionId": null
  },
  "IsSuccess": true,
  "Errors": null
}
```

---



## Enum Values Reference

### Submission Status

| Value                 | Description            |
| --------------------- | ---------------------- |
| `None`                | No status              |
| `Canceled`            | Submission canceled    |
| `PendingCommit`       | Awaiting commit        |
| `CommitStarted`       | Commit in progress     |
| `CommitFailed`        | Commit failed          |
| `PendingPublication`  | Awaiting publication   |
| `Publishing`          | Publishing in progress |
| `Published`           | Successfully published |
| `PublishFailed`       | Publication failed     |
| `PreProcessing`       | Pre-processing         |
| `PreProcessingFailed` | Pre-processing failed  |
| `Certification`       | In certification       |
| `CertificationFailed` | Certification failed   |
| `Release`             | Being released         |
| `ReleaseFailed`       | Release failed         |

Note: The typical flow you will see is CommitStarted → Certification → Release → Publishing → Published.

### Status Values Mapped across CLI and API

| CLI Shows  | API Value       | Meaning                |
| ---------- | --------------- | ---------------------- |
| Pending    | `PendingCommit` | Draft, awaiting commit |
| Committing | `CommitStarted` | Commit in progress     |
| Processing | `PreProcessing` | Pre-processing         |
| Certifying | `Certification` | In certification       |
| Publishing | `Publishing`    | Being published        |
| Published  | `Published`     | Live in Store          |
| Failed     | `*Failed`       | Any failed state       |



### Visibility Values

| Value | Meaning |
|-------|---------|
| `Public` | Visible to everyone |
| `Hidden` | Not visible in search |
| `Private` | Only via direct link |
| `NotSet` | Default |

### FileStatus Values

| Value | CLI Action |
|-------|------------|
| `None` | No file operation |
| `PendingUpload` | Will upload new file |
| `Uploaded` | File already uploaded |
| `PendingDelete` | Will delete file |

### TargetPublishMode Values

| Value | Behavior |
|-------|----------|
| `Immediate` | Publish when certified |
| `Manual` | Wait for manual release |
| `SpecificDate` | Publish on date |

### Trial Period

| Value               | Description     |
| ------------------- | --------------- |
| `NoFreeTrial`       | No trial        |
| `OneDay`            | 1 day trial     |
| `SevenDays`         | 7 day trial     |
| `FifteenDays`       | 15 day trial    |
| `ThirtyDays`        | 30 day trial    |
| `TrialNeverExpires` | Unlimited trial |

### Add-on Content Types

| Value               | Description          |
| ------------------- | -------------------- |
| `NotSet`            | Not specified        |
| `BookDownload`      | Book download        |
| `EMagazine`         | E-magazine           |
| `ENewspaper`        | E-newspaper          |
| `MusicDownload`     | Music download       |
| `MusicStream`       | Music streaming      |
| `OnlineDataStorage` | Online storage       |
| `VideoDownload`     | Video download       |
| `VideoStream`       | Video streaming      |
| `Asp`               | App service provider |
| `OnlineDownload`    | Online download      |

### Add-on Lifetime (Consumables)

| Value         | Description   |
| ------------- | ------------- |
| `Forever`     | Never expires |
| `OneDay`      | 1 day         |
| `ThreeDays`   | 3 days        |
| `FiveDays`    | 5 days        |
| `OneWeek`     | 1 week        |
| `TwoWeeks`    | 2 weeks       |
| `OneMonth`    | 1 month       |
| `TwoMonths`   | 2 months      |
| `ThreeMonths` | 3 months      |
| `SixMonths`   | 6 months      |
| `OneYear`     | 1 year        |

### Add-on Product Type

| Value        | Description        |
| ------------ | ------------------ |
| `Durable`    | One-time purchase  |
| `Consumable` | Can be repurchased |

### Image Types

| Value                         | Description            |
| ----------------------------- | ---------------------- |
| `Screenshot`                  | Desktop screenshot     |
| `MobileScreenshot`            | Mobile screenshot      |
| `XboxScreenshot`              | Xbox screenshot        |
| `SurfaceHubScreenshot`        | Surface Hub screenshot |
| `HoloLensScreenshot`          | HoloLens screenshot    |
| `StoreLogo9x16`               | Store logo 9:16        |
| `StoreLogoSquare`             | Store logo square      |
| `Icon`                        | App icon (300x300)     |
| `PromotionalArt16x9`          | Promo art 16:9         |
| `PromotionalArtwork2400X1200` | Hero art               |
| `XboxBrandedKeyArt`           | Xbox key art           |
| `XboxTitledHeroArt`           | Xbox hero art          |
| `XboxFeaturedPromotionalArt`  | Xbox promo art         |
| `SquareIcon358X358`           | Square icon            |
| `BackgroundImage1000X800`     | Background image       |
| `PromotionalArtwork414X180`   | Small promo art        |

### Hardware Preferences

| Value         | Description  |
| ------------- | ------------ |
| `Touch`       | Touch screen |
| `Keyboard`    | Keyboard     |
| `Mouse`       | Mouse        |
| `Camera`      | Camera       |
| `NfcHce`      | NFC HCE      |
| `Nfc`         | NFC          |
| `BluetoothLE` | Bluetooth LE |
| `Telephony`   | Telephony    |

### Gaming Genres

| Value                      |
| -------------------------- |
| `Games_ActionAndAdventure` |
| `Games_CardAndBoard`       |
| `Games_Casino`             |
| `Games_Educational`        |
| `Games_FamilyAndKids`      |
| `Games_Fighting`           |
| `Games_Music`              |
| `Games_Platformer`         |
| `Games_PuzzleAndTrivia`    |
| `Games_RacingAndFlying`    |
| `Games_RolePlaying`        |
| `Games_Shooter`            |
| `Games_Simulation`         |
| `Games_Sports`             |
| `Games_Strategy`           |
| `Games_Word`               |

### Package Rollout Status

| Value                      | Description    |
| -------------------------- | -------------- |
| `PackageRolloutNotStarted` | Not started    |
| `PackageRolloutInProgress` | In progress    |
| `PackageRolloutComplete`   | Complete       |
| `PackageRolloutStopped`    | Stopped/halted |

### Price Tiers

**Standard Pricing** (`isAdvancedPricingModel: false`):

- `Free` - Free
- `Tier2` through `Tier96` - $0.99 to $999.99 USD

**Advanced Pricing** (`isAdvancedPricingModel: true`):

- `Tier1012` through `Tier1424` - $0.99 to $1999.99 USD

### Enterprise Licensing

| Value              | Description             |
| ------------------ | ----------------------- |
| `None`             | No enterprise licensing |
| `Online`           | Online only             |
| `OnlineAndOffline` | Online and offline      |

### Device Families

| Value         | Description     |
| ------------- | --------------- |
| `Desktop`     | Windows Desktop |
| `Mobile`      | Windows Mobile  |
| `Holographic` | HoloLens        |
| `Xbox`        | Xbox            |
| `Team`        | Surface Hub     |

---



## Error Codes

### HTTP Status Codes

| Code  | Description                                     |
| ----- | ----------------------------------------------- |
| `200` | Success                                         |
| `201` | Created                                         |
| `204` | No Content (successful delete)                  |
| `400` | Bad Request - Invalid parameters                |
| `401` | Unauthorized - Invalid/expired token            |
| `404` | Not Found - Resource doesn't exist              |
| `409` | Conflict - Invalid state or unsupported feature |
| `500` | Internal Server Error                           |

### Status Detail Codes

| Code                       | Description                 |
| -------------------------- | --------------------------- |
| `None`                     | No code specified           |
| `InvalidArchive`           | ZIP archive is invalid      |
| `MissingFiles`             | Missing required files      |
| `PackageValidationFailed`  | Package validation failed   |
| `InvalidParameterValue`    | Invalid parameter value     |
| `InvalidOperation`         | Invalid operation           |
| `InvalidState`             | Invalid state for operation |
| `ResourceNotFound`         | Resource not found          |
| `ServiceError`             | Internal service error      |
| `ListingOptOutWarning`     | Listing language removed    |
| `ListingOptInWarning`      | Listing language added      |
| `UpdateOnlyWarning`        | Update-only operation       |
| `PackageValidationWarning` | Package validation warning  |
| `Other`                    | Unrecognized state          |

---



## Contributing

Contributions and suggestions are welcome. Feel free to submit a pull request or [file an issue](../../issues) if you find inaccuracies, have suggestions, or need help.




## License

This project is licensed under the MIT License — see the [LICENSE](../LICENSE) file for details.
