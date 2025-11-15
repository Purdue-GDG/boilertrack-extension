import {defineManifest} from '@crxjs/vite-plugin';

export default defineManifest({
    manifest_version: 3,
    name: 'Boilertrack newgenOCR branch',
    version: '1.2',
    icons: {
        16: 'images/gdglogo16.png',
        32: 'images/gdglogo32.png',
        48: 'images/gdglogo48.png',
        128: 'images/gdglogo128.png',
    },

    action: {
        default_popup: 'index.html',
    },

    background: {
        "service_worker": "background.js",
        "type": "module",


    },

    content_security_policy: {
        "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'none';"
    },

    web_accessible_resources: [
        {
            "resources": [
                "lib/worker.min.js",
                "lib/tesseract-core-simd.wasm.js",
                "lib/eng.traineddata.gz",
                "lib/tesseract.min.js" // Also include the main lib
            ],
            "matches": [
                "chrome-extension://*" // Allows your own extension to access them
            ],
            "use_dynamic_url": false
        }
    ],



    permissions:
        ['scripting', 'identity', 'storage', 'tabs', 'contextMenus', 'activeTab'],


    host_permissions:
        ['https://*/*', 'http://*/*'], // fixed duplicate, added http
})
;
