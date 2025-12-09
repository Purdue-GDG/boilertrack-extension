import {defineManifest} from '@crxjs/vite-plugin';

export default defineManifest({
    manifest_version: 3,
    name: 'Boilertrack',
    version: '1.0.2',
    icons: {
        16: 'images/gdglogo16.png',
        32: 'images/gdglogo32.png',
        48: 'images/gdglogo48.png',
        128: 'images/gdglogo128.png',
    },

    action: {
        default_popup: 'index.html',
    },

    permissions: ['scripting', 'identity', 'storage', 'tabs'],

    background: {
        service_worker: 'src/background.ts',
    },

    oauth2: {

        //IMPORTANT: google cloud oauth is setup a little weird. Heres why:

        //Google cloud oauth is setup to a web app even though this is a chrome extension.
        //origonally I attempted to do this on the google cloud dashboard with a client id registered
        //for a chrome extension but kept coming up with "URI redirect" errors. Don't understand why.
        //When I altered the client id on the oauth on google cloud to be for a web app and added
        //the extensions local url as the callback url for the google oauth, it works!!!

        client_id: "897649700187-q8tee8fmp1g65j53vnn6tkvn9cubr04p.apps.googleusercontent.com",
        scopes: ['openid', 'profile', 'email'],
    },

    host_permissions: ['https://*/*', 'http://*/*'], // fixed duplicate, added http

    content_scripts: [
        {
            matches: ['https://*/*', 'http://*/*'],
            js: ['src/content.ts'],
            run_at: 'document_idle',
        },
    ],

    web_accessible_resources: [
        {
            resources: ['assets/*.svg', 'images/*.svg'],
            matches: ['https://*/*', 'http://*/*'],
        },
    ],
});
