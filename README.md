# Automation CLI for Google Material Symbols

This command-line tool (CLI) is designed to automate the workflow with **Google Fonts (Material Symbols)** icons in web development projects (React, Lit, or Vanilla TS).

It allows you to search, download, map, and automatically replace icon references in your source code, transforming static `<span>` tags into safely imported components or variables.

## 🚀 Main Features

* 🔍 **Interactive Search:** Autocomplete search for icons in the Google library.
* ⬇️ **Automatic Download:** Downloads optimized SVGs locally.
* bot **Code Scanning (Stitch):** Reads your `.tsx` or `.ts` files, detects which icons you are using, and downloads them automatically.
* 🗺️ **Asset Mapping:** Generates `index.ts` or `index.tsx` files that export your icons as organized objects.
* 💉 **Code Injection:** Automatically replaces `<span>` tags in your files with React components or Lit directives.

---

## How to use it?

# First install

```hs
    npm install -g toolicongoogle
```

# In your workspace terminal run:

```hs
    fontsgo
```

## 📖 Menu Options Guide

When you start the CLI, you will see the following main options:

### 1. 🔍 Search icon

This option lets you manually search and download an individual icon without needing it to exist already in your code.

* An **autocomplete** search box will open.
* Type the icon name (e.g., `account_balance`).
* Once selected, the icon will be downloaded to your configured assets directory.

### 2. 🧵 Stitch Google Templates

This is the core of the automation. It connects your source code with the icon library.

#### ➤ Extract icons

Scans your code for icon references (elements with the class `material-symbols-outlined`) and downloads any missing icons.

* **File:** Select a specific `.js`, `.ts`, `.jsx`, or `.tsx` file.
* **Recursive:** Select an entire folder. The tool will scan all files inside it (and subfolders), searching for icon names to download.

#### ➤ Implement icons

Modifies your source code to use the downloaded and mapped icons, replacing static HTML with dynamic code.

* **File / Directory:** Select the target file or folder.
* **Action:** Searches for structures like `<span class="material-symbols-outlined">icon_name</span>` and replaces them with:

  * React: `<assets.iconName />`
  * Lit: `${() => assets.iconName}`

### 3. 🗺️ Map images

Generates an `index.ts` (or `.tsx`) file in your download folder that exports all downloaded icons as a structured object.

* **For Base (`null`):** Exports SVGs as raw strings inside a `.ts` file. Ideal for Vanilla JS/TS.
* **For React:** Exports React functional components. Generates a `.tsx` file with a helper to inject the SVG.
* **For Lit:** Exports functions that return `unsafeHTML(svg)`. Generates a `.ts` file.

### 4. ⚙️ Config

Global configuration for the tool.

* **Download dir:** Defines the absolute path where `.svg` files will be saved and where the `index` file will be generated.
* **Time icon:** Sets the delay (in ms) between downloads to avoid *rate limiting*.
* **Time search:** Sets the delay (in ms) for search requests.

---

## ⚡ Recommended Workflow

To get the most out of the tool, follow this order:

1. **Initial Setup:**

   * Go to `Config` > `Download dir` and select your `src/assets` folder (or similar).

2. **Development (UI):**

   * Write your HTML/JSX code normally using the icon names:

     ```tsx
     <span className="material-symbols-outlined">rocket_launch</span>
     ```

3. **Extraction and Download:**

   * Go to `stitch google templates` > `Extract icons` > `Recursive`.
   * Select your `src` folder. The CLI will find "rocket_launch" and download `rocket_launch.svg`.

4. **Mapping:**

   * Go to `Map images` > Select your framework (e.g., `for react`).
   * This will create `src/assets/index.tsx` with the ready-to-use component.

5. **Injection:**

   * Go to `stitch google templates` > `Implement icons`.
   * Select your file or folder.
   * Your code will automatically change to:

     ```tsx
     import assets from "../assets";
     // ...
     <assets.rocketLaunch />
     ```

---

## 🛠️ Technologies

* **Node.js & TypeScript**
* **Inquirer.js:** For the interactive terminal interface.
* **Google Fonts API:** Source of the icons.

---

## ⚠️ Important Notes

* The tool automatically ignores the `node_modules` folder during recursive scans.
* Be sure to run `Map images` before `Implement icons`, because injection depends on the generated `assets` object.
* Icon injection checks whether the file is `.ts` (Lit) or `.tsx` (React) to apply the correct syntax.


# Reconocimentos 
- Kaitovid [https://github.com/Kaitovid] "Gracias por probar la herramienta"
- Leandro-Calderon [https://github.com/Leandro-Calderon] "Gracias por sugerir traducción readme al ingles"