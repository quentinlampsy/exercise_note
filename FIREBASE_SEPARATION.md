# Keep FORM and your Bazi calendar separate

## First fix the local website address

The calendar and FORM previously both used **localhost:4173**. When FORM was running there, that address opened FORM and the calendar server could not use the same port. This is a local preview conflict, independent of Firebase.

The FORM launchers have now been changed to **4174**. The calendar files in `C:\Users\quent\Desktop\BaziApp` have not been edited.

1. In any old FORM preview terminal, press **Ctrl+C**, then close that terminal. Changing the source does not move a server that is already running.
2. Start the calendar using `BaziApp\website\preview.bat`.
3. Open the calendar at **http://localhost:4173/bazi-planner-web/**.
4. Start FORM using **Start FORM.bat** in the exercise project.
5. Open FORM at **http://localhost:4174/form/**.
6. Update any FORM bookmark that still points to port 4173.

Both preview windows can now stay open at the same time. On a published site, continue to use separate GitHub repositories/site addresses.

## Save your existing workout data first

Changing a local port gives FORM a different browser-storage location. Nothing in the old location is deleted by this change.

If the old FORM page is still open, use its person icon → **Export backup** before closing it. Export both its device journal and its signed-in workout journal if you used both. Firebase records remain in the old project until you explicitly migrate them.

If you already closed the old preview and need its device data:

1. Temporarily stop the calendar preview and any old FORM preview using Ctrl+C in their own terminals.
2. Double-click **Recover old FORM data.bat** in this exercise project's top folder.
3. Open **http://localhost:4173/form-recovery/** in the **same browser and profile** you used before. If you previously used `127.0.0.1`, use that hostname instead of `localhost`.
4. Download each FORM journal you want to keep. The recovery page only reads keys belonging to FORM and never connects to Firebase or deletes data.
5. Stop the recovery terminal with Ctrl+C. Restart the calendar and FORM with their normal launchers.
6. At the new FORM address, open the person icon → **Import backup**. Choose your backup in the journal you want to use.

FORM now uses the new project. The recovery tool can export previously cached account journals as well as the device journal. For old workouts that exist only in the original cloud project, export them from an old FORM deployment that still uses that project before updating it, or ask for help retrieving that journal. Keep all exported backup files until migration is verified.

## Create a separate Firebase PROJECT for FORM

**Current setup:** your new project's supplied web configuration has been applied to `workout/config.js`: **form-workout-44d44**. The local build has been regenerated. This project's `.firebaserc` also targets it, and `firebase.json` points to the workout-only rules. The Bazi calendar remains on **calendar-99c3f**. The creation/registration steps below are complete for this configuration; continue with enabling accounts and publishing rules if you have not done those yet. Signed-in cloud synchronization has not been verified.

Use a **new project**, rather than registering another Web app inside `calendar-99c3f`. Apps in one Firebase project share its back-end resources, including Authentication and Firestore. [Firebase project documentation](https://firebase.google.com/docs/projects/learn-more)

### 1. Create the project

1. Open [Firebase Console](https://console.firebase.google.com/) and sign in with your Google account.
2. Click **Create a project** or **Add project**.
3. Name it **FORM Workout Journal**. Firebase will suggest a unique project ID. It must be different from `calendar-99c3f`; write down the actual ID.
4. Google Analytics is optional and can be left off for this journal.
5. Complete **Create project**, wait for it to finish, then continue into the new project. [Official setup instructions](https://firebase.google.com/docs/web/setup)

### 2. Register its Web app

1. In the **new project's** overview, select the **Web icon (`</>`)**, or Add app → Web.
2. Give it the nickname **FORM** and choose **Register app**.
3. You can leave Firebase Hosting unchecked if you use GitHub Pages.
4. Find the **firebaseConfig** block. You can return to it through the gear icon → **Project settings → General → Your apps → FORM → SDK setup and configuration → Config**. [Web app registration](https://firebase.google.com/docs/web/setup)

Copy the public web configuration object. Do not copy an Admin SDK service-account file, password, or private key. You can send this web configuration in our chat and I can apply it to FORM.

### 3. Enable FORM accounts

1. Check the selected project ID is the **new FORM project**.
2. Open **Authentication**, then Get started if prompted.
3. Under **Sign-in method**, enable **Email/Password** and save.
4. Under **Settings → Authorized domains**, add `localhost` and your published website hostname, for example `quentinlampsy.github.io`. Use only the hostname, without a port or path. Add `127.0.0.1` too if you use that preview hostname. New projects do not automatically authorize localhost. [Password sign-in setup](https://firebase.google.com/docs/auth/web/password-auth), [authorized-domain note](https://firebase.google.com/docs/auth/faq-and-troubleshooting)

Calendar accounts do not automatically become accounts in the new project. After FORM connects to the new project, choose **Create an account** in FORM. You may use the same email address, but it is a separate account.

### 4. Create the workout database and publish its rules

1. Still in the new project, open **Firestore Database** and choose **Create database**.
2. If an edition is requested, choose **Standard**. Use the **default database**, choose a suitable location and start in **production mode**.
3. Open its **Rules** tab.
4. Open this exercise project's **`website/firestore.workout.rules`** in Notepad or your editor.
5. Copy the entire file into the new database's Rules editor and click **Publish**. [Firestore setup](https://firebase.google.com/docs/firestore/quickstart), [publishing rules](https://firebase.google.com/docs/firestore/security/get-started)

Publish this workout-only rules file to the **new FORM project only**. Leave the calendar project's Authentication settings, rules, database and Hosting unchanged. A rules publication replaces that database's rules, so choosing the intended project matters.

### 5. Connect only the exercise website

The only app configuration to edit is:

```text
C:\Users\quent\Desktop\exercise website\website\workout\config.js
```

In that file, replace the values inside `firebase: { ... }` with the values from the new Web app. Keep `window.FORM_CONFIG` and the outer `firebase` wrapper. A complete example template is available in **`workout/config.example.js`**; its placeholders need your real console values.

The resulting structure is:

```javascript
window.FORM_CONFIG = {
  firebase: {
    apiKey: "YOUR_REAL_WEB_API_KEY",
    authDomain: "YOUR_REAL_AUTH_DOMAIN",
    projectId: "YOUR_NEW_FORM_PROJECT_ID",
    storageBucket: "YOUR_REAL_STORAGE_BUCKET",
    messagingSenderId: "YOUR_REAL_SENDER_ID",
    appId: "YOUR_REAL_WEB_APP_ID"
  }
};
```

You do not need to add Firebase import lines or call initializeApp; FORM already does that. Do not edit `BaziApp\website\bazi-web\app\config.js`.

Save the file and restart **Start FORM.bat**. The launcher rebuilds the public files. For a published GitHub site, upload the updated exercise source and run its publishing workflow as described in [DEPLOYMENT.md](DEPLOYMENT.md).

### 6. Move the workout backup and check both apps

1. At **http://localhost:4174/form/**, open the account panel. Its **Firebase project** label should show your new project ID.
2. Choose **Create an account** in FORM. A new project has its own user IDs; old account journals are not automatically moved.
3. While signed in to the new FORM account, choose **Import backup** and select the workout backup saved earlier. Importing into a signed-out device journal instead will keep the data local until you copy it into your account.
4. Wait for **Cloud synced**. Check the new project's Firestore Data tab for `users → new user ID → workoutRecords`.
5. Sign in to the same **new FORM account** on your phone and check that the workouts appear.
6. Open the calendar at its separate address and check its existing account and notes.

Keep the old project and backup files. This procedure does not delete the old workout records or calendar records. The new Firebase connection is only verified after you complete a signed-in sync against it.

## What will be separate?

| Item | Bazi calendar | FORM exercise journal |
| --- | --- | --- |
| Local address | localhost:4173/bazi-planner-web/ | localhost:4174/form/ |
| Source folder | Desktop/BaziApp/website | Desktop/exercise website/website |
| Firebase project | calendar-99c3f | form-workout-44d44 |
| Sign-in users | Existing calendar users | New FORM users |
| Database rules | Existing calendar rules | firestore.workout.rules in the new project |
| Published website | Existing calendar site | Separate exercise repository/site |

If the calendar subsequently opens correctly but reports a Firebase permissions error, that is a different problem. Check its existing project's published rules separately rather than applying workout-only rules to it.
