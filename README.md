# Realtime Calendar App for Families

## Development

Start the Pocketbase app with `modd` and the React Native app with `npm -C react-native-frontend run start`. Pocketbase listens on all local IP addresses on port 8089. I am using Expo Go on my phone to run the React Native app in development. It communicates to Pocketbase, which is running on my laptop. Both devices, laptop and phone, are connected to the same Wifi in order to be able to talk to each other.

- [modd](https://github.com/cortesi/modd): Watches for changes in Golang source code and rebuilds the PocketBase server upon changes.

## Running in production

The app is currently running on a VPS behind a Caddy server reverse-proxy that routes all requests to Pocketbase. Pocketbase acts as a REST API on all routes like /api/* . Pocketbase is deployed as a single binary. A single process is managed by systemd. All data is currently stored in the `pb_data` directory such as the SQLite database or user-provided uploaded files. In the future, an S3 storage can be used for such file hosting.

### Hosting

#### Directory structure

```
    -- ~/projects/calendar-app
        -- production # contains the `its` binary
            -- pb_public # static assets (e.g. Vue app) being served by PocketBase
            -- pb_data  # SQLite database(s) and user file uploads
        - standard.log # logs from stdout of the application
        - errors.log # logs from stderr of the application
```

#### Systemd services

- /lib/systemd/system/calendar-app.service is running the application
- /lib/systemd/system/calendar-app-restart.service restarting the application when a the `calendar-app` binary is changed, watched by calendar-app.restart.path unit
    - a restart can be triggered manually with `touch ~/projects/calendar-app/production/calendar-app` or through the upload of a fresh executable

#### Logs

Follow the logs with e.g. `tail -f ~/projects/calendar-app/standard.log`
