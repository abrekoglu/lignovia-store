# Quick Fix for Git Large File Error

## Problem
The file `lignovia-store.zip` (181.13 MB) exceeds GitHub's 100 MB limit.

## Solution

Run these commands in PowerShell from your project root:

```powershell
# 1. Remove the file from git tracking
git rm --cached "lignovia-store.zip"

# 2. Stage the updated .gitignore
git add "lignovia-store/.gitignore"

# 3. Commit the changes
git commit -m "Remove large zip file and update .gitignore"

# 4. Push to remote
git push
```

## OR run the automated script:

```powershell
.\remove-large-file.ps1
```

## If the file is in git history (not just current commit):

You may need to remove it from history:

```powershell
# Remove from last commit only (if it's the most recent)
git rm --cached "lignovia-store.zip"
git commit --amend -C HEAD

# Then force push
git push --force
```

## Note
- The `.gitignore` has been updated to prevent this in the future
- The local file will remain but won't be tracked by git
- If you need to share the zip, use a file sharing service instead

