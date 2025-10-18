import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Boilertrack',
  version: '1.0.0',

  icons: {
    16: 'images/gdglogo16.png',
    32: 'images/gdglogo32.png',
    48: 'images/gdglogo48.png',
    128: 'images/gdglogo128.png',
  },

  action: {
    default_popup: 'index.html',
  },

  permissions: ['scripting'],

  host_permissions: ['https://*/*', 'http://*/*'], // fixed duplicate, added http
});
