//This ts is for the POPUP
//any js will run INTERNALLY within the popup window. This is not always the case, using chrome.scripting
import {useEffect, useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import Login from './authPage';
import {supabase} from './supabaseClient';
import syncedIcon from './assets/synced.svg';
import unsyncedIcon from './assets/unsynced.svg';
import './App.css';
import './App.css'

function App() {

    const [session, setSession] = useState<Session | null>(null);
    const [initializing, setInitializing] = useState(true);
    const [isSynced, setIsSynced] = useState(false);
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

    const handleToggleSync = () => {
        setIsSynced((prev) => !prev);
        if (isSynced) {
            startTracking();
        }
    };

    //any js in this html will run internally within the popup
    return (
        <div className="LoginPage">
            {/* Header with train icon and gear button */}
            <div className="login-header">
                {/* Train Icon - Top Left */}
                <svg
                    className="header-logo"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Train body */}
                    <rect x="3" y="6" width="18" height="10" rx="1"/>
                    {/* Windows */}
                    <rect x="5" y="8" width="5" height="3" fill="var(--color-charcoal)"/>
                    <rect x="14" y="8" width="5" height="3" fill="var(--color-charcoal)"/>
                    {/* Wheels */}
                    <circle cx="7" cy="19" r="2"/>
                    <circle cx="17" cy="19" r="2"/>
                    {/* Smoke stack */}
                    <rect x="10" y="3" width="4" height="4" rx="0.5"/>
                </svg>

                {/* Gear Icon Button - Top Right */}
                <button
                    className="gear-button"
                    type="button"
                >
                    <svg
                        className="gear-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                </button>
            </div>

            {/* Sync Section */}
            <div className="sync-section">
                <h2 className="sync-title">{isSynced ? 'Synced!' : 'Sync Site?'}</h2>

                {/* Sync Button */}
                <button
                    className={`sync-button ${isSynced ? 'synced' : ''}`}
                    type="button"
                    onClick={handleToggleSync}
                >
                    <img 
                        src={isSynced ? syncedIcon : unsyncedIcon} 
                        alt={isSynced ? 'Synced' : 'Not synced'}
                        className="sync-icon"
                    />
                </button>
            </div>

            <div className="card">
                <p>
                    logged in as: {session.user.email}
                </p>
                <button onClick={handleSignOut}>
                    sign out
                </button>
            </div>
        </div>
    )
}

export default App
