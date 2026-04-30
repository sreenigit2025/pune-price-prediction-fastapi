# Git Starter — From Empty Folder to Pushed GitHub Repo

A step-by-step guide to take an existing local project folder and publish it to a brand-new GitHub repository. This is the exact sequence used to push the **Pune Property Price Prediction** project to:
**https://github.com/prashant9501/pune-price-prediction-fastapi**

---

## Prerequisites

- **Git installed** — verify with `git --version`
- **GitHub account** with the empty (or to-be-overwritten) repo already created on github.com
- **Git authenticated** with GitHub — either:
  - Personal Access Token (HTTPS), or
  - SSH key configured (`ssh -T git@github.com` should succeed)
- **`.gitignore` file** already in the project root (don't commit `__pycache__/`, `.venv/`, `creds/`, `.env`, etc.)

---

## The Full Sequence

### 1. Initialize the local repository on `main`

```bash
git init -b main
```

`-b main` sets the initial branch name to `main` (modern default). Without it, older Git versions create `master`.

### 2. Sanity check — see what will be tracked vs. ignored

```bash
git status
```

Confirm that sensitive folders (`creds/`, `.env`, `.venv/`, `__pycache__/`) are **not** in the "Untracked files" list. If they are, fix `.gitignore` before proceeding.

### 3. Stage project files explicitly

```bash
git add .gitignore DEPLOYMENT.md README.md requirements.txt \
        model_features.csv model_target.npy \
        deployment/ frontend/ model/ src/
```

> **Why explicit instead of `git add -A` or `git add .`?**
> Explicit staging prevents accidentally committing secrets (`.env`, credential files, large binaries) that slipped through `.gitignore`. Recommended habit even when `.gitignore` looks complete.

### 4. Verify what got staged

```bash
git status --short
```

Every line should start with `A ` (added). Spot-check that nothing sensitive made it in.

### 5. Mark shell scripts as executable (Linux/macOS targets)

```bash
git update-index --chmod=+x deployment/ec2/setup.sh
```

On Windows, the filesystem doesn't have a "+x" bit. This command tells Git to mark the file as executable in the repo so that anyone cloning on Linux/macOS can run it directly without a separate `chmod +x`.

Skip this step if your project has no shell scripts.

### 6. Create the initial commit

Single-line version (simplest):

```bash
git commit -m "Initial commit: Pune Property Price Prediction FastAPI service"
```

Multi-line version (richer message, recommended for the *first* commit):

```bash
git commit -m "$(cat <<'EOF'
Initial commit: Pune Property Price Prediction FastAPI service

- FastAPI inference service (src/) with /health, /model/info, /predict
- Trained voting ensemble + NLP vectorizer artifacts (model/)
- Static HTML/CSS/JS frontend (frontend/)
- AWS EC2 deployment kit (deployment/ec2/) for Ubuntu 24.04 LTS:
  setup.sh, NGINX site config, systemd unit
- README.md and DEPLOYMENT.md
EOF
)"
```

> The `<<'EOF' ... EOF` syntax is a **heredoc**. Single-quoted `'EOF'` prevents shell expansion, so `$variables` and backticks stay literal inside the message.
> On Windows PowerShell use a single-quoted here-string (`@'...'@`) instead — the closing `'@` MUST be at column 0.

### 7. Add the GitHub remote

```bash
git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
```

Real example used here:

```bash
git remote add origin https://github.com/prashant9501/pune-price-prediction-fastapi.git
```

`origin` is just the conventional nickname for the primary remote — you can use any name, but stick with `origin` unless you have a reason not to.

### 8. Verify the remote was added correctly

```bash
git remote -v
```

You should see two lines (one for `fetch`, one for `push`), both pointing to your GitHub URL.

### 9. Check whether the remote already has commits

```bash
git ls-remote origin
```

- **If output is empty** → remote is brand-new, you can push directly (skip to step 11 with a regular `git push`).
- **If output shows a commit hash** → someone (probably you, via the GitHub UI) already put files there. Decide between merging or overwriting (steps 10 and 11).

### 10. Inspect what's on the remote (only if non-empty)

```bash
git fetch origin main
git ls-tree -r --name-only origin/main
git log origin/main -1 --pretty=format:"%h %s%n%b"
```

This shows you the file list and last commit message on the remote so you can decide:

- **Force push** — overwrites remote (destructive, you lose remote history)
- **Pull with `--allow-unrelated-histories`** — merges both, keeps history
- **Push to a separate branch** — safest, opens a PR for review

### 11. Push to GitHub

**Standard push (remote was empty):**
```bash
git push -u origin main
```

The `-u` flag sets the upstream so future `git push` / `git pull` work without arguments.

**Force push (you've decided to overwrite remote — destructive):** ⚠️
```bash
git push origin main --force
```

> ⚠️ **`--force` permanently overwrites remote `main`**. Only use it when you've verified the remote content is safe to lose, and never on shared branches with other collaborators.

**Push to a separate branch (safest if remote is non-empty):**
```bash
git push -u origin main:add-deployment-and-docs
# Then open a Pull Request on GitHub from this branch into main.
```

### 12. Verify the push succeeded

```bash
git log --oneline -1
git ls-remote origin main
```

Both should show the same commit hash. Open your repo URL in a browser to visually confirm.

---

## TL;DR — Minimum Commands for a Brand-New Empty Repo

If your remote is genuinely empty (no README, no LICENSE, no prior commits), this is the bare minimum:

```bash
git init -b main
git add <files...>
git commit -m "Initial commit"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Five commands. Everything else above is verification, safety, or recovering from a non-empty remote.

---

## Common First-Time Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `fatal: refusing to merge unrelated histories` | Remote already has commits, your local doesn't share history | `git pull origin main --allow-unrelated-histories` or force-push |
| `error: failed to push some refs` (non-fast-forward) | Remote has commits you don't have locally | `git pull origin main --rebase` then push, or force-push |
| `Authentication failed` over HTTPS | GitHub no longer accepts password auth | Use a Personal Access Token as the password, or switch to SSH |
| `Permission denied (publickey)` over SSH | Your SSH key isn't added to GitHub | `cat ~/.ssh/id_ed25519.pub` → add to github.com → Settings → SSH keys |
| Files you didn't want got committed | `.gitignore` was added *after* the file was tracked | `git rm --cached <file>` then commit again |
| Line-ending warnings (`LF will be replaced by CRLF`) on Windows | Cosmetic — Git normalizing line endings | Safe to ignore, or set `git config --global core.autocrlf input` |

---

## Day-2 Workflow (After the Initial Push)

```bash
# Make changes to files...

git status                    # See what changed
git diff                      # See exact line-level changes
git add <files>               # Stage changes
git commit -m "Short message" # Commit
git push                      # Push (no args needed because of -u from initial push)

# Pull the latest before starting new work
git pull
```

---

## Useful References

- Official Git book (free): https://git-scm.com/book/en/v2
- GitHub Personal Access Tokens: https://github.com/settings/tokens
- `.gitignore` templates: https://github.com/github/gitignore
