# boilertrack

For **vite**, the project is held in boilertrack folder

**Instructions to setup vite:**

- cd into boilertrack
- install proper plugins:
  - ```npm i -D vite @crxjs/vite-plugin``` <br>
    ```npm i react react-dom``` <br>
    ```npm i -D @vitejs/plugin-react-swc```<br>
    ```npm install -D @types/chrome```
- check to see if installed correctly: 
  - ```npm ls @vitejs/plugin-react-swc```<br> should return a directory
- restart ts server 
  - on vs code this is done with command shift P and then typing ```typescript: restart ts server```

**To run/build vite plugin:**
- In the console, ```npm run build``` will create a directory dist within the boilertrack folder. This is your unpacked extension folder. In chrome, open ```chrome://extensions``` and turn on dev mode. Then click the "load unpacked" button where you can select the dist directory. Whevever you change anything you must re run ```npm run build``` to get an updated extension. Within chrome, you only need to press the little reload button to update the extension if the dist folder stayed in the same location.

**Supabase** 
now that supabse has been included, in order to properly run the extension, you need to put the supabase API key and project url into a .env.local file.
this should be constructed in this format:
VITE_SUPABASE_URL=<url>
VITE_SUPABASE_ANON_KEY=<key>

**basic-no-vite** is a folder containing an unpacked chrome extension NOT using vite. 
