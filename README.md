# Sanskrit English Refiner — Text Annotation & Correction Tool
A tool to edit and annotate Sanskrit-English parallel corpora

A lightweight, browser-based editor for reviewing, correcting, and annotating Sanskrit–English mapping files. No installation, no server, no dependencies — just open `index.html` in any modern browser.

---

## Overview

Sanskrit digitisation projects often produce JSON mapping files that pair a Sanskrit verse (in Devanagari script) with its English translation. Errors creep in during OCR, transcription, or data entry. This tool lets you:

- Load a mapping JSON file and browse all verses in a clean layout
- Switch into **Edit Mode** to correct Sanskrit text, translations, and map IDs in place
- Add **Notes & Commentary** to any verse for scholarly annotation
- Insert new verses anywhere in the sequence — before the first, between any two, or after the last
- Delete verses with a confirmation prompt
- Save the corrected file back as a well-formatted JSON

---


## Input File Format

The tool expects a **JSON array** of mapping objects. Each object must have at least these keys:

| Key | Type | Description |
|---|---|---|
| `map_id` | number or string | A unique identifier for the verse (e.g. `1`, `"01-02-003"`) |
| `sanskrit` | string | The Sanskrit text in Devanagari script |
| `english` | string | The English translation |
| `notes` | string | *(optional)* Scholarly notes or commentary |

### Sample input file

```json
[
  {
    "map_id": 1,
    "sanskrit": "या सृष्टिः स्रष्टुराद्या वहति विधिहुतं या हविर्या च होत्री\nये द्वे कालं विधत्तः श्रुतिविषयगुणा या स्थिता व्याप्य विश्वम् ।\nयामाहुः सर्वबीजप्रकृतिरिति यया प्राणिनः प्राणवन्तः\nप्रत्यक्षाभिः प्रपन्नस्तनुभिरवतु वस्ताभिरष्टाभिरीशः ॥ १ ॥",
    "english": "That which is the first creation of the Creator; that which bears the offering made according to due rites; that which is the offerer; those two which make time; that which pervades all space, having for its quality what is perceived by the ear; that which is the womb of all seeds; that by which all living beings breathe — endowed with these eight visible forms, may the supreme Lord protect you!"
  },
  {
    "map_id": 2,
    "sanskrit": "सूत्रधारः - ( नेपथ्याभिमुखमवलोक्य ) आर्ये , यदि नेपथ्यविधान-\nमवसितम् , इतस्तावदागम्यताम् ।",
    "english": "THE STAGE-DIRECTOR (Looking towards the dressing-room). My lady, if you have finished with your dressing, pray, come here.",
    "notes": "Stage direction indicating movement toward the wings. Compare with similar directions in Kalidasa's Malavikagnimitra."
  },
  {
    "map_id": 3,
    "sanskrit": "नटी - अजउत्त , इयं म्हि । आणवेदु अज्जो को णिओओ अणुचिठ्ठीअदु ति ।",
    "english": "AN ACTRESS. Here I am, my lord; let my lord direct what I am to do."
  }
]
```

Multi-line Sanskrit verses can use `\n` for line breaks within the string. The `notes` key is optional — it will be omitted from the saved output if left blank.

---

## How to Use

### 1. Open the app

Open the [Sanskrit English Refiner]() app in your browser, preferrably in a new tab. No internet connection is required after the fonts load on first use.

### 2. Load a file

Either **drag and drop** a `.json` file onto the drop zone, or click the **Load JSON** button in the header and pick your file. The verses will render immediately in a scrollable critical-edition layout.

### 3. Enter Edit Mode

Flip the **Edit Mode** toggle in the toolbar or press `Ctrl+E`. Every field on every verse becomes editable:

- **ID** — the small text input at the top of each card. Leave blank to have an ID assigned automatically on save.
- **Sanskrit** — the Devanagari textarea. Use `\n` (or simply press Enter) for line breaks.
- **Translation** — the English textarea.
- **Notes** — the commentary textarea at the bottom of each card.

All changes sync live. Toggle back to read mode at any time to review the formatted result.

### 4. Insert verses

While in Edit Mode, hover between any two cards (or above the first / below the last) to reveal a dashed **"Insert verse here"** button. Clicking it splices a blank verse into that position and focuses the ID field ready for input.

The **Add Verse** button in the header always appends a new blank verse at the end.

### 5. Delete a verse

In Edit Mode, a **Delete** button appears on each card (top-right, visible on hover). Clicking it opens a confirmation dialog before removing the verse.

### 6. Save

Click **Save JSON** in the header or press `Ctrl+S` at any time. Before writing the file, the tool:

1. **Removes completely blank verses** — any entry where the ID, Sanskrit, English, and Notes fields are all empty is dropped silently. The toast notification tells you how many were pruned.
2. **Auto-assigns missing IDs** — verses left with a blank ID field receive a numeric ID automatically (the next integer after the highest ID seen in the list).
3. Downloads the result with the **same filename** as the file you loaded (or `mappings.json` if unnamed).

---

## Keyboard & UX Notes

- Textareas **auto-resize** as you type — no manual resizing needed.
- The inserter zones and delete buttons are **hidden in read mode** and only appear during editing to keep the read view clean.
- The search bar **hides inserter zones** while active to avoid confusion in filtered views.
- The modal confirmation for deletion can be dismissed by clicking the backdrop or the Cancel button.

---

## Browser Compatibility

Tested in Chrome 120+, Firefox 121+, and Safari 17+. Requires no build step, bundler, or internet connection (beyond the initial Google Fonts load).