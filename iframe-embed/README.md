# Upload Instructions for aryb2b.com/video

## Upload these files to your server:

Upload `index.html` to: `/home/aryb2b/public_html/video/index.html`

## How it works:

The single `index.html` file handles all room URLs dynamically:

- `https://aryb2b.com/video/` → Shows home page (room selection)
- `https://aryb2b.com/video/?room=room1` → Opens room1
- `https://aryb2b.com/video/?room=room2` → Opens room2
- `https://aryb2b.com/video/?room=meeting` → Opens meeting room
- `https://aryb2b.com/video/?room=any-name` → Opens any custom room

## Upload via FTP:

1. Connect to your FTP server
2. Navigate to `/public_html/video/`
3. Upload `index.html`
4. Done!

## Upload via cPanel File Manager:

1. Login to cPanel
2. Open File Manager
3. Navigate to `public_html/video/`
4. Upload `index.html`
5. Done!

## Alternative: Individual room files

If you prefer URLs like `https://aryb2b.com/video/room1.html`, you can also upload:
- `room1.html`
- `room2.html`
- `room3.html`
- `meeting.html`

These files are already created for you in the `iframe-embed` folder.
