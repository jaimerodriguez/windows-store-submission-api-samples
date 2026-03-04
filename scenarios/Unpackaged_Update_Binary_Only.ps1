Set-PSDebug -Trace 1 -Strict

# Scenario 2: Update an existing packaged app with new metadata and package using MSStore CLI

$AppId = 'TODO_AddYourUnpackagedApplicationIdHere' 


$version = "v6_0"
$date = Get-Date -Format "yyyy-MM-dd HH:mm"
$updatePostfix = $version + " " + $date

$UpdateUrl = "https://msstorefasteast.blob.core.windows.net/msstoreclitest/$($version)/MSCLIPipelineSetup.exe"



#GET THE CURRENT SUBMISSION JSON
msstore submission get $AppId | Out-File -FilePath "submission_$($AppId).json" -Encoding utf8

if ( $LASTEXITCODE -ne 0 ) {
    Write-Host "Failed to get submission. Exiting..." -ForegroundColor Red
    exit 1
}

# MODIFY THE JSON TO UPDATE METADATA FIELDS
try  {
$myJson = Get-Content "submission_$($AppId).json" -Raw | ConvertFrom-Json -Depth 50
$myJson.Packages[0].PackageUrl = $UpdateUrl
$myJson.PSObject.Properties.Remove("PackageId") #remove the old submission id
} catch {
    Write-Host "Failed to read or parse submission JSON. Exiting..." -ForegroundColor Red
    exit 1
}

$updatedJson = $myJson | ConvertTo-Json -Depth 50

#UPDATE THE SUBMISSION WITH THE NEW JSON
msstore submission update $AppId $updatedJson --verbose | Out-File -FilePath "submission_updated_$($AppId).json" -Encoding utf8  -NoNewline

if ( $LASTEXITCODE -ne 0 ) {
    Write-Host "Failed to update submission. Exiting..." -ForegroundColor Red
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
$SleepSeconds = 30      # Number of seconds to wait between polls
$priorStatus = ""
$currentStatus = ""
$errorCount = 0
$successCount = 0  # needed to prevent race condition where we poll for status too quickly after a submission
while ($true) {
    $pollCount++
    Write-Host "Poll #$pollCount at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" -ForegroundColor Cyan
    # Break after MaxPolls polls
    if ($pollCount -ge $MaxPolls) {
        Write-Host "Reached maximum poll count ($MaxPolls). Exiting..." -ForegroundColor Magenta
        break
    }

    try {
        $currentStatus = msstore submission status $AppId | ConvertFrom-Json -Depth 50                 
        if ($currentStatus.ResponseData.IsReady -and $currentStatus.ResponseData.OngoingSubmissionId -eq $null ) {           
            $successCount++ 
            if ( $successCount -ge 2) {
                Write-Host "Submission is ready. Exiting polling loop." -ForegroundColor Green
                break
            }             
        }

        if ($currentStatus.ResponseData.OngoingSubmissionId -ne $null -and $priorStatus -ne $currentStatus.ResponseData.OngoingSubmissionId ) {
             Write-Host "OngoingSubmissionId: '$($currentStatus.ResponseData.OngoingSubmissionId)'" -ForegroundColor Green
             $priorStatus = $currentStatus.ResponseData.OngoingSubmissionId
        }
        if ( !$currentStatus.IsSuccess )
        {
            Write-Host "Submission status indicates failure:"
            Write-Host ($currentStatus | ConvertTo-Json -Depth 50) -ForegroundColor Red
            $errorCount++
            if ( $errorCount -ge 5) {
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
