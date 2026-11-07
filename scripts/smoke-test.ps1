# Smoke test for the containerised Spring Boot + MySQL stack.
# Usage (from the project folder, once the containers are running):
#   powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1 -BaseUrl http://localhost:8080

param(
    [string]$BaseUrl = "http://localhost:8080"
)

$ErrorActionPreference = "Stop"
$script:passed = 0

function Check([bool]$condition, [string]$name) {
    if ($condition) {
        $script:passed++
        Write-Host "  PASS  $name" -ForegroundColor Green
    }
    else {
        throw "FAIL: $name"
    }
}

Write-Host ""
Write-Host "== Spring Boot + MySQL Docker smoke test ==" -ForegroundColor Cyan
Write-Host "Target: $BaseUrl"

$health = Invoke-RestMethod "$BaseUrl/actuator/health"
Check ($health.status -eq "UP") "Actuator health is UP"

$hello = Invoke-RestMethod "$BaseUrl/api/hello"
Check ($hello.message -like "*Docker*") "GET /api/hello"

$newTask = @{
    title       = "Smoke test task"
    description = "Created by scripts/smoke-test.ps1"
    status      = "TODO"
} | ConvertTo-Json

$created = Invoke-RestMethod "$BaseUrl/api/tasks" -Method Post -ContentType "application/json" -Body $newTask
Check ($created.id -gt 0) "POST /api/tasks created id=$($created.id)"

$tasks = Invoke-RestMethod "$BaseUrl/api/tasks"
Check ($tasks.Count -ge 1) "GET /api/tasks returns $($tasks.Count) task(s)"

$update = @{
    title       = "Smoke test task (updated)"
    description = "Updated by scripts/smoke-test.ps1"
    status      = "DONE"
} | ConvertTo-Json

$updated = Invoke-RestMethod "$BaseUrl/api/tasks/$($created.id)" -Method Put -ContentType "application/json" -Body $update
Check ($updated.status -eq "DONE") "PUT /api/tasks/$($created.id) updated the status"

Invoke-RestMethod "$BaseUrl/api/tasks/$($created.id)" -Method Delete | Out-Null
Check ($true) "DELETE /api/tasks/$($created.id)"

$wasDeleted = $false
try {
    Invoke-RestMethod "$BaseUrl/api/tasks/$($created.id)" | Out-Null
}
catch {
    $wasDeleted = ($_.Exception.Response.StatusCode.value__ -eq 404)
}
Check $wasDeleted "GET the deleted task returns 404"

Write-Host ""
Write-Host "All $($script:passed) checks passed." -ForegroundColor Green
Write-Host ""
