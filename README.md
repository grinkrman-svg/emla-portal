<div align="center">

# 🏥 EMLA Portal

### Emergency Medical Logistics Assistant — SOR Chojnice

**Portal szybkiego kierowania pacjentów dla lekarzy SOR Szpital Specjalistyczny im. J.K. Łukowicza**

[![Status](https://img.shields.io/badge/status-✅%20PRODUCTION-success?style=flat-square)](https://grinkrman-svg.github.io/emla-portal/)
[![Public](https://img.shields.io/badge/public-🟢%20open%20to%20colleagues-brightgreen?style=flat-square)](#)
[![Stack](https://img.shields.io/badge/PWA-HTML%2FJS-blue?style=flat-square)](#)
[![Categories](https://img.shields.io/badge/28-emergency%20categories-orange?style=flat-square)](#)
[![Hospital](https://img.shields.io/badge/SOR-Szpital%20Chojnice-red?style=flat-square)](#)

[**🌐 Open Live App**](https://grinkrman-svg.github.io/emla-portal/) · [**🩺 Chirurg-AI**](https://github.com/grinkrman-svg/chirurg-ai) · [**🌌 Vexor Omnis**](https://github.com/grinkrman-svg)

</div>

---

## 🇵🇱 O portalu

Portal szybkiego kierowania pacjentów dla lekarzy dyżurnych SOR Szpital Chojnice. **28 kategorii stanów zagrażających życiu** — na każdej stronie lista ośrodków specjalistycznych z bezpośrednimi numerami lekarzy, czasami transportu, możliwościami klinicznymi. Cel: skrócić czas od decyzji o transferze do pierwszego kontaktu telefonicznego ze specjalistą.

Wykorzystywany podczas nocnych dyżurów. Projekt siostrzany do [Chirurg-AI](https://github.com/grinkrman-svg/chirurg-ai) (dokumentacji dla tych samych lekarzy).

---

<!-- ↓ Existing README content below ↓ -->

# EMLA Portal
## Emergency Medical Logistics Assistant — SOR Chojnice

Portal szybkiego kierowania pacjentów dla lekarzy i personelu SOR Szpitala Specjalistycznego im. J.K. Łukowicza w Chojnicach.

---

## Co to jest?

Statyczna strona www z 28 stronami kategorii stanów nagłych. Każda strona zawiera listę specjalistycznych ośrodków z numerami telefonów, czasami transportu i możliwościami klinicznymi — zorganizowanymi według hierarchii kontaktów: od bezpośredniego numeru lekarza dyżurnego do centrali szpitala.

**Cel:** skrócić czas od decyzji o transferze do pierwszego telefonicznego kontaktu ze specjalistą.

---

## Jak uruchomić Claude Code

```bash
# Otwórz folder projektu w VS Code
# Uruchom Claude Code z pełnymi uprawnieniami
claude --dangerously-skip-permissions

# Claude Code przeczyta CLAUDE.md automatycznie
# i będzie wiedział co robić
```

---

## Struktura projektu

```
emla-portal/
├── CLAUDE.md                    ← instrukcje dla Claude Code (czytaj!)
├── README.md                    ← ten plik
├── index.html                   ← dashboard (28 kategorii)
│
├── oparzenia.html               ← 28 stron kategorii...
├── neurochirurgia.html
├── [... 26 kolejnych ...]
├── ciezka-hipotermia.html
│
├── css/
│   └── styles.css               ← wspólny design system
│
├── js/
│   └── app.js                   ← wspólne funkcje
│
└── data/
    ├── all-categories.json      ← dane JSON (kategorie 1-6)
    └── md-sources/              ← bazy telefonów w formacie MD
        └── [10 plików .md]
```

---

## 28 kategorii

| # | Kategoria | Plik |
|---|---|---|
| 1 | Centra Oparzeń | oparzenia.html |
| 2 | Neurochirurgia | neurochirurgia.html |
| 3 | Centrum Urazowe / Politrauma | centrum-urazowe.html |
| 4 | Udar / Trombektomia | udar-trombektomia.html |
| 5 | Kardiochirurgia | kardiochirurgia.html |
| 6 | ECMO | ecmo.html |
| 7 | Hemodynamika / PCI / STEMI | hemodynamika-pci.html |
| 8 | Toksykologia kliniczna | toksykologia.html |
| 9 | Komory hiperbaryczne | komory-hiperbaryczne.html |
| 10 | Replantacja / Mikrochirurgia | replantacja.html |
| 11 | Chirurgia naczyniowa | chirurgia-naczyniowa.html |
| 12 | Neonatologia / Perinatologia III° | neonatologia.html |
| 13 | Chirurgia dziecięca | chirurgia-dziecieca.html |
| 14 | Okulistyka nagła | okulistyka.html |
| 15 | Psychiatria nagła | psychiatria.html |
| 16 | Choroby zakaźne / Izolacja | choroby-zakazne.html |
| 17 | Chirurgia szczękowo-twarzowa | chirurgia-szczekowa.html |
| 18 | Torakochirurgia | torakochirurgia.html |
| 19 | Urologia nagła | urologia.html |
| 20 | Ginekologia / Położnictwo | ginekologia.html |
| 21 | Ciała obce w drogach oddechowych | ciala-obce.html |
| 22 | Radiologia interwencyjna | radiologia-interwencyjna.html |
| 23 | Transplantologia | transplantologia.html |
| 24 | Choroba dekompresyjna | choroba-dekompresyjna.html |
| 25 | Ukąszenie żmiji | ukaszenie-zmiji.html |
| 26 | Plazmafereza / TTP / HUS | plazmafereza.html |
| 27 | Masywna zatorowość płucna | masywna-pe.html |
| 28 | Ciężka hipotermia | ciezka-hipotermia.html |

---

## Hierarchia kontaktów

Portal organizuje numery telefonów według hierarchii:

```
POZIOM 1 — Lekarz dyżurny / specjalista      ← wyświetlany jako "hero"
POZIOM 2 — Post pielęgniarski / IP oddziału  ← zawsze widoczny
POZIOM 3 — Blok operacyjny                   ← w sekcji "więcej telefonów"
POZIOM 4 — Centrala szpitala (backup 24h)    ← w sekcji "więcej telefonów"
```

---

## Źródła danych

Dane zebrane metodą web_fetch ze stron szpitali (2026-03-30).

**⚠️ Wszystkie numery wymagają weryfikacji telefonicznej przed użyciem operacyjnym.**

Oznaczenia pewności danych:
- ✅ potwierdzono ze strony szpitala
- ⚠️ ze źródła pośredniego — wymaga weryfikacji
- ❓ nie znaleziono online — wymaga kontaktu telefonicznego

---

## Technologia

- HTML5 + CSS3 + Vanilla JavaScript
- Brak frameworków, brak npm, brak build tools
- Działa offline (po otwarciu z dysku lokalnego)
- Wymaga przeglądarki: Chrome 115+, Firefox 120+, Safari 17+
- Dane osadzone bezpośrednio w każdym pliku HTML

---

## Skróty klawiszowe

| Skrót | Działanie |
|---|---|
| `/` | Focus na wyszukiwaniu |
| `Ctrl+K` | Command Palette |
| `Escape` | Wyczyść wyszukiwanie / zamknij |
| `1-9` | Przejdź do karty #N |
| `F11` | Tryb pełnoekranowy |

---

## Kontekst

**SOR:** Szpitalny Oddział Ratunkowy  
**Szpital:** Szpital Specjalistyczny im. J.K. Łukowicza, ul. Leśna 10, 89-600 Chojnice  
**Region:** Pomorskie, ~100 km od Bydgoszczy, ~170 km od Gdańska  
**LPR:** Lotnicze Pogotowie Ratunkowe — Centrum Operacyjne: **22 22 99 999**
**EZT:** https://ezt.lpr.com.pl

---

*Ostatnia aktualizacja: 2026-03-30 | Projekt EMLA*
