# Microsoft Store Submission API Documentation

This document covers Microsoft Partner Center REST API for Updating Apps in the Microsoft Store.
To contextualize the document, please [read this first](../README.md).
You can see this API in action by running [the Node.js clients in this folder](../submissions_api_rest).


## Table of Contents

1. [Authentication](#1-authentication)
2. [Base URL & Headers](#2-base-url--headers)
3. [API Overview](#3-api-overview)
4. [App Data API](#4-app-data-api)
5. [App Submissions API](#5-app-submissions-api)
6. [Add-ons API](#6-add-ons-api)
7. [Package Flights API](#7-package-flights-api)
8. [Typical Workflow](#8-typical-workflow)


## 1. Authentication

### OAuth 2.0 Token Request

```http
POST https://login.microsoftonline.com/{tenant_id}/oauth2/token
Host: login.microsoftonline.com
Content-Type: application/x-www-form-urlencoded; charset=utf-8

grant_type=client_credentials
&client_id={client_id}
&client_secret={client_secret}
&resource=https://manage.devcenter.microsoft.com
```

### Required Credentials

| Parameter | Description |
|-----------|-------------|
| `tenant_id` | Azure AD tenant ID |
| `client_id` | Azure AD application client ID |
| `client_secret` | Azure AD application client secret |
| `resource` | Always `https://manage.devcenter.microsoft.com` |

### Token Response

```json
{
  "token_type": "Bearer",
  "expires_in": "3600",
  "access_token": "eyJ0eXAiOiJKV1Q..."
}
```

**Note:** Access tokens expire after 60 minutes.

---

## 2. Base URL & Headers

### Base URL

```
https://manage.devcenter.microsoft.com/v1.0/my/
```

### Required Headers

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer {access_token}` |
| `Content-Type` | `application/json` (for POST/PUT requests) |

---

## 3. API Overview

| API Area | Endpoints | Purpose |
|----------|-----------|---------|
| App Data | 4 | Retrieve app information |
| App Submissions | 10 | Create, update, commit app submissions |
| Add-ons | 4 | Manage in-app products |
| Add-on Submissions | 6 | Create, update add-on submissions |
| Package Flights | 3 | Manage flight groups |
| Package Flight Submissions | 10 | Manage flight submissions |

---

## 4. App Data API

### Get All Apps

```http
GET /applications
```

**Response:**
```json
{
  "value": [
    {
      "id": "9NBLGGH4R315",
      "primaryName": "ApiTestApp",
      "packageFamilyName": "30481DevCenterAPITester.ApiTestAppForDevbox_ng6try80pwt52",
      "packageIdentityName": "30481DevCenterAPITester.ApiTestAppForDevbox",
      "publisherName": "CN=...",
      "firstPublishedDate": "2020-01-15T00:00:00Z",
      "lastPublishedApplicationSubmission": {
        "id": "1152921504621086517",
        "resourceLocation": "applications/9NBLGGH4R315/submissions/1152921504621086517"
      },
      "pendingApplicationSubmission": {
        "id": "1152921504621243487",
        "resourceLocation": "applications/9NBLGGH4R315/submissions/1152921504621243487"
      },
      "hasAdvancedListingPermission": true
    }
  ],
  "totalCount": 1
}
```

### Get Specific App

```http
GET /applications/{applicationId}
```

**Response:** Single application resource (see schema above)

### Get App Add-ons

```http
GET /applications/{applicationId}/listinappproducts
```

**Response:**
```json
{
  "value": [
    {
      "inAppProductId": "9WZDNCRD7DLK"
    }
  ],
  "totalCount": 1
}
```

### Get App Package Flights

```http
GET /applications/{applicationId}/listflights
```

**Response:**
```json
{
  "value": [
    {
      "flightId": "7bfc11d5-f710-47c5-8a98-e04bb5aad310",
      "friendlyName": "myflight",
      "lastPublishedFlightSubmission": {
        "id": "1152921504621086517",
        "resourceLocation": "flights/7bfc11d5.../submissions/1152921504621086517"
      },
      "pendingFlightSubmission": null,
      "groupIds": ["1152921504606962205"],
      "rankHigherThan": "Non-flighted submission"
    }
  ],
  "totalCount": 1
}
```

---

## 5. App Submissions API

### Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/applications/{applicationId}/submissions` | Create submission |
| GET | `/applications/{applicationId}/submissions/{submissionId}` | Get submission |
| PUT | `/applications/{applicationId}/submissions/{submissionId}` | Update submission |
| POST | `/applications/{applicationId}/submissions/{submissionId}/commit` | Commit submission |
| DELETE | `/applications/{applicationId}/submissions/{submissionId}` | Delete submission |
| GET | `/applications/{applicationId}/submissions/{submissionId}/status` | Get status |

### Gradual Rollout Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `.../submissions/{submissionId}/packagerollout` | Get rollout info |
| POST | `.../submissions/{submissionId}/updatepackagerolloutpercentage` | Update percentage |
| POST | `.../submissions/{submissionId}/haltpackagerollout` | Halt rollout |
| POST | `.../submissions/{submissionId}/finalizepackagerollout` | Finalize rollout |

### Create App Submission

```http
POST /applications/{applicationId}/submissions
Authorization: Bearer {token}
```

**Response:** Full App Submission Resource. For the complete schema, see the [Packaged Submission](./CLI_API_MAPPING.md#packaged-submission) section in CLI_API_MAPPING.md.

### Update App Submission

```http
PUT /applications/{applicationId}/submissions/{submissionId}
Authorization: Bearer {token}
Content-Type: application/json

{request body - same structure as response above}
```

### Commit App Submission

```http
POST /applications/{applicationId}/submissions/{submissionId}/commit
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "CommitStarted"
}
```

### Get Submission Status

```http
GET /applications/{applicationId}/submissions/{submissionId}/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "PendingCommit",
  "statusDetails": {
    "errors": [],
    "warnings": [],
    "certificationReports": [
      {
        "date": "2024-01-15T10:30:00Z",
        "reportUrl": "https://..."
      }
    ]
  }
}
```

### Delete App Submission

```http
DELETE /applications/{applicationId}/submissions/{submissionId}
Authorization: Bearer {token}
```

**Response:** 204 No Content

---

## 6. Add-ons API

### Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inappproducts` | Get all add-ons |
| GET | `/inappproducts/{inAppProductId}` | Get specific add-on |
| POST | `/inappproducts` | Create add-on |
| DELETE | `/inappproducts/{inAppProductId}` | Delete add-on |

### Create Add-on

```http
POST /inappproducts
Authorization: Bearer {token}
Content-Type: application/json

{
  "applicationIds": ["9NBLGGH4R315"],
  "productId": "my-consumable-addon",
  "productType": "Consumable"
}
```

**Response:**
```json
{
  "applications": {
    "value": [
      {
        "id": "9NBLGGH4R315",
        "resourceLocation": "applications/9NBLGGH4R315"
      }
    ],
    "totalCount": 1
  },
  "id": "9NBLGGH4TNMP",
  "productId": "my-consumable-addon",
  "productType": "Consumable",
  "lastPublishedInAppProductSubmission": null,
  "pendingInAppProductSubmission": null
}
```

### Get Add-on

```http
GET /inappproducts/{inAppProductId}
Authorization: Bearer {token}
```

### Delete Add-on

```http
DELETE /inappproducts/{inAppProductId}
Authorization: Bearer {token}
```

---

## Add-on Submissions API

### Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/inappproducts/{id}/submissions` | Create submission |
| GET | `/inappproducts/{id}/submissions/{submissionId}` | Get submission |
| PUT | `/inappproducts/{id}/submissions/{submissionId}` | Update submission |
| POST | `/inappproducts/{id}/submissions/{submissionId}/commit` | Commit submission |
| DELETE | `/inappproducts/{id}/submissions/{submissionId}` | Delete submission |
| GET | `/inappproducts/{id}/submissions/{submissionId}/status` | Get status |

### Add-on Submission Resource

For the complete schema, see the [Add-on Submission](./CLI_API_MAPPING.md#packaged-submission) section in CLI_API_MAPPING.md.

---

## 7. Package Flights API

### Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/applications/{applicationId}/flights` | Create flight |
| GET | `/applications/{applicationId}/flights/{flightId}` | Get flight |
| DELETE | `/applications/{applicationId}/flights/{flightId}` | Delete flight |

### Create Package Flight

```http
POST /applications/{applicationId}/flights
Authorization: Bearer {token}
Content-Type: application/json

{
  "friendlyName": "Beta Testers Flight",
  "groupIds": ["1152921504606962205"],
  "rankHigherThan": null
}
```

**Response:**
```json
{
  "flightId": "43e448df-97c9-4a43-a0bc-2a445e736bcd",
  "friendlyName": "Beta Testers Flight",
  "groupIds": ["1152921504606962205"],
  "rankHigherThan": "671c2857-725e-4faf-9e9e-ea1191ef879c"
}
```

### Get Package Flight

```http
GET /applications/{applicationId}/flights/{flightId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "flightId": "43e448df-97c9-4a43-a0bc-2a445e736bcd",
  "friendlyName": "Beta Testers Flight",
  "lastPublishedFlightSubmission": {
    "id": "1152921504621086517",
    "resourceLocation": "flights/43e448df.../submissions/1152921504621086517"
  },
  "pendingFlightSubmission": {
    "id": "1152921504621243647",
    "resourceLocation": "flights/43e448df.../submissions/1152921504621243647"
  },
  "groupIds": ["1152921504606962205"],
  "rankHigherThan": "671c2857-725e-4faf-9e9e-ea1191ef879c"
}
```

---

## Package Flight Submissions API

### Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/applications/{appId}/flights/{flightId}/submissions` | Create |
| GET | `/applications/{appId}/flights/{flightId}/submissions/{subId}` | Get |
| PUT | `/applications/{appId}/flights/{flightId}/submissions/{subId}` | Update |
| POST | `/applications/{appId}/flights/{flightId}/submissions/{subId}/commit` | Commit |
| DELETE | `/applications/{appId}/flights/{flightId}/submissions/{subId}` | Delete |
| GET | `/applications/{appId}/flights/{flightId}/submissions/{subId}/status` | Status |

### Gradual Rollout Endpoints

| Method | Endpoint |
|--------|----------|
| GET | `.../submissions/{subId}/packagerollout` |
| POST | `.../submissions/{subId}/updatepackagerolloutpercentage` |
| POST | `.../submissions/{subId}/haltpackagerollout` |
| POST | `.../submissions/{subId}/finalizepackagerollout` |

### Flight Submission Resource

```json
{
  "id": "1152921504621243649",
  "flightId": "cd2e368a-0da5-4026-9f34-0e7934bc6f23",
  "status": "PendingCommit",
  "statusDetails": {
    "errors": [],
    "warnings": [],
    "certificationReports": []
  },
  "flightPackages": [
    {
      "fileName": "app-beta.msix",
      "fileStatus": "PendingUpload",
      "id": "",
      "version": "2.0.0.0-beta",
      "architecture": "x64",
      "languages": ["en-us"],
      "capabilities": ["internetClient"],
      "minimumDirectXVersion": "None",
      "minimumSystemRam": "None"
    }
  ],
  "packageDeliveryOptions": {
    "packageRollout": {
      "isPackageRollout": true,
      "packageRolloutPercentage": 10.0,
      "packageRolloutStatus": "PackageRolloutInProgress",
      "fallbackSubmissionId": "1152921504621243500"
    },
    "isMandatoryUpdate": false,
    "mandatoryUpdateEffectiveDate": "1601-01-01T00:00:00.0000000Z"
  },
  "fileUploadUrl": "https://productingestionbin1.blob.core.windows.net/ingestion/...",
  "targetPublishMode": "Immediate",
  "targetPublishDate": "",
  "notesForCertification": "Beta build for testing new features"
}
```



---

## 8. Typical Workflow

1. **Authenticate** - Get OAuth token
2. **Get App** - Retrieve app info and existing submission
3. **Delete Pending** - Delete any pending submission (if exists)
4. **Create Submission** - Create new submission (clones last published)
5. **Update Submission** - Modify listings, pricing, packages, etc.
6. **Upload Packages** - Upload ZIP to Azure Blob using SAS URI
7. **Commit Submission** - Submit for processing
8. **Poll Status** - Monitor submission status until complete



## Contributing

Contributions and suggestions are welcome. Feel free to submit a pull request or [file an issue](../../issues) if you find inaccuracies, have suggestions, or need help.




## License

This project is licensed under the MIT License — see the [LICENSE](../LICENSE) file for details.
