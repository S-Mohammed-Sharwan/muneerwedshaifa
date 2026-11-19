# Ahmed Muneer & Haifa Ashhareefa — Wedding Invitation

A responsive wedding invitation microsite based on the captured Faris & Simran reference site's visual structure and animation assets, adapted with the supplied Muneer & Haifa invitation artwork, venue illustration, video and nasheed.

## Event details
- Couple: Ahmed Muneer & Haifa Ashhareefa
- Date: Monday, 23 November 2026
- Nikah: 11:30 AM
- Lunch: until 2:00 PM
- Venue: Zara Convention Centre, Ganjimata, Mangalore
- Address: 6th Block, Krishnapura, Mangalore
- Contact: +91 80503 76944
- Maps: https://www.google.com/maps/place/Zara+Convention+Centre/@12.9739005,74.9442156,1099m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3ba357218b269f09:0x886f402eed8a0a08!8m2!3d12.9739005!4d74.9467905!16s%2Fg%2F11s0s4hmh5

## Run locally
This is a static website. No build step is required.
1. Extract the ZIP.
2. Open a terminal in this folder.
3. Run `python -m http.server 5173`
4. Visit `http://localhost:5173`

You can also deploy the folder to Vercel, Netlify, or any static host.

## Main files
- `index.html` — page structure and wedding content
- `styles.css` — captured reference styling plus custom styles
- `script.js` — envelope interaction, scroll effects, countdown, and tap-to-play nasheed
- `assets/` — media, artwork, fonts, and runtime libraries used by the page

## Notes
- The hero video and nasheed start from local files in `assets/`.
- The location section uses the supplied transparent Zara Convention Centre illustration.
- The supplied nasheed starts after the visitor's first tap or key press, because browsers block automatic audio playback.
- The map link opens Google Maps in a new tab from the venue section.
- The RSVP service from the reference site is not connected. No fake submission endpoint has been configured.
- Review the wording, address, phone number and venue pin before publishing.
