# Raport: Baza leków SOR dla Chojnice

## Podsumowanie

Zebrano **75 preparatów** na potrzeby listy zleceń lekarskich (karta zleceń) dla SOR (Szpitalny Oddział Ratunkowy) w Chojnice.

## Rozkład po kategoriach

| Kategoria | Liczba | Przykłady |
|-----------|--------|----------|
| **Przeciwbólowe/NSAID** | 7 | Pyralgin, Tramal, Ketonal, Diclofenac |
| **Płyny & elektrolity** | 6 | NaCl 0.9%, Glukoza 5%, KCl 15%, MgSO4 20% |
| **Antybiotyki IV** | 9 | Biotraxon, Metronidazol, Ciprinol, Gentamycyna |
| **Kardiologiczne** | 10 | Cordarone, Furosemid, Metocard, Isoket |
| **Wazopresory** | 3 | Adrenalina, Noradrenalina, Dopamina |
| **RSI sedacja** | 6 | Dormicum, Propofol, Ketanest, Etomidat |
| **RSI zwiotczenie** | 3 | Esmeron, Sukcynylocholin, Vecuronium |
| **Steroidy** | 3 | Dexaven, Solu-Medrol, Hydrokortyzon |
| **Antykoagulanty** | 5 | Clexane, Heparyna, Sintrom, Pradaxa |
| **Antidota** | 6 | Narcanti, Anexate, Fluimucil, Konakion |
| **Neurologiczne** | 6 | Clonazepamum, Phenytoina, Depakina |
| **Gastro** | 6 | Zofran, Controloc, Buscopan, Metoclopramid |
| **Inhalacje** | 5 | Berodual, Ventolin, Atrovent, Pulmicort |

## Weryfikacja i uwagi

- **67 preparatów** ma status `verified: true` (dane z CHPL / registrów medycznych)
- **6 preparatów** ma status `verified: false` — wymagają potwierdzenia przez lekarza:
  - Paracetamol IV (Perfalgan) — dawkowanie w SOR
  - Morfina siarczan — dostępność ampułkowa
  - Diclofenac, Metoprolol, Ketonal, Fluimucil — rozmiary ważą

## Wątpliwości:

1. **Pentotal (Thiopental)** — czy wciąż dostępny w Polsce? W niektórych krajach wycofany.
2. **Morfina vs Tramal** — obydwa w bazie; równoległa lista opioidów lub wybór jeden-jeden?
3. **Furosemid 20mg/2ml** — to wersja IV; sprawdzić czy dostępne też 40mg ampułki na SOR.

## Akcja:

Lekarz SOR Chojnice powinien: (1) potwierdzić dostępność każdego preparatu w szpitalnej aptece, (2) dodać domyślne dawki dla swoich pacjentów (obecnie wzory ogólne), (3) usunąć preparaty niedostępne.

**Plik:** `D:/VS/emla/emla-portal/data/leki_sor.json`
