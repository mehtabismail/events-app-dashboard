# PM2 + Systemd Setup for ext-ent Backend & Dashboard

This document explains **all scenarios we tried** to make PM2 processes survive reboot on an Azure Ubuntu server, why they failed, and the recommended final approach.

---

## 1. Problem Statement

We want to run two applications on PM2:

- Backend: `events-app-backend` (`src/app.js`)
- Dashboard: `events-app-dashboard` (`npm run start`)

Requirements:

1. Processes must survive server reboot.
2. PM2 processes must show up in `pm2 list` after reboot.
3. Nginx should point to backend API at `/api/events`.

**Issue:** After multiple attempts, PM2 processes either disappear or are not restored automatically after reboot.

---

## 2. Scenarios Tried and Observations

### Scenario A: Using `pm2 startup` with default suggestion

```bash
pm2 startup
```
**Observation:**
- Suggested command sometimes used `/tmp` as PM2_HOME.
- PM2 dump files stored in `/tmp/.pm2` are deleted on reboot.
- Result: PM2 list empty after reboot.

### Scenario B: Using `pm2 save` with incorrect PM2_HOME

```bash
pm2 save --force
```
**Observation:**
- PM2 dump saved to `/tmp/.pm2` or old location.
- Systemd resurrection uses different PM2_HOME.
- Processes not restored.

### Scenario C: Creating manual systemd service pointing to `/tmp`

```ini
[Service]
Environment=PM2_HOME=/tmp
ExecStart=/usr/bin/pm2 resurrect
```
**Observation:**
- Service starts but PM2 sees **empty process list**.
- Systemd shows `activating (auto-restart)`.
- `pm2 list` empty.

### Scenario D: Using systemd with Type=simple

```ini
[Service]
Type=simple
ExecStart=/usr/bin/pm2 resurrect
```
**Observation:**
- PM2 exits immediately after resurrecting.
- systemd attempts restart repeatedly.
- Processes never stay alive.

### Scenario E: Using scripts to automate start + save

**Observation:**
- Non-interactive environment in scripts fails to start Node / npm processes properly.
- `pm2 save` may save empty state.
- `pm2 list` after script shows nothing.

**Conclusion:** All previous methods fail because:
- PM2_HOME is incorrect or non-persistent
- Apps are not started manually in correct environment before `pm2 save`
- Systemd service does not correctly track PM2 daemon due to Type/shell/environment issues

---

## 3. Final Recommended Approach

**Step 1: Clean old PM2**
```bash
pm2 kill
sudo systemctl stop pm2-ext-ent
sudo systemctl disable pm2-ext-ent
sudo rm -rf /home/ext-ent/.pm2
```

**Step 2: Set PM2_HOME**
```bash
export PM2_HOME=/home/ext-ent/.pm2
mkdir -p $PM2_HOME
chown -R ext-ent:ext-ent $PM2_HOME
```

**Step 3: Start apps manually**
```bash
# Backend
cd /home/ext-ent/events-app-backend
pm2 start src/app.js --name events-backend

# Dashboard
cd /home/ext-ent/events-app-dashboard
pm2 start npm --name dashboard -- run start
```
Verify with `pm2 list`.

**Step 4: Save process list**
```bash
pm2 save
ls -l /home/ext-ent/.pm2/dump.pm2
```

**Step 5: Create systemd service**
```bash
sudo nano /etc/systemd/system/pm2-ext-ent.service
```
Content:
```ini
[Unit]
Description=PM2 process manager for ext-ent
After=network.target

[Service]
Type=forking
User=ext-ent
Environment=PM2_HOME=/home/ext-ent/.pm2
ExecStart=/usr/bin/pm2 resurrect
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

**Step 6: Reload systemd and enable service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable pm2-ext-ent
sudo systemctl start pm2-ext-ent
systemctl status pm2-ext-ent
```

**Step 7: Test reboot**
```bash
sudo reboot
pm2 list
```
✅ Both backend + dashboard must appear online.

---

## 4. Key Notes

- PM2_HOME must be a persistent directory (`/home/ext-ent/.pm2`), **not `/tmp`**
- Apps must be started **manually once** before saving dump file
- Use `Type=forking` in systemd service
- `pm2 save` must be called **after apps are online**
- After this setup, systemd + PM2 will resurrect processes automatically after reboot

---

## 5. Why Previous Attempts Failed

| Attempt | Reason for Failure |
|---------|------------------|
| pm2 startup with /tmp | Dump file lost on reboot |
| pm2 save with wrong PM2_HOME | Systemd resurrection sees empty list |
| systemd Type=simple | PM2 exits immediately, systemd restarts repeatedly |
| Script automation | Non-interactive shell failed to start Node/npm properly |

---

**This document serves as a definitive guide for PM2 + systemd setup for ext-ent applications on Azure Ubuntu.**

