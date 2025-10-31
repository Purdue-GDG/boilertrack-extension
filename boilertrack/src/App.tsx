//This ts is for the POPUP
//any js will run INTERNALLY within the popup window. This is not always the case, using chrome.scripting
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import gdgLogo from '/images/gdglogo128.png';
import Login from './authPage';
import { supabase } from './supabaseClient';
import './App.css';
import './App.css'

function App() {

  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const authClient = supabase;

    useEffect(() => {
      const client = authClient;
      if (!client) {
        setInitializing(false);
        return;
      }

   let isMounted = true; 

   void client.auth.getSession().then(({ data }) => {
      if(!isMounted) {
        return; 
      }
      setSession(data.session);
      setInitializing(false);
   });

   const {
    data: { subscription },
   } = client.auth.onAuthStateChange((_event, nextSession) => {
    setSession(nextSession);
    setInitializing(false);
   });
   
   return () => {
    isMounted = false;
    subscription.unsubscribe();
   };

   }, [authClient]);

   if (!authClient) {
    return (
      <div className="config-warning">
        <h1>Supabase not configured</h1>
        <p>
          Set the <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> environment variables to enable
          login.
        </p>
      </div>
    );

   }

   if (initializing) {
    return(
      <div className="auth-loading">
      <p>Checking your session…</p>
    </div>
    );
   }

   if (!session) {
    return <Login supabase={authClient} onAuthenticated={setSession} />;
   }


  //We can use document.body within a script being executed using scripting.executeScript to refer to the body doc of the page the user is currently on.
  //for example:
  // const onclick = async () => {
  //   if (!isChromeExtensionEnvironment) {
  //     console.warn('chrome APIs unavailable in this environment.');
  //     return;
  //   }
  //   let [tab] = await chrome.tabs.query({active: true});
  //   //this following line, scripting.execute script, executes the following script in the specified web page
  //   chrome.scripting.executeScript({
  //     //saying the script will execute on _ tab which was defined above as the currently active tab
  //     target: {tabId: tab.id!},
  //     //its basically like running this in the console of the current webpage
  //       func: () => {
  //         document.body.style.backgroundColor = 'black';
  //       }
  //   });
  // }
  const handleSignOut = async () => {
    if (!authClient) {
      console.warn('Supabase client unavailable; cannot sign out.');
      return;
    }
    await authClient.auth.signOut();
    setSession(null);
  };
  //any js in this html will run internally within the popup
  return ( 
    <>
      <div>
        
          <img src={gdgLogo} className="logo" alt="Vite logo" />
        
        
          <img src={gdgLogo} className="logo react" alt="React logo" />
        
      </div>
      <h1>Welcome to Boilertrack</h1>
      <div className="card">
        <button>
          make the background black
        </button>
        <p>
          logged in as: {session.user.email}
        </p>
        <button onClick={handleSignOut}>
          sign out
        </button>
      </div>
    </>
  )
}

export default App
