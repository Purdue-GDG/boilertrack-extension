//This ts is for the POPUP
//any js will run INTERNALLY within the popup window. This is not always the case, using chrome.scripting
import {useEffect, useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import Login from './authPage';
import {supabase} from './supabaseClient';
import {trackedSitesService} from './trackedSiteServices';
import syncedIcon from './assets/synced.svg';
import unsyncedIcon from './assets/unsynced.svg';
import gcalAddIcon from './assets/gcal_add.svg';
import checkedIcon from './assets/checked.svg';
import uncheckedIcon from './assets/unchecked.svg';

import './App.css';

interface Task {
    id: string;
    name: string;
    dueDate: string;
    class: string;
    classColor: string;
}

function App() {

    const [session, setSession] = useState<Session | null>(null);
    const [initializing, setInitializing] = useState(true);
    const [isSynced, setIsSynced] = useState(false);
    const [showTaskSelection, setShowTaskSelection] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
    const authClient = supabase;

    // Hardcoded task data matching the image MOCKUP FOR NOW, TBD: fetch from the OCR
    const tasks: Task[] = [
        { id: '1', name: 'Project 5', dueDate: '11/11/2022', class: 'TDM', classColor: '#E8B4D9' },
        { id: '2', name: 'Mary Poppins Reading', dueDate: '10/22/2022', class: 'SCLA', classColor: '#D4B3E8' },
        { id: '3', name: 'Lab Reflection 9', dueDate: '05/22/2022', class: 'CHEM', classColor: '#B3E8B3' },
        { id: '4', name: 'Chain Rule Worksheet', dueDate: '07/14/2022', class: 'CALC I', classColor: '#E8D4B3' },
        { id: '5', name: 'Group Presentation', dueDate: '12/04/2021', class: 'CHEM', classColor: '#B3E8B3' },
        { id: '6', name: 'Project 6', dueDate: '02/02/2022', class: 'TDM', classColor: '#E8B4D9' },
    ];

    // right off the bat when the user opens the application,
    // the client connects with supabase and determins if the site is being synced.
    // if the site is being synced already by the client, it sets that boolean to true
    // therefore the "tracking" icon will go green.

    useEffect(() => {
        if (session) {
            chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
                if (tabs[0]) {

                    setCurrentTab(tabs[0]);

                    // Check if current site is already tracked
                    if (tabs[0].url) {
                        const tracked = await trackedSitesService.isSiteTracked(tabs[0].url);
                        setIsSynced(tracked);
                    }
                }
            });
        }
    }, [session]);

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

    //instead of start tracking just printing the current URL in the console,
    // as of dec 9 2025 the start tracking function sends all needed info to supabase to be added to database.

    const startTracking = async () => {

        try {

            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                console.log(tabs[0].url);

            });

            if (!currentTab) {
                throw new Error('No active tab available to track.');
            }

            const tabUrl = currentTab.url;
            if (!tabUrl) {
                throw new Error('Active tab has no URL to track.');
            }

            const result = await trackedSitesService.addTrackedSite(

                tabUrl,
                currentTab.title || null,
                currentTab.favIconUrl || null
            );

            console.log('Site tracked successfully:', result);

            // Show success message
            if (result.isNew) {
                console.log('New site added to tracking!');
            } else {
                console.log('Site visit count updated!');
            }

            setIsSynced(true);
        } catch (error) {
            console.error('Error tracking site:', error);
            alert('Failed to track site. Please try again.');
            setIsSynced(false);
        }


    };

    const handleToggleSync = () => { // Big sync button handler
        if (!isSynced) {
            setShowTaskSelection(true);
        } else {
            setIsSynced(false);
        }
    };

    const handleTaskToggle = (taskId: string) => {
        setSelectedTasks((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedTasks.size === tasks.length) {
            // Deselect all with top button
            setSelectedTasks(new Set());
        } else {
            // Select all with top button
            setSelectedTasks(new Set(tasks.map(task => task.id)));
        }
    };

    const handleAddToCalendar = () => {
        // Return to sync view and mark as synced
        setShowTaskSelection(false);
        setIsSynced(true);
        startTracking();
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
                        <path
                            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                </button>
            </div>

            {showTaskSelection ? (
                /* Task Selection Grid MOCKUP */
                <div className="task-selection-container">
                    <div className="task-table">
                        <div className="task-header">
                            <div className="task-header-cell checkbox-header">
                                <img
                                    src={selectedTasks.size === tasks.length && tasks.length > 0 ? checkedIcon : uncheckedIcon}
                                    alt="Select all"
                                    onClick={handleSelectAll}
                                    className="task-checkbox-icon"
                                />
                            </div>
                            <div className="task-header-cell task-name-header">
                                <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="8" y1="6" x2="21" y2="6"/>
                                    <line x1="8" y1="12" x2="21" y2="12"/>
                                    <line x1="8" y1="18" x2="21" y2="18"/>
                                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                                </svg>
                                Task
                            </div>
                            <div className="task-header-cell due-header">
                                <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                Due
                            </div>
                            <div className="task-header-cell class-header">
                                <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="8" y1="6" x2="21" y2="6"/>
                                    <line x1="8" y1="12" x2="21" y2="12"/>
                                    <line x1="8" y1="18" x2="21" y2="18"/>
                                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                                </svg>
                                Class
                            </div>
                        </div>
                        {tasks.map((task) => (
                            <div key={task.id} className="task-row">
                                <div className="task-cell checkbox-cell">
                                    <img
                                        src={selectedTasks.has(task.id) ? checkedIcon : uncheckedIcon}
                                        alt={selectedTasks.has(task.id) ? 'Checked' : 'Unchecked'}
                                        onClick={() => handleTaskToggle(task.id)}
                                        className="task-checkbox-icon"
                                    />
                                </div>
                                <div className="task-cell task-name-cell">
                                    {task.name}
                                    <svg className="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </div>
                                <div className="task-cell due-cell">{task.dueDate}</div>
                                <div className="task-cell class-cell">
                                    <span className="class-label" style={{ backgroundColor: task.classColor }}>
                                        {task.class}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="task-footer">
                        <div className="selected-count">
                            ({selectedTasks.size}) tasks selected
                        </div>
                        <button className="add-button" onClick={handleAddToCalendar}>
                            <img src={gcalAddIcon} alt="Add to Calendar" className="add-button-icon" />
                        </button>
                    </div>
                </div>
            ) : (
                <>
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
                </>
            )}
        </div>
    )
}

export default App
