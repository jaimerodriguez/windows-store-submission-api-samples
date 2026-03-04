# Microsoft Store CLI (msstore) Documentation

Complete reference for the Microsoft Store Developer CLI, including command syntax, API mappings, constraints, and gotchas.
To contextualize the document, please [read this first](../README.md).

## Table of Contents

1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Authentication](#authentication)
4. [Product Types](#product-types)
5. [Commands Reference](#commands-reference)
6. [Project Types](#project-types)
7. [API Mappings](#api-mappings)
8. [Gotchas & Constraints](#gotchas--constraints)
9. [Configuration Files](#configuration-files)
10. [Error Handling](#error-handling)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The Microsoft Store CLI (`msstore`) is a cross-platform command-line tool for publishing applications to the Microsoft Store. It supports:

- **Windows, macOS, and Linux** (with platform-specific limitations)
- **Multiple app types**: UWP, WinUI 3, Flutter, Electron, React Native, PWA, MAUI
- **Two product types**: Packaged (MSIX) and Unpackaged (MSI/EXE)

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       MSStore CLI                            │
├──────────────────────────────────────────────────────────────┤
│  Commands Layer (init, publish, submission, flights, etc.)   │
├──────────────────────────────────────────────────────────────┤
│  Project Configurators (UWP, PWA, Electron, Flutter, etc.)  │
├──────────────────────────────────────────────────────────────┤
│  MSStore.API (Packaged API + Unpackaged API)                 │
├──────────────────────────────────────────────────────────────┤
│  Microsoft Store Submission APIs (REST)                      │
│  https://manage.devcenter.microsoft.com/v1.0/my/             │
└──────────────────────────────────────────────────────────────┘
```

---

## Installation & Setup

### Install via .NET

```bash
dotnet tool install -g MSStore.CLI
```

### First-Time Configuration

```bash
msstore reconfigure
```

This will prompt for:
- **Tenant ID** - Azure AD tenant GUID
- **Seller ID** - Partner Center seller ID (numeric)
- **Client ID** - Azure AD application client ID
- **Authentication method** - Client secret OR certificate

---

## Authentication

The CLI supports three authentication methods:

### 1. Client Secret

```bash
msstore reconfigure \
  --tenantId {guid} \
  --sellerId {number} \
  --clientId {guid} \
  --clientSecret {secret}
```

### 2. Certificate (Thumbprint)

```bash
msstore reconfigure \
  --tenantId {guid} \
  --sellerId {number} \
  --clientId {guid} \
  --certificateThumbprint {thumbprint}
```

### 3. Certificate (File)

```bash
msstore reconfigure \
  --tenantId {guid} \
  --sellerId {number} \
  --clientId {guid} \
  --certificateFilePath /path/to/cert.pfx \
  --certificatePassword {password}
```

### Credential Storage

| Platform | Storage Location |
|----------|------------------|
| Windows | Windows Credential Manager |
| macOS | Keychain |
| Linux | Secret Service API |

Configuration file: `~/.config/msstore/settings.json`

---

## Product Types

The CLI distinguishes between two product types based on the Product ID format:

### Packaged (MSIX/UWP)

- **ID Format**: Store ID (e.g., `9NBLGGH4R315`)
- **API**: Dev Center Packaged API
- **Features**: Full submission control, flights, rollouts

### Unpackaged (MSI/EXE)

- **ID Format**: GUID (e.g., `12345678-1234-1234-1234-123456789012`)
- **API**: Store API (different endpoints)
- **Limitations**: No flights, no rollouts, no submission delete

**Detection Logic** (from `ProductTypeHelper.cs`):
```csharp
if (Guid.TryParse(productId, out _))
    return ProductType.Unpackaged;
else
    return ProductType.Packaged;
```

### Command Support by Package Type

| Command | Packaged (MSIX) | Unpackaged (EXE/MSI) | Notes |
|---------|:---------------:|:--------------------:|-------|
| **Utility Commands** | | | |
| `info` | ✅ | ✅ | System info |
| `reconfigure` | ✅ | ✅ | Credential setup |
| `settings` | ✅ | ✅ | CLI settings |
| **App Commands** | | | |
| `apps list` | ✅ | ❌ | DevCenter API only |
| `apps get` | ✅ | ❌ | Rejects GUID IDs |
| **Init/Package/Publish** | | | |
| `init` | ✅ | ❌ | MSIX packaging |
| `package` | ✅ | ❌ | Creates MSIX |
| `publish` (top-level) | ✅ | ❌ | MSIX projects |
| **Submission Commands** | | | |
| `submission get` | ✅ | ✅ | Different API |
| `submission status` | ✅ | ✅ | Different API |
| `submission getListingAssets` | ✅ | ✅ | Different API |
| `submission update` | ✅ | ✅ | Different schemas |
| `submission updateMetadata` | ✅ | ✅ | Different schemas |
| `submission publish` | ✅ | ✅ | Commit/publish |
| `submission poll` | ✅ | ✅ | Poll for completion |
| `submission delete` | ✅ | ❌ | Packaged only |
| **Rollout Commands** | | | |
| `submission rollout *` | ✅ | ❌ | All rollout commands |
| **Flight Commands** | | | |
| `flights *` | ✅ | ❌ | All flight commands |
| `flights submission *` | ✅ | ❌ | All flight submissions |

**Legend**: ✅ = Supported, ❌ = Not supported (returns error)

---

## Commands Reference

### Global Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--verbose` | `-v` | Enable verbose logging |
| `--help` | `-h` | Show help |

---

### `msstore info`

Display CLI and system information.

```bash
msstore info
```

---

### `msstore init`

> **Package Type**: Packaged (MSIX) only

Initialize a project for Microsoft Store publishing.

```bash
msstore init [pathOrUrl] [options]
```

#### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `pathOrUrl` | Project directory or PWA URL | Current directory |

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--publisherDisplayName` | `-n` | Publisher display name |
| `--package` | | Also package the project |
| `--publish` | | Also publish (implies `--package`) |
| `--output` | `-o` | Output directory for packages |
| `--arch` | `-a` | Build architecture(s): `x86`, `x64`, `arm`, `arm64` |
| `--version` | `-ver` | Override project version |
| `--flightId` | `-f` | Flight ID for publishing |
| `--packageRolloutPercentage` | `-prp` | Rollout percentage (0-100) |

#### Examples

```bash
# Initialize UWP project
msstore init ./MyApp

# Initialize and publish PWA
msstore init https://myapp.com --publish

# Initialize with specific architecture
msstore init ./MyApp --arch x64 --arch arm64
```

---

### `msstore package`

> **Package Type**: Packaged (MSIX) only

Create MSIX package from project.

```bash
msstore package [pathOrUrl] [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--output` | `-o` | Output directory |
| `--arch` | `-a` | Build architecture(s) |
| `--version` | `-ver` | Override version |

---

### `msstore publish`

> **Package Type**: Packaged (MSIX) only

Publish application to the Microsoft Store.

```bash
msstore publish [pathOrUrl] [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--inputDirectory` | `-i` | Directory containing `.msix`/`.msixupload` |
| `--appId` | `-id` | Application ID (if not initialized) |
| `--noCommit` | `-nc` | Keep submission in draft state |
| `--flightId` | `-f` | Publish to specific flight |
| `--packageRolloutPercentage` | `-prp` | Rollout percentage (0-100) |

#### Examples

```bash
# Publish to production
msstore publish ./MyApp

# Publish to a flight
msstore publish ./MyApp --flightId abc123

# Publish with gradual rollout
msstore publish ./MyApp --packageRolloutPercentage 10

# Publish without committing (draft)
msstore publish ./MyApp --noCommit
```

---

### `msstore reconfigure`

Re-configure CLI credentials.

```bash
msstore reconfigure [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--tenantId` | `-t` | Azure tenant ID |
| `--sellerId` | `-s` | Seller/Partner Center ID |
| `--clientId` | `-c` | Azure AD client ID |
| `--clientSecret` | `-cs` | Client secret |
| `--certificateThumbprint` | `-ct` | Certificate thumbprint |
| `--certificateFilePath` | `-cfp` | Path to certificate file |
| `--certificatePassword` | `-cp` | Certificate password |
| `--reset` | | Reset credentials only |

---

### `msstore settings`

Manage CLI settings.

```bash
msstore settings [options]
```

#### Options

| Option | Description |
|--------|-------------|
| `--enableTelemetry` | Enable/disable telemetry (true/false) |

#### Subcommands

```bash
# Set publisher display name
msstore settings set-publisher-display-name "My Company"
```

---

### `msstore apps`

> **Package Type**: Packaged (MSIX) only

Manage registered applications.

#### List All Apps

```bash
msstore apps list
```

**API Call**: `GET /applications`

**Response Schema**: See [Application Resource](#application-resource)

#### Get Specific App

```bash
msstore apps get <productId>
```

**API Call**: `GET /applications/{applicationId}`

> **Note**: Both `apps list` and `apps get` only work with packaged apps. Attempting to use a GUID product ID will return: "This command is not supported for unpackaged applications."

---

### `msstore submission`

> **Package Type**: Most commands support both Packaged and Unpackaged (see notes below)

Manage app submissions.

#### Get Submission

```bash
msstore submission get <productId> [--submissionId <id>]
```

**API Call**: `GET /applications/{appId}/submissions/{submissionId}`

#### Get Submission Status

```bash
msstore submission status <productId> [--submissionId <id>]
```

**API Call**: `GET /applications/{appId}/submissions/{submissionId}/status`

#### Get Listing Assets

```bash
msstore submission get-listing-assets <productId> [--language <lang>]
```

#### Update Submission (JSON)

```bash
msstore submission update <productId> '<json>' [--skipInitialPolling]
```

**API Call**: `PUT /applications/{appId}/submissions/{submissionId}`

> **Warning**: Only works for FREE apps. Paid apps return error.

#### Update Metadata

```bash
msstore submission update-metadata <productId> '<json>'
```

#### Publish/Commit Submission

```bash
msstore submission publish <productId>
```

**API Call**: `POST /applications/{appId}/submissions/{submissionId}/commit`

#### Poll Submission Status

```bash
msstore submission poll <productId> [--submissionId <id>]
```

#### Delete Submission

> **Package Type**: Packaged (MSIX) only

```bash
msstore submission delete <productId> [--submissionId <id>]
```

**API Call**: `DELETE /applications/{appId}/submissions/{submissionId}`

---

### `msstore submission rollout`

> **Package Type**: Packaged (MSIX) only - All rollout commands require MSIX apps

Manage gradual package rollout.

#### Get Rollout Status

```bash
msstore submission rollout get <productId> [--submissionId <id>]
```

**API Call**: `GET /applications/{appId}/submissions/{submissionId}/packagerollout`

#### Update Rollout Percentage

```bash
msstore submission rollout update <productId> <percentage>
```

**API Call**: `POST /applications/{appId}/submissions/{submissionId}/updatepackagerolloutpercentage`

**Constraint**: Percentage must be 0-100.

#### Halt Rollout

```bash
msstore submission rollout halt <productId>
```

**API Call**: `POST /applications/{appId}/submissions/{submissionId}/haltpackagerollout`

#### Finalize Rollout

```bash
msstore submission rollout finalize <productId>
```

**API Call**: `POST /applications/{appId}/submissions/{submissionId}/finalizepackagerollout`

---

### `msstore flights`

> **Package Type**: Packaged (MSIX) only - All flight commands require MSIX apps

Manage package flights.

#### List Flights

```bash
msstore flights list <productId>
```

**API Call**: `GET /applications/{appId}/listflights`

#### Get Flight

```bash
msstore flights get <productId> --flightId <flightId>
```

**API Call**: `GET /applications/{appId}/flights/{flightId}`

#### Create Flight

```bash
msstore flights create <productId> <friendlyName> \
  --group-ids <id1> [--group-ids <id2>] \
  [--rank-higher-than <flightId>]
```

**API Call**: `POST /applications/{appId}/flights`

**Constraint**: At least one group ID is required.

#### Delete Flight

```bash
msstore flights delete <productId> --flightId <flightId>
```

**API Call**: `DELETE /applications/{appId}/flights/{flightId}`

---

### `msstore flights submission`

> **Package Type**: Packaged (MSIX) only

Manage flight submissions.

#### Get Flight Submission

```bash
msstore flights submission get <productId> --flightId <flightId>
```

#### Get Flight Submission Status

```bash
msstore flights submission status <productId> --flightId <flightId>
```

#### Update Flight Submission

```bash
msstore flights submission update <productId> --flightId <flightId> '<json>'
```

#### Publish Flight Submission

```bash
msstore flights submission publish <productId> --flightId <flightId>
```

#### Poll Flight Submission

```bash
msstore flights submission poll <productId> --flightId <flightId>
```

#### Delete Flight Submission

```bash
msstore flights submission delete <productId> --flightId <flightId>
```

---

### `msstore flights submission rollout`

Manage flight submission rollouts.

```bash
# Get rollout info
msstore flights submission rollout get <productId> --flightId <flightId>

# Update rollout percentage
msstore flights submission rollout update <productId> --flightId <flightId> <percentage>

# Halt rollout
msstore flights submission rollout halt <productId> --flightId <flightId>

# Finalize rollout
msstore flights submission rollout finalize <productId> --flightId <flightId>
```

---

## Project Types

The CLI auto-detects project type and applies appropriate configuration.

### UWP (Universal Windows Platform)

| Property | Value |
|----------|-------|
| Detection | `Package.appxmanifest` file present |
| Package Output | `.msixupload`, `.appxupload` |
| Default Archs | x64, ARM64 |
| **Windows Only** | Yes (packaging requires Windows) |
| Device Families | Desktop, Mobile, Holographic |

### WinUI 3

| Property | Value |
|----------|-------|
| Detection | UWP + `Microsoft.WindowsAppSDK` NuGet package |
| Based On | UWP configurator |
| **Windows Only** | Yes |

### PWA (Progressive Web App)

| Property | Value |
|----------|-------|
| Detection | URL input or `pwaAppInfo.json` file |
| Package Output | `.msix`, `.appx`, `.msixbundle`, `.appxbundle` |
| Default Archs | None (handled by PWABuilder) |
| **Windows Only** | No |
| Device Families | Desktop, Holographic |

**Constraint**: Must use `--output` or `--publish` flag.

### Electron

| Property | Value |
|----------|-------|
| Detection | `package.json` with Electron dependencies |
| Package Manager | npm or yarn |
| **Windows Only** | No |

### Flutter

| Property | Value |
|----------|-------|
| Detection | Flutter project structure |
| **Windows Only** | No |

### React Native

| Property | Value |
|----------|-------|
| Detection | React Native project structure |
| **Windows Only** | No |

### MAUI

| Property | Value |
|----------|-------|
| Detection | .NET MAUI project |
| **Windows Only** | No |

---

## API Mappings

### CLI to REST API Mapping

| CLI Command | HTTP Method | API Endpoint |
|-------------|-------------|--------------|
| `apps list` | GET | `/applications` |
| `apps get` | GET | `/applications/{appId}` |
| `submission get` | GET | `/applications/{appId}/submissions/{subId}` |
| `submission status` | GET | `/applications/{appId}/submissions/{subId}/status` |
| `submission update` | PUT | `/applications/{appId}/submissions/{subId}` |
| `submission publish` | POST | `/applications/{appId}/submissions/{subId}/commit` |
| `submission delete` | DELETE | `/applications/{appId}/submissions/{subId}` |
| `flights list` | GET | `/applications/{appId}/listflights` |
| `flights get` | GET | `/applications/{appId}/flights/{flightId}` |
| `flights create` | POST | `/applications/{appId}/flights` |
| `flights delete` | DELETE | `/applications/{appId}/flights/{flightId}` |

### API Response Schemas

See [CLI_API_MAPPING.md](./CLI_API_MAPPING.md) for sample responses and [MS_STORE_SUBMISSION_API.md](./MS_STORE_SUBMISSION_API.md) for complete schemas.

---

## Gotchas & Constraints

### Critical Constraints

#### 1. Paid Apps Cannot Use `submission update`

```
App updates are supported only for Free products.
```

The `submission update` command checks `Pricing.PriceId`:
- If `PriceId == "Base"` (paid), the command fails and deletes the submission
- Only apps with `PriceId == "Free"` can be updated via CLI

**Workaround**: Use Partner Center for paid app updates, or use the publish workflow.

#### 2. Rollout Percentage Must Be 0-100

```bash
# This will fail
msstore submission rollout update 9NBLGGH4R315 150
# Error: "The percentage must be between 0 and 100."
```

#### 3. Flights Require At Least One Group ID

```bash
# This will fail
msstore flights create 9NBLGGH4R315 "MyFlight"
# Error: "At least one group ID must be provided."

# Correct usage
msstore flights create 9NBLGGH4R315 "MyFlight" --group-ids 123456
```

#### 4. UWP Packaging Requires Windows

```bash
# On macOS/Linux for UWP project:
# Error: "This project type can only be packaged on Windows."
```

**Affected**: UWP, WinUI 3

#### 5. PWA Requires Output Directory or Publish Flag

```bash
# This will fail
msstore init https://myapp.com
# Error: "For PWAs the init command should output to a specific directory..."

# Correct usage
msstore init https://myapp.com --output ./output
# OR
msstore init https://myapp.com --publish
```

#### 6. Unpackaged Apps Don't Support Flights

```bash
# With GUID product ID (unpackaged)
msstore flights create 12345678-... "MyFlight" --group-ids 123
# Error: "This command is not supported for unpackaged applications."
```

#### 7. Only One Pending Submission Allowed

The API allows only one pending submission per app. Creating a new submission when one exists will:
1. Use the existing pending submission, OR
2. Clone from the last published submission if no pending exists

#### 8. API-Created Submissions Should Only Be Modified via API

Submissions created via the API should not be modified in Partner Center, as this can cause sync issues.

### Version Handling

#### PWABuilder Version Constraints

- PWABuilder doesn't accept `Major = 0`
- If version is `0.x.x`, it's automatically changed to `1.0.0`
- Version is auto-incremented from the last published submission

#### Manifest Version Updates

The CLI automatically updates version in:
- `Package.appxmanifest` (UWP/WinUI)
- `package.json` (Electron/React Native)

### Authentication Token Expiration

- Tokens expire after **60 minutes**
- Long-running operations may fail if token expires mid-operation
- The CLI handles token refresh automatically

### File Upload (Azure Blob)

When creating/updating submissions:
1. API returns `fileUploadUrl` (SAS URI)
2. CLI uploads ZIP to Azure Blob Storage
3. ZIP must contain packages and assets

### Submission State Machine

```
                    ┌─────────────┐
                    │  No State   │
                    └──────┬──────┘
                           │ Create
                           ▼
                    ┌─────────────┐
              ┌────▶│PendingCommit│◀────┐
              │     └──────┬──────┘     │
              │            │ Commit     │
              │            ▼            │
              │     ┌─────────────┐     │
              │     │CommitStarted│     │
              │     └──────┬──────┘     │
              │            │            │
              │     ┌──────┴──────┐     │
              │     ▼             ▼     │
        ┌───────────┐       ┌──────────┐│
        │CommitFailed│      │Publishing││
        └───────────┘       └────┬─────┘│
                                 │      │
                          ┌──────┴──────┐
                          ▼             ▼
                    ┌──────────┐ ┌────────────┐
                    │Published │ │PublishFailed│
                    └────┬─────┘ └────────────┘
                         │
                         ▼
                    ┌──────────┐
                    │ Rollout  │ (if enabled)
                    └──────────┘
```

---

## Configuration Files

### CLI Configuration

**Location**: `~/.config/msstore/settings.json`

```json
{
  "SellerId": 12345,
  "TenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "ClientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "CertificateThumbprint": "...",
  "CertificateFilePath": "/path/to/cert.pfx",
  "StoreApiServiceUrl": "https://api.partnercenter.microsoft.com",
  "StoreApiScope": "...",
  "DevCenterServiceUrl": "https://manage.devcenter.microsoft.com",
  "DevCenterScope": "...",
  "PublisherDisplayName": "My Company"
}
```

**Note**: `ClientSecret` is stored in the OS credential manager, not in this file.

### Telemetry Settings

**Location**: `~/.config/msstore/telemetrySettings.json`

```json
{
  "TelemetryEnabled": true,
  "SessionId": "...",
  "UserId": "..."
}
```

Disable telemetry:
```bash
msstore settings --enableTelemetry false
```

### PWA App Info

**Location**: `{project}/pwaAppInfo.json`

```json
{
  "AppId": "9NBLGGH4R315",
  "Uri": "https://myapp.com"
}
```

---

## Error Handling

### Exception Types

| Exception | Description |
|-----------|-------------|
| `MSStoreException` | Base exception for all CLI errors |
| `MSStoreHttpException` | HTTP errors from API calls |
| `MSStoreWrappedErrorException` | API validation errors |

### Common Error Codes

| HTTP Code | Meaning | Common Cause |
|-----------|---------|--------------|
| 400 | Bad Request | Invalid JSON or parameters |
| 401 | Unauthorized | Token expired or invalid |
| 403 | Forbidden | Wrong ProductId or no permission |
| 404 | Not Found | Submission/flight doesn't exist |
| 409 | Conflict | Invalid state for operation |

### Error Response Format

```json
{
  "code": "InvalidParameterValue",
  "message": "The description field exceeds maximum length",
  "source": "Listings",
  "target": "en-us",
  "data": [...],
  "details": [...]
}
```

---

## Troubleshooting

### "Could not find application"

```bash
msstore apps get 9NBLGGH4R315
# Error: Could not find application with ID '9NBLGGH4R315'
```

**Causes**:
- Wrong Product ID
- App not registered in Partner Center
- Missing API permissions

### "App updates are supported only for Free products"

Your app has a price set. Use Partner Center to update paid apps.

### "This project type can only be packaged on Windows"

You're trying to package a UWP/WinUI app on macOS or Linux. Package on Windows.

### "At least one group ID must be provided"

When creating a flight, you must specify `--group-ids`:
```bash
msstore flights create 9NBLGGH4R315 "MyFlight" --group-ids 123456
```

### Token/Authentication Issues

```bash
# Reset credentials
msstore reconfigure --reset

# Reconfigure from scratch
msstore reconfigure
```

### Verbose Logging

```bash
msstore --verbose <command>
```

This enables detailed logging for debugging.

---
