# iPhone Air mockup

A photographic iPhone Air scene: two phones facing the camera at an angle and one showing the back, on a light grey background (6000x4500). Use it for hero pictures and launch posts of an iPhone app, where a flat frame (`../iphone.html`) feels too plain.

    python3 place.py screenshot.png out.jpg
    python3 place.py home.png detail.png out.jpg      # different screens on each phone

The script warps the screenshot onto both screens with the right perspective, fills each screen exactly to its black border and keeps the Dynamic Island on top. No Photoshop needed. Needs Pillow and NumPy.

Rules: real screenshots only, portrait, full resolution (iPhone Air is 1260x2736), status bar included. Pick a screen whose top part reads well small; the phones are tilted, so tiny text won't survive. Check the corners at full size before using it.

Source: "iPhone Air" mockup by River Visual, supplied by Owen. The layered PSD stays in his Downloads, not in this repo. Check River Visual's licence before using a picture commercially.
