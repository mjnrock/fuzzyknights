# Get the directory of the current script
$scriptPath = Split-Path -Parent $PSCommandPath

# Define the relative directory paths
$gamePath = Join-Path -Path $scriptPath -ChildPath ".\game\dotf\client"

# Check if directories exist and select the correct one
if (Test-Path $gamePath) {
    $directoryPath = $gamePath
} else {
    Write-Error "Neither the 'mapski' nor the 'studio' directories exist"
    exit 1
}

# Change to the selected directory
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