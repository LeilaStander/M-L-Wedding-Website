# Marli & Liam — wedding site setup

This is your full site: free hosting on GitHub Pages, free RSVP backend on
Google Apps Script, live guest search pulled from your own Google Sheet.

There are three things to set up, in this order:

1. The Google Sheet (your guest list)
2. The Apps Script backend (makes the sheet readable/writable from the site)
3. GitHub Pages (puts the site online)

---

## 1. The Google Sheet

Take your existing Excel guest list and open it in Google Sheets
(Drive → right-click the file → **Open with → Google Sheets**), or start
fresh. Rename the tab (bottom-left) to exactly **Guests**.

Set up these exact column headers in row 1:

| ID | PartyID | Name | Attending | RSVPDate | SongRequest | Message |
|----|---------|------|-----------|----------|--------------|---------|
| 1 | SMITH01 | Marli Stander | | | | |
| 2 | SMITH01 | Liam Someone | | | | |
| 3 | JONES01 | Amy Jones | | | | |

- **ID**: any unique number per row (1, 2, 3…)
- **PartyID**: give everyone who RSVPs together the same code — this is
  what lets one person RSVP for the whole party
- **Attending / RSVPDate**: leave blank, the site fills these in
- **SongRequest / Message**: leave blank — these capture the optional
  song request and message-to-the-couple fields on the RSVP form. Since
  they're submitted once per party, the same value is written to every
  guest's row within that party.

---

## 2. The Apps Script backend (free, no request limits)

1. In your Google Sheet, click **Extensions → Apps Script**.
2. Delete anything in the editor and paste in the contents of
   `apps-script/Code.gs` (in this folder).
3. Click **Deploy → New deployment**.
4. Click the gear icon next to "Select type" and choose **Web app**.
5. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Click **Deploy**. Google will ask you to authorize it — approve it
   (you'll see a warning screen since it's your own unverified script,
   click "Advanced" → "Go to project (unsafe)" → Allow).
7. Copy the **Web app URL** it gives you — looks like
   `https://script.google.com/macros/s/AKfycb.../exec`

8. Open `rsvp.js` in this folder, and paste that URL in at the top:
   ```js
   var RSVP_API_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```

If you ever edit `Code.gs` later, you need to **Deploy → Manage deployments →
edit (pencil icon) → New version → Deploy** for the changes to take effect.

---

## 2b. Set your site password

Open `gate.js` in this folder and set your password near the top:

```js
var GATE_PASSWORD = "REPLACE_WITH_YOUR_PASSWORD";
```

Guests will need to enter this once before the site content shows. It's
remembered on their device afterward, so they won't be asked again on
future visits (unless they clear their browser data or use a different
device). Send this password out along with the site link on your
invitations.

Note: this is a simple front-door lock, not real account security —
someone determined enough could find the password in the page's source
code. It's mainly there to keep the site out of Google search results
and stop random visitors, not to withstand a targeted attempt to get in.

---

## 3. Put the site on GitHub Pages (free)

1. Go to [github.com](https://github.com) and create a free account if you
   don't have one.
2. Click the **+** in the top right → **New repository**.
   - Name it something like `wedding` (this becomes part of your URL)
   - Set it to **Public**
   - Click **Create repository**
3. On the new repo page, click **Add file → Upload files**.
4. Drag in every file and folder from this project (`index.html`,
   `styles.css`, `rsvp.js`, `gate.js`, the `images` folder with your real
   photos, and the `apps-script` folder). Commit the changes.
5. Go to **Settings → Pages** (left sidebar).
6. Under "Build and deployment", set **Source** to **Deploy from a branch**,
   branch **main**, folder **/ (root)**. Click **Save**.
7. Wait 1–2 minutes, then refresh — GitHub shows your live URL at the top,
   something like `https://yourusername.github.io/wedding/`.

That's your site, live, for free. Share that link with guests.

### Adding your real photos

Put these five files in the `images` folder, replacing the placeholders,
using these exact names (or edit the `src=` in `index.html` to match
whatever you name them):

- `hero.jpg` — the welcome/top photo
- `venue.jpg` — Country Sjiek venue photo
- `couple-formal.jpg` — the formal portrait
- `couple-farm.jpg` — currently unused, kept in case you want it
- `closing.jpg` — the closing section photo

### Custom domain (optional)

If you want something like `marliandliam.com` instead of the github.io
address: buy the domain from any registrar (Namecheap, Google Domains
successor Squarespace Domains, etc. — around $10–15/year), then in your
repo's **Settings → Pages**, enter it under "Custom domain." GitHub gives
you the DNS records to add at your registrar.

---

## Making changes later

Any time you want to update text, add a photo, or tweak the design —
just tell me what you want changed and I'll give you the updated file(s)
to re-upload to GitHub (drag-and-drop over the old ones, same as before).
