# Microsoft Store Submission API Samples

This repo provides end-to-end samples to automate your Microsoft Store application updates. We include PowerShell scripts and GitHub Action workflows to update packaged (MSIX) or unpackaged (.exe/.msi) apps.
Pick the use case that matches your scenario, configure your credentials, and run.


## What's Inside

```
├── README.md              # Your guide to the repository.
├── scenarios/             # PowerShell scripts for each use case (run locally)
├── .github/workflows/     # GitHub Action workflows (CI/CD)
├── releases/              # JSON files with app configs that trigger the GitHub Action workflows
├── submissions_api_rest/   # Node.js samples for the Store REST API directly
└── docs/                  # Reference docs: API schemas, CLI mappings, constraints
```

##### Terminology

- **Packaged app** — Submitted as MSIX (or MSIXUpload/MSIXBundle). The packages are uploaded to Azure Storage in the API, or via Partner Center UI.
- **Unpackaged app** — Submitted as .exe or .msi. You provide a URL to where you host your installer.
- **Binary / Package** — Your application's installable artifact (the MSIX or .exe).
- **Metadata** — Everything except the binary: description, release notes, images, markets, pricing, etc.



## PowerShell Quick Start

1. Install the [Microsoft Store Developer CLI](https://github.com/microsoft/msstore-cli) and [PowerShell 7+](https://learn.microsoft.com/en-us/powershell/scripting/install/install-powershell?view=powershell-7.5).

2. Set up authentication (you'll need a Partner Center account with an associated Entra application):
   - [Associate your Partner Center account with Azure AD](https://learn.microsoft.com/en-us/windows/apps/publish/partner-center/create-new-azure-ad-tenant)
   - [Configure your Entra application](https://learn.microsoft.com/en-us/windows/apps/publish/msstore-dev-cli/github-actions?tabs=msix)

3. *Suggestion*: *Publish a hidden test app in the Microsoft Store first. Test the scripts against that app, and update them to suit your needs. Once your scripts work, replace the product Ids with the ones for your production apps.*

4. Validate your credentials with the CLI:

   ```powershell
   msstore reconfigure -t <tenantId> -c <clientId> -cs <clientSecret> -s <sellerId>
   ```

5. Read through the first sample you want to run in PowerShell. Replace the Ids and the Packages, then run the PowerShell script.

   ```powershell
   # Unpackaged app
   # Release a new version of your app by updating the URL to your latest version.
   # Replace the $AppId, $version, and $UpdateUrl, then run it in PowerShell.
   .\scenarios\Unpackaged_Update_Binary_Only.ps1


   # Packaged app — publish a new MSIX
   # Replace the $AppId, $version, and copy the .msixupload you want to publish to the scenarios folder.
   .\scenarios\Packaged_Update_MSIX_Only.ps1
   ```



### GitHub Actions Quick Start

1. Set up authentication (you'll need a Partner Center account with an associated Entra application):
   - [Associate your Partner Center account with Azure AD](https://learn.microsoft.com/en-us/windows/apps/publish/partner-center/create-new-azure-ad-tenant)
   - [Configure your Entra application](https://learn.microsoft.com/en-us/windows/apps/publish/msstore-dev-cli/github-actions?tabs=msix)
2. *Suggestion*: *Publish a hidden test app in the Microsoft Store first. Test the scripts against that app, and update them to suit your needs. Once your scripts work, replace the product Ids with the ones for your production apps.*
3. Clone this repository, or copy the .github and releases folders to the repository you will use for CI/CD.
4. After completing the authentication pre-requisites mentioned above, create these four Actions secrets in your repository.

| Secret          | Description                                                  |
| :-------------- | :----------------------------------------------------------- |
| `TENANT_ID`     | Azure AD tenant ID where your Entra application lives        |
| `CLIENT_ID`     | Client ID of the Entra application associated with Partner Center |
| `CLIENT_SECRET` | Client secret for the Entra application. Keep this secured.  |
| `SELLER_ID`     | Your Partner Center seller ID. <br>Get it from Partner Center's Account Settings → Legal Info → Developer Settings) |

5. Enable GitHub Action workflows in the repository.
6. To verify your secrets are properly configured, run any workflow manually.  The first step calls the shared Configure MSStore CLI action; if that step passes, your secrets are configured properly.
7. Configure your use case with your application id.
   Look in the releases folder. Find the scenario you want to run, and update the appropriate json file with your Application Id. Also, copy your .msixupload package or update the link to your .exe installer so the scripts submit your binaries.
   If you cloned the repo, commit the updated json file, to trigger the workflow.   If you did not clone it, commit the json and trigger your workflow manually.

> **Important:** Your app must already be published and live in the Microsoft Store. Make your first submission through Partner Center manually, then use the submission API for subsequent updates.





## Use Cases

The following five use cases cover the most common update workflows. They increase in complexity within each category, so start with the basics for your package type and build up.

Each use case provides:
- A **PowerShell script** you can run locally (with `--verbose` flags for learning)
- A **GitHub Action workflow** for CI/CD automation

All GitHub Action workflows assume you've configured the secrets listed above. All PowerShell scripts assume you've installed the Store Developer CLI and run `msstore reconfigure`.

---



### Unpackaged Apps (.exe/.msi installers)

> **Note:** For unpackaged apps, you can mix submissions started through the API and Partner Center. However, you can't delete or reset an in-progress submission via API, so always override (or validate) all fields when submitting an update.

#### Use Case 1: Binary-Only Update

Update your app's installer URL without changing any metadata.

| | |
| :--- | :--- |
| PowerShell | [Unpackaged_Update_Binary_Only.ps1](./scenarios/Unpackaged_Update_Binary_Only.ps1) |
| GitHub Action | [unpackaged-binary-only.yml](./.github/workflows/unpackaged-binary-only.yml) · triggered by [unpackaged-binary-only.json](./releases/unpackaged-binary-only.json) |

**Steps:**

1. Get the current in-progress submission:

   ```powershell
   msstore submission get $yourAppId
   ```

2. Update the package URL and remove the old Package Id:

   ```powershell
   $myJson.Packages[0].PackageUrl = $UpdateUrl
   $myJson.PSObject.Properties.Remove("PackageId")
   ```

3. Submit the update:

   ```powershell
   msstore submission update $AppId $myJson
   ```

---

#### Use Case 2: Binary + Metadata Update

Update both the installer URL and metadata (description, release notes, etc.) in one submission.

| | |
| :--- | :--- |
| PowerShell | [Unpackaged_Update_Metadata_and_Binary.ps1](./scenarios/Unpackaged_Update_Metadata_and_Binary.ps1) |
| GitHub Action | [unpackaged-metadata-and-binary.yml](./.github/workflows/unpackaged-metadata-and-binary.yml) · triggered by [unpackaged-metadata-and-binary.json](./releases/unpackaged-metadata-and-binary.json) |

**Steps:**

1. Get the current in-progress submission:

   ```powershell
   msstore submission get $yourAppId
   ```

2. Update the package URL and remove the old Package Id:

   ```powershell
   $myJson.Packages[0].PackageUrl = $UpdateUrl
   $myJson.PSObject.Properties.Remove("PackageId")
   ```

3. Update the submission (but don't publish yet):

   ```powershell
   msstore submission update $AppId $myJson
   ```

4. Prepare and submit the metadata update:

   ```powershell
   $metadata = @{
     listings = @{
       language               = "en"
       description            = $descriptionEn
       whatsNew               = $whatsNewEn
       shortDescription       = "Updated $version"
       additionalLicenseTerms = "License terms are required."
     }
   }
   msstore submission updateMetadata $appId $metadata
   ```

5. Publish the submission:

   ```powershell
   msstore submission publish "$appId"
   ```

---



### Packaged Apps (MSIX)

> **Note:** Packaged apps do not let you mix a Partner Center–created submission with an API submission. The samples delete any pending submission before creating a new one. If the pending submission was created in Partner Center, you'll need to delete it manually; the API cannot delete Partner Center created submissions.

> For packaged apps, you upload your binaries to Azure Storage (via a SAS-token URL returned by the API), then submit. This differs from unpackaged apps where you provide a hosted download URL.

#### Use Case 3: Binary-Only Update (MSIX)

Publish a new MSIX package without changing metadata.

| | |
| :--- | :--- |
| PowerShell | [Packaged_Update_MSIX_Only.ps1](./scenarios/Packaged_Update_MSIX_Only.ps1) |
| GitHub Action | [packaged-msix-only.yml](./.github/workflows/packaged-msix-only.yml) · triggered by [packaged-msix-only.json](./releases/packaged-msix-only.json) |

**Steps:**

1. Delete any pending submission. (We pipe a space to prevent the CLI from blocking on a prompt if there's a Partner Center submission.)

   ```powershell
   $delete = " " | msstore submission delete $AppId --no-confirm 2>&1
   ```

2. Publish your new package:

   ```powershell
   msstore publish "myawesomepackage.msixupload" --appId $AppId
   ```

---

#### Use Case 4: MSIX + Metadata Update

Update both the binary and metadata for a packaged application.

| | |
| :--- | :--- |
| PowerShell | [Packaged_update_MSIX_and_Metadata.ps1](./scenarios/Packaged_update_MSIX_and_Metadata.ps1) |
| GitHub Action | [packaged-msix-and-metadata.yml](./.github/workflows/packaged-msix-and-metadata.yml) · triggered by [packaged-msix-and-metadata.json](./releases/packaged-msix-and-metadata.json) |

**Steps:**

1. Delete any pending submission:

   ```powershell
   $delete = " " | msstore submission delete $AppId --no-confirm 2>&1
   ```

2. Get the last submission's metadata:

   ```powershell
   msstore submission get $AppId
   ```

3. Modify the metadata. Remove the old ID and FileUploadUrl so new ones are generated. Set `FileStatus` to `"PendingUpload"` for any new packages (and images):

   ```powershell
   $myJson.PSObject.Properties.Remove("Id")
   $myJson.PSObject.Properties.Remove("FileUploadUrl")
   $myJson.'Listings'.'en-us'.'BaseListing'.'Description' = "Description updated for " + $updatePostfix
   $myJson.Listings.'en-us'.BaseListing.ReleaseNotes = "Release Notes updated for " + $updatePostfix
   $myJson.ApplicationPackages += [PSCustomObject]@{
       "FileName"             = "$($AppId)_$($version).msixupload"
       "FileStatus"           = "PendingUpload"
       "MinimumDirectXVersion" = "None"
       "MinimumSystemRam"     = "None"
   }
   ```

4. Update the submission to get a FileUploadUrl in the response:

   ```powershell
   msstore submission update $AppId $updatedJson
   ```

5. Upload your package to Azure Storage:

   ```powershell
   $FileUploadUrl = $updatedSubmission.FileUploadUrl

   Compress-Archive -Path "$($AppId)_$($version).msixupload" -DestinationPath "packages.zip" -Force

   $headers = @{ "x-ms-blob-type" = "BlockBlob" }
   Invoke-WebRequest -Uri $FileUploadUrl -Method Put -Headers $headers -InFile "packages.zip" -ContentType "application/octet-stream"
   ```

6. Publish the update:

   ```powershell
   msstore submission publish $AppId --verbose
   ```

---

#### Use Case 5: Multiple MSIX Packages

Same workflow as Use Case 4, but with multiple architectures or bundles.

| | |
| :--- | :--- |
| PowerShell | [Packaged_update_Multiple_MSIX.ps1](./scenarios/Packaged_update_Multiple_MSIX.ps1) |
| GitHub Action | [packaged-multiple-msix.yml](./.github/workflows/packaged-multiple-msix.yml) · triggered by [packaged-multiple-msix.json](./releases/packaged-multiple-msix.json) |

Follow the same steps as Use Case 4, with these differences:

**Step 3** — Add multiple packages to the metadata:

```powershell
$myJson.ApplicationPackages += [PSCustomObject]@{
    "FileName"             = "$($AppId)_$($version)_x64_bundle.msixupload"
    "FileStatus"           = "PendingUpload"
    "MinimumDirectXVersion" = "None"
    "MinimumSystemRam"     = "None"
}
$myJson.ApplicationPackages += [PSCustomObject]@{
    "FileName"             = "$($AppId)_v2_2_arm64_bundle.msixupload"
    "FileStatus"           = "PendingUpload"
    "MinimumDirectXVersion" = "None"
    "MinimumSystemRam"     = "None"
}
```

**Step 5** — Compress all packages into a single zip:

```powershell
Compress-Archive -Path "$($AppId)_v2_2_arm64_bundle.msixupload", "$($AppId)_$($version)_x64_bundle.msixupload" -DestinationPath "packages.zip" -Force
```




## Additional Resources

| Resource | Description |
| :--- | :--- |
| [CLI to REST API Mapping](./docs/CLI_API_MAPPING.md) | Schema mapping between CLI commands and REST API, including most enum values. |
| [MS Store CLI Reference](./docs/MS_STORE_CLI.md) | Complete reference for the Microsoft Store Developer CLI |
| [Submission API Reference](./docs/MS_STORE_SUBMISSION_API.md) | Condensed reference for the Store Submission API |
| [REST API Node.js Samples](./submisions_api_rest/) | Working Node.js scripts that call the Store REST API directly ([README](./submisions_api_rest/README.md)) |



## Tips & FAQs

- **Why does every GitHub workflow start with `msstore reconfigure`?** The reconfigure command acquires access and refresh tokens. Access tokens are valid for 60 minutes, and the CLI refreshes them automatically, so long-running scripts work fine.  The PowerShell scripts do not include that step, but they assume you did, and you have active tokens.
- **Does this work with hidden apps or apps using private audiences?**  Yes. The main requirement is for the app to have been published once, even if that publishing had hidden visibility or targeted private audiences.
- **Can I use bash instead of PowerShell?** Yes. The GitHub Action workflows support bash; just use any AI-powered IDE to convert the scripts.
- **"App updates are supported only for Free products"** — The `submission update` CLI command only works for free apps. For paid apps, use Partner Center directly.
- **One submission at a time** — Only one submission can be pending per app. If you have an in-progress submission, delete or complete it before starting a new one.
- **PowerShell is finicky with JSON.**  Always pay attention to the *NoNewLine* parameter when serializing to file or from strings.
- **The CLI can't update in-progress submissions started in Partner Center. Does the opposite direction work?** Yes. If you start a submission via the API and cancel the certification, all the metadata you updated will be saved and you will be able to update or finish the submission using the Partner Center UI.
- **My programmatic submission failed, but I don't see its status on Partner Center. The UI shows the submission in Draft state.**  This is expected behavior. Look at the draft submission and find any sections that are "Incomplete" or have Errors. If you can't find it, delete the draft submission and try again.
- **I want to distribute an app in the Microsoft Store, but I have a .zip or portable executable. How can I do that?**  The easiest way to do that is to create an MSIX installer.  File an issue and we will send you a link, it is trivial and can be automated.



## Original Sources

These samples were generated, with AI tools, from the following official documentation:

- [Microsoft Store Submission API](https://learn.microsoft.com/en-us/windows/uwp/monetize/create-and-manage-submissions-using-windows-store-services)
- [Microsoft Store Developer CLI](https://github.com/microsoft/msstore-cli) (source code and docs)
- [Partner Center APIs (Auth & App Association)](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/azure-app-apis)
- [Microsoft Store GitHub Actions](https://learn.microsoft.com/en-us/windows/apps/publish/msstore-dev-cli/github-actions?tabs=msix)

The sample scripts and GitHub Action workflows were reviewed and tested against real store submissions.



## Known Issues

- **Partner Center's UI does not update immediately after a submission.**  In my experience, it can take 5 to 30 minutes before Partner Center's UI reflects API submissions.  If you need to check app status after a submission, use the CLI.
- **The samples do not do retries.**  By design. I wanted to keep these simple and I feel if something fails you might want to inspect it manually. I have run similar scripts in production and see very few failures.
- **The releases\\<scenario.json> files used to trigger the GitHub Actions are minimalistic.**  By design. If I tried to build this as a production library covering all properties and scenarios, it would be bloated, slower, and harder to read and maintain for you.  Tweak these scripts to meet your needs; if you need help, file an issue.



## Contributing

Contributions and suggestions are welcome. Feel free to submit a pull request or [file an issue](../../issues) if you find inaccuracies, have suggestions, or need help.




## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
