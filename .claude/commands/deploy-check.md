Run a pre-deploy check before pushing to main:

1. Run `git status` — if there are uncommitted changes, list them and stop.
2. Validate that index.html exists and is valid HTML (check for unclosed tags).
3. Confirm we're on the `main` branch.
4. If everything passes, tell me it's safe to push and ask if I want to proceed.
5. If I say yes, push to main.
