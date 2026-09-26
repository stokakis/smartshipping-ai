# 📦 SmartShipping AI — Πλήρης Οδηγός Χρήσης & Τεχνική Ανάλυση (User & Technical Manual)

> **PrestaShop 1.7 / 8.x Carrier Module with Gemini AI Volumetric Classification & Volume Absorption Matrix™**

---

## 📑 Πίνακας Περιεχομένων

1. [Εισαγωγή & Φιλοσοφία (Το Πρόβλημα του Shipping Shock)](#1-εισαγωγή--φιλοσοφία)
2. [Οι 4 Ογκομετρικές Κλάσεις (Volumetric Classes)](#2-οι-4-ογκομετρικές-κλάσεις)
3. [Οι 5 Μαθηματικοί Κανόνες του Αλγορίθμου (Volume Absorption Matrix™)](#3-οι-5-μαθηματικοί-κανόνες-του-αλγορίθμου)
4. [Αναλυτικός Οδηγός Χρήσης ανά Καρτέλα (Tabs 1 - 5)](#4-αναλυτικός-οδηγός-χρήσης-ανά-καρτέλα)
   - [Tab 1: Phase 1 — Module & DB Overview (Διαδραστικό Flowchart)](#tab-1-phase-1--module--db-overview)
   - [Tab 2: Phase 2 — Live Simulator (Προσομοιωτής Καλαθιού)](#tab-2-phase-2--live-simulator)
   - [Tab 3: Phase 3 — Back-Office Admin (Διαχείριση, CSV, AI Sandbox, Couriers)](#tab-3-phase-3--back-office-admin)
   - [Tab 4: Phase 4 — Front-Office Hook (Dynamic Upselling Banner)](#tab-4-phase-4--front-office-hook)
   - [Tab 5: Unit Tests (15 PHPUnit Automated Scenarios)](#tab-5-unit-tests)
5. [Οδηγός Εγκατάστασης στο PrestaShop (Step-by-Step)](#5-οδηγός-εγκατάστασης-στο-prestashop)
6. [Εξαγωγή & Μαζική Εισαγωγή CSV (Bulk CSV Import/Export)](#6-εξαγωγή--μαζική-εισαγωγή-csv)
7. [Πραγματικά Παραδείγματα Υπολογισμού (Case Studies)](#7-πραγματικά-παραδείγματα-υπολογισμού)
8. [Σύνδεση μέσω PrestaShop 1.7 / 8.x WebService (Live Bridge)](#8-σύνδεση-μέσω-prestashop-17--8x-webservice-live-bridge)
9. [Συνοπτική Τεχνική Τεκμηρίωση Κώδικα](#9-συνοπτική-τεχνική-τεκμηρίωση-κώδικα)

---

## 1. Εισαγωγή & Φιλοσοφία

### Το Πρόβλημα στα Κλασικά E-commerce Καταστήματα:
Στα περισσότερα e-shops, όταν ένας πελάτης τοποθετεί στο καλάθι του έναν μεγάλο καναπέ, μία καρέκλα και δύο διακοσμητικά κεριά, το σύστημα προσθέτει τα μεταφορικά γραμμικά:
$$\text{Κόστος} = 79€ \text{ (Καναπές)} + 35€ \text{ (Καρέκλα)} + 5€ \text{ (Κερί 1)} + 5€ \text{ (Κερί 2)} = 124€$$

Αυτό το φαινόμενο (**Shipping Shock**) οδηγεί σε άμεση εγκατάλειψη καλαθιού (cart abandonment > 65%), διότι στην πραγματικότητα η μεταφορική εταιρεία τοποθετεί τα κεριά και τα μικρά αντικείμενα **μέσα στα φυσικά κενά της συσκευασίας του καναπέ** πάνω στην παλέτα, χωρίς επιπλέον κόστος χώρου.

### Η Λύση: Volume Absorption Matrix™
Το **SmartShipping AI** εισάγει τη λογική της **φυσικής απορρόφησης όγκου** (Dimensional Buffer Absorption):
- Το μεγαλύτερο αντικείμενο αναλαμβάνει τον ρόλο του **Cart Leader**.
- Τα μικρότερα αντικείμενα **απορροφώνται μερικώς ή κατά 100% ΔΩΡΕΑΝ**.
- Ο πελάτης βλέπει άμεσα το κέρδος του, ενθαρρύνοντας το cross-selling και αυξάνοντας δραστικά τη μέση αξία παραγγελίας (**Average Order Value - AOV**).

---

## 2. Οι 4 Ογκομετρικές Κλάσεις

Κάθε προϊόν στο κατάστημα ανήκει σε μία από τις 4 ογκομετρικές κλάσεις:

| Κλάση | Όνομα & Κατηγορία | Βασική Τιμή | Τυπικά Όρια Βάρους & Όγκου | Ρόλος Απορρόφησης (Absorption Role) | Παραδείγματα Προϊόντων |
|:---:|:---|:---:|:---|:---|:---|
| **Class 1** | **Small Decor & Accessories** | **€5.00** | $< 3.0\text{ kg}$, $< 0.05\text{ m}^3$ | **100% Απορροφήσιμο**: Χωράει σε κενά μεγαλύτερων επίπλων. | Μαξιλάρια, κεριά, βάζα, επιτραπέζια διακοσμητικά, ριχτάρια. |
| **Class 2** | **Small Furniture & Lighting** | **€15.00** | $3.0 - 15.0\text{ kg}$, $0.05 - 0.25\text{ m}^3$ | **Parcel / Medium Buffer**: Απορροφάται δωρεάν από Class 4. | Κομοδίνα, φωτιστικά δαπέδου, καθρέφτες, σκαμπό. |
| **Class 3** | **Medium Furniture** | **€35.00** | $15.0 - 40.0\text{ kg}$, $0.25 - 0.80\text{ m}^3$ | **Cart Leader**: Απορροφά δωρεάν όλα τα Class 1 αντικείμενα. | Καρέκλες τραπεζαρίας, πολυθρόνες, γραφεία, χαμηλά τραπέζια. |
| **Class 4** | **Bulky Freight / Sofas** | **€79.00** | $\ge 40.0\text{ kg}$ ή $\ge 0.80\text{ m}^3$ ή διάσταση $> 200\text{ cm}$ | **Top Cart Leader**: Απορροφά 100% δωρεάν τα Class 1 και Class 2! | 3θέσιοι καναπέδες, τραπεζαρίες, ντουλάπες, κρεβάτια. |

---

## 3. Οι 5 Μαθηματικοί Κανόνες του Αλγορίθμου

Όταν καλείται η μέθοδος `getOrderShippingCost($cart, $shipping_cost)` στο PrestaShop:

1. **Ανάπτυξη Καλαθιού (Cart Flattening):**  
   Αν ένα προϊόν έχει ποσότητα 3, αναπτύσσεται σε 3 ξεχωριστές οντότητες (Items #1, #2, #3).
2. **Εκλογή Αρχηγού (Cart Leader Election):**  
   Το αντικείμενο με το μεγαλύτερο `id_class` (και σε ισοβαθμία με τη μεγαλύτερη βασική τιμή) ορίζεται ως Leader:
   $$\text{Running Cost} = \text{Leader Base Price}$$
3. **Εφαρμογή Κανόνων στα Υποδεέστερα Αντικείμενα (Items $2 \dots N$):**

### 🔹 Κανόνας A: $\Delta\text{Class} \ge 2 \implies 100\%\ \text{Free Absorption (+€0.00)}$
Αν η κλάση του αντικειμένου είναι τουλάχιστον 2 επίπεδα χαμηλότερη από τον Leader (π.χ. Class 1 ή Class 2 κάτω από Class 4, ή Class 1 κάτω από Class 3):
$$\text{Επιπλέον Κόστος} = +0.00€$$
*Αιτιολογία: Το προϊόν τοποθετείται στα φυσικά κενά της παλέτας/συσκευασίας.*

### 🔹 Κανόνας B: $\text{Leader} = 4 \ \& \ \text{Item} = 3 \implies \text{Flat Pallet Neighbor Fee (+€10.00)}$
Όταν ο Leader είναι Καναπές (Class 4) και το επόμενο έπιπλο είναι Πολυθρόνα/Τραπέζι (Class 3):
$$\text{Επιπλέον Κόστος} = +10.00€ \quad (\text{αντί για } 35.00€)$$
*Αιτιολογία: Συνδυασμός στην ίδια παλέτα μεταφοράς βαρέων φορτίων.*

### 🔹 Κανόνας C: $\text{Same Class (Co-Leader)} \implies 40\%\ \text{Leader Base Rate}$
Αν προστεθεί δεύτερο προϊόν της **ίδιας μέγιστης κλάσης** (π.χ. 2ος καναπές Class 4 ή 2η πολυθρόνα Class 3):
$$\text{Επιπλέον Κόστος} = 0.40 \times \text{Leader Base Price}$$
*(π.χ. για 2ο καναπέ: $0.40 \times 79€ = +31.60€$, προσφέροντας 60% έκπτωση στο 2ο έπιπλο).*

### 🔹 Κανόνας D: $\Delta\text{Class} = 1 \implies 30\%\ \text{Subordinated Item Base Rate}$
Για γειτονικές μη-ογκώδεις κλάσεις (π.χ. Class 2 φωτιστικό κάτω από Class 3 καρέκλα):
$$\text{Επιπλέον Κόστος} = 0.30 \times \text{Item Base Price}$$
*(π.χ. για φωτιστικό Class 2: $0.30 \times 15€ = +4.50€$).*

### 🔹 Κανόνας E: Γεωγραφικός Πολλαπλασιαστής Ζώνης (Geo-Zone Multiplier)
$$\text{Τελικά Μεταφορικά} = \text{round}\Big(\sum \text{Costs} \times \text{Zone Multiplier} + \text{Ferry Surcharge}, 2\Big)$$

- **Zone 1 (Mainland / Αττική & Κεντρική Ελλάδα):** Multiplier **1.00x** (Surcharge: 0€)
- **Zone 2 (Regional / Επαρχία & Περιφέρεια):** Multiplier **1.15x** (Surcharge: Class 4 +12€)
- **Zone 3 (Islands / Αιγαίο & Ιόνιο):** Multiplier **1.40x** (Surcharge: Class 4 +38€ ναυτιλιακό)
- **Zone 4 (Remote / Δυσπρόσιτες & Ορεινές):** Multiplier **1.65x** (Surcharge: Class 4 +55€)

---

## 4. Αναλυτικός Οδηγός Χρήσης ανά Καρτέλα

### Tab 1: Phase 1 — Module & DB Overview
- **Interactive Decision Tree Flowchart:**  
  Περιηγηθείτε στο διάγραμμα ροής του αλγορίθμου. Κάνοντας κλικ στα κουμπιά σεναρίων (*100% Free Absorption*, *Pallet Neighbor*, *Co-Leader* κ.α.), το διάγραμμα φωτίζει αυτόματα την ακριβή διαδρομή αποφάσεων που παίρνει ο κώδικας PHP.
- **Matrix Table 4x4:**  
  Δισδιάστατος πίνακας που παρουσιάζει το κόστος για κάθε συνδυασμό Leader και Subordinated προϊόντος.
- **SQL Schema Inspector:**  
  Προβολή των εντολών `CREATE TABLE` για τους πίνακες `smartshipping_classes`, `smartshipping_product`, και `smartshipping_geo_zones`.

---

### Tab 2: Phase 2 — Live Simulator (Προσομοιωτής Καλαθιού)
Χρησιμοποιήστε τον προσομοιωτή για να επαληθεύσετε τα μεταφορικά σε πραγματικό χρόνο:
1. **Επιλογή Προϊόντων:**  
   Πατήστε το κουμπί **«+ Add»** δίπλα από τα δείγματα επίπλων (Καναπές Stockholm, Τραπέζι Δρυός, Καρέκλες, Φωτιστικό, Μαξιλάρια κ.λπ.) ή αυξήστε την ποσότητα.
2. **Επιλογή Ταχυδρομικού Κώδικα (Τ.Κ.):**  
   Επιλέξτε ανάμεσα σε:
   - `10431` (Αθήνα / Ηπειρωτική — 1.00x)
   - `26221` (Πάτρα / Περιφερειακή — 1.15x)
   - `84700` (Σαντορίνη / Νησιά — 1.40x + 38€ ferry)
   - `48060` (Ορεινά / Δυσπρόσιτα — 1.65x)
3. **Ζωντανή Ανάλυση (Live Breakdown):**  
   - Βλέπετε ποιο προϊόν κέρδισε τον ρόλο του **Cart Leader**.
   - Βλέπετε αναλυτικά ποια αντικείμενα έγιναν **100% Absorbed (€0.00)**.
   - Βλέπετε το κουτί **«Client Shipping Savings»**, που υπολογίζει πόσα ευρώ γλίτωσε ο πελάτης συγκριτικά με την απλή πρόσθεση.

---

### Tab 3: Phase 3 — Back-Office Admin
Προσομοίωση του πίνακα ελέγχου διαχειριστή (`AdminSmartShippingAIController`):
1. **Διαχείριση Προϊόντων (HelperList):**
   - **Άμεση Έγκριση (One-Click AJAX):** Πατήστε στο badge κατάστασης για να αλλάξετε ένα προϊόν από `Pending Review` σε `Approved`.
   - **Αλλαγή Κλάσης:** Επιλέξτε άλλη κλάση (1 - 4) από το dropdown για άμεση επαναβαθμονόμηση.
   - **Παραλλαγές (Combinations):** Πατήστε στο βελάκι ενός προϊόντος για να δείτε και να βαθμονομήσετε διαφορετικές διαστάσεις/χρώματα.
2. **Εξαγωγή & Εισαγωγή CSV (Αναλυτικά στην Ενότητα 6):**  
   Πλήρης εξαγωγή σε αρχείο Excel/CSV και μαζική εισαγωγή νέων αντιστοιχίσεων.
3. **AI Sandbox (Gemini Multimodal Logistics Engine):**
   - Πατήστε το κουμπί **«AI Sandbox»**.
   - Συμπληρώστε διαστάσεις (Μήκος, Ύψος, Βάθος σε cm) και Βάρος (kg).
   - Πατήστε **«Run Gemini Classification»**. Το μοντέλο αναλύει τον κυβισμό, το ογκομετρικό βάρος ($W_{\text{dim}} = \frac{L \times W \times H}{5000}$) και προτείνει αυτόματα την κατάλληλη κλάση με γραπτή αιτιολόγηση!
   - Πατήστε **«Add to Active PrestaShop Catalog»** για να εισαχθεί κατευθείαν στον κατάλογο.
4. **Courier APIs & Webhooks:**
   - Μεταβείτε στο υπο-tab **«Courier APIs & Webhooks»**.
   - Δημιουργήστε voucher (φορτωτική) για ACS, DHL, Speedex ή Γενική Ταχυδρομική.
   - Στείλτε δοκιμαστικό **Webhook event** (`IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`) για να ελέγξετε την άμεση ενημέρωση ιστορικού παραγγελίας.
5. **PrestaShop WebService Live Bridge (Νέο):**
   - Πατήστε το κουμπί **«PrestaShop API Bridge»** για απευθείας σύνδεση με το πραγματικό σας κατάστημα.

---

### Tab 4: Phase 4 — Front-Office Hook
- Εμφανίζει το dynamic Smart Cart Footer Banner (`displayShoppingCartFooter`).
- **Ψυχολογικό Upsell:** Όταν υπάρχει Leader στο καλάθι, το widget ενημερώνει αυτόματα τον αγοραστή:
  > *«Έχετε ήδη καναπέ στο καλάθι σας! Προσθέστε διακοσμητικά μαξιλάρια ή αρωματικά κεριά με εντελώς ΔΩΡΕΑΝ μεταφορικά!»*

---

### Tab 5: Unit Tests
- Περιλαμβάνει τη σουίτα ελέγχου **PHPUnit (15 Test Cases)**.
- Πατήστε **«Run All Unit Tests»** για να τρέξουν ταυτόχρονα όλα τα τεστ για:
  - Απορρόφηση 100%
  - Διπλούς καναπέδες (Co-Leader 40%)
  - Ναυτιλιακά τέλη ferry σε νησιά
  - Καλάθια με μηδενικά ή ακραία βάρη.

---

## 5. Οδηγός Εγκατάστασης στο PrestaShop

### Βήμα 1: Λήψη του Αρχείου Εγκατάστασης (.zip)
1. Στην εφαρμογή, πατήστε το πράσινο κουμπί **«Export Module ZIP»** (στο πάνω δεξί μέρος).
2. Θα παραχθεί και θα κατέβει το αρχείο:
   ```text
   smartshippingai-v1.0.0.zip
   ```

### Βήμα 2: Εγκατάσταση στο PrestaShop Back-Office
1. Συνδεθείτε στο διαχειριστικό σας περιβάλλον (PrestaShop Back-Office).
2. Μεταβείτε στο μενού: **Modules (Πρόσθετα) → Module Manager**.
3. Στο πάνω δεξιά μέρος της οθόνης, πατήστε το κουμπί **«Upload a module»** (Μεταφόρτωση πρόσθετου).
4. Σύρετε και αφήστε το αρχείο `smartshippingai-v1.0.0.zip`.

### Βήμα 3: Αυτόματη Εκτέλεση & Ενεργοποίηση
Μόλις ολοκληρωθεί το upload, το PrestaShop:
- Δημιουργεί αυτόματα τους πίνακες στη βάση δεδομένων μέσω του `sql/install.sql`.
- Καταχωρεί τον νέο Carrier: **«SmartShipping AI - Volumetric Freight»**.
- Συνδέει τα απαραίτητα hooks:
  - `actionCarrierProcess` / `getOrderShippingCost` (Υπολογισμός τιμής)
  - `displayShoppingCartFooter` (Εμφάνιση banner στο καλάθι)
  - `displayBackOfficeHeader` & `actionAdminControllerSetMedia` (Admin scripts)
- Δημιουργεί τη νέα καρτέλα στο μενού διαχείρισης: **Shipping → SmartShipping AI**.

---

## 6. Εξαγωγή & Μαζική Εισαγωγή CSV

### Εξαγωγή Καταλόγου σε CSV (Export):
1. Στο Tab **Phase 3 (Back-Office)**, πατήστε **«Export CSV»**.
2. Κατεβαίνει άμεσα αρχείο με όνομα `smartshipping_volumetric_assignments_YYYY-MM-DD.csv`.
3. Το αρχείο διαθέτει **UTF-8 BOM** ώστε τα ελληνικά και οι ειδικοί χαρακτήρες να ανοίγουν τέλεια στο Microsoft Excel χωρίς αλλοιώσεις.
4. Περιλαμβάνει στήλες: `id_product`, `id_product_attribute`, `reference`, `name`, `width_cm`, `height_cm`, `depth_cm`, `weight_kg`, `volume_m3`, `id_class`, `class_name`, `confidence_score`, `ai_notes`, `is_approved`, `date_upd`.

### Μαζική Εισαγωγή & Ενημέρωση (Bulk Import):
1. Πατήστε **«Import CSV»**.
2. Μπορείτε να:
   - Σύρετε ένα αρχείο `.csv` στην περιοχή μεταφόρτωσης, **ή**
   - Κάνετε άμεση επικόλληση (copy-paste) στη γραμμή κειμένου.
3. Το σύστημα αναγνωρίζει αυτόματα κόμμα (`,`), ερωτηματικό (`;`) και tab (`\t`).
4. Στην καρτέλα **«Preview & Validate»**, βλέπετε πριν την αποθήκευση:
   - Ποια προϊόντα θα αλλάξουν κλάση (π.χ. `Update: C2 ➔ C3`).
   - Ποια παραμένουν ίδια (`Keep Class 4`).
   - Ποια νέα προϊόντα θα προστεθούν αυτόματα (`+ Associate New`).
5. Πατάτε **«Bulk-Update Database»** και η βάση δεδομένων ενημερώνεται άμεσα!

---

## 7. Πραγματικά Παραδείγματα Υπολογισμού (Case Studies)

### 📌 Σενάριο 1: Πλήρες Σαλόνι (Bulky Leader + Δωρεάν Απορρόφηση)
- **Περιεχόμενα Καλαθιού:**
  - 1x Καναπές Stockholm 3-Seater (Class 4, Βασική: 79.00€) $\rightarrow$ **Cart Leader**
  - 1x Φωτιστικό Δαπέδου (Class 2, Βασική: 15.00€) $\rightarrow$ **$\Delta\text{Class} = 2 \implies 0.00€$**
  - 2x Μαξιλάρια Λινά (Class 1, Βασική: 5.00€ έκαστο) $\rightarrow$ **$\Delta\text{Class} = 3 \implies 0.00€$**
  - 1x Αρωματικό Κερί (Class 1, Βασική: 5.00€) $\rightarrow$ **$\Delta\text{Class} = 3 \implies 0.00€$**
- **Προορισμός:** Αθήνα (Zone 1, Multiplier: 1.00x)
- **Υπολογισμός SmartShipping:**
  $$\text{Σύνολο} = (79.00 + 0.00 + 0.00 + 0.00 + 0.00) \times 1.00 = \mathbf{79.00€}$$
- **Παραδοσιακή Χρέωση χωρίς το Module:**
  $$79 + 15 + 5 + 5 + 5 = \mathbf{109.00€}$$
- **Κέρδος Πελάτη:** **30.00€ ΔΩΡΕΑΝ ΜΕΤΑΦΟΡΙΚΑ** (Μηδενικός κίνδυνος εγκατάλειψης καλαθιού!).

---

### 📌 Σενάριο 2: Καναπές + Τραπεζαρία + Καρέκλες σε Νησί (Zone 3)
- **Περιεχόμενα Καλαθιού:**
  - 1x Καναπές (Class 4, Βασική: 79.00€) $\rightarrow$ **Leader**
  - 1x Τραπέζι Δρυός (Class 4, Βασική: 79.00€) $\rightarrow$ **Co-Leader 40% $\implies +31.60€$**
  - 2x Καρέκλες Δρυός (Class 3, Βασική: 35.00€ έκαστη) $\rightarrow$ **Neighbor Fee $\implies 2 \times +10.00€ = +20.00€$**
  - 2x Διακοσμητικά Κεριά (Class 1) $\rightarrow$ **100% Free Absorption $\implies +0.00€$**
- **Προορισμός:** Σαντορίνη (Τ.Κ. 84700 — Zone 3, Multiplier: 1.40x, Class 4 Ferry Surcharge: 38.00€)
- **Υπολογισμός SmartShipping:**
  $$\text{Υποσύνολο} = 79.00 + 31.60 + 20.00 + 0.00 = 130.60€$$
  $$\text{Τελικό Κόστος} = (130.60 \times 1.40) + 38.00 = 182.84 + 38.00 = \mathbf{220.84€}$$
- **Παραδοσιακή Χρέωση:** Ξεπερνούσε τα 360€, ενώ με το SmartShipping AI παραμένει ανταγωνιστική και κερδοφόρα για το κατάστημα.

---

## 8. Σύνδεση μέσω PrestaShop 1.7 / 8.x WebService (Live Bridge)

Η εφαρμογή διαθέτει ενσωματωμένο **Server-Side Secure REST Proxy** που συνδέεται απευθείας με το πραγματικό σας κατάστημα PrestaShop, χωρίς προβλήματα ασφαλείας ή περιορισμούς CORS του browser.

### Πώς να ενεργοποιήσετε το WebService στο PrestaShop:
1. Στο Back-Office του PrestaShop, πηγαίνετε: **Advanced Parameters (Προχωρημένες Παράμετροι) ➔ Webservice**.
2. Ενεργοποιήστε την επιλογή **«Enable PrestaShop Webservice»** (Ενεργοποίηση WebService) σε **ΝΑΙ (YES)**.
3. Πατήστε **«Add new webservice key»** (Προσθήκη νέου κλειδιού webservice).
4. Πατήστε **«Generate»** για να δημιουργηθεί το κλειδί 32 χαρακτήρων.
5. Στον πίνακα δικαιωμάτων (Permissions), ενεργοποιήστε τουλάχιστον τα δικαιώματα **View (GET)** για τα resources:
   - `products`
   - `combinations`
   - `categories`
   - *(Προαιρετικά: `orders`, `carts`, `stock_availables`)*
6. Πατήστε **Save (Αποθήκευση)**.

### Πώς να το δουλέψετε μέσα από το App:
1. Στην καρτέλα **Phase 3: Back-Office**, πατήστε το μπλε κουμπί **«PrestaShop API Bridge»** στη γραμμή εργαλείων.
2. Εισάγετε:
   - **PrestaShop Store URL:** Το domain του καταστήματός σας (π.χ. `https://my-furniture-store.gr`).
   - **WebService API Key:** Το κλειδί 32 χαρακτήρων που δημιουργήσατε.
   - *(Υπάρχει και κουμπί «Fill Demo Store Credentials» για άμεση δοκιμή).*
3. Πατήστε **«Test Connection»**: Το σύστημα επαληθεύει την επικοινωνία, την έκδοση PrestaShop (π.χ. 1.7.8.9) και τα δικαιώματα.
4. Πατήστε **«Import Catalog Products»**:
   - Το app αντλεί αυτόματα τα πραγματικά σας προϊόντα (ID, τίτλο, κωδικό/SKU, βάρος, μήκος, ύψος, βάθος).
   - Εφαρμόζει τον υπολογισμό κυβισμού και αρχικής ογκομετρικής κλάσης.
   - Τα προϊόντα εμφανίζονται άμεσα στον κατάλογο, έτοιμα για AI Batch Classification (Gemini), δοκιμή στο Simulator και εξαγωγή!

---

## 9. Συνοπτική Τεχνική Τεκμηρίωση Κώδικα

| Αρχείο | Ρόλος & Περιγραφή |
|:---|:---|
| `smartshippingai.php` | Κύρια κλάση carrier module. Υλοποιεί την `getOrderShippingCost()`, την εγκατάσταση hooks και την εγγραφή του carrier. |
| `controllers/admin/AdminSmartShippingAIController.php` | Controller διαχείρισης HelperList, έγκρισης AI badges, εξαγωγής/εισαγωγής CSV και AJAX endpoints. |
| `sql/install.sql` | Αυτόματη δημιουργία πινάκων `ps_smartshipping_classes`, `ps_smartshipping_product`, `ps_smartshipping_geo_zones`. |
| `views/templates/hook/shopping_cart_footer.tpl` | Smarty template για το dynamic upsell banner στο checkout. |
| `tests/Unit/SmartShippingShippingCostTest.php` | Πλήρης σουίτα δοκιμών PHPUnit για όλους τους κανόνες απορρόφησης. |
| `server.ts` | Backend REST API & Secure Proxy για Gemini Multimodal, Courier Webhooks και PrestaShop WebService Bridge (`/api/prestashop/*`). |

---

*Δημιουργήθηκε για την πλατφόρμα **PrestaShop 1.7 / 8.x** — SmartShipping AI Logistics Suite.*
