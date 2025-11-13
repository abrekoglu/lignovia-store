# Fix Git Large File Error

The `lignovia-store.zip` file (181.13 MB) exceeds GitHub's 100 MB limit and is blocking your push.

## Steps to Fix:

1. **Remove the file from git tracking:**
   ```powershell
   git rm --cached lignovia-store.zip
   ```

2. **If the file is already in git history, you need to remove it from history:**
   ```powershell
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch lignovia-store.zip" --prune-empty --tag-name-filter cat -- --all
   ```
   
   Or using the newer `git filter-repo` tool:
   ```powershell
   git filter-repo --path lignovia-store.zip --invert-paths
   ```

3. **Add to .gitignore** (already done in `lignovia-store/.gitignore`):
   ```
   *.zip
   lignovia-store.zip
   ```

4. **Commit the changes:**
   ```powershell
   git add .gitignore lignovia-store/.gitignore
   git commit -m "Remove large zip file and update .gitignore"
   ```

5. **Force push to update remote (WARNING: This rewrites history):**
   ```powershell
   git push origin --force --all
   ```

## Alternative: If you don't want to rewrite history

If the large file is only in recent commits, you can:

1. Remove it from the current commit and amend:
   ```powershell
   git rm --cached lignovia-store.zip
   git commit --amend -C HEAD
   ```

2. Force push:
   ```powershell
   git push origin --force
   ```

## Note:
The `.gitignore` file has been updated to prevent this in the future.

