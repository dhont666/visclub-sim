# 🚀 SNELSTART - Website Online Zetten

**Voor beginners - In 10 stappen je website live!**

---

## ⏱️ Geschatte Tijd: 30-60 minuten

---

## STAP 1: Controleer je Belgian Hosting Account

Je hebt nodig:
- [ ] cPanel login URL (krijg je van Belgian Hosting)
- [ ] Gebruikersnaam
- [ ] Wachtwoord
- [ ] Domeinnaam (bijv. `visclubsim.be`)

**✅ Heb je dit? Ga naar stap 2!**

---

## STAP 2: Login op cPanel

1. Open je browser
2. Ga naar je cPanel URL (meestal `https://jouwdomein.be/cpanel`)
3. Log in met je gebruikersnaam en wachtwoord
4. Je ziet nu het cPanel dashboard

**Screenshot locatie:** Zoek naar "File Manager" icoon

---

## STAP 3: Open File Manager

1. Klik op **"File Manager"** in cPanel
2. Een nieuw venster opent
3. Je ziet links een directory structuur
4. Klik op **`public_html`** (of `www`)

**💡 TIP:** `public_html` is de root van je website - wat hier staat is zichtbaar op internet!

---

## STAP 4: Verwijder Default Bestanden (indien aanwezig)

In `public_html` zie je mogelijk:
- `index.html` of `index.php` (Belgian Hosting placeholder)
- `cgi-bin` directory (laat staan!)

**Verwijder ALLEEN:**
- [ ] `index.html` (als het een placeholder is)
- [ ] `default.html`
- [ ] Andere placeholder bestanden

**NIET verwijderen:** `.htaccess`, `cgi-bin`, `.well-known`

---

## STAP 5: Upload Je Website

**Methode 1: Upload Button (Eenvoudig)**

1. Klik op **"Upload"** bovenaan in File Manager
2. Sleep deze bestanden naar de upload zone:

**Vanuit je project directory upload:**
```
✓ index.html
✓ home.html
✓ kalender.html
✓ klassement.html
✓ inschrijven.html
✓ inschrijvingen.html
✓ leden.html
✓ visvergunning.html
✓ contact.html
✓ weer.html
✓ gallerij.html
✓ route.html
✓ style.css
✓ script.js
✓ klassement-data.js
✓ vijverkaart.js
✓ .htaccess (belangrijk!)
✓ contact-handler.php (voor contact formulier)
```

3. Upload ook de **directories:**
```
✓ admin/ (hele directory)
✓ images/ (hele directory)
✓ assets/ (indien aanwezig)
```

**💡 TIP:** Je kunt meerdere bestanden tegelijk slepen!

**Methode 2: ZIP Upload (Sneller voor grote sites)**

1. Pak lokaal al je bestanden in een ZIP:
   - Selecteer ALLE bestanden (niet de parent directory!)
   - Rechtsklik → "Compress to ZIP"
   - Naam: `website.zip`

2. Upload `website.zip` via File Manager

3. Klik rechts op `website.zip` → **"Extract"**

4. Kies `public_html` als locatie

5. Klik **"Extract Files"**

6. Verwijder daarna `website.zip` (rechts klik → Delete)

---

## STAP 6: Controleer Bestandsstructuur

In `public_html` moet je nu zien:

```
public_html/
├── .htaccess ✓
├── index.html ✓
├── home.html ✓
├── kalender.html ✓
├── ... (alle HTML bestanden)
├── style.css ✓
├── script.js ✓
├── contact-handler.php ✓
├── admin/ ✓
│   ├── login.html
│   ├── index.html
│   └── ... (alle admin bestanden)
└── images/ ✓
    └── ... (alle afbeeldingen)
```

**Missen er bestanden? Upload ze opnieuw!**

---

## STAP 7: Configureer Contact Formulier

**Bewerk `contact-handler.php`:**

1. In File Manager, rechtsklik op `contact-handler.php`
2. Klik **"Edit"**
3. Zoek deze regels (ongeveer regel 15-20):

```php
define('ADMIN_EMAIL', 'info@jouwvisclub.be'); // WIJZIG DIT!
define('FROM_EMAIL', 'noreply@jouwdomein.be'); // WIJZIG DIT!
```

4. **Wijzig naar JOUW email adressen:**

```php
define('ADMIN_EMAIL', 'info@visclubsim.be'); // Waar berichten naartoe gaan
define('FROM_EMAIL', 'noreply@visclubsim.be'); // Afzender adres
```

5. Klik **"Save Changes"** (rechts boven)

6. Sluit de editor

---

## STAP 8: Installeer SSL Certificaat (HTTPS)

**Gratis SSL met Let's Encrypt:**

1. Ga terug naar cPanel hoofdpagina
2. Zoek **"SSL/TLS Status"** (of "AutoSSL")
3. Klik erop
4. Klik **"Run AutoSSL"**
5. Wacht 1-2 minuten
6. Refresh de pagina
7. Je domein moet nu een groen vinkje hebben ✓

**💡 Als AutoSSL niet werkt:**
- Check of je domein correct gekoppeld is
- Wacht 24 uur na domein registratie
- Neem contact op met Belgian Hosting support

---

## STAP 9: Test Je Website!

**Open in een NIEUWE browser tab:**

1. Ga naar: `https://jouwdomein.be`
   - (Vervang `jouwdomein.be` met je echte domein!)

2. **Check deze dingen:**
   - [ ] Website laadt (geen errors)
   - [ ] "Secure" slotje in adresbalk (HTTPS werkt)
   - [ ] Navigatie werkt (klik op menu items)
   - [ ] Afbeeldingen laden
   - [ ] Kalender toont competities
   - [ ] Contact formulier bestaat

**Als de website NIET laadt:**
- Check of domein DNS correct is
- Wacht 24-48 uur na DNS wijziging
- Check of bestanden in `public_html` staan (niet in subdirectory)

---

## STAP 10: Test Admin Panel

1. Ga naar: `https://jouwdomein.be/admin/login.html`

2. Login met:
   - **Username:** `admin`
   - **Password:** `admin123`

3. Je moet nu het admin dashboard zien

**⚠️ BELANGRIJK - Wijzig Admin Wachtwoord:**

Momenteel gebruikt iedereen het default wachtwoord!

**Om wachtwoord te wijzigen:**

1. Open `admin/login.html` in File Manager → Edit
2. Zoek deze sectie (ongeveer regel 150-160):

```javascript
const validUsers = {
    'admin': 'admin123',      // WIJZIG DIT!
    'visclub': 'visclub2026'  // WIJZIG DIT!
};
```

3. Wijzig naar sterke wachtwoorden:

```javascript
const validUsers = {
    'admin': 'jouw_sterke_wachtwoord_hier',
    'visclub': 'ander_sterk_wachtwoord'
};
```

4. Save & sluit

**✅ Test opnieuw met nieuwe wachtwoorden!**

---

## 🎉 GEFELICITEERD - Je Website is Live!

### Laatste Checks:

- [ ] Website laadt op https://jouwdomein.be
- [ ] Alle pagina's bereikbaar
- [ ] Admin panel werkt
- [ ] Contact formulier geconfigureerd
- [ ] SSL certificaat actief (groen slotje)
- [ ] Admin wachtwoord gewijzigd

---

## 📱 Test op Mobiel

Open je website op:
- [ ] Smartphone
- [ ] Tablet
- [ ] Verschillende browsers (Chrome, Safari, Firefox)

---

## 🔄 Volgende Stappen

**1. Maak Backup:**
   - cPanel → Backup → Download Full Backup

**2. Monitoring:**
   - Test wekelijks of website nog werkt
   - Check maandelijks SSL certificaat (vernieuwt automatisch)

**3. Content Updates:**
   - Nieuwe competities toevoegen
   - Klassement updaten
   - Foto's uploaden

**4. Deel Website:**
   - Email naar alle leden
   - Post op social media
   - Update visitekaartjes met URL

---

## 🆘 Hulp Nodig?

### Website laadt niet:
1. Check DNS instellingen bij domein registrar
2. Wacht 24-48 uur na DNS wijziging
3. Clear browser cache (Ctrl+F5)

### SSL werkt niet:
1. Force refresh: Ctrl+Shift+R
2. Run AutoSSL opnieuw in cPanel
3. Wacht 1-2 uur

### Contact formulier werkt niet:
1. Check `contact-handler.php` email adressen
2. Test PHP mail functie in cPanel
3. Check spam folder voor test emails

### Admin panel werkt niet:
1. Check browser console voor errors (F12)
2. Verifieer `USE_LOCAL_MODE = true` in bestanden
3. Clear browser cache en cookies

---

## 📞 Support Contacten

**Belgian Hosting Support:**
- Login op cPanel → Support Tickets
- Email: support@belgianhosting.be (voorbeeld)

**Website Issues:**
- Check DEPLOYMENT_NL.md voor gedetailleerde troubleshooting

---

## ✨ Success Tips

✓ Maak wekelijks een backup
✓ Test updates eerst lokaal
✓ Houd wachtwoorden veilig
✓ Monitor website uptime
✓ Update regelmatig content

---

**Datum online gezet:** ____ / ____ / 2025

**Website URL:** https://_____________________

**Admin URL:** https://_____________________/admin/

**Notities:**
_________________________________________________________________________
_________________________________________________________________________
