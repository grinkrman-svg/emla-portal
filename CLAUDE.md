# CLAUDE.md — EMLA Portal
# Emergency Medical Logistics Assistant — SOR Chojnice
# Version 3.0 | 2026-03-30
# Język projektu: Polski | Język komunikacji z Roman: Rosyjski

---

## §0 — DUCH PROJEKTU

Jest 3:47 w nocy. Do SOR Chojnice przywieziono pacjenta z rozległymi oparzeniami 60% ciała.
Lekarz dyżurny ma 90 sekund na decyzję: gdzie, jak i kiedy.
Otwiera ten portal.

To nie jest strona internetowa. To jest narzędzie ratunkowe.

Każda decyzja projektowa musi przechodzić przez ten filtr:
**"Czy to pomaga lekarzowi SOR znaleźć właściwy numer w ciągu 10 sekund?"**

Jeśli nie pomaga — nie wchodzi do projektu.
Jeśli spowalnia — jest do usunięcia.
Jeśli jest ozdobą bez funkcji — nie istnieje.

Użytkownik docelowy:
- Lekarz lub pielęgniarka SOR pod presją czasową
- Zna medyczny kontekst, nie potrzebuje wyjaśnień
- Potrzebuje numeru — nie opisu
- Działa w stresie, prawdopodobnie po nocnej zmianie
- Może używać telefonu jedną ręką

Ten portal ma jeden cel: **skrócić czas od decyzji o transferze do pierwszego dzwonienia.**

---

## §1 — PROTOKÓŁ WSPÓŁPRACY Z ROMAN

**Język komunikacji:** wyłącznie rosyjski.
**Język projektu:** wyłącznie polski — UI, dane, etykiety, komentarze w kodzie.

**Zasady współpracy:**

1. **Nie rób nic bez komendy "rób" / "делай".** Jeśli widzisz problem lub możliwość poprawy — opisz jednym zdaniem i poczekaj.

2. **Jeden pomysł na raz.** Nie bombarduj listą sugestii. Jedna obserwacja → pytanie → decyzja → działanie.

3. **Jeśli coś wymaga weryfikacji danych** (np. brakujący numer telefonu) — poinformuj Roman co znalazłeś i co nadal brakuje. Nie uzupełniaj danych z głowy.

4. **Raportuj po każdym etapie.** Co zostało zrobione, co pozostało, czy są blokery.

5. **Pytaj o priorytet** jeśli zadań jest więcej niż jedno. Nigdy nie decyduj samodzielnie co jest ważniejsze.

6. **Przy konflikcie danych** (np. różne numery w różnych źródłach) — zawsze podaj oba źródła i zapytaj które wybrać.

---

## §2 — HIERARCHIA KONTAKTÓW (KLUCZOWA ZASADA)

Każda placówka w tym portalu powinna posiadać kontakty w tej kolejności priorytetów:

```
POZIOM 1 — HERO (najważniejszy, wyróżniony wizualnie)
  → Komórkowy lekarz dyżurny / chirurg dyżurny / anestezjolog dyżurny
    (jeśli numer jest OPUBLIKOWANY na stronie szpitala = to telefon służbowy,
     który dyżurny specjalista nosi przy sobie zawsze. NIE dane osobowe!)
  → Dyżurka lekarska oddziału (bezpośrednia linia)

POZIOM 2 — ZAWSZE WIDOCZNY
  → SOR / Izba Przyjęć szpitala docelowego (24h, lekarz→lekarz)
  → Post pielęgniarski (pielęgniarka może połączyć z lekarzem)
  → Sekretariat oddziału (godz. pracy)

POZIOM 3 — UKRYTY (rozwijany po kliknięciu "Więcej telefonów ▼")
  → Blok operacyjny (gdy lekarz jest w trakcie operacji — ostateczność!)
  → Centrala szpitala (24h) + prośba o połączenie
  → E-mail (tylko jako ostateczność, nie dla ostrych stanów)
```

**Logika priorytetu numerów:**
Jeśli szpital PUBLIKUJE komórkowy dyżurnego specjalisty na swojej stronie →
to jest telefon SŁUŻBOWY, który dyżurny nosi zawsze przy sobie.
To NAJSZYBSZA droga kontaktu: lekarz SOR → specjalista, bez centrali, bez czekania.
Taki numer = POZIOM 1, HERO, wyróżniony na karcie.

Jeśli szpital NIE publikuje komórkowego → HERO = SOR szpitala docelowego.

**Logika działania w portalu:**
Lekarz SOR Chojnice dzwoni na POZIOM 1 (dyżurny specjalista lub SOR docelowy).
Nie odbiera → POZIOM 2 (SOR, post pielęgniarski).
Chirurg w operacji → dopiero wtedy rozwijamy POZIOM 3 (blok operacyjny).

**Zachowanie UI:**
- POZIOM 1 i 2 → **zawsze widoczne** na karcie placówki
- POZIOM 3 → **ukryte** za przyciskiem "Więcej telefonów ▼" (rozwijane po kliknięciu)
- Blok operacyjny to opcja ostateczna — nie bombardujemy chirurga na sali!

### Jak wypełniać braki w danych

Gdy w pliku MD widnieje "DO UZUPEŁNIENIA":

**Krok 1 — Przeszukaj web:**
```
web_search: "[nazwa szpitala] [oddział] telefon dyżurny"
web_search: "[nazwa szpitala] [oddział] numer telefonu kontakt"
web_fetch: strona szpitala → sekcja kontakty / teleadresowa / oddziały
```

**Krok 2 — Sprawdź powiązane bazy:**
```
placowki.mp.pl/[szpital]
nfz.gov.pl (rejestr)
aisn.pl (dla hemodynamiki)
baza-szpitali.pl
```

**Krok 3 — Jeśli nie znaleziono:**
Zostaw "DO UZUPEŁNIENIA" z adnotacją co sprawdzono i kiedy.
NIE wpisuj numerów z pamięci ani założeń.

**Krok 4 — Oznaczenia pewności:**
```
✅ — numer potwierdzony ze strony szpitala lub oficjalnej bazy
⚠️ — numer ze źródła pośredniego (wymaga weryfikacji tel.)
❓ — DO UZUPEŁNIENIA — nie znaleziono online
```

### Format numeru telefonu
- Wyświetlanie: `52 585 42 22` (spacje dla czytelności)
- Link tel:: `tel:+48525854222` (bez spacji, z +48)
- Komórkowe: `695 914 465` → `tel:+48695914465`

---

## §3 — ARCHITEKTURA PLIKÓW

```
emla-portal/
├── CLAUDE.md                          ← ten plik — czytaj przy każdej sesji
├── README.md                          ← opis projektu
├── index.html                         ← dashboard (28 kategorii)
│
├── [28 stron kategorii]               ← patrz lista w §6
│
├── css/
│   └── styles.css                     ← wspólny design system
│
├── js/
│   └── app.js                         ← wspólne funkcje JS
│
└── data/
    ├── all-categories.json            ← dane dla kategorii 1-6 (JSON)
    └── md-sources/                    ← bazy telefonów (MD) dla wszystkich 28
        ├── CENTRA_OPARZEN_TELEFONY.md
        ├── NEUROCHIRURGIA_TELEFONY.md
        ├── CENTRUM_URAZOWE_TELEFONY.md
        ├── KARDIOCHIRURGIA_TELEFONY.md
        ├── ECMO_TELEFONY.md
        ├── HEMODYNAMIKA_PCI_TELEFONY.md
        ├── CHIRURGIA_NACZYNIOWA_TELEFONY.md
        ├── KOMORY_HIPERBARYCZNE_TELEFONY.md
        ├── NEONATOLOGIA_CHIR_DZIECIECA_OKULISTYKA_TELEFONY.md
        ├── CIALA_OBCE_RADIOLOGIA_TRANSPLANTOLOGIA_TELEFONY.md
        └── DEKOMPRESJA_ZMIJA_PLAZMAFEREZA_PE_HIPOTERMIA_TELEFONY.md
```

**Zasada źródeł danych:**
- Kategorie 1-6: dane z `data/all-categories.json` (priorytet)
- Kategorie 7-28: dane parsowane z odpowiednich plików MD
- Dane są osadzane bezpośrednio w każdym pliku HTML jako `const FACILITIES = [...]`
- Portal działa w 100% offline po otwarciu z dysku lokalnego

---

## §4 — WZORZEC PROJEKTOWY

**Plik referencyjny: `centra_oparzen.html`**

To jest złoty standard tego projektu. Wszystkie pozostałe strony kategorii dziedziczą z tego pliku:
- Design tokens (CSS Custom Properties z oklch)
- Ciemny i jasny motyw (`data-theme="dark"`)
- Glass morphism topbar
- Grain overlay
- Scroll progress bar
- Toast notifications
- Card layout z hierarchią telefonów
- Command Palette (Ctrl+K)
- Keyboard shortcuts
- Ripple effect na numerach
- Print single card
- Copy all data
- "dzwoniono HH:MM" timestamp

**NIE zmieniaj estetyki bez polecenia Roman.**
**NIE upraszczaj funkcji istniejących w pliku referencyjnym.**

### Typografia
```
DM Sans          — interfejs, etykiety, opisy
JetBrains Mono   — numery telefonów (ZAWSZE monospace dla numerów!)
```

### System kolorów (oklch)
Zdefiniowany w pliku referencyjnym. Kopiuj tokeny 1:1. Nie wprowadzaj nowych zmiennych kolorów bez potrzeby.

### Ikony
Inline SVG — bez zewnętrznych bibliotek ikon. Portal musi działać offline.

---

## §5 — SCHEMAT DANYCH PLACÓWKI

Każda placówka w JavaScript (`const FACILITIES = [...]`) musi mieć strukturę:

```javascript
{
  id: 1,                                    // liczba całkowita, unikalna w kategorii
  name: "Centrum Leczenia Oparzeń im. dr. S. Sakiela",
  city: "Siemianowice Śląskie",
  voivodeship: "śląskie",
  addr: "ul. Jana Pawła II 2, 41-100 Siemianowice Śląskie",
  distance_km: 420,
  url: "https://clo.com.pl",
  ul: "clo.com.pl",

  transport: {
    heli_min: 115,                          // null jeśli nieznane
    drive_min: 300,                         // null jeśli nieznane
    notes: "Lądowisko: TAK"                 // opcjonalnie
  },

  // KONTAKTY — zgodnie z hierarchią §2
  ph: [                                     // primary phones (POZIOM 1-2) — ZAWSZE WIDOCZNE
    {
      r: "Lekarz dyżurny (chirurg)",        // POZIOM 1 HERO: komórkowy służbowy!
      n: "695 914 465",                     // numer opublikowany na clo.com.pl
      h: true,                              // hero = true → wyróżniony wizualnie
      h24: true,                            // dostępny 24h
      lvl: 1,                               // poziom wg hierarchii §2
      src: "clo.com.pl"                     // źródło
    },
    {
      r: "Izba Przyjęć",                    // POZIOM 2: SOR / IP
      n: "32 735 74 75",
      h: false,
      h24: true,
      lvl: 2,
      src: "clo.com.pl"
    },
    {
      r: "Post pielęgniarski",
      n: "32 735 74 10",
      h: false,
      h24: true,
      lvl: 2,
      src: "clo.com.pl"
    }
  ],

  mo: [                                     // more phones (POZIOM 3) — UKRYTE za "Więcej telefonów ▼"
    {
      r: "Blok operacyjny",                  // ostateczność — chirurg w operacji!
      n: "32 735 74 55",
      h: false,
      h24: false,
      lvl: 3,
      src: "clo.com.pl"
    },
    {
      r: "Centrala (portiernia)",
      n: "32 735 76 96",
      h: false,
      h24: true,
      lvl: 3,
      src: "clo.com.pl"
    }
  ],

  caps: [                                   // możliwości / capabilities
    { t: "OIT oparzeniowy", ok: true },
    { t: "Bank skóry", ok: true },
    { t: "HBO", ok: true },
    { t: "Dzieci", ok: false }
  ],

  badges: ["CU", "Lądowisko", "24h"],       // krótkie badge'e na karcie
  priority: 1,                              // kolejność wyświetlania (1 = pierwsza)

  notes: "Jedyne samodzielne centrum oparzeniowe w Polsce.",
  last_verified: "2026-03-30",
  data_quality: "✅"                        // ✅ / ⚠️ / ❓ wg hierarchii §2
}
```

---

## §6 — 28 STRON KATEGORII

| # | Plik HTML | Kategoria | Źródło danych |
|---|---|---|---|
| 1 | `oparzenia.html` | Centra Oparzeń | JSON + CENTRA_OPARZEN_TELEFONY.md |
| 2 | `neurochirurgia.html` | Neurochirurgia | JSON + NEUROCHIRURGIA_TELEFONY.md |
| 3 | `centrum-urazowe.html` | Centrum Urazowe | JSON + CENTRUM_URAZOWE_TELEFONY.md |
| 4 | `udar-trombektomia.html` | Udar / Trombektomia | JSON |
| 5 | `kardiochirurgia.html` | Kardiochirurgia | JSON + KARDIOCHIRURGIA_TELEFONY.md |
| 6 | `ecmo.html` | ECMO | JSON + ECMO_TELEFONY.md |
| 7 | `hemodynamika-pci.html` | Hemodynamika / PCI | HEMODYNAMIKA_PCI_TELEFONY.md |
| 8 | `toksykologia.html` | Toksykologia kliniczna | CIALA_OBCE_...md (sekcja PCT) |
| 9 | `komory-hiperbaryczne.html` | Komory hiperbaryczne | KOMORY_HIPERBARYCZNE_TELEFONY.md |
| 10 | `replantacja.html` | Replantacja | CENTRA_OPARZEN + NEUROCHIRURGIA (sekcje replantacja) |
| 11 | `chirurgia-naczyniowa.html` | Chirurgia naczyniowa | CHIRURGIA_NACZYNIOWA_TELEFONY.md |
| 12 | `neonatologia.html` | Neonatologia | NEONATOLOGIA_...md (sekcja 1) |
| 13 | `chirurgia-dziecieca.html` | Chirurgia dziecięca | NEONATOLOGIA_...md (sekcja 2) |
| 14 | `okulistyka.html` | Okulistyka nagła | NEONATOLOGIA_...md (sekcja 3) |
| 15 | `psychiatria.html` | Psychiatria nagła | brak MD → web_search |
| 16 | `choroby-zakazne.html` | Choroby zakaźne | brak MD → web_search |
| 17 | `chirurgia-szczekowa.html` | Chirurgia szczękowo-twarzowa | brak MD → web_search |
| 18 | `torakochirurgia.html` | Torakochirurgia | CIALA_OBCE_...md (sekcja UCK Gdańsk) |
| 19 | `urologia.html` | Urologia nagła | brak MD → web_search |
| 20 | `ginekologia.html` | Ginekologia / Położnictwo | brak MD → web_search |
| 21 | `ciala-obce.html` | Ciała obce w drogach odd. | CIALA_OBCE_...md (sekcja 1) |
| 22 | `radiologia-interwencyjna.html` | Radiologia interwencyjna | CIALA_OBCE_...md (sekcja 2) |
| 23 | `transplantologia.html` | Transplantologia | CIALA_OBCE_...md (sekcja 3) |
| 24 | `choroba-dekompresyjna.html` | Choroba dekompresyjna | DEKOMPRESJA_...md (sekcja 1) |
| 25 | `ukaszenie-zmiji.html` | Ukąszenie żmiji | DEKOMPRESJA_...md (sekcja 2) |
| 26 | `plazmafereza.html` | Plazmafereza / TTP / HUS | DEKOMPRESJA_...md (sekcja 3) |
| 27 | `masywna-pe.html` | Masywna zatorowość płucna | DEKOMPRESJA_...md (sekcja 4) |
| 28 | `ciezka-hipotermia.html` | Ciężka hipotermia | DEKOMPRESJA_...md (sekcja 5) |

### Jak parsować pliki MD

Każdy plik MD ma sekcje nagłówkowe (`## 1. NAZWA`, `## 2. NAZWA`).
Tabele telefonów mają format: `| Funkcja | Numer | Źródło |`

Algorytm parsowania:
1. Podziel plik po `##` → sekcje placówek
2. Wyciągnij nazwę, miasto, adres z nagłówka sekcji
3. Wyciągnij telefony z tabel `| Funkcja | Numer |`
4. Mapuj "Funkcja" na poziom hierarchii kontaktów (§2)
5. Wyciągnij możliwości z list "Możliwości" lub "TAK/NIE"
6. Wyciągnij odległości z tabel "Odległości" lub z tekstu "~X km"
7. Osadź dane jako `const FACILITIES = [...]` w HTML

---

## §7 — WZBOGACANIE BAZ MD (ENRICHMENT PROTOCOL)

**Cel:** Każda placówka powinna mieć kompletną hierarchię kontaktów (§2).
Gdy widzisz "DO UZUPEŁNIENIA" — podejmij próbę znalezienia numeru.

### Kolejność działań dla każdego brakującego numeru:

```
1. web_fetch: oficjalna strona szpitala → zakładka "Kontakt" / "Teleadresowy" / "Oddziały"
2. web_fetch: placowki.mp.pl/[id-szpitala]
3. web_search: "[nazwa szpitala] [nazwa oddziału] telefon"
4. web_search: "[nazwa szpitala] [miasto] oddział [specjalność] numer"
5. web_fetch: bip.[szpital].pl lub nfz.gov.pl/rejestr
```

### Co szukać dla każdego oddziału:

| Czego szukasz | Polskie frazy do szukania |
|---|---|
| Lekarz dyżurny | "dyżurny", "lekarz dyżurny", "chirurg dyżurny", "telefon alarmowy" |
| Post pielęgniarski | "post pielęgniarski", "stanowisko pielęgniarek", "pielęgniarka koordynująca" |
| Blok operacyjny | "blok operacyjny", "sala operacyjna", "nadzór bloku" |
| Izba przyjęć | "izba przyjęć", "izba przyjęć oddziałowa", "wejście" |

### Jak zaktualizować plik MD po znalezieniu numeru:

Dodaj numer do odpowiedniej tabeli w pliku MD:
```markdown
| **Dyżurka lekarska** | **52 XXX XX XX** | placowki.mp.pl ✅ |
```

Zmień status z "DO UZUPEŁNIENIA" na znaleziony numer.
Dodaj adnotację `*(znaleziono: 2026-03-30)*` jeśli numer nie był w oryginale.

### Raport braków

Po zakończeniu enrichmentu każdej kategorii — wygeneruj raport:
```
Kategoria: [NAZWA]
Placówek: X
Numery uzupełnione: Y
Nadal brakuje: Z
  - [Placówka A]: brak dyżurki lekarskiej, bloku operacyjnego
  - [Placówka B]: brak postu pielęgniarskiego
```

---

## §8 — DASHBOARD (index.html)

### Header
- Logo SOR badge (czerwone tło, biały tekst "SOR")
- Tekst: "Szpital im. J.K. Łukowicza, Chojnice"
- Theme toggle + Fullscreen toggle

### Pasek wyszukiwania
- Pełna szerokość
- Placeholder: `Szukaj kategorii... (np. oparzenia, udar, ECMO)`
- Filtruje karty w czasie rzeczywistym
- Normalizacja polskich znaków (ą→a, ę→e, ó→o, itd.)
- Skrót: `/` lub `Ctrl+K`

### Siatka kategorii (28 kart)
- CSS Grid: `auto-fill, minmax(260px, 1fr)`
- Każda karta: emoji + nazwa + opis jednolinijkowy + liczba placówek

### Pasek LPR (sticky bottom)
- Background: `oklch(0.5 0.22 300)` (fioletowy)
- "LPR Centrum Operacyjne: 2222 99999" — klikalny tel:
- "Zgłoś lot →" link do ezt.lpr.com.pl
- Widoczny zawsze, na każdej stronie

---

## §9 — WSPÓLNY KOD (css/styles.css i js/app.js)

### css/styles.css musi zawierać:
Cały design system z pliku referencyjnego (`centra_oparzen.html`) wyekstrahowany do osobnego pliku.
Każda strona kategorii linkuje ten plik: `<link rel="stylesheet" href="css/styles.css">`

### js/app.js musi zawierać:
```javascript
initTheme()           // ciemny/jasny + auto-dark 22:00-06:00 + localStorage
initSearch(D)         // filtrowanie + normalizacja polskich znaków
initKeyboard()        // /, Escape, 1-9, Ctrl+K
copyPhone(n, el, evt) // kopia + ripple + timestamp "dzwoniono HH:MM"
copyAll(id)           // kopia wszystkich danych placówki
printCard(id)         // drukowanie jednej karty (nowe okno)
initFullscreen()      // F11
showToast(msg)        // toast notification
goToCard(n)           // scroll + highlight karty
initScrollProgress()  // pasek postępu scrollowania
```

Każda strona kategorii linkuje: `<script src="js/app.js"></script>`

---

## §10 — KOLEJNOŚĆ WYKONANIA

```
ETAP 1 — FUNDAMENT
  1a. Wzbogać pliki MD (§7) — szukaj brakujących numerów
  1b. Stwórz css/styles.css (wyekstrahuj z centra_oparzen.html)
  1c. Stwórz js/app.js (wyekstrahuj z centra_oparzen.html)

ETAP 2 — DASHBOARD
  2a. Stwórz index.html

ETAP 3 — STRONY KATEGORII (w kolejności priorytetu medycznego)
  Fala 1 (dane kompletne w JSON): oparzenia, neurochirurgia, centrum-urazowe,
          udar-trombektomia, kardiochirurgia, ecmo
  Fala 2 (dane z MD): hemodynamika-pci, komory-hiperbaryczne, chirurgia-naczyniowa,
          neonatologia, chirurgia-dziecieca, ecmo, transplantologia,
          ciala-obce, radiologia-interwencyjna
  Fala 3 (dane z MD — złożone): choroba-dekompresyjna, ukaszenie-zmiji,
          plazmafereza, masywna-pe, ciezka-hipotermia
  Fala 4 (web_search wymagany): toksykologia, replantacja, okulistyka,
          psychiatria, choroby-zakazne, chirurgia-szczekowa,
          torakochirurgia, urologia, ginekologia, chirurgia-szczekowa

ETAP 4 — WALIDACJA
  Sprawdź checklist §11 dla każdej strony
```

---

## §11 — CHECKLIST JAKOŚCI

Przed uznaniem strony za gotową — sprawdź każdy punkt:

```
DANE
□ Wszystkie placówki z pliku MD/JSON są na stronie
□ Każda placówka ma przynajmniej POZIOM 2 kontaktu (§2)
□ Numery telefonów są klikalne (tel: linki z +48)
□ Odległości i czasy transportu są podane
□ Możliwości/capabilities są wyświetlone

FUNKCJE
□ Wyszukiwanie filtruje karty w czasie rzeczywistym
□ Polskie znaki normalizowane (ą→a, łódź=lodz)
□ Kliknięcie numeru → kopiuje do schowka + "dzwoniono HH:MM"
□ "Kopiuj wszystko" → pełne dane placówki
□ "Drukuj" → otwiera okno druku jednej karty
□ Powrót do dashboardu (breadcrumb lub przycisk)

DESIGN
□ Ciemny i jasny motyw działają poprawnie
□ Auto-dark między 22:00 a 06:00
□ Motyw zapisywany w localStorage
□ LPR bar widoczny na dole
□ Scroll progress bar na górze

DOSTĘPNOŚĆ I OFFLINE
□ Brak zewnętrznych zależności (oprócz Google Fonts)
□ Strona działa po otwarciu z dysku lokalnego (file://)
□ Responsywna: 375px, 768px, 1280px
□ Brak poziomego scrolla na mobile
□ Brak błędów w konsoli JS
□ Wszystkie teksty w języku polskim
```

---

## §12 — STATUS PROJEKTU (aktualizowany co sesję)

### Stan na: 2026-03-30

**Gotowe:**
- [x] CLAUDE.md v4.0 (§0-§14 kompletne)
- [x] README.md (zaktualizowany)
- [x] Plik referencyjny: `centra_oparzen.html` (wzorzec designu)
- [x] Bazy MD: 16 plików z danymi kontaktowymi
- [x] `data/all-categories.json` — przepisany na nowy schemat §5 (6 kategorii, 23 placówki)
- [x] Weryfikacja telefonów kategorii "oparzenia" — 6 placówek sprawdzonych
- [x] Hierarchia kontaktów §2 — ustalone: mobil dyżurnego = HERO, SOR = LVL2, blok op. = ukryty LVL3
- [x] §14 — mapa systemów wolnych łóżek (SIoS/InfoMed) wg województw
- [x] Dane LPR: 22 bazy, czasy reakcji, flota, procedura EZT

**W trakcie (agenty enrichmentu):**
- [ ] Enrichment WSZYSTKICH 16 plików MD (6 agentów pracuje równolegle)
  - [ ] CENTRA_OPARZEN + NEUROCHIRURGIA
  - [ ] CENTRUM_URAZOWE + UDAR + KARDIOCHIRURGIA
  - [ ] ECMO + HEMODYNAMIKA + CHIRURGIA_NACZYNIOWA
  - [ ] KOMORY_HIPERBAR + NEONATOLOGIA + REPLANTACJA + TOKSYKOLOGIA
  - [ ] CIALA_OBCE + DEKOMPRESJA_ZMIJA...
  - [ ] PSYCHIATRIA + TORAKOCHIRURGIA + UROLOGIA + GINEKOLOGIA

**Do zrobienia po enrichmencie:**
- [ ] Ekstrakcja css/styles.css i js/app.js z pliku referencyjnego
- [ ] index.html (dashboard)
- [ ] 28 stron kategorii (wg §10: 4 fale)
- [ ] Walidacja (§11 checklist)

**Otwarte pytania:**
1. Czy Google Fonts (DM Sans, JetBrains Mono) mogą ładować się online, czy wymagany pełny offline z embed?
2. Czy lekarz SOR ma login do InfoMed (pomorskie)? → jeśli tak, podać URL logowania na kartach placówek pomorskich.

**Następny krok:** Poczekaj na zakończenie enrichmentu → zaktualizuj `all-categories.json` → przejdź do budowy stron HTML.

---

## §13 — POST-PROJEKT: APLIKACJA MOBILNA

**PRZYPOMNIENIE DLA ROMAN po zakończeniu projektu:**

Po ukończeniu wszystkich 28 stron i walidacji danych — omówić z Roman przygotowanie:

1. **Wersja mobilna jako PWA (Progressive Web App)**
   - Service Worker do pełnego offline
   - Manifest.json z ikoną SOR
   - "Dodaj do ekranu głównego" na iOS/Android
   - Pełna funkcjonalność offline, identyczna z wersją desktopową

2. **Alternatywnie: natywna aplikacja mobilna**
   - Wrapper (Capacitor / Expo) na bazę tego portalu
   - Publikacja w Google Play / App Store
   - Push notifications o zmianach numerów
   - Geolokalizacja → automatyczny wybór najbliższego ośrodka

**Cel:** Lekarz SOR otwiera aplikację na telefonie jedną ręką, w 3 kliknięcia ma numer i dzwoni.

**Status:** DO OMÓWIENIA po zakończeniu portalu webowego.

---

## §14 — INTEGRACJA Z SYSTEMAMI WOLNYCH ŁÓŻEK (SIoS / InfoMed)

### Cel
Każda karta placówki powinna mieć przycisk **"🏥 Sprawdź wolne łóżka"**,
który otwiera system monitorowania łóżek odpowiedni dla danego województwa.

### Mapa systemów wg województw

| Województwo | System | URL | Dostęp | Deep link? |
|---|---|---|---|---|
| **pomorskie** | InfoMed | Zamknięty (login UW) | Tylko: koordynator, dyspozytorzy, szpitale | Nie |
| **kujawsko-pomorskie** | Brak danych o systemie online | — | — | — |
| **śląskie** | SIoS v2 | `https://sios.slask.eu:4433/sios/` | Login wymagany | Nie |
| **lubelskie** | SIoS | `https://szpitale.lublin.uw.gov.pl/page/` | **Częściowo publiczny!** | Wg oddziałów |
| **wielkopolskie** | Brak danych | — | — | — |
| **łódzkie** | Brak danych | — | — | — |
| **małopolskie** | Brak danych | — | — | — |
| **zachodniopomorskie** | Gov.pl (zamknięty) | — | Login | Nie |
| **warmińsko-mazurskie** | Brak danych | — | — | — |
| **mazowieckie** | SIoS | `https://szpitale.mazowieckie.pl/page/` | Login (hasło) | Nie |

### Centralny system EPS
- **Ewidencja Potencjału Świadczeniodawcy** — ustawa przyjęta przez Sejm
- **Planowany start: 01.01.2027**
- Będzie obejmować WSZYSTKIE szpitale w Polsce
- Aktualizacja danych: max 30 min od zmiany stanu łóżka
- **UWAGA:** Dane będą "prawnie chronione" — publiczne API niepewne
- Gdy EPS wystartuje → rozważyć integrację biegącym paskiem (ticker)

### Zachowanie UI na karcie placówki

```html
<!-- Jeśli system dostępny (nawet za loginem) -->
<a href="[URL_systemu_wg_województwa]"
   target="_blank"
   class="btn-beds"
   title="Zaloguj się → szukaj: [nazwa szpitala], oddział [specjalność]">
   🏥 Sprawdź wolne łóżka ([nazwa systemu])
</a>

<!-- Jeśli system niedostępny -->
<button class="btn-beds btn-beds--disabled"
        title="Brak systemu online — zweryfikuj telefonicznie">
   🏥 Wolne łóżka — sprawdź telefonicznie
</button>
```

### Mapowanie w JavaScript

```javascript
const BED_SYSTEMS = {
  "pomorskie":              { name: "InfoMed", url: null, note: "System zamknięty — dostęp przez UW Gdańsk" },
  "kujawsko-pomorskie":     { name: null, url: null, note: "Brak systemu online" },
  "śląskie":                { name: "SIoS", url: "https://sios.slask.eu:4433/sios/", note: "Login wymagany" },
  "lubelskie":              { name: "SIoS", url: "https://szpitale.lublin.uw.gov.pl/page/", note: "Dostęp publiczny!" },
  "wielkopolskie":          { name: null, url: null, note: "Brak systemu online" },
  "łódzkie":                { name: null, url: null, note: "Brak systemu online" },
  "małopolskie":            { name: null, url: null, note: "Brak systemu online" },
  "zachodniopomorskie":     { name: null, url: null, note: "Brak systemu online" },
  "warmińsko-mazurskie":    { name: null, url: null, note: "Brak systemu online" },
  "mazowieckie":            { name: "SIoS", url: "https://szpitale.mazowieckie.pl/page/", note: "Login wymagany" }
};
```

### Opcja ręczna (MVP)
Na karcie placówki — pole do ręcznego wpisania przez lekarza SOR:
```
Wolne łóżka: [___] OIT / [___] oddział   (sprawdzono: HH:MM)
```
Wartość zapisywana w `localStorage`. Przy następnym otwarciu widać ostatnią aktualizację.
Kasowane automatycznie po 8h (dane tracą aktualność).

### Przyszłość (2027+)
Gdy EPS udostępni API → zastąpić ręczne pola automatycznym tickerem:
```html
<div class="bed-ticker">
  🏥 CLO Siemianowice: OIT 2/8 | Oddz. 5/24 | aktualizacja 14:30
</div>
```
Aktualizacja co 15-30 min via `fetch()` do API EPS.

---

## §15 — FORMULARZE SZPITALNE (Hospital Forms — added 2026-04-13)

Separate from the portal, standalone print-ready forms were built in D:/VS/emla/forms/:

| File | Purpose | Status |
|------|---------|--------|
| zgoda-tk-dziecka.html | CT consent for children | DONE |
| zgoda-swiadczenie.html | General consent/refusal/discharge | DONE |
| karta-zlecen.html | Medical order card | DONE |
| karta-zlecen-app.html | Digital order card | DONE |
| karta-zlecen-v2.html | Order card v2 | DONE |

**Next:** Link from index.html under new "Formularze" category card.

---

## §16 — INTEGRACJA Z CHIRURG-AI (added 2026-04-13)

**Decision:** EMLA portal functionality will be integrated into Chirurg-AI dashboard.

### Plan:
1. Chirurg-AI dashboard gets a "Transfer" tab
2. EMLA routing pages embedded/linked within that tab
3. Doctor generates patient document -> one click opens EMLA to arrange transfer
4. EMLA continues to work independently as standalone portal
5. Data source: emla-portal/data/ + emla-portal/*.html

### Why:
- Workflow: generate zalecenia -> identify that patient needs transfer -> look up specialist center -> call
- Currently these are two separate tools. Integration makes it one workflow.
- EMLA phone hierarchy is exactly what a surgeon needs when transferring a patient.

---

## §17 — SUPABASE BACKEND DLA SECONDARY TABS (added 2026-04-29)

**Decision:** Vkladki `kalkulatory.html`, `protokoly.html`, `farmakologia.html` zyskują backend Supabase obok dotychczasowych embedded data. Main routing portal (28 kategorii placówek) pozostaje 100% offline z embedded `const FACILITIES`.

### Architektura (hybrid)
- **Main portal (28 kategorii):** offline, `const FACILITIES = [...]` w HTML — bez zmian.
- **Secondary tabs (kalkulatory / protokoły / farmakologia):** Supabase jako single source of truth + lokalny cache dla offline.

### Supabase project
- **Project ref:** `zqfqqwdfndkipnklajdf` (TrendDrop main, ten sam co Chirurg-AI/Arcalion)
- **URL:** `https://zqfqqwdfndkipnklajdf.supabase.co`
- **Schema:** `emla` (exposed via PostgREST Management API obok `public, arcalion`)

### Tabele
| Tabela | Cel | Stan 2026-04-29 |
|--------|-----|-----------------|
| `emla.drugs` | Reference: leki SOR | **86 wpisów** (76 z `data/leki_sor.json` + 10 priority) |
| `emla.protocols` | Reference: protokoły kliniczne | **72 wpisy** (zsynchronizowane z inline `PROTOKOLY` z protokoly.html) |
| `emla.calculators` | Reference: kalkulatory medyczne | 0 (do wypełnienia w Phase 3) |
| `emla.calculator_history` | Per-doctor: historia obliczeń kalkulatorów | 0 (czeka na auth wiring) |
| `emla.guidelines_versions` | Wersje wytycznych z `valid_until` | 9 źródeł (ERC 2021, ESC 2023, ATLS 10ed, SSC 2021, ESO 2022, PALS 2020, GINA 2024, GOLD 2025, URPL live) |

### RLS & dostęp
- Public read przez anon key (na danych referencyjnych).
- Modyfikacje: tylko service_role / admin via Supabase SQL Editor.
- Calculator history: doctor_id = auth.uid() (own rows only).

### JS loader
`js/emla-loader.js` eksponuje `window.EmlaAPI`:
```js
EmlaAPI.getDrugs({ category: 'antybiotyki' })
EmlaAPI.getProtocols({ category: 'sepsa' })
EmlaAPI.getProtocol('INLINE-ERC-3')
EmlaAPI.searchDrugs('paracetamol')
EmlaAPI.getCalculators()
EmlaAPI.getGuidelinesVersions()
EmlaAPI.saveCalcResult({ calc_code, inputs, result_value, ... })   // localStorage fallback
EmlaAPI.renderMd(content_md)
```

### Audit-trail / правила
1. **Każdy `emla.drugs` ma `verified bool` + `source_ref text` + `source_url`.** Bez weryfikacji `verified=false` (jeszcze nie sprawdzone z URPL CPL).
2. **Każdy `emla.protocols` ma `source` + `source_year` + `valid_until` + `smoke_test_passed bool`.** Pole `valid_until` z `guidelines_versions` — wymusza okresowe re-review.
3. **Trigger `updated_at`:** każda zmiana wiersza odświeża timestamp.
4. **Migration files** w `supabase/migrations/YYYYMMDD_NNN_*.sql` — version controlled.
5. **NIE wpisywać dawek z głowy.** Każde `verified=true` musi mieć `source_url` do CPL URPL lub oficjalnego wytycznego.

### Roadmap (pozostałe fazy)
- **Phase 1:** rozszerzyć `emla.drugs` z 86 → ~150 leków (brakuje wazopresorów rzadkich, antydotów ekstr. tox, antykoagulantów DOAC pełnych).
- **Phase 2:** rozszerzyć `emla.protocols` z 72 → ~150 (brakuje rzadkich pediatrycznych, anestezjologii regionalnej, OIT-specyficznych).
- **Phase 3:** populacja `emla.calculators` (17 istniejących inline → schema + extend o 20 missing: Wells DVT, CHA2DS2-VASc, HAS-BLED, Padua, Caprini, Alvarado, Ranson, Glasgow-Blatchford, Genewa, sPESI, APACHE II, SOFA, Child-Pugh, MELD, PERC, CRB-65).
- **Phase 4:** Integracja z Chirurg-AI: epikryza odwołuje się do protokołu po `code`; dawki z `farmakologia` używane w `zalecenia.md` rendererze.
- **Phase 5:** Service Worker + IndexedDB cache → 100% offline read.
- **Phase 6:** Audit log dla zmian (kto/kiedy/co).
- **Phase 7:** Auto-reminder kiedy `valid_until` dla wytycznego się zbliża → notyfikacja e-mailowa.

### Bug znalezione 2026-04-29 (do naprawy)
1. **`protokoly.html` — duplicate `const PROTOKOLY` declaration** (linie 187-260 ORAZ 474-547). Drugi zastępuje pierwszy. Ok. 100KB nadmiarowych danych w pliku. **Fix: usunąć blok 473-547 (drugi script).**
2. **`leki_sor.json` — typo:** `Metopropolum` → poprawione w Supabase na `Metoprololum tartras` (id `c004`). Trzeba też poprawić w `data/leki_sor.json` przy następnej synchronizacji.
3. **`leki_sor.json` — błędna kategoria:** Dexmedetomidine (id `g006`) była w `gastro`, poprawione w Supabase na `RSI_sedacja`. Tak samo w JSON.

### Jak ja (Claude) mam tu pracować
- **Single source of truth:** `emla.*` tabele w Supabase. Inline data w HTML traktuj jako cache/fallback.
- **Sync direction:** modyfikacje robi się w Supabase → eksportuje do JSON / inline (przy build/deploy time, nie ad-hoc).
- **`verified=false` = NIE NADAJE SIĘ DO PRODUKCJI bez ręcznej weryfikacji Roman.** Filtruj UI: pokazuj tylko `verified=true` w trybie produkcyjnym.
- **WebFetch nie wykonuje JS** — sprawdzaj realny stan przez `fetch /rest/v1/...` lub czytaj inline JS przez Node `Function('return ' + arrayLiteral)()`.
