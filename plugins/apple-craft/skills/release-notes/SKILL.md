---
name: release-notes
description: A clean, Apple-style release-notes format for any product - GitHub releases, changelogs, in-app update notes and chat announcements - with a header, one real picture, short grouped bullets, credits and install steps. Use before writing or publishing any release, changelog entry or update announcement.
---

# Release notes

Every release, every time:

1. **Header** (centred): app icon, "App X.Y.Z", one short summary line, and a download button linking to the download.
2. **One real picture of this release's main change**, right after the header. Wide, about 2.5:1 to 3:1 (like 1200×460), so an in-app update card shows all of it; a full-screen 16:10 shot gets cropped to a strip. New for this release, a real screenshot (staged only when the real thing can't be captured), no black frame, no buttons nested inside it, no test values such as "Version 0.1.0". Upload it before publishing so its URL works.
3. **"## What's new"** with a few plain `###` headings (Lock screen, Setup, Updates) and one short bullet per change, written per `product-writing`.
4. **"### Thanks"**: everyone who reported or helped, by the name they use ("Anthony, for reporting the missing face.").
5. **"## Install"** last: how to download, update in-app, the package-manager command in a code block, and any first-launch step.

## Template (GitHub Markdown)

    <div align="center">
      <img src="ICON_URL" width="96" alt="APP app icon" />
      <h1>APP X.Y.Z</h1>
      <p>One short summary line.</p>
      <p><a href="DOWNLOAD_URL"><img src="DOWNLOAD_BUTTON_IMAGE_URL" width="253" alt="Download for Mac" /></a></p>
    </div>

    <p align="center"><img src="PICTURE_URL" width="100%" alt="What the picture shows" /></p>

    ## What's new

    ### Area
    - One short, plain sentence.

    ### Thanks
    - Name, for what they reported.

    ## Install

    Download **APP.dmg** and drag APP to Applications, update from APP Settings, or run:

    ```sh
    brew upgrade --cask app
    ```

    First-launch note, if any.

## Example

    ### Unlocking
    - Nodding works reliably. Lowering your chin no longer restarts the check.
    - A stronger check against photos and screens held up to the camera.

    ### Thanks
    - Jonathan, for the nod problems.

## One set of notes, many places

Write the notes once and reuse them: the release page, the website's release list, the in-app update card (which hides Install) and the chat announcement (which keeps it, with the command copyable and real Download and Release Notes buttons). Check how each one renders after publishing.

## Before publishing

- Header, picture, What's new, Thanks, Install: all present, in that order?
- Is the picture new, real, clean and about the main change? Does it show in full in the in-app card?
- Is every bullet short and about what the person gets?
- Are version numbers right everywhere: title, links, file names?
