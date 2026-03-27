Set-PSDebug -Trace 1 -Strict 

# Scenario 2: Update an existing packaged app with new metadata and package using MSStore CLI

$AppId = '9N6MK2GQBD58'
$version = "v17_1"
 
# DELETE ANY PENDING SUBMISSION ... This willl fail if the pending submission was created via Partner Center UI 
$delete =  " " |  msstore submission delete $AppId --no-confirm 2>&1 
if ( $LASTEXITCODE -ne 0 ) {    
    if ( $delete -match "No pending submission found" ) {
        Write-Host "No active submission found, continuing..." -ForegroundColor Yellow
    } 
    #This means it failed because the submission was created via Partner Center UI 
    # the " " | pipe eats the rest of the error message 
    elseif ( $delete -match "Press Enter to open the browser at this page" ) {
        Write-Host "Failed to delete submission. " -ForegroundColor Red
        Write-Host "The API/CLI can only delete submissions created via API. If you have a pending submission created in Partncer Center, please delete it or publish it there" -ForegroundColor Red 
        exit 1 
    }
    else {
        Write-Host "Failed to delete submission. " -ForegroundColor Red         
        Write-Host "The full output is : $delete" -ForegroundColor Yellow 
        Write-Host "Exiting..." -ForegroundColor Red
        exit 1
    }
}

msstore publish "$($AppId)_$($version).msixupload" --appId $AppId --verbose 

if ( $LASTEXITCODE -ne 0 ) {
    Write-Host "Failed to publish package. Exiting..." -ForegroundColor Red
    exit 1
}

 

Set-PSDebug -Trace 0 
$MaxPolls = 50           # Maximum number of polls before exiting
$SleepSeconds = 180      # Number of seconds to wait between polls
$ErrorLimit = 5          # Maximum number of consecutive errors before exiting

$pollCount = 0
$priorStatus = "" 
$currentStatus = "" 
$errorCount = 0 

while ($true) {
    $pollCount++   
    Write-Host "Poll #$pollCount $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" -ForegroundColor Cyan    
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
        if ( $currentStatus.Contains( "Failed") -or $currentStatus.Contains( "Rejected")) {
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
        if ($errorCount -ge $ErrorLimit) {
            Write-Host "Exceeded maximum error count ($ErrorLimit). Exiting..." -ForegroundColor Red
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
