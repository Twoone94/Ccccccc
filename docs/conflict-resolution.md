# Resolving pull request merge conflicts

When the pull request for this branch shows conflicts (for example at `https://github.com/Twoone94/Ccccccc/pull/3/conflicts`), follow these steps to reconcile the branch with the target branch before updating the PR.

> **Tip:** These instructions use `work` as the feature branch and `main` as the target. Adjust the branch names if your PR uses different ones.

## Quick recipe for PR #3 (from GitHub directly)

If you only have the GitHub PR URL and want to refresh it locally:

```bash
# 1) Add the repo remote if you do not have it yet
git remote add origin git@github.com:Twoone94/Ccccccc.git  # or https://github.com/Twoone94/Ccccccc.git

# 2) Fetch main and the PR head in one go
git fetch origin main pull/3/head:pr-3

# 3) Check out the PR branch
git checkout pr-3

# 4) Rebase the PR onto the latest main and resolve conflicts when prompted
git rebase origin/main

# 5) After resolving conflicts (see sections below), push the refreshed branch
git push origin pr-3 --force-with-lease
```

If you prefer merging instead of rebasing, replace the rebase step with `git merge origin/main` and push without `--force-with-lease`.

## 1) Sync the latest target branch locally

1. Add the remote if it is not already present:
   ```bash
   git remote add origin git@github.com:Twoone94/Ccccccc.git
   ```
2. Fetch the latest refs and checkout the target branch (usually `main`):
   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   ```

## 2) Rebase or merge the feature branch onto the target branch

From the project root:

```bash
git checkout work
# Choose one approach:
# A) Rebase onto the updated target branch (keeps history linear)
git rebase main
# B) Or merge the target branch into your feature branch
git merge main
```

Resolve any conflicts that Git reports during the rebase/merge.

## 3) Resolve conflicts in files

For each conflicted file:

1. Open the file and search for conflict markers `<<<<<<<`, `=======`, `>>>>>>>`.
2. Decide which changes to keep from each side; remove the markers and ensure the file builds correctly.
3. Save the file, then mark it as resolved:
   ```bash
   git add <file>
   ```

If you are using rebase and need to continue after resolving conflicts:
```bash
git rebase --continue
```
If you need to abort and start over:
```bash
git rebase --abort
```

## 4) Verify the project builds

Run the project checks to ensure the merged code is healthy:
```bash
npm install
npm run lint
```
Add or adjust tests if necessary.

## 5) Push the updated branch to update the PR

After resolving conflicts and passing checks:
```bash
git push origin work --force-with-lease   # if you rebased
# or
git push origin work                        # if you merged
```

The PR at `https://github.com/Twoone94/Ccccccc/pull/3` should now show no conflicts.
