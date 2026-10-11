// Builds everything a Mac scene needs from the Mac this runs on, so nothing has to be downloaded:
// Dock icons from the installed apps, menu bar symbols from SF Symbols, a system wallpaper,
// and optionally your own app's icon (or a temporary one from an SF Symbol).
//
//   swift make-assets.swift <out-dir> [--app /path/To/Your.app] [--symbol doc.on.clipboard --tint #0A84FF]
//
// Writes <out-dir>/dock/*.png, <out-dir>/menubar/*.png, <out-dir>/files/*.png, <out-dir>/wallpaper.jpg,
// <out-dir>/manifest.json and, if asked, <out-dir>/dock/app.png.
// The laptop frame (macbook-air-shell.webp) is in ../assets next to this script.
import AppKit
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count > 1 else { print("usage: swift make-assets.swift <out-dir> [--app Your.app] [--symbol name --tint #RRGGBB]"); exit(1) }
let out = URL(fileURLWithPath: args[1])
func arg(_ name: String) -> String? { args.firstIndex(of: name).flatMap { $0 + 1 < args.count ? args[$0 + 1] : nil } }
let fm = FileManager.default
for sub in ["dock", "menubar", "files"] { try? fm.createDirectory(at: out.appendingPathComponent(sub), withIntermediateDirectories: true) }
var written: [String] = []

func render(_ size: CGFloat, _ draw: (NSRect) -> Void) -> Data {
  let px = Int(size)
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: px, pixelsHigh: px, bitsPerSample: 8, samplesPerPixel: 4,
                             hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  rep.size = NSSize(width: size, height: size)
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  NSGraphicsContext.current?.imageInterpolation = .high
  draw(NSRect(x: 0, y: 0, width: size, height: size))
  NSGraphicsContext.restoreGraphicsState()
  return rep.representation(using: .png, properties: [:])!
}
func save(_ data: Data, _ path: String) { try! data.write(to: out.appendingPathComponent(path)); written.append(path); print("wrote \(path)") }

// Dock: the real icons of apps that ship with macOS, in Dock order.
let dock: [(String, String)] = [
  ("finder", "/System/Library/CoreServices/Finder.app"), ("safari", "/Applications/Safari.app"),
  ("messages", "/System/Applications/Messages.app"), ("mail", "/System/Applications/Mail.app"),
  ("photos", "/System/Applications/Photos.app"), ("music", "/System/Applications/Music.app"),
  ("calendar", "/System/Applications/Calendar.app"), ("notes", "/System/Applications/Notes.app"),
  ("appstore", "/System/Applications/App Store.app"), ("settings", "/System/Applications/System Settings.app"),
]
for (name, path) in dock where fm.fileExists(atPath: path) {
  let icon = NSWorkspace.shared.icon(forFile: path)
  save(render(256) { icon.draw(in: $0) }, "dock/\(name).png")
}
if let trash = NSImage(named: NSImage.trashEmptyName) { save(render(256) { trash.draw(in: $0) }, "dock/trash.png") }
for trashPath in ["/System/Library/CoreServices/Dock.app/Contents/Resources/trashempty2.png",
                  "/System/Library/CoreServices/Dock.app/Contents/Resources/trashempty.png"] {
  if fm.fileExists(atPath: trashPath), let trashFile = NSImage(contentsOfFile: trashPath) {
    save(render(256) { trashFile.draw(in: $0) }, "dock/trash.png")
    break
  }
}

// Your app: its real icon, or a temporary one (an SF Symbol on a tinted rounded square).
if let app = arg("--app") {
  let icon = NSWorkspace.shared.icon(forFile: app)
  save(render(256) { icon.draw(in: $0) }, "dock/app.png")
} else if let symbolName = arg("--symbol"), let symbol = NSImage(systemSymbolName: symbolName, accessibilityDescription: nil) {
  let hex = (arg("--tint") ?? "#0A84FF").dropFirst()
  let v = Int(hex, radix: 16) ?? 0x0A84FF
  let tint = NSColor(srgbRed: CGFloat(v >> 16 & 255) / 255, green: CGFloat(v >> 8 & 255) / 255, blue: CGFloat(v & 255) / 255, alpha: 1)
  save(render(256) { r in
    // Apple's icon grid: the tile is about 80 % of the canvas with a continuous-corner radius of about 22 %.
    let tile = r.insetBy(dx: r.width * 0.1, dy: r.height * 0.1)
    NSGradient(starting: tint.blended(withFraction: 0.25, of: .white)!, ending: tint)!.draw(in: NSBezierPath(roundedRect: tile, xRadius: tile.width * 0.225, yRadius: tile.width * 0.225), angle: -90)
    let config = NSImage.SymbolConfiguration(pointSize: tile.width * 0.46, weight: .semibold).applying(.init(paletteColors: [.white]))
    if let s = symbol.withSymbolConfiguration(config) {
      let size = s.size
      s.draw(in: NSRect(x: r.midX - size.width / 2, y: r.midY - size.height / 2, width: size.width, height: size.height))
    }
  }, "dock/app.png")
}

// Menu bar: SF Symbols, black on transparent. Use them as CSS masks so they take the menu bar's text colour.
let symbols: [(String, String)] = [
  ("apple", "apple.logo"), ("battery", "battery.100percent"), ("wifi", "wifi"),
  ("search", "magnifyingglass"), ("control", "switch.2"),
  ("battery75", "battery.75percent"), ("bell", "bell"), ("calendar", "calendar"),
  ("clock", "clock"), ("mappin", "mappin"), ("tray-full", "tray.full"), ("tray", "tray"),
  ("doc", "doc"), ("folder", "folder"), ("trash", "trash"), ("plus", "plus"),
  ("xmark", "xmark"), ("checkmark", "checkmark"), ("chevron-down", "chevron.down"),
  ("chevron-right", "chevron.right"), ("gearshape", "gearshape"),
  ("share", "square.and.arrow.up"), ("download", "arrow.down.circle"),
  ("sun", "sun.max"), ("moon", "moon"), ("person", "person.crop.circle"),
]
var seenSymbols = Set<String>()
for (file, symbolName) in symbols {
  guard !seenSymbols.contains(symbolName) else { continue }
  seenSymbols.insert(symbolName)
  guard !written.contains("menubar/\(file).png") else { continue }
  guard let s = NSImage(systemSymbolName: symbolName, accessibilityDescription: nil)?
    .withSymbolConfiguration(.init(pointSize: 64, weight: .medium)) else { continue }
  save(render(96) { r in
    let size = s.size, scale = min(r.width / size.width, r.height / size.height) * 0.9
    let w = size.width * scale, h = size.height * scale
    s.draw(in: NSRect(x: r.midX - w / 2, y: r.midY - h / 2, width: w, height: h))
  }, "menubar/\(file).png")
}

// Document icons: the real macOS icons for each type, rendered to 256 px PNGs.
let docTypes: [(String, UTType?)] = [
  ("pdf", .pdf), ("png", .png), ("jpeg", .jpeg),
  ("keynote", UTType(filenameExtension: "key")), ("pages", UTType(filenameExtension: "pages")),
  ("numbers", UTType(filenameExtension: "numbers")), ("text", .plainText),
  ("markdown", UTType(filenameExtension: "md")), ("movie", .movie), ("audio", .audio),
  ("zip", UTType(filenameExtension: "zip")), ("folder", .folder),
  ("swift", UTType(filenameExtension: "swift")), ("html", .html), ("generic", .data),
]
for (name, type) in docTypes {
  guard let type else { print("warning: no UTType for files/\(name).png; skipped"); continue }
  let icon = NSWorkspace.shared.icon(for: type)
  guard icon.size.width > 0 else { print("warning: no icon for files/\(name).png; skipped"); continue }
  save(render(256) { icon.draw(in: $0) }, "files/\(name).png")
}

// Wallpapers: calm stills, never the loud colourful defaults (Mac Blue, iMac Purple...), which drown the product.
// wallpaper.jpg is light, wallpaper-dark.jpg is dark. Pass --wallpaper / --wallpaper-dark to choose your own.
let pictures = "/System/Library/Desktop Pictures"
let assets = NSHomeDirectory() + "/Library/Application Support/com.apple.mobileAssetDesktop"
func firstExisting(_ paths: [String]) -> String? { paths.first { fm.fileExists(atPath: $0) } }
func saveWallpaper(_ path: String, as file: String) {
  guard let image = NSImage(contentsOfFile: path), let tiff = image.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff) else { return }
  let w = 2560, h = Int(Double(w) * Double(rep.pixelsHigh) / Double(rep.pixelsWide))
  let scaled = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8, samplesPerPixel: 4,
                                hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState(); NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: scaled)
  image.draw(in: NSRect(x: 0, y: 0, width: w, height: h)); NSGraphicsContext.restoreGraphicsState()
  try! scaled.representation(using: .jpeg, properties: [.compressionFactor: 0.88])!.write(to: out.appendingPathComponent(file))
  written.append(file)
  print("wrote \(file) (\((path as NSString).lastPathComponent))")
}
let light = arg("--wallpaper") ?? firstExisting(["\(pictures)/iMac Silver.heic", "\(pictures)/Sonoma.heic"])
let dark = arg("--wallpaper-dark") ?? firstExisting(["\(assets)/Pro Black.heic", "\(pictures)/Radial Sky Blue.heic"])
if let light { saveWallpaper(light, as: "wallpaper.jpg") } else { print("no calm light wallpaper found; pass --wallpaper /path/to/image") }
if let dark { saveWallpaper(dark, as: "wallpaper-dark.jpg") } else { print("no calm dark wallpaper found; pass --wallpaper-dark /path/to/image") }

// Manifest: every file written, grouped by folder.
var manifest: [String: [String]] = ["dock": [], "files": [], "symbols": [], "menubar": [], "wallpaper": [], "app": []]
for path in written {
  if path == "dock/app.png" { manifest["app"]!.append(path) }
  else if path.hasPrefix("dock/") { manifest["dock"]!.append(path) }
  else if path.hasPrefix("files/") { manifest["files"]!.append(path) }
  else if path.hasPrefix("menubar/") { manifest["menubar"]!.append(path); manifest["symbols"]!.append(path) }
  else if path.hasPrefix("wallpaper") { manifest["wallpaper"]!.append(path) }
}
for key in manifest.keys { manifest[key]!.sort() }
try! JSONSerialization.data(withJSONObject: manifest, options: [.prettyPrinted, .sortedKeys])
  .write(to: out.appendingPathComponent("manifest.json"))
print("wrote manifest.json")
for key in ["dock", "files", "symbols", "menubar", "wallpaper", "app"] {
  print("\(key): \(manifest[key]!.count)")
}
print("Use only these files for icons in a Mac scene. Hand-drawn icons fail lint-slop.")
