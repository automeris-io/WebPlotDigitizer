# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebPlotDigitizer (WPD) is a computer vision-assisted tool for extracting numerical data from images of charts and graphs. It's a browser-based application (v5.3) written primarily in vanilla JavaScript, with a Python build system and an optional Electron-based desktop app.

- **License**: GNU AGPL v3 (frontend)
- **Main Author**: Ankit Rohatgi (plots@automeris.io)
- **Repository**: https://github.com/automeris-io/WebPlotDigitizer
- **Live App**: https://automeris.io

## Quick Start Commands

### Development (with Docker)
```bash
docker compose up --build               # Install dependencies, build, and host on localhost:8080
docker compose run wpd npm run build    # Rebuild artifacts
docker compose run wpd npm run format   # Auto-format code
docker compose run wpd npm run test     # Run tests
http://localhost:8080/tests             # View test results
```

### Development (without Docker)
```bash
npm install     # Install dependencies
npm run build   # Build artifacts (runs prebuild script)
npm start       # Start local dev server (http-server)
npm run format  # Auto-format code
npm run test    # Run Karma tests in ChromeHeadless
```

### Desktop App (Electron)
```bash
cd desktop
./fetch_wpd.sh      # Fetch WPD artifacts from parent directory
npm install         # Install dependencies
npm start           # Start local dev server
npm run package     # Build desktop app (output in ./out)
```

## Build System

The build process combines JavaScript files in a specific order and generates HTML pages with localization:

1. **Prebuild Phase** (`build.sh`):
   - Concatenates JavaScript files into `combined.js` (order matters, see below)
   - Updates translation files using `pybabel` (6 languages: en_US, zh_CN, fr_FR, de_DE, ru, ja)
   - Renders HTML templates with Jinja2 to produce localized pages

2. **Build Phase**:
   - Minifies `combined.js` into `wpd.min.js` using UglifyJS

3. **Output**:
   - `wpd.min.js` (minified, combined JavaScript)
   - `index.html`, `dev.html`, `offline.html`, `cloud.html` (base template + 6 language variants)
   - Localization files in `locale/` directory

### JavaScript Concatenation Order (from `build.sh`)
The order is critical for dependencies:
1. `javascript/core/*.js` - Core data structures and algorithms
2. `javascript/core/curve_detection/*.js` - Curve detection algorithms
3. `javascript/core/point_detection/templateMatcherAlgo.js` - Point detection
4. `javascript/core/axes/*.js` - Axis type definitions (XY, Polar, Ternary, Map, Bar, Image)
5. `javascript/widgets/*.js` - UI widgets (graphicsWidget, dataTable, tree, popups, etc.)
6. `javascript/tools/base/*.js` - Base tool classes
7. `javascript/tools/*.js` - Tool implementations (image editing, detection, calibration, etc.)
8. `javascript/controllers/*.js` - Page controllers managing workflows
9. `javascript/services/*.js` - Services (events, file I/O, cloud integration, preferences)
10. `javascript/main.js` - Entry point

## Architecture

### High-Level Structure

**Frontend (Vanilla JavaScript)** - Single-page application with a global `wpd` namespace.

```
Core Data Models
  ├── PlotData - Container for all project data (axes, datasets, measurements)
  ├── Dataset - Data point collection with optional metadata
  ├── DataPoint - Single extracted point
  └── Axes (hierarchy) - XYAxes, BarAxes, PolarAxes, TernaryAxes, MapAxes, ImageAxes

Detection & Extraction
  ├── Auto Detection - Algorithms (AveragingWindow, BlobDetector, TemplateMatching, etc.)
  ├── Curve Detection - Custom Independents, X-step interpolation, Bar Extraction
  └── Point Detection - Template Matching algorithm with workers

UI Layer
  ├── Graphics Widget - Multi-layered canvas system for display/interaction
  ├── Widgets - Data table, tree view, popups, toolbars, sidebars
  ├── Controllers - Coordinate high-level workflows (calibration, detection, measurements)
  └── Tools - User interaction tools (manual point detection, image editing, etc.)

Services
  ├── Events - Custom event dispatch system
  ├── Save/Resume - Project persistence (local storage + cloud)
  ├── Data Export - CSV/JSON export
  ├── Cloud Integration - Project save/load from Automeris cloud
  └── File Manager - Load images, PDFs, tarballs
```

### Core Modules

**`javascript/core/`** - Data structures and algorithms
- `plotData.js` - Main data container (PlotData class)
- `dataset.js` - Dataset model with data points and connections
- `autoDetection.js` - Auto-detection algorithm management
- `colorAnalysis.js` - Color-based extraction helpers
- `dateConversion.js` - Date/time value parsing
- `dataProviders.js` - Format-specific data retrieval
- `calibration.js` - Axis calibration helpers
- `mathFunctions.js` - Numerical utilities

**`javascript/core/axes/`** - Axis type definitions
- `xy.js` - Standard Cartesian axes
- `bar.js` - Bar chart axes
- `polar.js` - Polar coordinate axes
- `ternary.js` - Ternary diagram axes
- `map.js` - Geographic map axes
- `image.js` - Simple image coordinate system
- `circularChartRecorder.js` - Circular chart tools

**`javascript/core/curve_detection/`** - Curve extraction algorithms
- `averagingWindow.js`, `averagingWindowCore.js` - Averaging window algorithm
- `averagingWindowWithStepSize.js` - X-step algorithm
- `xStepWithInterpolation.js` - X-step with interpolation
- `customIndependents.js` - Custom independent variable handling
- `barExtraction.js` - Bar chart detection
- `blobdetector.js` - Blob/cluster detection

**`javascript/core/point_detection/`** - Point extraction algorithms
- `templateMatcherAlgo.js` - Template matching for point detection
- `templateMatcherWorker.js` - Worker script for parallel processing

**`javascript/widgets/`** - UI widgets and layouts
- `graphicsWidget.js` - Central canvas system (8 layers: main, data, draw, hover, top + rotated versions)
- `dataTable.js` - Spreadsheet-like data view
- `tree.js` - Hierarchical project tree (axes, datasets, measurements)
- `pointGroups.js` - Point group management UI
- `popups.js` - Modal dialog system
- `layoutManager.js` - Page layout coordination
- `zoom.js` - Zoom level management

**`javascript/tools/`** - User interaction tools
- `manualDetectionTools.js` - Click-based point detection
- `axesCalibrationTools.js` - Axis calibration interface
- `measurementTools.js` - Distance/angle measurement tools
- `imageEditingTools.js` - Image transformation (crop, rotate, mask)
- `colorPickerTools.js` - Color selection for detection
- `gridDetectionTools.js` - Grid removal tools
- `imageOps.js` - Image pixel manipulation
- `base/boundingBoxTool.js` - Selection rectangle tool

**`javascript/controllers/`** - High-level workflow controllers
- `axesCalibration.js` - Axis calibration workflow
- `autoDetection.js` - Auto-extraction configuration and execution
- `manualDetection.js` - Manual point extraction workflow
- `gridDetection.js` - Grid removal workflow
- `measurements.js` - Measurement tools management
- `fileManager.js` - Image/project file loading
- `imageEditing.js` - Image transformation tools
- `datasetManagement.js` - Dataset operations (add, delete, configure)
- `pageManager.js` - Multi-page navigation (if document has multiple images)
- `undoManager.js` - Undo/redo state management

**`javascript/services/`** - Singleton services
- `events.js` - Custom event system (registers/dispatches events)
- `saveResume.js` - Project persistence and cloud integration
- `dataExport.js` - CSV/JSON/Plotly export
- `cloud.js` - Automeris cloud API integration
- `ai.js` - AI Assist integration
- `prefs.js` - User preferences/settings
- `download.js` - File download utilities
- `log.js` - Application logging

### Key Design Patterns

1. **Namespace Pattern**: Everything lives under `var wpd = wpd || {}` to avoid global pollution
2. **Module Pattern**: Services/controllers use IIFE (Immediately Invoked Function Expression) for encapsulation
3. **Class-Based**: Core models (PlotData, Dataset, Axes) use ES6 classes
4. **Event-Driven**: Controllers dispatch custom events for state changes
5. **Multi-Canvas Rendering**: graphicsWidget manages 8 HTML5 canvas layers with coordinate transformation

### Data Flow Example: Auto-Detection

1. User selects algorithm from dropdown in UI
2. `autoDetection.js` controller initializes color picker
3. User selects color range → `colorPicker` controller stores selection
4. `algoManager` creates appropriate algorithm instance (AveragingWindow, TemplateMatching, etc.)
5. Algorithm runs on image data → generates new DataPoints
6. `dataset.js` stores points; UI updates via event dispatch
7. User can manually refine → points saved to `PlotData`

## Testing

- **Framework**: Qunit + Sinon (mocking)
- **Test Runner**: Karma (configured in `karma.conf.js`)
- **Test Files**: `tests/*_tests.js`
- **Test Data**: `tests/files/*.json` (sample project files)

Run tests:
```bash
npm run test                    # Full test suite
http://localhost:9876/debug    # Interactive debugging (after starting Karma)
```

Tests are excluded from the main bundle (`karma.conf.js` excludes `main.js`), so all tests run without the entry point.

## Code Formatting

```bash
npm run format
```

Formats all JavaScript, HTML, and CSS files using `js-beautify` with `-n` (newline detection) and `-r` (recursive) flags.

## Localization

- **Extraction**: `pybabel extract` scans `templates/*.html` for `{{ _("string") }}` markers
- **Languages**: en_US (default), zh_CN, fr_FR, de_DE, ru, ja
- **File Structure**: `locale/{language}/LC_MESSAGES/messages.po`
- **Rendering**: Python script applies translations during HTML template rendering

To add a new string for translation, wrap it in `{{ _("string") }}` in templates or use `wpd.gettext("string")` in JavaScript.

## HTML Templates

- **Base**: `templates/_base.html` (extends across all pages)
- **Components**: `_menubar.html`, `_navbar.html`, `_sidebars.html`, `_popups.html`, `_tree.html`, `_toolbars.html`, `_strings.html`
- **Entry Points**: 
  - `index.html` - Production (cloud-connected)
  - `offline.html` - Offline mode
  - `cloud.html` - Cloud-specific features
  - `dev.html` - Development build

All are generated from Jinja2 templates with localization applied.

## Dependencies

### Core Dependencies
- `bootstrap-icons` - Icon library (CSS)
- `pdfjs-dist` - PDF rendering
- `tarballjs` - Tarball file handling (custom fork)

### Dev Dependencies
- `uglify-js` - JavaScript minification
- `js-beautify` - Code formatting
- `karma` + `karma-*-launcher` - Test runner + browser launchers
- `qunit` - Unit test framework
- `sinon` - Mocking/stubbing library
- `http-server` - Local dev server

### Python (Build)
- `jinja2` - Template rendering
- `babel` (pybabel) - Localization extraction/compilation

## Desktop App (Electron)

Located in `desktop/` directory:
- Uses Electron v31
- Electron Forge for packaging
- Includes native installers for Linux (deb, rpm), Windows (Squirrel), and macOS (zip)
- Re-uses the main WPD artifacts from parent build

## Project Structure Summary

```
WebPlotDigitizer/
├── javascript/               # Main application source
│   ├── core/                # Data models & algorithms
│   ├── controllers/         # Workflow controllers
│   ├── tools/               # User interaction tools
│   ├── widgets/             # UI components
│   ├── services/            # Singleton services
│   └── main.js              # Entry point
├── templates/               # Jinja2 HTML templates
├── styles/                  # CSS files
├── locale/                  # Translation files
├── tests/                   # QUnit test suite
├── desktop/                 # Electron app wrapper
├── images/                  # Icons, screenshots, logo
├── build.sh                 # Prebuild script (concatenation, translations, HTML rendering)
├── format.sh                # Code formatter
├── karma.conf.js            # Test runner config
├── package.json             # Dependencies & scripts
├── Dockerfile               # Docker build image
├── compose.yaml             # Docker Compose for development
└── renderHTML.py            # Python script for HTML generation
```

## Common Development Scenarios

### Adding a New Axis Type
1. Create `javascript/core/axes/newtype.js` inheriting from base axis class
2. Add UI controls in `templates/_sidebars.html`
3. Add controller in `javascript/controllers/` if needed
4. Update `autoDetection.js` algorithm list for applicability

### Adding a New Auto-Detection Algorithm
1. Create algorithm class in `javascript/core/curve_detection/`
2. Register in `autoDetection.js` controller's `updateAlgoList()`
3. Add UI config in popups if needed
4. Add tests in `tests/`

### Modifying the UI
1. Edit `templates/_*.html` files (components are split logically)
2. If adding strings, wrap in `{{ _("text") }}` for localization
3. Run `npm run build` to render HTML and minify JavaScript
4. CSS in `styles/` is concatenated and included in base template

### Fixing a Bug
1. Identify the module from architecture overview
2. Add test case in `tests/` if not present
3. Fix the bug in the source module
4. Run `npm run format` to maintain code style
5. Verify with `npm run test`

## Important Notes

- The app uses a global `wpd` namespace; all new code should follow this pattern
- `PlotData` is the root data container; all plot modifications flow through it
- Event system (`events.js`) enables loose coupling between controllers
- Canvas coordinate transformation is complex; see comments in `graphicsWidget.js` for frame details (screen → canvas → image)
- Point detection uses Web Workers (`templateMatcherWorker.js`) for parallelization
- Cloud features are currently proprietary/closed-source; frontend is AGPL

## License & Attribution

- **Frontend**: GNU AGPL v3
- **Author**: Ankit Rohatgi
- **Copyright**: 2010-2025

