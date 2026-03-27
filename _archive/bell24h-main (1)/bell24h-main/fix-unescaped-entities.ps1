# PowerShell script to fix unescaped entities in React components (.tsx files) using .NET Regex
# Use double quotes for replacement strings and escape $ as $$ for group references

$dirs = @("src", "app", "components")
$files = @()

foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        $files += Get-ChildItem -Path $dir -Recurse -Filter *.tsx | Select-Object -ExpandProperty FullName
    }
}

foreach ($file in $files) {
    Write-Host "Processing $file"
    $content = Get-Content $file -Raw

    # Replace unescaped single quotes in JSX text nodes
    $content = [regex]::Replace($content, "(>[^<]*)'([^<]*<)", "$1'$2")

    # Replace unescaped double quotes in JSX text nodes
    $content = [regex]::Replace($content, "(>[^<]*)\"([^\<]*<)", "$1"$2")

    # Optionally, replace backticks in JSX text nodes (rare)
    $content = [regex]::Replace($content, "(>[^<]*)`([^<]*<)", "$1&lsquo;$2")

    Set-Content $file $content
}
