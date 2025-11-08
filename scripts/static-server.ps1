param(
  [int]$Port = 8000
)

Add-Type -AssemblyName System.Net
$listener = [System.Net.HttpListener]::new()
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $scriptDir "..\client")
Write-Host "Static server listening at $prefix serving from $root"

function Get-ContentType($path) {
  switch ([System.IO.Path]::GetExtension($path).ToLower()) {
    ".html" { return "text/html" }
    ".css" { return "text/css" }
    ".js" { return "application/javascript" }
    ".json" { return "application/json" }
    ".png" { return "image/png" }
    ".jpg" { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".svg" { return "image/svg+xml" }
    default { return "text/plain" }
  }
}

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $req = $context.Request
    $res = $context.Response
    $relPath = $req.Url.AbsolutePath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = 'index.html' }
    $fsPath = Join-Path $root $relPath
    if ((Test-Path $fsPath) -and ((Get-Item $fsPath).PSIsContainer)) {
      $fsPath = Join-Path $fsPath 'index.html'
    }
    if (Test-Path $fsPath) {
      $bytes = [System.IO.File]::ReadAllBytes($fsPath)
      $res.ContentType = Get-ContentType $fsPath
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      $res.StatusCode = 200
    } else {
      $res.StatusCode = 404
      $msg = "Not Found"
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    $res.Close()
  } catch {
    Write-Host "Server error: $_"
  }
}

