# FORM — your personal workout journal

FORM replaces the entry page of this **local copy** with a dedicated exercise journal. It has two pages: **This week** and **History**. Your original calendar's live site has not been changed. Its source remains in `bazi-web/`, but the new build publishes only FORM.

## 1. Open it on your computer

1. Install the **LTS** version of [Node.js](https://nodejs.org/) if it is not already installed. This app needs Node.js 20 or newer. Node is already available on the computer used to develop this copy.
2. Open this project's `website` folder in File Explorer.
3. Double-click **`preview.bat`**. Keep the terminal window open.
4. Open **http://localhost:4173/** in Chrome or Edge.
5. To stop, return to the terminal and press **Ctrl+C**.

You do not need `npm install` to run or build this website. Do not double-click `.js` files. If Windows asks what to use for `.bat`, run `npm start` in a terminal opened in the `website` folder instead.

**localhost works on this computer only.** To open the website on your phone, publish it using step 5 below. A local preview is not a public web address.

## 2. Plan and log a workout

1. Open **This week**. The computer shows seven columns. Your phone shows days vertically, with navigation at the bottom.
2. Tap **Add exercise** under the day you want, or the orange **+** at the bottom on your phone.
3. Enter a movement, such as **Lat pulldown**, and choose **Back** as the muscle group.
4. Choose the day and weight unit. Kilograms are the default; pounds and bodyweight are also available. Changing a unit changes its label; it does not convert entered numbers.
5. Swipe the set selector and tap **2**, **3**, **4**, **5**, or another number. Up to 12 sets are supported.
6. Enter the **weight and reps in each row**. For example, set 1 can be 40 kg × 12, set 2 can be 40 kg × 10, and set 3 can be 35 kg × 8.
7. Tap the circle with **✓** for each set you actually completed. Planned sets stay unchecked.
8. Add a note if useful, then tap **Save exercise**.

Tap a saved movement card to open its larger editor. Tap its small check button on the weekly board to mark all its sets completed, or to reopen a completed workout. Every saved change gets a history entry; typing without saving does not create an entry. An accidental completion can be corrected by reopening the card and changing its set checks.

Empty days are open for rest or more exercises. **Try a sample week** adds eight editable example plans only after you choose it; it never invents completed workouts.

## 3. Future plans and repeated routines

Use the arrows beside the week title to move to any future or past week. **Today** returns to the current week. No event time is required.

In an exercise editor, choose:

| Repeat option | How it works |
| --- | --- |
| Just this day | A single workout on the selected date. |
| Every week | Choose one or more weekdays. Repeats begin on or after the start date. |
| Every day | Repeats daily from the selected start date. |
| Every … days | Enter 2 for every two days, 3 for every three days, and so on. |

You can leave **Repeat until** blank or choose an end date. Completed sets do not automatically carry over to the next repeat.

When editing a saved card, choose **Apply changes to**:

- **Only this workout day** records that day's weights, reps, notes and completion. It keeps other days' plan and results intact. Repeat controls are disabled in this mode.
- **This day and future routine** changes the plan starting with that day. Earlier workout dates stay intact. Already saved logs are preserved, including future dates you previously edited. To update one of those saved logs, edit that specific card separately.

**Remove** follows the same scope. Removing a single day skips only that occurrence. Removing the future routine stops it from that date onward. Historical edits and already logged results remain available in History. To undo a removal, add a new exercise using the previous values shown in its history entry.

## 4. Read your history and keep a backup

Open **History** and choose a month.

- **Activity & changes** is sorted by the date you saved each change. Expand an entry to see its full date and time, workout date, and before/after details, including every set.
- **Workout log** is sorted by the actual workout date. It shows exercises with at least one completed set.
- Search by movement name or filter by muscle group. The chart counts completed sets by weekday.
- Logged volume is weight × reps for completed sets. Kilograms and pounds are shown separately. Bodyweight sets are included in completed-set totals.

The weekly page also previews your three latest saved changes.

Tap the person icon in the header, then **Export backup** to download a JSON file. Keep it somewhere you can find. **Import backup** merges a previous FORM backup into the journal currently open; newer edits are kept. Calendar backups use a different format and cannot be imported here.

When signed out, data is saved in this browser on this device. Clearing site data or using private browsing can remove that local journal. Export a backup or sign in before changing devices.

## 5. Put the website online with GitHub

The simplest arrangement is **a separate GitHub repository for FORM**, with the same Firebase project for accounts. For example, you may create `exercise-journal` while leaving your existing `zzz_calendar` repository alone.

Follow **[DEPLOYMENT.md](DEPLOYMENT.md)** for the exact upload and publishing steps. The new upload script requires you to name a repository explicitly; it has no calendar repository default.

GitHub hosts the website files. Firebase stores your private workout records. The GitHub website source can be public while Firestore records are accessible only to their signed-in owner.

## 6. Connect Firebase for phone/computer sync

Your existing public Firebase web configuration for **`calendar-99c3f`** is already copied into **`workout/config.js`**. No passwords or server account keys belong in that file. Firebase web configuration is intended for browser use; authentication and database rules control access. [Firebase configuration documentation](https://firebase.google.com/docs/projects/learn-more#config-files-objects)

If your calendar already supports signing in, you can use **the same email and password** in FORM. Workout data is stored separately under:

```text
users / YOUR_USER_ID / workoutRecords
```

Your calendar data remains under `users / YOUR_USER_ID / records`.

### A. Enable sign-in (only if not already enabled)

1. Open [Firebase Authentication for your project](https://console.firebase.google.com/project/calendar-99c3f/authentication/providers).
2. Open **Sign-in method** and enable **Email/Password**.
3. Under **Authentication → Settings → Authorized domains**, ensure `localhost` and `quentinlampsy.github.io` are listed. Add a different hostname if you publish elsewhere. Enter only the hostname, without `https://` or a folder path.

### B. Publish the updated privacy rules — required for FORM

1. Open [your Firestore database](https://console.firebase.google.com/project/calendar-99c3f/firestore).
2. If the database does not exist, choose **Create database**, select a location and use production mode.
3. Select the **Rules** tab.
4. Open **`website/firestore.rules`** in Notepad or an editor.
5. Copy the **entire file** and replace the text in the console's Rules editor. It includes the original calendar rule block and the new workout rule block.
6. Click **Publish**.

The new rules allow each account to read and edit its own workout records, keep audit history immutable, and use deletion markers so older devices cannot recreate removed plans. The calendar block has been retained. If your live project has additional custom rules beyond this copied calendar project, merge those with the supplied workout block before publishing.

### C. Sign in and verify

1. Open FORM and tap the person icon in the header.
2. Sign in using your existing calendar account, or choose **Create an account** with an email and password.
3. Workouts created while signed out stay in the separate device journal. If you want them in your account, choose **Copy device workouts to my account**.
4. Add or edit an exercise. Look for **Cloud synced** in the header on your computer. On mobile, open the account panel to see the status.
5. Check Firestore's **Data** tab for `users → your user ID → workoutRecords`.
6. Open your published GitHub Pages address on your phone. Sign in with the same account. Your journal should appear there.

**Cloud synced** means the app has read the server and completed its pending writes. If you see **Sync needs attention**, open your account panel for the actual reason and choose **Retry sync** after fixing it. The app keeps a device copy and retries when you reconnect. When two devices change the same exercise, the newer saved version wins; both separate audit entries remain.

Switching accounts switches the whole local journal. Signing out returns to the device journal. It does not mix one person's records into another account. The account copy is cached locally for when that same account returns; use a personal device for your journal.

## 7. Add FORM to your phone's home screen

After opening the published HTTPS website:

- **iPhone:** open it in Safari, tap **Share**, then **Add to Home Screen**.
- **Android:** open it in Chrome, use the browser menu, then **Add to Home screen** or **Install app**.

The installed app opens like a small personal training journal. The app shell can load offline after an initial online visit. Account sign-in and cloud sync need the internet; offline edits are stored locally and sync after reconnecting. This version does not send workout reminder notifications.

## Files you are likely to use

| File | Purpose |
| --- | --- |
| `preview.bat` | Double-click to start the local preview. |
| `README.md` | This beginner guide. |
| `DEPLOYMENT.md` | Upload and publish the website. |
| `deploy.ps1` | Checks and uploads only approved source files to a repository you specify. |
| `workout/config.js` | Public Firebase web configuration. |
| `firestore.rules` | Calendar rules plus private workout rules. |
| `workout/styles.css` | Colors, phone layout and desktop layout. |
| `workout/app.mjs` | The two pages, editor and account workflow. |
| `workout/core.mjs`, `store.mjs`, `cloud.mjs` | Repeat logic, local saving and Firebase synchronization. |
| `dist/` | Generated public assets. Do not edit this folder directly. |
| `bazi-web/`, `functions/`, old setup documents | Retained calendar source; not part of the FORM build. |

## Developer checks

Open a terminal in the `website` folder:

```powershell
npm test
npm run build
npm start
```

`npm test` checks recurrence, date arithmetic, separate account storage, history snapshots, backups, deleted-record reconciliation and storage errors. `npm run build` creates a fresh `dist/` from an explicit list of public assets; private files, backups, tests and old calendar files are excluded.

Browser checks use Playwright with an installed Chromium browser (`npm run test:browser`). They cover phone/desktop flows, offline app reload and simulated account synchronization without real credentials or production data. This is optional for day-to-day use. See the command's output if that developer dependency is absent.

### Common problems

| What you see | What to do |
| --- | --- |
| “node is not recognized” | Install Node.js LTS, close the terminal, and reopen `preview.bat`. |
| `localhost` does not load | Keep the preview terminal open. If port 4173 is busy, stop the earlier preview first. |
| Missing/insufficient Firebase permissions | Publish the entire updated `firestore.rules`, then choose Retry sync. |
| Sign-in is not allowed | Enable Email/Password in Firebase Authentication. |
| Different journal after signing in | Device and account journals are separate. Use Copy device workouts to my account if desired. |
| Phone cannot open localhost | Open the published GitHub Pages URL instead. |
| An old design is still visible | Refresh. For an installed app, close and reopen it while online, then refresh once more. |
| Import is rejected | Use a FORM backup exported from this app, not an old calendar export. |

No live repository upload, Firebase rule publication, or signed-in cross-device test is implied by a local build. Those actions require access to your chosen GitHub repository and Firebase console.
