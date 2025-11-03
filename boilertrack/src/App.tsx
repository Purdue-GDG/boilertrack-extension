//This ts is for the POPUP
//any js will run INTERNALLY within the popup window. This is not always the case, using chrome.scripting
import {useEffect, useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import trackingImage from '/images/trackingImage.png';
import Login from './authPage';
import {supabase} from './supabaseClient';
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

        void client.auth.getSession().then(({data}) => {
            if (!isMounted) {
                return;
            }
            setSession(data.session);
            setInitializing(false);
        });

        const {
            data: {subscription},
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
                    Set the <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> environment variables
                    to enable
                    login.
                </p>
            </div>
        );

    }

    if (initializing) {
        return (
            <div className="auth-loading">
                <p>Checking your session…</p>
            </div>
        );
    }

    if (!session) {
        return <Login supabase={authClient} onAuthenticated={setSession}/>;
    }


    const handleSignOut = async () => {
        if (!authClient) {
            console.warn('Supabase client unavailable; cannot sign out.');
            return;
        }
        await authClient.auth.signOut();
        setSession(null);
    };

    const startTracking = async () => {
        //TODO: make this save the website to the supabase user data and also start tracking it within the extension
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            console.log(tabs[0].url);
        });
    };

    //any js in this html will run internally within the popup
    return (
        <>
            <div>
            </div>
            <div className="card">
                <h1>Tracking</h1>
                <img src={trackingImage} className="tracking-button" onClick={startTracking} />
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
