# 🚀 Οδηγός Ανάπτυξης στο Railway.com μέσω GitHub (SmartShipping AI Web App)

> **Πώς να αναπτύξετε την εφαρμογή SmartShipping AI ως αυτόνομη, cloud full-stack εφαρμογή (SaaS/Admin Hub) στο Railway.com.**

---

## 📌 Περίληψη & Αρχιτεκτονική

Η εφαρμογή είναι **ήδη δομημένη ως αυτόνομη Full-Stack εφαρμογή**:
- **Backend:** Node.js + Express (`server.ts`) με REST endpoints για PrestaShop WebService Bridge, Gemini AI Multimodal, Courier APIs, και εξαγωγή Module ZIP.
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS.
- **Production Server:** Το Express σε production mode (`NODE_ENV=production`) σερβίρει αυτόματα τα built assets του φακέλου `dist/` και χειρίζεται όλα τα client-side routes (SPA).
- **Συμβατότητα:** Περιλαμβάνει έτοιμο αρχείο `railway.json` (Nixpacks builder) και εναλλακτικό `Dockerfile`.

---

## 🛠️ Βήμα 1: Ανέβασμα του Κώδικα στο GitHub

Αν δεν έχετε ήδη συνδέσει τον κώδικα με το GitHub:

1. Δημιουργήστε ένα νέο Repository στο προφίλ σας στο [GitHub](https://github.com/new) (π.χ. `smartshipping-ai-prestashop`).
2. Στο τοπικό σας τερματικό:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of SmartShipping AI full-stack applet"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/smartshipping-ai-prestashop.git
   git push -u origin main
   ```

---

## 🚆 Βήμα 2: Σύνδεση & Ανάπτυξη στο Railway.com

1. Επισκεφθείτε το [railway.com](https://railway.com/) και συνδεθείτε (π.χ. με το GitHub λογαριασμό σας).
2. Στο Dashboard, πατήστε **«+ New Project»**.
3. Επιλέξτε **«Deploy from GitHub repo»**.
4. Επιλέξτε το repository που ανεβάσατε (`smartshipping-ai-prestashop`).
5. Το Railway διαβάζει αυτόματα το αρχείο `railway.json`:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start` (τρέχει το `tsx server.ts` και ανοίγει στην πόρτα `$PORT`).

---

## 🔑 Βήμα 3: Ρύθμιση Μεταβλητών Περιβάλλοντος (Environment Variables)

Στην καρτέλα του project σας στο Railway, πηγαίνετε στην ενότητα **Variables** και προσθέστε:

| Variable | Προτεινόμενη Τιμή | Περιγραφή |
|:---|:---|:---|
| `NODE_ENV` | `production` | Ενεργοποιεί τη γρήγορη static διανομή μέσω `dist/` |
| `GEMINI_API_KEY` | *Το δικό σας Google AI Studio API Key* | Για τις λειτουργίες AI Multimodal ταξινόμησης (από [aistudio.google.com](https://aistudio.google.com/app/apikey)) |

*(Σημείωση: Η μεταβλητή `PORT` δημιουργείται και παρέχεται **αυτόματα** από το Railway — ο κώδικάς μας τη διαβάζει άμεσα μέσω του `process.env.PORT`).*

---

## 🌐 Βήμα 4: Δημιουργία Δημόσιου Domain (HTTPS)

1. Στο Railway, επιλέξτε το Service σας και πηγαίνετε στις **Settings**.
2. Στην ενότητα **Networking**, πατήστε **«Generate Domain»** (ή συνδέστε δικό σας Custom Domain, π.χ. `shipping.yourshop.com`).
3. Θα λάβετε ένα έτοιμο, ασφαλές HTTPS URL, όπως:
   ```text
   https://smartshipping-ai-production.up.railway.app
   ```
4. Ανοίξτε το link στον browser: **Η εφαρμογή σας είναι live και πλήρως λειτουργική στο διαδίκτυο 24/7!**

---

## 🔗 Βήμα 5: Σύνδεση με το PrestaShop 1.7 / 8.x από το Railway

Μόλις η εφαρμογή είναι live στο Railway:
1. Ανοίξτε τη live διεύθυνση του Railway στον browser.
2. Μεταβείτε στο **Phase 3: Back-Office Admin**.
3. Πατήστε το μπλε κουμπί **«PrestaShop API Bridge»**.
4. Εισάγετε το URL του καταστήματός σας (`https://your-shop.gr`) και το WebService API Key.
5. Πατήστε **Test Connection** και **Import Catalog Products**.
6. Το Railway backend λειτουργεί ως ασφαλής proxy με δική του σταθερή IP/domain και επικοινωνεί απρόσκοπτα με το PrestaShop σας!

---

## 🔄 Αυτόματο CI/CD (Continuous Deployment)

Κάθε φορά που κάνετε `git push origin main` στο GitHub:
- Το Railway εντοπίζει τις αλλαγές αυτόματα.
- Εκτελεί το `npm run build` και επανεκκινεί την εφαρμογή σε λίγα δευτερόλεπτα χωρίς downtime (zero-downtime rolling update).
