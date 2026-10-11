# Publish FORM with GitHub Pages

Use a **new repository** if you want to keep your existing calendar online. You can reuse the same Firebase project; the exercise data has its own collection.

## 1. Create the workout repository

1. Sign in at [GitHub](https://github.com/).
2. Click **+ → New repository**.
3. Name it something like **`exercise-journal`**. This is a suggested name; the upload script uses whatever you enter.
4. Choose **Public** for the simplest GitHub Pages setup. The source is public, while signed-in workout data is protected by Firebase rules.
5. Create the repository. You can leave the initialization options unchecked.

## 2. Upload using the included script

Install [Git for Windows](https://git-scm.com/downloads/win) if necessary. Node.js 20+ is also needed. Reopen the terminal after installing.

1. Open the `website` folder in File Explorer.
2. Click its address bar, type **powershell**, and press Enter.
3. Run this local check first:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy.ps1 -CheckOnly
```

4. If the checks pass, run the upload command, replacing the repository name if you chose a different one:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy.ps1 -Repository "quentinlampsy/exercise-journal"
```

5. Git may open a browser to ask you to sign in. Use the account that owns your new repository.
6. On a first upload, the script may ask for a commit author name and email. These are saved **inside its temporary checkout in this project**, not in your global Git configuration. You can use your GitHub-provided private commit email from GitHub Settings → Emails.
7. The script prints the files and target repository, then asks you to type **UPLOAD**. Review them before proceeding.

The script clones into this project's ignored `.deploy/` folder, copies only the listed FORM source files, and pushes a normal commit. It does not force-push, delete remote files, upload old calendar folders or upload exports/private keys. It never defaults to `zzz_calendar`. To replace the calendar deliberately, you must supply that repository explicitly; its FORM entry page will then replace the calendar when published.

## 3. Enable Pages and publish

1. Open the new repository on GitHub.
2. Choose **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**. [GitHub's publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
4. Open **Actions → Publish FORM workout journal**.
5. Click **Run workflow**, choose `main`, then click the green **Run workflow** button.
6. Wait until both **build** and **deploy** are green. Open the website URL from the deployment result or Settings → Pages.

For a repository named `quentinlampsy/exercise-journal`, the address will be:

```text
https://quentinlampsy.github.io/exercise-journal/
```

The workflow runs tests, builds only the approved public assets, and publishes `dist/`. It runs manually, so uploading a change does not immediately change the live site. [GitHub's custom-workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## 4. Enable workout cloud sync

Follow **[README.md, step 6](README.md#6-connect-firebase-for-phonecomputer-sync)**. The existing Firebase configuration is included. You still need to publish the updated Firestore rules for the new `workoutRecords` collection.

## Updating the website later

Edit the source files locally, use `preview.bat` to check the result, rerun the upload command with the same repository name, then run **Publish FORM workout journal** in GitHub Actions again. Your workout records are stored in Firebase and the browser, independently of the website code.

## Optional: Firebase Hosting instead

GitHub Pages is the main documented route. The included `firebase.json` also supports Firebase Hosting with `dist/` as the public folder.

If your Firebase project already hosts the calendar, **do not deploy hosting to its default site** unless you intend to replace it. Use a separate Hosting site and target first, following [Firebase's multisite guide](https://firebase.google.com/docs/hosting/multisites). Publishing rules to the shared project is separate from publishing Hosting; the rules file retains the original calendar paths.

No Cloud Functions, reminder service, server account JSON key or paid backend runtime is needed for FORM.
