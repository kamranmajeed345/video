# Deployment Instructions for aryb2b.com/video

## Prerequisites
- Node.js v22.22.0 ✓
- npm 10.9.4 ✓
- SSH/Terminal access ✓

## Deployment Steps

### 1. Upload files to server
Upload all project files to: `/home/aryb2b/video/` (or your preferred directory)

You can use:
- FTP/SFTP client (FileZilla, WinSCP)
- SCP command: `scp -r Zoom-Clone-With-WebRTC/* aryb2b@ns520721:/home/aryb2b/video/`
- Or zip and upload via cPanel File Manager

### 2. SSH into your server
```bash
ssh aryb2b@ns520721
cd video
```

### 3. Install dependencies
```bash
npm install
```

### 4. Start the application
```bash
node server.js
```

Or use PM2 for production (keeps app running):
```bash
npm install -g pm2
pm2 start server.js --name video-call
pm2 save
pm2 startup
```

### 5. Configure ports
The app runs on:
- Main server: port 3000
- PeerJS server: port 3001

Make sure these ports are open in your firewall.

### 6. Set up reverse proxy (Apache/Nginx)
To access via https://aryb2b.com/video, configure your web server to proxy to port 3000.

**For Apache (.htaccess or VirtualHost):**
```apache
ProxyPass /video http://localhost:3000
ProxyPassReverse /video http://localhost:3000
```

**For Nginx:**
```nginx
location /video {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Important Notes
- WebRTC requires HTTPS (SSL) - you already have this ✓
- Keep the Node.js process running with PM2 or similar
- PeerJS server must be accessible on port 3001

## Troubleshooting
- If port 3000 is in use, edit server.js to change the port
- Check firewall: `sudo firewall-cmd --list-ports`
- View logs: `pm2 logs video-call`
