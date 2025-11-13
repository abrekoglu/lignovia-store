# Script to remove lignovia-store.zip from git tracking

Write-Host "Removing lignovia-store.zip from git tracking..." -ForegroundColor Yellow

# Remove file from git index (but keep local file)
git rm --cached "lignovia-store.zip"

# If that fails, try with force
if ($LASTEXITCODE -ne 0) {
    Write-Host "Trying with --force flag..." -ForegroundColor Yellow
    git rm --cached --force "lignovia-store.zip"
}

# Stage the .gitignore update
git add "lignovia-store/.gitignore"

# Commit the changes
git commit -m "Remove large zip file from repository and update .gitignore"

Write-Host "`nDone! The file has been removed from git tracking." -ForegroundColor Green
Write-Host "The file still exists locally but will be ignored by git." -ForegroundColor Green
Write-Host "`nNow you can push with: git push" -ForegroundColor Cyan

