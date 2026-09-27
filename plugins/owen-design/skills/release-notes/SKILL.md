---
name: release-notes
description: The exact release-notes format Owen requires for every release of any product (GitHub releases, changelogs, in-app update notes, Discord announcements). Load before writing or publishing any release, changelog entry or update announcement. Owen has repeated this many times — get it right the first time.
---

# Release notes

Every release, every project, without being asked:

1. **Header** (centred): app icon, "App X.Y.Z", one short summary line, the download-button image linking to the download.
2. **One real picture** of this release's main change, right after the header. New for this release. Real screenshot or faithful staged shot. No black frame/outline, no nested action buttons (e.g. no Install button inside a picture of the update card), no test values (like "Version 0.1.0"). Commit/upload the image before publishing so its URL works.
3. **"## What's new"** with a few plain `###` headings (e.g. Lock screen, Setup, Updates) and one short bullet per change, written per `product-writing`.
4. **"### Thanks"** — the tester who reported it, by the name they use ("Anthony2317, for reporting the missing face.").
5. **"## Install"** last — how to download, update in-app, the package-manager command in a code block, and any first-launch step.

## Template (GitHub-flavoured Markdown)

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

    (fenced sh block) brew upgrade --cask app

    First-launch note, if any.

## Where the same notes appear
The notes are written once and reused: the release page, the website's release list, the in-app update card (which hides the Install section) and the chat announcement (which keeps it, with the command copyable, plus real Download and Release Notes buttons). Check how each one renders after publishing.

## Before publishing — checklist
- Header, picture, What's new, Thanks, Install — all present, in that order?
- Picture new, real, clean, relevant to the *main* change?
- Every bullet short and about what the person gets?
- Version numbers correct everywhere (title, links, file names)?
