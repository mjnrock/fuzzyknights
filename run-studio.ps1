# Get the directory of the current script
$scriptPath = Split-Path -Parent $PSCommandPath

# Define the relative directory path
$directoryPath = Join-Path -Path $scriptPath -ChildPath ".\mapski\client"

# Change to the directory
Set-Location -Path $directoryPath

# Update the git repository
Write-Host "Pulling latest changes from git `master` branch..."
git pull origin master
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to pull latest changes from git `master` branch"
    exit $LASTEXITCODE
}

# Run yarn install
Write-Host "Running `yarn install`..."
Invoke-Expression "yarn install"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to run `yarn install` command"
    exit $LASTEXITCODE
}

# Run yarn start
Write-Host "Running `yarn start`..."
Invoke-Expression "yarn start"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to run `yarn start` command"
    exit $LASTEXITCODE
}

Write-Host "Script completed successfully."

# Wait for the user to press Enter before exiting
Read-Host "Press Enter to exit"