---
description: Sync local folder with GitHub repository
---

# Sync Local Folder with GitHub Repository

This workflow helps you keep your local GradConnect folder synchronized with the GitHub repository at https://github.com/Aswithadari/GradConnect.

## Pull Latest Changes from GitHub

To get the latest changes from the remote repository:

```bash
git pull origin main
```

This will fetch and merge any new commits from the GitHub repository into your local folder.

## Push Local Changes to GitHub

If you've made local changes and want to push them to GitHub:

1. **Check the status of your changes:**
   ```bash
   git status
   ```

2. **Stage all changes:**
   ```bash
   git add .
   ```

3. **Commit your changes with a descriptive message:**
   ```bash
   git commit -m "Your descriptive commit message here"
   ```

4. **Push to GitHub:**
   ```bash
   git push origin main
   ```

## Check Sync Status

To see if your local folder is in sync with the remote repository:

```bash
git status
```

This will show:
- Whether your branch is up to date with origin/main
- Any uncommitted local changes
- Any untracked files

## View Recent Changes

To see the recent commit history:

```bash
git log --oneline -10
```

## Resolve Conflicts

If you encounter merge conflicts when pulling:

1. **View conflicted files:**
   ```bash
   git status
   ```

2. **Open and manually resolve conflicts in the listed files**

3. **After resolving, stage the files:**
   ```bash
   git add <resolved-file>
   ```

4. **Complete the merge:**
   ```bash
   git commit
   ```

## Full Sync (Pull and Push)

To do a complete sync - pull changes and push your local work:

```bash
git pull origin main
git add .
git commit -m "Update: [describe your changes]"
git push origin main
```
