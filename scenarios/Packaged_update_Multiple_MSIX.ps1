Set-PSDebug -Trace 1 -Strict

# Scenario 2: Update an existing packaged app with new metadata and package using MSStore CLI

$AppId = 'TODO_AddYourPackagedApplicationIdHere'
$version = "v16_0"
$date = Get-Date -Format "yyyy-MM-dd HH:mm"
$updatePostfix = $version + " " + $date


# DELETE ANY PENDING SUBMISSION ... This willl fail if the pending submission was created via Partner Center UI
$delete = msstore submission delete $AppId --no-confirm 2>&1
if ( $LASTEXITCODE -ne 0 ) {
    if ( $delete -match "No pending submission found" ) {
        Write-Host "No active submission found, continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "Failed to delete submission. " -ForegroundColor Red
        Write-Host "The API/CLI can only delete submissions created via API. If you have a pending submission created in Partncer Center, please delete it or publish it there" -ForegroundColor Red
        Write-Host "Exiting..." -ForegroundColor Red
        exit 1
    }
}

#GET THE CURRENT SUBMISSION JSON
msstore submission get $AppId | Out-File -FilePath "submission_prior_$($AppId)_$($version).json"-Encoding utf8

if ( $LASTEXITCODE -ne 0 ) {
    Write-Host "Failed to get submission. Exiting..." -ForegroundColor Red
    exit 1
}

# MODIFY THE JSON TO UPDATE METADATA FIELDS
$myJson = Get-Content "submission_prior_$($AppId)_$($version).json" -Raw | ConvertFrom-Json -Depth 50

#$myJson.Visibility = "Public"
$myJson.PSObject.Properties.Remove("Id") #remove the old submission id
$myJson.PSObject.Properties.Remove("FileUploadUrl") #remove FileUloadUrl to allow new one to be generated
$myJson.'Listings'.'en-us'.'BaseListing'.'Description' = "Description updated for " + $updatePostfix
$myJson.Listings.'en-us'.BaseListing.ReleaseNotes = "Release Notes updated for " + $updatePostfix
$myJson.ApplicationPackages += [PSCustomObject]@{
    "FileName" =  "$($AppId)_$($version)_x64.msixupload"
    "FileStatus" = "PendingUpload"
    "MinimumDirectXVersion" = "None"
    "MinimumSystemRam" = "None"
}

$myJson.ApplicationPackages += [PSCustomObject]@{
    "FileName" =  "$($AppId)_$($version)_arm64.msixupload"
    "FileStatus" = "PendingUpload"
    "MinimumDirectXVersion" = "None"
    "MinimumSystemRam" = "None"
}

$updatedJson = $myJson | ConvertTo-Json -Depth 50

$updatedSubmissionRaw = msstore submission update $AppId $updatedJson --verbose | Out-String -NoNewline

if ( $LASTEXITCODE -ne 0 ) {
    Write-Host "Failed to update submission. Exiting..." -ForegroundColor Red
    exit 1
}

$updatedSubmission = $updatedSubmissionRaw | ConvertFrom-Json -Depth 50

$FileUploadUrl = $updatedSubmission.FileUploadUrl
if ( [string]::IsNullOrEmpty($FileUploadUrl) ) {
    Write-Host "FileUploadUrl is null or empty. Exiting..." -ForegroundColor Red
    exit 1
} else {
    Write-Host "Will upload to $($FileUploadUrl)." -ForegroundColor Green
}

Set-PSDebug -Off  #Turn off debugging for the upload process because it is verbose
Compress-Archive -Path "$($AppId)_$($version)_arm64.msixupload", "$($AppId)_$($version)_x64.msixupload"  -DestinationPath "packages.zip" -Force
if ( $LASTEXITCODE -ne 0 ) {
    Write-Host "Failed to create update zip file" -ForegroundColor Red
    exit 1
}
Set-PSDebug -Trace 1 -Strict
# Upload to the SAS URL from the response
$headers = @{ "x-ms-blob-type" = "BlockBlob" }

$StatusCode = 0
try
{
    $uploadResponse = Invoke-WebRequest -Uri $FileUploadUrl -Method Put -Headers $headers -InFile "packages.zip" -ContentType "application/octet-stream"
    # This will only execute if the Invoke-WebRequest is successful.
    $StatusCode = $uploadResponse.StatusCode
    Write-Host "Package uploaded successfully to $($FileUploadUrl)." -ForegroundColor Green
    Write-Host "Status Code: $($StatusCode)" -ForegroundColor Green
} catch {
    $StatusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Exception during package upload: $($_.Exception.Message)" -ForegroundColor Red
}

if ( $StatusCode -ne 200 -and $StatusCode -ne 201 ) {
    Write-Host "Failed to upload package to $($FileUploadUrl)." -ForegroundColor Red
    Write-Host "Status Code: $($StatusCode)" -ForegroundColor Red
    Write-Host "Exiting..." -ForegroundColor Red
    exit 1
}

# This is not required, but during debug and early setup, I use it to compare later with the final published submission
msstore submission get $AppId | Out-File -FilePath "pre_commit_$($AppId)_$($version).json"-Encoding utf8  -NoNewline
if ( $LASTEXITCODE -ne 0 ) {
    Write-Host "Failed to get submission. Exiting..." -ForegroundColor Red
    exit 1
}


msstore submission publish $AppId --verbose
if ( $LASTEXITCODE -ne 0 ) {
    Write-Host "Failed to publish submission. Exiting..." -ForegroundColor Red
    exit 1
}


Set-PSDebug -Trace 0
$pollCount = 0
$MaxPolls = 50           # Maximum number of polls before exiting
$SleepSeconds = 180      # Number of seconds to wait between polls
$priorStatus = ""
$currentStatus = ""
$errorCount = 0
while ($true) {
    $pollCount++
    Write-Host "Poll #$pollCount at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" -ForegroundColor Cyan
    # Break after MaxPolls polls
    if ($pollCount -ge $MaxPolls) {
        Write-Host "Reached maximum poll count ($MaxPolls). Exiting..." -ForegroundColor Magenta
        break
    }

    try {
        $status = msstore submission status $AppId 2>&1  | Out-String
        $currentStatus = $status.ToString().Trim()
        if ($currentStatus -ne $priorStatus) {
            $priorStatus = $currentStatus
            Write-Host "Status changed to: '$($currentStatus)'" -ForegroundColor Green
        }
        if ( $currentStatus.Contains( "Published") ) {
            Write-Host "Submission published successfully. Exiting polling loop." -ForegroundColor Green
            break
        }
        if ( $currentStatus.Contains( "Canceled") ) {
            Write-Host "Submission was canceled. Exiting polling loop." -ForegroundColor Yellow
            break
        }
        if ( $currentStatus.Contains( "Failed") -or $currentStatus.Contains( "Rejected") -or $currentStatus.Contains( "Error")  ) {
            Write-Host "Submission failed or was rejected. Exiting polling loop." -ForegroundColor Red
            break
        }
        if ( $currentStatus.Contains( "Error") ) {
            Write-Host "$($currentStatus)" -ForegroundColor Red
            $errorCount++   
            if ($errorCount -ge $ErrorLimit) {
                Write-Host "Exceeded maximum error count. Exiting..." -ForegroundColor Red
                break
            }                 
        }
    }
    catch {
        Write-Host "Error polling status: $($_.Exception.Message)" -ForegroundColor Red
        # Increment error count and check if it exceeds threshold
        $errorCount++
        if ($errorCount -ge 5) {
            Write-Host "Exceeded maximum error count. Exiting..." -ForegroundColor Red
            break
        }
    }
    Start-Sleep -Seconds $SleepSeconds
}


# This is not required, but during debug and early setup, I use it to compare later with the final published submission
msstore submission get $AppId | Out-File -FilePath "final_$($AppId)_$($version).json"-Encoding utf8  -NoNewline
if ( $LASTEXITCODE -ne 0 ) {
    Write-Host "Could not get final submission." -ForegroundColor Yellow
    exit 1
}
