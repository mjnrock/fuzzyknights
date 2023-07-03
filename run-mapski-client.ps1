# Get the directory of the current script
$scriptPath = Split-Path -Parent $PSCommandPath

# Define the relative directory path
$directoryPath = Join-Path -Path $scriptPath -ChildPath ".\mapski\client"

# Change to the directory
Set-Location -Path $directoryPath

# Run yarn start
Invoke-Expression "yarn start"