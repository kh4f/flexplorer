# Changelog

## &ensp; ` 🏷️ 5.0.3  `

### &emsp; 🩹 Fixes
- **Stable position after unpinning**: pinning an item now moves it to the top of its folder, so unpinning puts it back at the top instead of at a random spot after its siblings were reordered. [🡥](https://github.com/kh4f/flexplorer/commit/e3e06ec)
- **Consistent drop onto a folder title**: dropping an item onto a folder title now always places it at the top of that folder. Previously it stayed in place when dropped into its own folder, while moving to another folder put it at the top. [🡥](https://github.com/kh4f/flexplorer/commit/495ad91)

##### &emsp;&emsp; [Commit log](https://github.com/kh4f/flexplorer/compare/5.0.2...5.0.3) &ensp;•&ensp; Oct 9, 2026

## &ensp; ` 🏷️ 5.0.2  `

### &emsp; 🩹 Fixes
- **Drags starting at a row's top edge no longer cancel instantly**: the per-level layout offset is no longer applied during `dragstart` — Chromium cancels a drag when the source row moves out from under the cursor there. Drops at the end of nested folders keep working through a virtual hit zone instead of real padding. [🡥](https://github.com/kh4f/flexplorer/commit/be46d70)
- **Cleanup after long autoscrolled drags**: when the source row leaves the DOM mid-drag, a drop now always clears the drop indicator and restores explorer scrolling instead of leaving both stuck. [🡥](https://github.com/kh4f/flexplorer/commit/ad0ab52)
- **Console no longer floods after dragging outside the explorer**: leaving the explorer logs a single message instead of dumping dozens of repeated lines once the cursor comes back. [🡥](https://github.com/kh4f/flexplorer/commit/a3064bc)

##### &emsp;&emsp; [Commit log](https://github.com/kh4f/flexplorer/compare/5.0.1...5.0.2) &ensp;•&ensp; Oct 9, 2026

## &ensp; ` 🏷️ 5.0.1  `

### &emsp; 🩹 Fixes
- **Fixed v5 sort order migration**: `sortOrder` values saved by v5 are no longer mangled by the v4→v5 migration on load. [🡥](https://github.com/kh4f/flexplorer/commit/e3892a2) [#192](https://github.com/kh4f/flexplorer/issues/192)
- **Safer multi-selection drops**: drops are now skipped when the selection mixes pinned and unpinned items, or when a fully pinned selection spans multiple folders. [🡥](https://github.com/kh4f/flexplorer/commit/2eefa02)
- **No drops into the dragged folder**: hovering the title of the dragged folder itself, or of any folder inside it, during a drag no longer marks it as a drop target, so a folder can't be moved into its own descendant. [🡥](https://github.com/kh4f/flexplorer/commit/09e65dd)
- **No surprise folder expansion**: collapsed folders no longer expand seconds after a drop — the pending expand timer is now canceled when the drag ends. [🡥](https://github.com/kh4f/flexplorer/commit/801e74d)

##### &emsp;&emsp; [Commit log](https://github.com/kh4f/flexplorer/compare/5.0.0...5.0.1) &ensp;•&ensp; Oct 7, 2026

## &ensp; ` 🏷️ 5.0.0  `

### &emsp; 📢 BREAKING CHANGES
- **Obsidian 1.13.0+ required**: the plugin now uses the declarative settings API, available only in Obsidian 1.13.0 and later. [🡥](https://github.com/kh4f/flexplorer/commit/18ffcae)
- **Settings format migration**: pin state is now stored solely in `items[path].isPinned` (the duplicated `pinnedFiles` array is gone), and sort order values use the new `*Asc`/`*Desc` suffixes (`byName` → `byNameAsc`, etc.). Existing settings migrate automatically on load. [🡥](https://github.com/kh4f/flexplorer/commit/2e6666f)

### &emsp; ✨ Features
- **Pattern-based hiding**: hide items matching basic gitignore-style globs (`any-1?3-*.md`, `*/nested.*`, `/only-root.md`). Pattern-hidden items are revealed via `Show hidden` together with manually hidden ones. [🡥](https://github.com/kh4f/flexplorer/commit/7ff5f5d) [#191](https://github.com/kh4f/flexplorer/issues/191)
- **Smarter copying**: a copied item now keeps the original's settings, and is placed right after the source. [🡥](https://github.com/kh4f/flexplorer/commit/120c422) [🡥](https://github.com/kh4f/flexplorer/commit/5d09ee8) [#172](https://github.com/kh4f/flexplorer/issues/172)
- **Stable time sorting across devices**: created/modified sorting now uses timestamps tracked by the plugin instead of the OS file stats, so the order no longer changes after syncing between devices. [🡥](https://github.com/kh4f/flexplorer/commit/f492354) [#169](https://github.com/kh4f/flexplorer/issues/169)
- **Native mobile dragging**: dragging on mobile now uses the same drag events as desktop — long-press an item and drag, no more dedicated drag handle. [🡥](https://github.com/kh4f/flexplorer/commit/9fa475c) [#186](https://github.com/kh4f/flexplorer/issues/186) [#174](https://github.com/kh4f/flexplorer/issues/174) [#184](https://github.com/kh4f/flexplorer/issues/184)
- **Settings search**: all settings are now indexed by Obsidian's settings search. [🡥](https://github.com/kh4f/flexplorer/commit/18ffcae)

### &emsp; 🩹 Fixes
- **Fixed first-enable reshuffle**: the initial custom order is now seeded from the currently displayed sort instead of Obsidian's internal child order. [🡥](https://github.com/kh4f/flexplorer/commit/bae268b) [#180](https://github.com/kh4f/flexplorer/issues/180) [#178](https://github.com/kh4f/flexplorer/issues/178)
- **Fixed drops after long drags**: notes dropped after a prolonged drag are now registered reliably, and autoscroll no longer gets stuck mid-drag. [🡥](https://github.com/kh4f/flexplorer/commit/fcf0ef6) [#175](https://github.com/kh4f/flexplorer/issues/175) [#181](https://github.com/kh4f/flexplorer/issues/181)
- **Fixed enabling from Settings**: the plugin now works when enabled from the Settings window in Obsidian 1.13.0+. [🡥](https://github.com/kh4f/flexplorer/commit/489f287)

### &emsp; ⚡ Performance
- **Smoother dragging**: the drag-and-drop engine was rewritten from scratch, greatly reducing lag in large vaults and on mobile. [🡥](https://github.com/kh4f/flexplorer/commit/489f287) [#185](https://github.com/kh4f/flexplorer/issues/185) [#187](https://github.com/kh4f/flexplorer/issues/187)

### &emsp; 🎨 Style
- **Improved drop indicator**: the drop line is now thicker and layered above the selected item's outline. [🡥](https://github.com/kh4f/flexplorer/commit/489f287) [#186](https://github.com/kh4f/flexplorer/issues/186)

##### &emsp;&emsp; [Commit log](https://github.com/kh4f/flexplorer/compare/4.0.5...5.0.0) &ensp;•&ensp; Oct 4, 2026

## &ensp; [` 📦 4.0.5  `](https://github.com/kh4f/flexplorer/compare/4.0.4...4.0.5)

### &emsp; ⚙️ Internal
- **Logger lint fix**: the logger now avoids an Obsidian lint false positive by using a local console alias. [🡥](https://github.com/kh4f/flexplorer/commit/7e69026)

##### &emsp;&emsp; [Full Changelog](https://github.com/kh4f/flexplorer/compare/4.0.4...4.0.5) &ensp;•&ensp; Jun 24, 2026


## &ensp; [` 📦 4.0.4  `](https://github.com/kh4f/flexplorer/compare/4.0.3...4.0.4)

### &emsp; 🩹 Fixes
- **Restricted sort‑menu patch to file explorer**: the custom sort menu no longer overrides the `Change sort order` button in the community plugins browser. [🡥](https://github.com/kh4f/flexplorer/commit/3c26d84) [#170](https://github.com/kh4f/flexplorer/issues/170)

##### &emsp;&emsp; [Full Changelog](https://github.com/kh4f/flexplorer/compare/4.0.3...4.0.4) &ensp;•&ensp; Jun 20, 2026


## &ensp; [` 📦 4.0.3  `](https://github.com/kh4f/flexplorer/compare/4.0.2...4.0.3)

### &emsp; 🩹 Fixes
- **Fixed multiple item dragging**: dragging multiple selected elements now correctly moves all items and updates the UI. [🡥](https://github.com/kh4f/flexplorer/commit/67fd614)
- **Fixed indicator errors on rename**: prevented undefined settings errors during file renames by relying on automatic mounting. [🡥](https://github.com/kh4f/flexplorer/commit/75be877)

##### &emsp;&emsp; [Full Changelog](https://github.com/kh4f/flexplorer/compare/4.0.2...4.0.3) &ensp;•&ensp; May 27, 2026


## &ensp; [` 📦 4.0.2  `](https://github.com/kh4f/flexplorer/compare/4.0.1...4.0.2)

### &emsp; 🩹 Fixes
- **Mobile loading error**: fixed a crash that prevented the plugin from loading on mobile devices. [🡥](https://github.com/kh4f/flexplorer/commit/8dd13b3) [#166](https://github.com/kh4f/flexplorer/issues/166)

##### &emsp;&emsp; [Full Changelog](https://github.com/kh4f/flexplorer/compare/4.0.1...4.0.2) &ensp;•&ensp; May 27, 2026


## &ensp; [` 📦 4.0.1  `](https://github.com/kh4f/flexplorer/compare/4.0.0...4.0.1)

### &emsp; 🩹 Fixes
- **Collapsed subfolder drops**: resolved an issue where dragging an item into a collapsed subfolder (when it's the only child of its parent) would fail. [🡥](https://github.com/kh4f/flexplorer/commit/36eb0de)
- **Quicker folder expansion**: reduced the folder expansion delay while hovering for a more natural drag-and-drop feel. [🡥](https://github.com/kh4f/flexplorer/commit/37506b0)

##### &emsp;&emsp; [Full Changelog](https://github.com/kh4f/flexplorer/compare/4.0.0...4.0.1) &ensp;•&ensp; May 26, 2026


## &ensp; [` 📦 4.0.0  `](https://github.com/kh4f/flexplorer/compare/3.2.4...4.0.0)

### &emsp; 📢 BREAKING CHANGES
- **Plugin relaunch**: since the next major version (v4) would have introduced breaking changes anyway —  
including a full reset of user settings — and the project focus has shifted from  
manual sorting only to a broader file explorer enhancement suite, the plugin is being republished under a more versatile name: **Flexplorer**.  
The **Manual Sorting** plugin will be unpublished soon.

### &emsp; 🎁 Features
- **Per-folder sorting**: each folder now maintains its own independent sorting mode. [#40](https://github.com/kh4f/flexplorer/issues/40)
- **Pinning & hiding**: items can now be pinned to the top or hidden from view. [#124](https://github.com/kh4f/flexplorer/issues/124) [#146](https://github.com/kh4f/flexplorer/issues/146)
- **Extended context menu**: explorer items now include `Pin`, `Hide`, and `Sort order` options.
- **Enhanced sort order menu**: the native `Change sort order` menu now includes `Custom order` sorting mode, `Save as custom order` action, and `Show hidden` toggle.
- **Smarter auto-scroll**: improved auto-scroll dynamics for faster and more flexible dragging near explorer edges [#135](https://github.com/kh4f/flexplorer/issues/135)
- **Sync-friendly persistence**: added a setting to control whether `data.json` updates immediately after file create/delete operations, helping reduce sync conflicts with services like Obsidian Sync. [#120](https://github.com/kh4f/flexplorer/issues/120)

### &emsp; ⚡ Performance
- **Rewritten DnD engine**: drag‑and‑drop logic has been rebuilt from scratch for improved reliability and performance.

### &emsp; 🧩 Compatibility
- **File Explorer Note Count compatibility**: fixed the drag handles overlapping folder child counters on mobile. [#125](https://github.com/kh4f/flexplorer/issues/125)
- **Novel Word Count compatibility**: resolved visual conflict with word counter on mobile. [#165](https://github.com/kh4f/flexplorer/issues/165)

### &emsp; 🎨 Style
- **Cleaner drag visuals**: removed tooltip, folder highlight, drop zones, indicator animation, and mobile drag handles for a more minimal, smooth and distraction‑free drag experience.

##### &emsp;&emsp; [Full Changelog](https://github.com/kh4f/flexplorer/compare/3.2.4...4.0.0) &ensp;•&ensp; May 23, 2026


## &ensp; [` 📦 3.2.4  `](https://github.com/kh4f/manual-sorting/compare/3.2.3...3.2.4)

### &emsp; 🩹 Fixes
- **Settings save on rename**: renaming items now always updates settings in `data.json`. [🡥](https://github.com/kh4f/manual-sorting/commit/115f687) [#120](https://github.com/kh4f/manual-sorting/issues/120)

##### &emsp;&emsp; [_Full Changelog_](https://github.com/kh4f/manual-sorting/compare/3.2.3...3.2.4) &ensp;•&ensp; _Jan 21, 2026_


## &ensp; [` 📦 3.2.3  `](https://github.com/kh4f/manual-sorting/compare/3.2.2...3.2.3)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🩹 Fixes
- **dnd**: 
  - ensure drop zones are cleared when releasing mouse [`9576442`](https://github.com/kh4f/manual-sorting/commit/9576442) ([#114](https://github.com/kh4f/manual-sorting/issues/114))
  - prevent drag activation on right click [`5ceadc4`](https://github.com/kh4f/manual-sorting/commit/5ceadc4) ([#114](https://github.com/kh4f/manual-sorting/issues/114))

##### &emsp;&ensp;&nbsp;&nbsp; [_All Release Commits_](https://github.com/kh4f/manual-sorting/compare/3.2.2...3.2.3) &ensp;•&ensp; _Dec 26, 2025_


## &ensp; [` 📦 3.2.2  `](https://github.com/kh4f/manual-sorting/compare/3.2.1...3.2.2)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🩹 Fixes
- **dnd**: 
  - prevent drop zones from appearing in default sorting modes [`3ef2bfe`](https://github.com/kh4f/manual-sorting/commit/3ef2bfe)
  - display correct target folder in drag tooltip [`4ae09d4`](https://github.com/kh4f/manual-sorting/commit/4ae09d4)
  - disallow multi-select drop into selected folders [`a8c611e`](https://github.com/kh4f/manual-sorting/commit/a8c611e)
  - prevent unintended nesting in multi-select drop [`8eb3709`](https://github.com/kh4f/manual-sorting/commit/8eb3709)
  - prevent phantom drop zones when dragging near empty folders [`4904d0c`](https://github.com/kh4f/manual-sorting/commit/4904d0c)
  - clear drop zones activation timeout on item drop [`06431b6`](https://github.com/kh4f/manual-sorting/commit/06431b6) ([#114](https://github.com/kh4f/manual-sorting/issues/114))
  - prevent subfolders of selected folders from escaping during multi-selection drag [`5373c80`](https://github.com/kh4f/manual-sorting/commit/5373c80) ([#113](https://github.com/kh4f/manual-sorting/issues/113))

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🎨 Style
- **dnd**: improve visual clarity of active drop zone [`e63f740`](https://github.com/kh4f/manual-sorting/commit/e63f740)
- **modal**: add `mod-form` class for narrower modal layout [`37fb900`](https://github.com/kh4f/manual-sorting/commit/37fb900)

##### &emsp;&ensp;&nbsp;&nbsp; [_All Release Commits_](https://github.com/kh4f/manual-sorting/compare/3.2.1...3.2.2) &ensp;•&ensp; _Dec 25, 2025_


## &ensp; [` 📦 3.2.1  `](https://github.com/kh4f/manual-sorting/compare/3.2.0...3.2.1)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🩹 Fixes
- **dnd**: 
  - increase drag zone activation width to `36px` [`6616215`](https://github.com/kh4f/manual-sorting/commit/6616215)
  - validate dragged element is tree item before processing [`8e5061b`](https://github.com/kh4f/manual-sorting/commit/8e5061b) ([#108](https://github.com/kh4f/manual-sorting/issues/108))
- **styles**: add spaces around operator in `calc` expression [`e9994fe`](https://github.com/kh4f/manual-sorting/commit/e9994fe)

##### &emsp;&ensp;&nbsp;&nbsp; [_All Release Commits_](https://github.com/kh4f/manual-sorting/compare/3.2.0...3.2.1) &ensp;•&ensp; _Dec 13, 2025_


## &ensp; [` 📦 3.2.0  `](https://github.com/kh4f/manual-sorting/compare/3.1.0...3.2.0)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✨ Features
- **dnd**: activate drop zones on mouse hold before drag start [`1de433f`](https://github.com/kh4f/manual-sorting/commit/1de433f) ([#100](https://github.com/kh4f/manual-sorting/issues/100))

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🩹 Fixes
- **dnd**: 
  - clear `futureSibling` state after drop to prevent unintended moves on mobile [`fa76bbd`](https://github.com/kh4f/manual-sorting/commit/fa76bbd)
  - prevent click event propagation on drag handle to explorer item [`51eb4c8`](https://github.com/kh4f/manual-sorting/commit/51eb4c8)
- **dnd-manager**: prevent drop handler execution when drag wasn't initiated [`139a5d4`](https://github.com/kh4f/manual-sorting/commit/139a5d4)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🚜 Refactoring
- **settings**: update settings storage format and add migration to v4 [`0ad2816`](https://github.com/kh4f/manual-sorting/commit/0ad2816)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🎨 Style
- **modal**: 
  - change cancel button text from "Cancel" to "Nope" [`1f41b31`](https://github.com/kh4f/manual-sorting/commit/1f41b31)
  - correct title casing from 'Manual sorting' to 'Manual Sorting' [`8aedacd`](https://github.com/kh4f/manual-sorting/commit/8aedacd)
- **drag-handles**: update drag handle icon to traditional 2-row 6-dot pattern [`0538258`](https://github.com/kh4f/manual-sorting/commit/0538258)

##### &emsp;&ensp;&nbsp;&nbsp; [_All Release Commits_](https://github.com/kh4f/manual-sorting/compare/3.1.0...3.2.0) &ensp;•&ensp; _Dec 10, 2025_


## &ensp; [` 📦 3.1.0  `](https://github.com/kh4f/manual-sorting/compare/3.0.3...3.1.0)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✨ Features
- **dnd**: implement auto-scrolling during dragging [`9365d21`](https://github.com/kh4f/manual-sorting/commit/9365d21)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🩹 Fixes
- **dnd-manager**: 
  - remove element caching logic causing drag-and-drop failures [`f7891ca`](https://github.com/kh4f/manual-sorting/commit/f7891ca)
  - ensure settings are saved even when item is dropped at same position [`eef0f91`](https://github.com/kh4f/manual-sorting/commit/eef0f91)
- **dnd**: restore drag indicators when pointer returns to explorer bounds [`cba2313`](https://github.com/kh4f/manual-sorting/commit/cba2313)
- **styles**: prevent drag handles from appearing in non-file explorers [`3453f23`](https://github.com/kh4f/manual-sorting/commit/3453f23)

##### &emsp;&ensp;&nbsp;&nbsp; [_All Release Commits_](https://github.com/kh4f/manual-sorting/compare/3.0.3...3.1.0) &ensp;•&ensp; _Nov 19, 2025_


## &ensp; [` 📦 3.0.3  `](https://github.com/kh4f/manual-sorting/compare/3.0.2...3.0.3)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🩹 Fixes
- **dnd**: 
  - prevent drop indicators from disappearing during explorer scroll while dragging [`76919ed`](https://github.com/kh4f/manual-sorting/commit/76919ed)
  - prevent folder order reset when dragging to empty explorer area [`885af77`](https://github.com/kh4f/manual-sorting/commit/885af77)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⚡ Performance
- **dnd-manager**: 
  - add basic element caching while explorer scroll position remains unchanged [`701ccb4`](https://github.com/kh4f/manual-sorting/commit/701ccb4)
  - calculate `explorerRect` once in `dragStartHandler` instead of on every drag event [`e4aadcc`](https://github.com/kh4f/manual-sorting/commit/e4aadcc)
  - move no-op check from `order-manager` to `dnd-manager` [`4b6ca4b`](https://github.com/kh4f/manual-sorting/commit/4b6ca4b)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🎨 Style
- **logger**: enhance logger styles and tag format [`3f9135a`](https://github.com/kh4f/manual-sorting/commit/3f9135a)

##### &emsp;&ensp;&nbsp;&nbsp; [_All Release Commits_](https://github.com/kh4f/manual-sorting/compare/3.0.2...3.0.3) &ensp;•&ensp; _Nov 12, 2025_


## &ensp; [` 📦 3.0.2  `](https://github.com/kh4f/manual-sorting/compare/3.0.1...3.0.2)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🩹 Fixes
- **dnd**: 
  - prevent instant folder expansion during drag on mobile [`d4b2474`](https://github.com/kh4f/manual-sorting/commit/d4b2474) ([#90](https://github.com/kh4f/manual-sorting/issues/90))
  - prevent explorer scrolling during drag on mobile [`1267d8d`](https://github.com/kh4f/manual-sorting/commit/1267d8d)
  - prevent dragged folder auto-expansion when dragging on mobile [`4d9c601`](https://github.com/kh4f/manual-sorting/commit/4d9c601)
  - prevent item move when dropped outside explorer [`06374ac`](https://github.com/kh4f/manual-sorting/commit/06374ac)
  - prevent drop zones from displaying inside dragged folder descendants [`6ea7056`](https://github.com/kh4f/manual-sorting/commit/6ea7056)

##### &emsp;&ensp;&nbsp;&nbsp; [_All Release Commits_](https://github.com/kh4f/manual-sorting/compare/3.0.1...3.0.2) &ensp;•&ensp; _Nov 9, 2025_


## &ensp; [` 📦 3.0.1  `](https://github.com/kh4f/manual-sorting/compare/3.0.0...3.0.1)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🩹 Fixes
- **dnd**: 
  - handle dragging outside explorer correctly [`a574453`](https://github.com/kh4f/manual-sorting/commit/a574453)
  - add drag handle for touch devices to prevent unintended drag events during scrolling [`b7304b7`](https://github.com/kh4f/manual-sorting/commit/b7304b7) ([#91](https://github.com/kh4f/manual-sorting/issues/91), [#87](https://github.com/kh4f/manual-sorting/issues/87))
  - fix drop zone visibility issues [`5edf809`](https://github.com/kh4f/manual-sorting/commit/5edf809)
- **dnd-manager**: 
  - prevent race condition in drop indicator cleanup [`d3794ae`](https://github.com/kh4f/manual-sorting/commit/d3794ae)
  - prevent item jump when dragging to same position [`3f7a363`](https://github.com/kh4f/manual-sorting/commit/3f7a363) ([#88](https://github.com/kh4f/manual-sorting/issues/88))

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⚡ Performance
- **dnd-manager**: throttle drag event handling with RAF [`6a637ea`](https://github.com/kh4f/manual-sorting/commit/6a637ea) ([#89](https://github.com/kh4f/manual-sorting/issues/89))

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;♻️ Reverts
- **dnd-manager**: optimize drag and drop performance with RAF and element caching [`e5d72b1`](https://github.com/kh4f/manual-sorting/commit/e5d72b1) ([#89](https://github.com/kh4f/manual-sorting/issues/89))

##### &emsp;&ensp;&nbsp;&nbsp; [_All Release Commits_](https://github.com/kh4f/manual-sorting/compare/3.0.0...3.0.1) &ensp;•&ensp; _Nov 8, 2025_


## &ensp; [` 📦 3.0.0  `](https://github.com/kh4f/manual-sorting/compare/2.5.1...3.0.0)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⚠️ BREAKING CHANGES
- Changed settings storage format: renamed `customFileOrder` to `customOrder`, `selectedSortOrder` to `sortOrder`, and `newItemsPosition` to `newItemPlacement`. <sup>[1]</sup>
- Removed `draggingEnabled` option. <sup>[1]</sup>

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⚡ Performance
- **dnd-manager**: optimize drag and drop performance with RAF and element caching [`8116e5e`](https://github.com/kh4f/manual-sorting/commit/8116e5e)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🚜 Refactoring
- **core**: migrate to custom DnD engine and update patching logic [`0609f36`](https://github.com/kh4f/manual-sorting/commit/0609f36) ⚠️<sup>[1]</sup> ([#34](https://github.com/kh4f/manual-sorting/issues/34), [#46](https://github.com/kh4f/manual-sorting/issues/46), [#48](https://github.com/kh4f/manual-sorting/issues/48), [#49](https://github.com/kh4f/manual-sorting/issues/49), [#73](https://github.com/kh4f/manual-sorting/issues/73))

##### &emsp;&ensp;&nbsp;&nbsp; [_All Release Commits_](https://github.com/kh4f/manual-sorting/compare/2.5.1...3.0.0) &ensp;•&ensp; _Nov 6, 2025_


## &ensp; [` 📦 2.5.1  `](https://github.com/kh4f/manual-sorting/compare/2.5.0...2.5.1)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🩹 Fixes
- **explorer-manager**: 
  - track file explorer mounting to correctly update related states [`7073d54`](https://github.com/kh4f/manual-sorting/commit/7073d54) ([#54](https://github.com/kh4f/manual-sorting/issues/54))
  - prevent duplicate 'Reload app' button in file explorer header [`7ee34d1`](https://github.com/kh4f/manual-sorting/commit/7ee34d1)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⚡ Performance
- **patcher**: replace post-processing reordering with incremental insertion during load [`739d645`](https://github.com/kh4f/manual-sorting/commit/739d645) ([#34](https://github.com/kh4f/manual-sorting/issues/34), [#68](https://github.com/kh4f/manual-sorting/issues/68))

##### &emsp;&ensp;&nbsp;&nbsp; [_All Release Commits_](https://github.com/kh4f/manual-sorting/compare/2.5.0...2.5.1) &ensp;•&ensp; _Oct 14, 2025_


## &ensp; [` 📦 2.5.0  `](https://github.com/kh4f/manual-sorting/compare/2.4.0...2.5.0)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✨ Features
- **settings**: 
  - add `newItemsPosition` option to control default position for new items [`f1f3bdf`](https://github.com/kh4f/manual-sorting/commit/f1f3bdf) ([#45](https://github.com/kh4f/manual-sorting/issues/45))
  - add settings tab with debug mode toggle [`09d296f`](https://github.com/kh4f/manual-sorting/commit/09d296f)
- **plugin**: add live file explorer refresh on external settings changes [`5d59d2a`](https://github.com/kh4f/manual-sorting/commit/5d59d2a) ([#63](https://github.com/kh4f/manual-sorting/issues/63))
- **logger**: implement centralized logging system [`46f8c2e`](https://github.com/kh4f/manual-sorting/commit/46f8c2e)

### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🩹 Fixes
- **plugin**: 
  - enable `debugMode` by default in dev environment on first launch [`a34f29a`](https://github.com/kh4f/manual-sorting/commit/a34f29a)
  - prevent `getAttribute` error on non-HTMLElement `firstChild` [`06ee68f`](https://github.com/kh4f/manual-sorting/commit/06ee68f)
  - replace external `i18next` with Obsidian's built-in global [`841cc79`](https://github.com/kh4f/manual-sorting/commit/841cc79)
  - use `childrenEl` prototype for patching explorer [`7b3d993`](https://github.com/kh4f/manual-sorting/commit/7b3d993)

##### &emsp;&ensp;&nbsp;&nbsp; [_All Release Commits_](https://github.com/kh4f/manual-sorting/compare/2.4.0...2.5.0) &ensp;•&ensp; _Oct 9, 2025_


## [2.4.0](https://github.com/Kh4f/manual-sorting/compare/2.3.3...2.4.0) (2025-05-04)

### 🚀 Features

* **dev:** add app reload button to file explorer header in dev mode ([6771a2e](https://github.com/Kh4f/manual-sorting/commit/6771a2e7c098a7f19876523c9d44ece5d427acde))


### 🩹 Bug Fixes

* **ui:** preserve scroll filler div at the top of tree-item containers when inserting new items ([01dd1ab](https://github.com/Kh4f/manual-sorting/commit/01dd1abd2091eeb1b5f6e0c96278d2f4512d07b2)), closes [#43](https://github.com/Kh4f/manual-sorting/issues/43)


### [2.3.3](https://github.com/Kh4f/manual-sorting/compare/2.3.2...2.3.3) (2025-04-30)


### 🩹 Bug Fixes

* **mobile:** prevent tooltip and hover simulation after dragging ([f6de298](https://github.com/Kh4f/manual-sorting/commit/f6de2988e5a285023e6b6609100a692964cddf68))

### [2.3.2](https://github.com/Kh4f/manual-sorting/compare/2.3.1...2.3.2) (2025-04-27)


### 🩹 Bug Fixes

* **dnd:** correct file/folder info tooltip behavior while dragging ([15f463a](https://github.com/Kh4f/manual-sorting/commit/15f463aa4c82981eb0aec1f87c7447c75a4ec898))
* **dnd:** correct hover state after dragging ([916b773](https://github.com/Kh4f/manual-sorting/commit/916b7738efccb22a440d1ce1b7704101b2abdb43))

### [2.3.1](https://github.com/Kh4f/manual-sorting/compare/2.3.0...2.3.1) (2025-04-21)


### 🩹 Bug Fixes

* **settings:** resolve race condition causing manual sorting state to reset after restart ([4c13117](https://github.com/Kh4f/manual-sorting/commit/4c13117e628d14a1ed5289e6531ff00aabe1df3a)), closes [#41](https://github.com/Kh4f/manual-sorting/issues/41)

## [2.3.0](https://github.com/Kh4f/manual-sorting/compare/2.2.1...2.3.0) (2025-04-17)


### 🚀 Features

* **settings:** persist last selected sorting mode and "Dragging" state across plugin reloads ([9da2ca6](https://github.com/Kh4f/manual-sorting/commit/9da2ca63e9f0682c91125e2feb05b4bbebc02abc)), closes [#38](https://github.com/Kh4f/manual-sorting/issues/38) (based on the solution proposed by [@Mara-Li](https://github.com/Mara-Li) in [#39](https://github.com/Kh4f/manual-sorting/issues/39))


### 🩹 Bug Fixes

* **obsidian:** persist last selected built-in sorting mode across app reloads ([730917f](https://github.com/Kh4f/manual-sorting/commit/730917f5e1101eec7231205f38eee2a1c79aaba0))
* prevent toggling the 'Manual sorting' option when it's already active ([26908bb](https://github.com/Kh4f/manual-sorting/commit/26908bb2dfade62253c65d679c20f0e364295e0e))


### 🧹 Adjustments

* extract `FileExplorerView` retrieval logic into `getFileExplorerView` method ([977197d](https://github.com/Kh4f/manual-sorting/commit/977197d05a2bc68016080a36cfb41e9744f4002d))
* **FileOrderManager:** add type annotations to filter and map functions ([a0039f4](https://github.com/Kh4f/manual-sorting/commit/a0039f433fe16d3f2c3f1bec0b240c5e8783aa05))
* **FileOrderManager:** remove comments before `FileOrderManager` and `_saveCustomOrder` ([e7803bc](https://github.com/Kh4f/manual-sorting/commit/e7803bcb5d618e740f2942796fdfeb530cf0e12c))
* **FileOrderManager:** remove data migration method ([bf83458](https://github.com/Kh4f/manual-sorting/commit/bf83458cf51a0c90c1c2b23f3057593df3958dfa))
* **modal:** clarify reset order confirmation message with target sorting mode ([b0d404b](https://github.com/Kh4f/manual-sorting/commit/b0d404b49161892ee9f277c53c42828d2ed1adf6))
* **package-lock:** update versions and repository URLs ([fa1a520](https://github.com/Kh4f/manual-sorting/commit/fa1a52008d4f9091ffe74b77964e5f133fb6a01c))
* **package:** update project name and repository url ([ec76ead](https://github.com/Kh4f/manual-sorting/commit/ec76eaddd56a826dbe520fc9c21a1868c01d105c))
* **types:** rename `PluginData` interface to `PluginSettings` ([5f7a508](https://github.com/Kh4f/manual-sorting/commit/5f7a508e6e2a57bb171fb7030598108ce5243deb))
* **ui:** change icon for `Manual Sorting` option from 'user' to 'pin' ([7d84dba](https://github.com/Kh4f/manual-sorting/commit/7d84dba778179bf2492b0f220fa8b129d9a3a678))

### [2.2.1](https://github.com/Kh4f/obsidian-manual-sorting/compare/2.2.0...2.2.1) (2025-04-16)


### 🧹 Adjustments

* **manifest:** correct description formatting ([52a5a23](https://github.com/Kh4f/obsidian-manual-sorting/commit/52a5a2363f46017d439c334253b1e2f025c92392))
* **manifest:** update description ([dd6bd0b](https://github.com/Kh4f/obsidian-manual-sorting/commit/dd6bd0ba7e0f8a01112f065618020c4b18089641))
* **package:** add i18next override to resolve dependency conflict ([0b2fa80](https://github.com/Kh4f/obsidian-manual-sorting/commit/0b2fa80ae8fb84958779f6631d805ebea77b1559))
* **package:** update description and add `drag-and-drop` keyword ([1701b7b](https://github.com/Kh4f/obsidian-manual-sorting/commit/1701b7b41f481ea530e96f7fdae4a2173e51c473))

## [2.2.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/2.1.2...2.2.0) (2025-04-13)

### 🚀 Features

* **dnd:** implement drag-and-drop toggle based on `Dragging` checkbox ([415b187](https://github.com/Kh4f/obsidian-manual-sorting/commit/415b187fd399214b26bd87ac305e87104198a478)), closes [#36](https://github.com/Kh4f/obsidian-manual-sorting/issues/36)
* **menu:** add `Dragging` checkbox to toggle drag & drop in `Change sort order` menu ([017df8c](https://github.com/Kh4f/obsidian-manual-sorting/commit/017df8c9528669110166de5e6b319359aff89341)), refs [#36](https://github.com/Kh4f/obsidian-manual-sorting/issues/36)
* **menu:** update custom option icons using Lucide icon library ([bffa4fc](https://github.com/Kh4f/obsidian-manual-sorting/commit/bffa4fcab2932baca27e47d36be264974be45a1a))


### 🩹 Bug Fixes

* **dnd:** ensure elements update position after drop when dragging is disabled ([ce44dc4](https://github.com/Kh4f/obsidian-manual-sorting/commit/ce44dc48f1c73b5a82302600994b9d3c389c9a1b)), refs [#36](https://github.com/Kh4f/obsidian-manual-sorting/issues/36)
* **dnd:** prevent dispatching drop event in `onUnchoose` when dragging is disabled ([cee129f](https://github.com/Kh4f/obsidian-manual-sorting/commit/cee129f302b5bd5385ca3b993dd87120ef0a7766)), refs [#36](https://github.com/Kh4f/obsidian-manual-sorting/issues/36)


### 🧹 Adjustments

* make `patchSortable` async ([636b85f](https://github.com/Kh4f/obsidian-manual-sorting/commit/636b85ffbccc937c82f09e663cb6222541ae1071))
* replace firstChild with firstElementChild for `childPath` in `setChildrenInPlace` ([61e83b3](https://github.com/Kh4f/obsidian-manual-sorting/commit/61e83b320de09d9a0d4d129dc874a4657b0ae83b))

### [2.1.2](https://github.com/Kh4f/obsidian-manual-sorting/compare/2.1.1...2.1.2) (2025-04-11)


### 🩹 Bug Fixes

* **`patchFileExplorer`:** ensure patched `setChildrenInPlace` only runs for elements with "nav-" in classList ([e0168b6](https://github.com/Kh4f/obsidian-manual-sorting/commit/e0168b62bbbb59bdc8b18ddce177cebf4f8184b6)), closes [#35](https://github.com/Kh4f/obsidian-manual-sorting/issues/35), refs [#29](https://github.com/Kh4f/obsidian-manual-sorting/issues/29)

### 🧹 Adjustments

* **revert:** "fix: prevent sorting from affecting outline panel elements" ([21c8234](https://github.com/Kh4f/obsidian-manual-sorting/commit/21c8234e03a14f9d8ebc82305d10a19075812e77))

### [2.1.1](https://github.com/Kh4f/obsidian-manual-sorting/compare/2.1.0...2.1.1) (2025-04-09)


### 🩹 Bug Fixes

* **drag-and-drop:** fix jittering after emptying folder by patching Sortable's `_onDragOver` ([3d8d20d](https://github.com/Kh4f/obsidian-manual-sorting/commit/3d8d20d5606d62fb2cc3ba9363b90f62ef70caf3)), closes [#33](https://github.com/Kh4f/obsidian-manual-sorting/issues/33)

## [2.1.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/2.0.0...2.1.0) (2025-03-30)


### ⚡ Performance

* run `updateOrder` only for manually created files ([3991f62](https://github.com/Kh4f/obsidian-manual-sorting/commit/3991f62527a752ff875c3f16e913497d091aa7e7))
* skip `restoreOrder` if all elements are already loaded ([db17d2c](https://github.com/Kh4f/obsidian-manual-sorting/commit/db17d2c8f22e08c57753d4463985237fbf69dad4)), refs [#34](https://github.com/Kh4f/obsidian-manual-sorting/issues/34)


### 🚀 Features

* implement custom name conflict resolution for moved items ([507bc5f](https://github.com/Kh4f/obsidian-manual-sorting/commit/507bc5f50c2628077a5c1d5cb979f1c5639b04d0))


### 🩹 Bug Fixes

* **order-manager:** enhance `_matchSavedOrder` method to remove duplicates ([9bc98c5](https://github.com/Kh4f/obsidian-manual-sorting/commit/9bc98c51b8f3fa9fd36cbec7acf8f18c70710a96))


### 🧹 Adjustments

* **`_matchSavedOrder`:** update comment to reflect new behavior of adding files to the beginning of the list ([b4c05b4](https://github.com/Kh4f/obsidian-manual-sorting/commit/b4c05b4d51dd198f5a3bfcf92e72220cc3a81b62))
* **FileOrderManager:** rename `migrateDataToNewFormat` method to `_migrateDataToNewFormat` ([00a989e](https://github.com/Kh4f/obsidian-manual-sorting/commit/00a989e268187119734c72bc3da2e3751a114938))
* rename `OrderManager` class to `FileOrderManager` ([90a731b](https://github.com/Kh4f/obsidian-manual-sorting/commit/90a731babeadd67c42aaa6fd3e4e7d2ec4b2c2f8))

## [2.0.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.11.4...2.0.0) (2025-03-28)


### ⚠ BREAKING CHANGES

Changed the data storage format from `{"folder1":[], "folder2":[]}` to `{customFileOrder: {"folder1":[], "folder2":[]}}`.
This allows storing additional data in the plugin’s storage, such as settings or paths for folders excluded from manual sorting.

A migration method `OrderManager.migrateDataToNewFormat()` has been added to automatically convert existing data to the new format. However, **this method will be removed in future versions**.


### 🚀 Features

* **menu:** always display '🗑️ Reset order' option regardless of selected sorting mode ([87d05ee](https://github.com/Kh4f/obsidian-manual-sorting/commit/87d05eee956a7621451de86055f0ada1eb68971d))
* **menu:** toggle manual sorting off and restore previous sorting mode when deselected ([f91f526](https://github.com/Kh4f/obsidian-manual-sorting/commit/f91f5265c3f5a481338700faa50048a9e2f42a77))


### 🧹 Adjustments
* **order-manager:** rewrite logic to simplify custom file order handling ([dd561b5](https://github.com/Kh4f/obsidian-manual-sorting/commit/dd561b5802539fdf2322857845741e027bae6d2e))
  - Removed the operation queue as it is no longer needed due to storing the order in `_customFileOrder`. 
  - Removed calls to `updateVirtualDisplay()` and `updateShowUnsupportedFiles()`, as they are no longer necessary due to improved logic for handling moved elements after drag-and-drop (12c9614). 
  - The heavy `updateOrder()` method is now only called during initialization (`initOrder()`) and when adding/removing DOM elements. 
  - Minimized `restoreOrder()` calls.
* **`patchSortOrderMenu`:** add missing return before calling original function ([1f8dfbd](https://github.com/Kh4f/obsidian-manual-sorting/commit/1f8dfbd8471b31cee768190f81f59b01d68f0292))
* **`patchSortOrderMenu`:** remove unnecessary await for `resetOrder` and replace `initOrder` with `updateOrder` ([e8277d1](https://github.com/Kh4f/obsidian-manual-sorting/commit/e8277d1b867d191ca48cf726c04149c46419974a))
* **`setChildrenInPlace`:** remove unused container variable and related logic ([a95b4a9](https://github.com/Kh4f/obsidian-manual-sorting/commit/a95b4a9c9392d2ac7b9235548f98e453db3ef5d6))
* **menu:** remove unnecessary 'custom-sorting' section from menu ([fdde071](https://github.com/Kh4f/obsidian-manual-sorting/commit/fdde07149bdc133d41f68c79f5d18d38a383f7d6))
* **package:** update dependencies to use caret notation ([9640eb6](https://github.com/Kh4f/obsidian-manual-sorting/commit/9640eb6f1cf3497fd0dcadbddb30d06355c70b6c))
* process manually created folders only when manual sorting is enabled ([e392048](https://github.com/Kh4f/obsidian-manual-sorting/commit/e392048df8c77241600902155dd3a3a58ce3ddde))
* set `_manualSortingEnabled` to false by default and enable it in initialize() ([6347edf](https://github.com/Kh4f/obsidian-manual-sorting/commit/6347edfcb13f18d3a0d1de923eff21136c4309f2))
* **sortable:** call `onRename` instead of `restoreOrder` in `onEnd` for better DOM sync ([12c9614](https://github.com/Kh4f/obsidian-manual-sorting/commit/12c9614569aad3a9bb78a3ebdf97ec078ce53523))
* **types:** add all missing types and integrate `obsidian-typings` ([7fc6ac4](https://github.com/Kh4f/obsidian-manual-sorting/commit/7fc6ac486038716028521baf8043f3b01df22949))
* **types:** add definition for `CustomFileOrder` interface ([532afc3](https://github.com/Kh4f/obsidian-manual-sorting/commit/532afc399a10f947092cacf3fc8d826518861e93))
* **types:** add TypeScript definitions for SortableJS ([44169b5](https://github.com/Kh4f/obsidian-manual-sorting/commit/44169b5ec0a5e1d2b053d88f954663dac2259a05))
* update manually folder creation check to use TFolder instance ([433c61b](https://github.com/Kh4f/obsidian-manual-sorting/commit/433c61b7bfe7bafe0a309a5fea125c4eb500b6dd))


### [1.11.4](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.11.3...1.11.4) (2025-03-27)


### 🩹 Bug Fixes

* **drag-and-drop:** prevent elements jittering after emptying folder by overriding `setCollapsed` ([4f9bcd0](https://github.com/Kh4f/obsidian-manual-sorting/commit/4f9bcd08dcea2d78e84e1ce27ef3308bd3625e13)), closes [#13](https://github.com/Kh4f/obsidian-manual-sorting/issues/13)
* **ui:** correct hovered item after dragging ends by simulating drop event ([67b680f](https://github.com/Kh4f/obsidian-manual-sorting/commit/67b680fbdd5e6e66db79fbeffcbd104d151e9fe3)), closes [#9](https://github.com/Kh4f/obsidian-manual-sorting/issues/9)

### [1.11.3](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.11.2...1.11.3) (2025-03-25)


### 🩹 Bug Fixes

* **`setChildrenInPlace`:** adjust leaf detection logic with `parentLeafContent` check ([811c35c](https://github.com/Kh4f/obsidian-manual-sorting/commit/811c35c47109cc09afbe85de0593d451b7273d1e)), refs [#26](https://github.com/Kh4f/obsidian-manual-sorting/issues/26)

### [1.11.2](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.11.1...1.11.2) (2025-03-25)


### 🩹 Bug Fixes

* **mobile:** increase delay before dragging to 100ms on touch screens ([55a64d4](https://github.com/Kh4f/obsidian-manual-sorting/commit/55a64d4dd566f14cb9e23481e93ae96e933c0029)), refs [#24](https://github.com/Kh4f/obsidian-manual-sorting/issues/24)

### [1.11.1](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.11.0...1.11.1) (2025-03-24)


### 🩹 Bug Fixes

* prevent sorting from affecting outline panel elements ([3b0e89f](https://github.com/Kh4f/obsidian-manual-sorting/commit/3b0e89f876880ce8f4608bda55fa6ec49ca7b1de)), closes [#29](https://github.com/Kh4f/obsidian-manual-sorting/issues/29)

## [1.11.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.10.2...1.11.0) (2025-03-24)


### 🚀 Features

* add autoscrolling when dragging items outside window ([3838dd6](https://github.com/Kh4f/obsidian-manual-sorting/commit/3838dd66fc2e10bad392d6731b0c75806510fa26)), closes [#26](https://github.com/Kh4f/obsidian-manual-sorting/issues/26)
* add smooth scrolling and correct scroll position after manual sorting ([2970987](https://github.com/Kh4f/obsidian-manual-sorting/commit/297098722a5fd736bbd7210cd7a89a0d87773c75))
* make `swapThreshold` dynamic based on adjacent folders ([25a8153](https://github.com/Kh4f/obsidian-manual-sorting/commit/25a815387cbc9c5826a8bedeeaabed70c20f5aaf))


### 🩹 Bug Fixes

* **`waitForExplorer`:** ensure it resolves if explorer already exists ([53c823f](https://github.com/Kh4f/obsidian-manual-sorting/commit/53c823f8afe6c63622ed03238f646c90a8e657a9))
* add `toggleSortingClass`  to apply styles for explorer only when manual sorting is enabled ([1c641ca](https://github.com/Kh4f/obsidian-manual-sorting/commit/1c641ca566883be89c87be17845ce867d0e2f357))
* **order-manager:** call `updateOrder` instead of `updateVirtualDisplay` after removing misplaced element ([a5f0ee1](https://github.com/Kh4f/obsidian-manual-sorting/commit/a5f0ee17be752a53147a46e0a3749d65ba2c27e1))
* **order-manager:** call `updateShowUnsupportedFiles` to sync file explorer with actual file structure after reordering ([908d772](https://github.com/Kh4f/obsidian-manual-sorting/commit/908d772e579e48f519df6eb1e922a3515f2c0c61))
* **order-manager:** improve folder path validation and remove misplaced elements ([56e0c14](https://github.com/Kh4f/obsidian-manual-sorting/commit/56e0c14ea3791d52b1af0af5686a377e4ccee803))
* **order-manager:** prevent adding duplicate paths after moving item ([6ec8ab9](https://github.com/Kh4f/obsidian-manual-sorting/commit/6ec8ab9396615b19b3be7e218687607f1969deb4))
* **order-manager:** restore scroll position after reordering items ([f44ad71](https://github.com/Kh4f/obsidian-manual-sorting/commit/f44ad71a8b5bdd15a02bc1febf68011395ac4991))
* **order-manager:** update `restoreOrder` to accept folder path as parameter ([ccd0b94](https://github.com/Kh4f/obsidian-manual-sorting/commit/ccd0b94e7681f66f1414a7e84785c7690ac695ae))
* prevent unexpected scrolling after renaming or moving an item ([adf088b](https://github.com/Kh4f/obsidian-manual-sorting/commit/adf088b07305b12c994d7100255cc25be148dab6))
* remove manual data-path update and enable `renameFile` for files at drag end ([efcd37c](https://github.com/Kh4f/obsidian-manual-sorting/commit/efcd37c443678d8af378bbc3c2f9d9545d75c57f))
* **sortable:** add `setData` to enable dragging notes to tabs, new leaf or canvas ([35af97c](https://github.com/Kh4f/obsidian-manual-sorting/commit/35af97c560bc21ad87dce842e9abd111ece4fcfc)), closes [#25](https://github.com/Kh4f/obsidian-manual-sorting/issues/25)


### 🧹 Adjustments

* **`onEnd`:** simplify `destinationPath` and `previousItemPath` assignment ([898fc15](https://github.com/Kh4f/obsidian-manual-sorting/commit/898fc157aceedb402f882a4d5e66db043436ae66))
* **`patchFileExplorer`:** simplify `onRename` and `setSortOrder` method ([4d5937d](https://github.com/Kh4f/obsidian-manual-sorting/commit/4d5937dba7d766537ef08840ffdd993b6191d0fb))
* **`patchFileExplorer`:** wrap Sortable initialization in `makeSortable` function ([71437b1](https://github.com/Kh4f/obsidian-manual-sorting/commit/71437b16f4cf5eb6fb566a79613ff3a02c161158))
* **`restoreOrder`:** move scrollTop initialization to where it still has value ([220a05e](https://github.com/Kh4f/obsidian-manual-sorting/commit/220a05e483a5edbae26c15bd6237d530dd9d0583))
* **`toggleSortingClass`:** remove unnecessary console warning ([7d09064](https://github.com/Kh4f/obsidian-manual-sorting/commit/7d09064fd9ed2ae822f33dc255c99202764b0557))
* **`waitForExplorer`:** avoid duplicate querySelector calls ([2a108c1](https://github.com/Kh4f/obsidian-manual-sorting/commit/2a108c1e79271f08354924960ad91b151980b33b))
* **`waitForExplorer`:** make return the dom element ([c70bfe5](https://github.com/Kh4f/obsidian-manual-sorting/commit/c70bfe52f69b6cc451f27f238c63ed05f3425588))
* **`waitForExplorer`:** move function to class level ([73d6a4d](https://github.com/Kh4f/obsidian-manual-sorting/commit/73d6a4d7daaeb491b94211c25eef48ccc097ac48))
* add blank lines between properties in Sortable configuration ([ae3e90c](https://github.com/Kh4f/obsidian-manual-sorting/commit/ae3e90c3d543ff2365c8c19e5b23842c808d5999))
* **debug:** add logs for Sortable events ([75f10c7](https://github.com/Kh4f/obsidian-manual-sorting/commit/75f10c7ceab324e2acdb212139295436f8ffa92c))
* **modal:** add `manual-sorting-modal` class for more specific `.modal-buttons` styling ([efdd991](https://github.com/Kh4f/obsidian-manual-sorting/commit/efdd991355adacc0ac3b4b6d16158ad83b33c61e))
* **order-manager:** remove unnecessary comma in file order result ([1bf0673](https://github.com/Kh4f/obsidian-manual-sorting/commit/1bf0673fa65556f3ab5f34e6b7a1d2677bedfa5e))
* remove unnecessary await from `reloadExplorerPlugin` calls ([ed6d567](https://github.com/Kh4f/obsidian-manual-sorting/commit/ed6d5679b1ae7807017069637607a8937bee151f))
* update variable names to use underscore prefix for private properties ([f1a7aa7](https://github.com/Kh4f/obsidian-manual-sorting/commit/f1a7aa7471a0b57e67fc478699d4df9fb12d52f3))
* **versionrc:** include `style` commits in `Adjustments` section ([264969a](https://github.com/Kh4f/obsidian-manual-sorting/commit/264969affe6c1bb9184766c4da52efcf14f1077a))


### [1.10.2](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.10.1...1.10.2) (2025-03-21)


### 🩹 Bug Fixes

* **compatibility:** add custom chosenClass and ghostClass to resolve cMenu plugin conflict ([26c0567](https://github.com/Kh4f/obsidian-manual-sorting/commit/26c0567a743cf8468358b6ff7765c3d89900016f)), closes [#21](https://github.com/Kh4f/obsidian-manual-sorting/issues/21) [#24](https://github.com/Kh4f/obsidian-manual-sorting/issues/24)

### [1.10.1](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.10.0...1.10.1) (2025-03-21)


### 🩹 Bug Fixes

* **mobile:** add delay before drag starts to prevent accidental reordering during scroll ([6938ce6](https://github.com/Kh4f/obsidian-manual-sorting/commit/6938ce6e5a8560729017f12417bf7c2ea9887866)), closes [#24](https://github.com/Kh4f/obsidian-manual-sorting/issues/24)

## [1.10.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.9.3...1.10.0) (2025-03-20)


### 🚀 Features

* add new files/folders to the beginning of the directory instead of the end ([c8c6045](https://github.com/Kh4f/obsidian-manual-sorting/commit/c8c6045214c808c48b99b560f5302c6d0458505e))

### [1.9.3](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.9.2...1.9.3) (2025-03-20)


### 🩹 Bug Fixes

* preserve rename mode for manually created folders by skipping order restoration ([1934e85](https://github.com/Kh4f/obsidian-manual-sorting/commit/1934e85dcb00704baac1027325569149e0da14de)), closes [#23](https://github.com/Kh4f/obsidian-manual-sorting/issues/23)


### 🧹 Adjustments

* **debug:** add log message for order updates ([8660eef](https://github.com/Kh4f/obsidian-manual-sorting/commit/8660eefde343028da802e52025283e29ee3dbffd))

### [1.9.2](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.9.1...1.9.2) (2025-03-19)


### 🩹 Bug Fixes

* **ui:** apply margin-bottom style only to non-tree-item elements ([5d477d4](https://github.com/Kh4f/obsidian-manual-sorting/commit/5d477d426ecf1e4a42da091e6effec1f9d1d8678)), closes [#22](https://github.com/Kh4f/obsidian-manual-sorting/issues/22)

### [1.9.1](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.9.0...1.9.1) (2025-03-17)


### ⚡ Performance

* remove await before enabling Folder Notes plugin in reloadExplorerPlugin ([0207f62](https://github.com/Kh4f/obsidian-manual-sorting/commit/0207f62c3457b4735370499e4f3349671d2f9fe8))


### 🧹 Adjustments

* add console log for File Explorer plugin reloaded ([29b7f24](https://github.com/Kh4f/obsidian-manual-sorting/commit/29b7f245826333c06dcf3ff634ca026357ed6a14))
* combine patches for the same class into a single around function ([3dcb705](https://github.com/Kh4f/obsidian-manual-sorting/commit/3dcb705a16cf10bd8e468f2a7ed5a2b7706c0715))
* move `main.ts` to `src` folder and update `entryPoints` in `esbuild.config.mjs` ([9780d12](https://github.com/Kh4f/obsidian-manual-sorting/commit/9780d12128177f4fe9e582731780092e40e286cd))
* move `OrderManager` class to a separate file ([e23bb85](https://github.com/Kh4f/obsidian-manual-sorting/commit/e23bb8570f4d3e909a78a48231a8c49c7514d681))
* move `ResetOrderConfirmationModal` class to a separate file ([dd0df38](https://github.com/Kh4f/obsidian-manual-sorting/commit/dd0df38423837d925a5e3742fb11c1abce2fdad1))
* move `waitForExplorer` function inside `patchFileExplorer` ([42ada4e](https://github.com/Kh4f/obsidian-manual-sorting/commit/42ada4eb354dc29b22e4b3bdeb870ee9bcd9a342))
* move console log for reloading Folder Notes plugin to the top ([6aa0c2c](https://github.com/Kh4f/obsidian-manual-sorting/commit/6aa0c2c44b6b264037f3e45dac4b2df2c8de5bd2))
* move i18next type declaration to types.d.ts ([d2e261e](https://github.com/Kh4f/obsidian-manual-sorting/commit/d2e261e7b0fa64e5a29afe2a87707c375ec8b662))
* **order-manager:** make `cachedData` private ([3ebf6c6](https://github.com/Kh4f/obsidian-manual-sorting/commit/3ebf6c653376060920e4861de67f7e523dfd7434))
* remove `await` from `reloadExplorerPlugin` call in `initialize` ([526a98c](https://github.com/Kh4f/obsidian-manual-sorting/commit/526a98cac4f1a6923ba5d23b24772dc0185427b8))
* remove `deleteItem` function in `OrderManager` and replace its calls with `updateOrder` ([1e98b0d](https://github.com/Kh4f/obsidian-manual-sorting/commit/1e98b0d73a0ac99733e2c5d0a3c1d823411e44e6))
* remove `reloadFolderNotesPlugin` and inline its content into `reloadExplorerPlugin` ([1ad2c31](https://github.com/Kh4f/obsidian-manual-sorting/commit/1ad2c31031f8b462a7f2a0f1c1a4a72733cc1740))
* remove unnecessary .npmrc file ([ccfa3b1](https://github.com/Kh4f/obsidian-manual-sorting/commit/ccfa3b133b727c9a9b32dfb48cfaeca9f32c4fd2))
* rename `explorerPatches` to `explorerUnpatchFunctions` for clarity ([ea79ea7](https://github.com/Kh4f/obsidian-manual-sorting/commit/ea79ea7f7cd72ff03ec1e5786a6e315fca543184))
* replace `debugLog` function with esbuild `drop` configuration ([aa89b97](https://github.com/Kh4f/obsidian-manual-sorting/commit/aa89b97897715a4f2746a269efec7fefb42af52c))
* **types:** import only type from i18next ([99d9b0c](https://github.com/Kh4f/obsidian-manual-sorting/commit/99d9b0cc98fe3fdcdc7aba6ddb36e23018f6e13c))

## [1.9.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.8.2...1.9.0) (2025-03-15)


### 🚀 Features

* **order-manager:** add caching ([aaed1ee](https://github.com/Kh4f/obsidian-manual-sorting/commit/aaed1eee683f40d24f1fa5b75635c69b294b904d))
* **order-manager:** add getFlattenPaths method to retrieve all paths in a single array ([af1991c](https://github.com/Kh4f/obsidian-manual-sorting/commit/af1991c1dc5726e36e28495775e13b08ec3fde78))


### 🩹 Bug Fixes

* ensure correct selection range after reordering by patching `handleItemSelection` ([1b69a9e](https://github.com/Kh4f/obsidian-manual-sorting/commit/1b69a9ec842d2a57cf33acb426f1446da66480ab)), closes [#16](https://github.com/Kh4f/obsidian-manual-sorting/issues/16)
* prevent patching `detach` and `setFocusedItem` when manual sorting is disabled ([0deb1eb](https://github.com/Kh4f/obsidian-manual-sorting/commit/0deb1ebe566e55711e62056de785529fdccada2f))


### 🧹 Adjustments

* **order-manager:** make _queueOperation generic to support different return types ([adbf3d2](https://github.com/Kh4f/obsidian-manual-sorting/commit/adbf3d28fbfe6d973d43fc1dd95cf10d6c395d7e))

### [1.8.2](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.8.1...1.8.2) (2025-03-13)


### 🩹 Bug Fixes

* prevent scrolling when right-clicking an item by patching setFocusedItem ([8d61c6b](https://github.com/Kh4f/obsidian-manual-sorting/commit/8d61c6bf1eb640741f9d5000035bce5a57bcf022)), closes [#18](https://github.com/Kh4f/obsidian-manual-sorting/issues/18)
* **debug:** update debug log message to reference itemContainer directly ([ba7ca59](https://github.com/Kh4f/obsidian-manual-sorting/commit/ba7ca591da2d3dec9d1d177864f09aa0681c58e5))


### 🧹 Adjustments

* **revert:** fix(ui): adjust animation speed for smoother transition ([b5e5726](https://github.com/Kh4f/obsidian-manual-sorting/commit/b5e5726aa290219244221a886ed9e0e8c3acc2dc))
* **package.json:** add separate scripts for version bumping and tagging, remove version script ([e4ef759](https://github.com/Kh4f/obsidian-manual-sorting/commit/e4ef75939efbe944575c2c1091ab5a5f4f7592a5))
* **versionrc:** update postcommit and pretag scripts ([c52f548](https://github.com/Kh4f/obsidian-manual-sorting/commit/c52f5483fcbc3fe78c610e942eae5a4fb57b66b2))
* **versionrc:** update section labels ([943c09f](https://github.com/Kh4f/obsidian-manual-sorting/commit/943c09febfffa5df7225ce4d46167fd410868b06))

### [1.8.1](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.8.0...1.8.1) (2025-03-10)


### 🛠️ Changes

* remove unused code for fetching all folders ([f1e10ef](https://github.com/Kh4f/obsidian-manual-sorting/commit/f1e10ef85022d97d18d6ff2ae02124e552d2dd66))


### 🐞 Bug Fixes

* **compatibility:** add reload for Folder Notes plugin to resolve conflict ([ec48f17](https://github.com/Kh4f/obsidian-manual-sorting/commit/ec48f17ba7a3e6c1707cc6e2340c11464ed5f672)), closes [#11](https://github.com/Kh4f/obsidian-manual-sorting/issues/11)

## [1.8.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.7.4...1.8.0) (2025-03-10)


### 🐞 Bug Fixes

* **ui:** adjust animation speed for smoother transition ([31d355d](https://github.com/Kh4f/obsidian-manual-sorting/commit/31d355d3d530d81bec4644457944254f85e5efd0))


### 🛠️ Changes

* remove update and restore order logic based on rendered elements count ([cd66353](https://github.com/Kh4f/obsidian-manual-sorting/commit/cd66353fd1924462186ccd1b4530f33e78dc119a))


### 🚀 Features

* add restoreOrder call after moving an element ([cdb7044](https://github.com/Kh4f/obsidian-manual-sorting/commit/cdb7044a84e97e087c225ae9f5534e7b17a85a20))
* ensure ui matches saved order by calling updateVirtualDisplay in updateOrder ([ca9083b](https://github.com/Kh4f/obsidian-manual-sorting/commit/ca9083b2b67d59a1493ca6dc2f7a49e804e8e8a2))

### [1.7.4](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.7.3...1.7.4) (2025-03-09)


### 🐞 Bug Fixes

* ensure patched setChildrenInPlace runs only for items inside file explorer ([6613c48](https://github.com/Kh4f/obsidian-manual-sorting/commit/6613c481e1324aa4b1a26c438a7727c180f6c70a)), closes [#15](https://github.com/Kh4f/obsidian-manual-sorting/issues/15)

### [1.7.3](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.7.2...1.7.3) (2025-03-09)


### 🐞 Bug Fixes

* resolve issue with incorrect destinationPath when moving folders after hover callout ([4fae11f](https://github.com/Kh4f/obsidian-manual-sorting/commit/4fae11f05e09ef593ceff87406f6519df2352231))

### [1.7.2](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.7.1...1.7.2) (2025-03-09)


### 🐞 Bug Fixes

* **desktop:** resolve issue where item does not move when releasing mouse after hover callout ([ffc6e1b](https://github.com/Kh4f/obsidian-manual-sorting/commit/ffc6e1b3b5e7d8435b3116941fd4f44f15ca208b))

### [1.7.1](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.7.0...1.7.1) (2025-03-09)


### 🐞 Bug Fixes

* **ui:** fix cursor stuck in "grabbing" state when releasing mouse outside file explorer ([0c03d2a](https://github.com/Kh4f/obsidian-manual-sorting/commit/0c03d2a8376022a608e3e99d3bb0b13e88d36220)), closes [#9](https://github.com/Kh4f/obsidian-manual-sorting/issues/9)

## [1.7.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.6.1...1.7.0) (2025-03-09)


### 🚀 Features

* **drag-n-drop:** automatically collapse folder when dragging ([d1b0730](https://github.com/Kh4f/obsidian-manual-sorting/commit/d1b07303d4b2f2085e071a57bcad7e452a5a0266)), closes [#13](https://github.com/Kh4f/obsidian-manual-sorting/issues/13)

### [1.6.1](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.6.0...1.6.1) (2025-03-09)


### 🐞 Bug Fixes

* **ui:** further reduce large empty gaps between file structure elements ([ce08b0f](https://github.com/Kh4f/obsidian-manual-sorting/commit/ce08b0fbe9f23b2b7e9cb5b536a3ac90ad612531)), closes [#7](https://github.com/Kh4f/obsidian-manual-sorting/issues/7)

## [1.6.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.5.0...1.6.0) (2025-03-09)


### 🚀 Features

* add waitForExplorer method to ensure file explorer is loaded before patching ([10d460f](https://github.com/Kh4f/obsidian-manual-sorting/commit/10d460f3237f572624d753a0f4ed64f6d08486fe))
* enable plugin for mobile devices ([3f08a57](https://github.com/Kh4f/obsidian-manual-sorting/commit/3f08a5727479f34ade1c5e39b75a2d321baf92b1))
* manually trigger file renaming after moving between directories ([e9f94d8](https://github.com/Kh4f/obsidian-manual-sorting/commit/e9f94d88e86cda357feba63d729798a7bbd86355))

## [1.5.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.4.0...1.5.0) (2025-03-08)


### 🐞 Bug Fixes

* add optional chaining to prevent errors when accessing nextItem's firstChild ([a23b662](https://github.com/Kh4f/obsidian-manual-sorting/commit/a23b66289a97b9e977970a250b995f88ffcf75ef))
* **debug:** correct debug message from 'after' to 'before' ([e796833](https://github.com/Kh4f/obsidian-manual-sorting/commit/e796833f7c84c477456ae80c56084e72d9e94e8e))


### 🚀 Features

* **drag-and-drop:** prevent folder from moving when dragging item over it by adding swapThreshold ([de043d1](https://github.com/Kh4f/obsidian-manual-sorting/commit/de043d133389c51b5d0e6c6502fa8d2d903464ee)), closes [#10](https://github.com/Kh4f/obsidian-manual-sorting/issues/10)

## [1.4.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.3.7...1.4.0) (2025-03-08)


### 🚀 Features

* **order-manager:** rewrite OrderManager to index entire file structure and seamlessly update order after external changes ([786f924](https://github.com/Kh4f/obsidian-manual-sorting/commit/786f924bccb86ef647e899d4002189389deaa5e1))


### 🛠️ Changes

* replace itemInstance?.children with itemIsFolder variable ([752e70d](https://github.com/Kh4f/obsidian-manual-sorting/commit/752e70d1bb223cc44a83a1728f785c8b7e433494))


### 🐞 Bug Fixes

* ensure files are truly deleted before updating order ([29f5b71](https://github.com/Kh4f/obsidian-manual-sorting/commit/29f5b7128463fba201448a7dab082c439c087bea))
* **menu:** correct variable name from 'openManuButton' to 'openMenuButton' ([f8385d5](https://github.com/Kh4f/obsidian-manual-sorting/commit/f8385d52ddc935bb17ddcbdbdb021cba92a19d1a))
* override detach function to prevent deletion of offscreen files ([f296b9e](https://github.com/Kh4f/obsidian-manual-sorting/commit/f296b9e68c32268df654878544d777cf25e177c8))
* **ui:** reduce large empty gaps between file structure elements ([b1ab442](https://github.com/Kh4f/obsidian-manual-sorting/commit/b1ab4424021aacf34e40ca1cf0790dbe6058f623))

### [1.3.7](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.3.6...1.3.7) (2025-03-06)


### 🐞 Bug Fixes

* **menu:** ensure "Change sort order" click handler only applies in File Explorer ([a90690e](https://github.com/Kh4f/obsidian-manual-sorting/commit/a90690eabb5d8299b88de063aa6f7122954a4711)), closes [#6](https://github.com/Kh4f/obsidian-manual-sorting/issues/6)

### [1.3.6](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.3.5...1.3.6) (2025-02-28)


### 🐞 Bug Fixes

* **ui:** change modal title to sentence case ([cb2ec6c](https://github.com/Kh4f/obsidian-manual-sorting/commit/cb2ec6c2108bdd128464ea9fedf8f83f96ef682a))


### 🛠️ Changes

* **license:** update copyright year and owner ([fbb6e76](https://github.com/Kh4f/obsidian-manual-sorting/commit/fbb6e762d294d636182c9a2179508547a5bde1fb))
* replace outdated layout ready check with modern approach ([82f2951](https://github.com/Kh4f/obsidian-manual-sorting/commit/82f2951ce72b0235f49a59a94539e6e54437987e))

### [1.3.5](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.3.4...1.3.5) (2025-02-15)


### 🛠️ Changes

* **dependencies:** add i18next and update @babel/runtime ([17dc880](https://github.com/Kh4f/obsidian-manual-sorting/commit/17dc8808b431cdea7494c927488f5edcdcfefe67))
* **manifest.json:** set isDesktopOnly to true ([f200866](https://github.com/Kh4f/obsidian-manual-sorting/commit/f200866d8433d7599032858852a1a80d64109171))

### [1.3.4](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.3.3...1.3.4) (2025-02-12)


### 🛠️ Changes

* add refactor and chore sections to .versionrc ([888c7c6](https://github.com/Kh4f/obsidian-manual-sorting/commit/888c7c6742280b5e87da3586c76c83d2c51f8936))
* update devDependencies to latest versions ([541c609](https://github.com/Kh4f/obsidian-manual-sorting/commit/541c609d36410c36a66afafc4810c69ca5a89ec2))


### 🐞 Bug Fixes

* **mobile:** tree.infinityScroll not found that lead to a crash by [<u>**@Mara-Li**</u>](https://github.com/Mara-Li) in [#3](https://github.com/Kh4f/obsidian-manual-sorting/pull/3) ([7b369fb](https://github.com/Kh4f/obsidian-manual-sorting/commit/7b369fb5f77131c0febd9e43ce1965a6e1b7b694))
* not working in french by [<u>**@Mara-Li**</u>](https://github.com/Mara-Li) in [#2](https://github.com/Kh4f/obsidian-manual-sorting/pull/2) ([ebb4e5d](https://github.com/Kh4f/obsidian-manual-sorting/commit/ebb4e5d9bfccb3e2b46fb283a6a0b5a3c5b8834f)), closes [#1](https://github.com/Kh4f/obsidian-manual-sorting/issues/1)

### [1.3.3](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.3.2...1.3.3) (2025-02-12)


### 🛠️ Changes

* include styles.css in release workflow ([b115fff](https://github.com/Kh4f/obsidian-manual-sorting/commit/b115fff55363c10487f8f571e209a7f0f412b143))
* move modal button styles into CSS ([1a20f9e](https://github.com/Kh4f/obsidian-manual-sorting/commit/1a20f9e092d7361f00e25785f2d913bc04906dfc))

### [1.3.2](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.3.1...1.3.2) (2025-02-11)

### 🛠️ Changes
- update plugin ID in `manifest.json` ([d374551](https://github.com/Kh4f/obsidian-manual-sorting/commit/d37455194018310698f9a054d5b42bf7c54e0830))

### [1.3.1](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.3.0...1.3.1) (2025-02-11)

### 🛠️ Changes
- update description for clarity in `manifest.json` ([364117b](https://github.com/Kh4f/obsidian-manual-sorting/commit/364117beb82ab53f512565aed4a0c4364984a660))

## [1.3.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.2.0...1.3.0) (2025-02-10)


### 🚀 Features

* **menu:** add emojis to custom menu options ([ce51167](https://github.com/Kh4f/obsidian-manual-sorting/commit/ce511674f982c653228e5945eca7e9a9ff36549e))


### 🐞 Bug Fixes

* add optional chaining to prevent potential null reference errors ([8c64d67](https://github.com/Kh4f/obsidian-manual-sorting/commit/8c64d679266c38036fc26e861b2011571f81584b))
* add type annotations for better type safety in menu and sorting logic ([a3d0847](https://github.com/Kh4f/obsidian-manual-sorting/commit/a3d0847d9034049c833e0a1dc4293f6eb7395676))
* replace direct prototype access with Object.getPrototypeOf for better compatibility ([d33bf5e](https://github.com/Kh4f/obsidian-manual-sorting/commit/d33bf5ece069a14475663020932e11295cba2536))

## [1.2.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.1.0...1.2.0) (2025-02-10)


### 🚀 Features

* add 'Reset order' option to Obsidian Sort Order menu for clearing saved data ([0b095b6](https://github.com/Kh4f/obsidian-manual-sorting/commit/0b095b6a772ec32267be30f29f98cf268dff87a7))
* add confirmation modal for resetting sort order to default ([01ed06e](https://github.com/Kh4f/obsidian-manual-sorting/commit/01ed06e04b33f69bf81b24c2161e6ab30f1d5d7f))
* conditionally add 'Reset order' option to sorting menu based on manual sorting status ([19c2253](https://github.com/Kh4f/obsidian-manual-sorting/commit/19c2253af5fa5b0b4098ce8bedc46a61219b33f0))


### 🐞 Bug Fixes

* correct small spacing between buttons in confirmation modal ([fc80c2d](https://github.com/Kh4f/obsidian-manual-sorting/commit/fc80c2d0487c459011ec7dcf313a2d683ae747da))

## [1.1.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/1.0.0...1.1.0) (2025-02-10)


### 🚀 Features

* add custom option for manual sorting in Sort Order menu ([7583173](https://github.com/Kh4f/obsidian-manual-sorting/commit/7583173670746020e5d76eb0c5f210a0416eb755))
* add enable/disable functionality for custom option ([05628ec](https://github.com/Kh4f/obsidian-manual-sorting/commit/05628ec49c65bfd18891dd0dfb099d6d2f99c702))
* add unpatching functionality for sort order menu on unload ([b3ff25e](https://github.com/Kh4f/obsidian-manual-sorting/commit/b3ff25eedb49f10ef0890e993bdac1b542c4a959))
* enhance initialization process by patching sort order menu and cleaning up invalid paths ([7be74d5](https://github.com/Kh4f/obsidian-manual-sorting/commit/7be74d5622678394e7d67bd4e2f012e769a145c9))
* update manual sorting menu option to reflect enabled state and reload plugin on activation ([a850371](https://github.com/Kh4f/obsidian-manual-sorting/commit/a850371225ec575a9d3f462f4f1fbaaee47d0f73))

### 🐞 Bug Fixes

* disable manual sorting when selecting another sort option ([bf987d0](https://github.com/Kh4f/obsidian-manual-sorting/commit/bf987d09776cba549904e14e10f8bbc0794a094a))

## [1.0.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/0.2.0...1.0.0) (2025-02-10)


### 🚀 Features

* add unpatching functionality for file explorer on unload ([7d51c21](https://github.com/Kh4f/obsidian-manual-sorting/commit/7d51c2138749d92425df9b07808601bb1d35d827))

## [0.2.0](https://github.com/Kh4f/obsidian-manual-sorting/compare/0.1.0...0.2.0) (2025-02-10)


### 🚀 Features

* add allChildrenRendered flag to TFolder for rendering tracking ([3032919](https://github.com/Kh4f/obsidian-manual-sorting/commit/3032919494f847498a9f73a5a25ca4784e0dd675))
* add onEnd handler  for order saving on drag end ([7156d4d](https://github.com/Kh4f/obsidian-manual-sorting/commit/7156d4df26ac3275fa798792fbf1e747674aa739))
* add onRename handler to save order after renaming items ([c24a172](https://github.com/Kh4f/obsidian-manual-sorting/commit/c24a1726ca66a6086dca8ca2ae213945f4cd014f))
* add prevActualChildrenCount to TFolder for tracking child count changes ([1eb4939](https://github.com/Kh4f/obsidian-manual-sorting/commit/1eb49392f234b12f3a38a2b54960dc73d6574729))
* add reloadExplorerPlugin method to refresh file explorer state ([85cb1c4](https://github.com/Kh4f/obsidian-manual-sorting/commit/85cb1c4d2de1988664d2553d344d44c7a34130b3))
* enhance OrderManager to handle concurrent save operations with a queue ([b41003c](https://github.com/Kh4f/obsidian-manual-sorting/commit/b41003cd568e7c2e5e1ea1a37f2e4a3b55fbf29d))
* implement OrderManager for saving and restoring item order in containers ([71fc89b](https://github.com/Kh4f/obsidian-manual-sorting/commit/71fc89bd7794c0eb8dd9b389f7775abd890912f9))
* integrate OrderManager for saving and restoring item order in ManualSortingPlugin ([cf44580](https://github.com/Kh4f/obsidian-manual-sorting/commit/cf445805450a229e27efdbe72079eda8dccabe75))
* update data-path attribute for moved items manually ([f14d315](https://github.com/Kh4f/obsidian-manual-sorting/commit/f14d3159365603f6a7ff8d0cd50a0c24ef52e4ac))


### 🐞 Bug Fixes

* add cleanup for invalid paths after removing and renaming folders ([58ecaa1](https://github.com/Kh4f/obsidian-manual-sorting/commit/58ecaa18750c9743fb2731cc9fd423dd00fd380a))
* update folder path property manually on move to fix auto-update issue ([f2ebf27](https://github.com/Kh4f/obsidian-manual-sorting/commit/f2ebf27553cf6d01525b428717e2d688701523f9))

## 0.1.0 (2025-02-10)


### 🚀 Features

* add development-only logging function ([fc8d9c8](https://github.com/Kh4f/obsidian-manual-sorting/commit/fc8d9c8b3cbb6febca416c9187b01931ebffcea6))
* add initialization method ([13e2109](https://github.com/Kh4f/obsidian-manual-sorting/commit/13e21095544dcbc858e656f1179185bd8c4e08c2))
* add MutationObserver to monitor data-path attribute changes ([001bdd5](https://github.com/Kh4f/obsidian-manual-sorting/commit/001bdd5f396eec389fad865c3cb4c75ef3797883))
* add ribbon icon ([7761c1d](https://github.com/Kh4f/obsidian-manual-sorting/commit/7761c1dc5c31d8463b48917769e1ad5be18eda8f))
* implement file explorer patching using monkey-around ([6e027d1](https://github.com/Kh4f/obsidian-manual-sorting/commit/6e027d1c6deb65f3b48581441a353db254cae9a3))
* implement manual sorting functionality using SortableJS ([a74fd76](https://github.com/Kh4f/obsidian-manual-sorting/commit/a74fd76165031364cc1bce688d72ba731c874754))


### 🐞 Bug Fixes

* disconnect MutationObserver after processing new item ([d3ebea6](https://github.com/Kh4f/obsidian-manual-sorting/commit/d3ebea603328e2b14825544cd8075dc1f4ae2dda))
* update regex pattern to extracting first release notes from CHANGELOG.md ([1e81a09](https://github.com/Kh4f/obsidian-manual-sorting/commit/1e81a098ac1410f035387aa24f58a0b31a388e9f))