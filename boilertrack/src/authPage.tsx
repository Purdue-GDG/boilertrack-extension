//The main auth page, what the user sees when he first opens the extension for the first time
import {useCallback, useMemo, useState, type FormEvent} from 'react';
import type {Session, SupabaseClient} from '@supabase/supabase-js';

//Type AuthMode is essentially an Enum
type AuthMode = 'Sign-in' | 'Sign-up';

interface loginParms {
    supabase: SupabaseClient;
    onAuthenticated: (session: Session) => void;
}

// This line was erroring on my VSCode typscrint lint, it should be capitalized
const AuthPage = ({ supabase, onAuthenticated }: loginParms) => {

//if the client is logging in or signing up
const [mode, setMode] = useState<AuthMode>('Sign-in');
//if the client is currently submitting their info
const [submitting, setSubmitting] = useState(false);
//The clients entered email
    const [email, setEmail] = useState('');
//the clients entered psasword
    const [password, setPassword] = useState('');
//any error response that has come back
    const [error, setError] = useState<string | null>(null);
//any message from supabase
    const [message, setMessage] = useState<string | null>(null);
//url for the google oauth
    const oAuthurl = new URL('https://accounts.google.com/o/oauth2/auth');
    //manifest file for oauth
    const manifest = chrome.runtime.getManifest()
    const oauth2 = manifest.oauth2;


//oauth setup
    if (oauth2?.client_id && oauth2.scopes) {
        oAuthurl.searchParams.set('client_id', oauth2.client_id);
        oAuthurl.searchParams.set('response_type', 'id_token');
        oAuthurl.searchParams.set('access_type', 'offline');
        oAuthurl.searchParams.set('redirect_uri', chrome.identity.getRedirectURL());
        oAuthurl.searchParams.set('scope', oauth2.scopes.join(' '));
        // console.log(oAuthurl.searchParams.get('redirect_uri'));
    } else {
        console.error('OAuth2 config is missing from manifest.json');
    }


    //function that is ran when the google auth button is pressed
    const googleLogin = async () => {
        chrome.identity.launchWebAuthFlow(
            {
                url: oAuthurl.href,
                interactive: true,
            },
            async (redirectedTo) => {

                //if the page dosent open, throw an error:
                if (chrome.runtime.lastError || !redirectedTo) {
                    //console.error(chrome.runtime.lastError); for debugging
                    setError('Google sign-in failed');
                    return;
                } else {
                    // auth was successful, extract the ID token from the redirectedTo URL
                    // grab the auth token google provides and pass it to supabase
                    const url = new URL(redirectedTo)
                    const params = new URLSearchParams(url.hash.replace(/^#/, ''));
                    const idToken = params.get('id_token');

                    // if for some reason there WASNT a token, throw an error.
                    if (!idToken) {
                        console.error('No id_token found in redirect URL');
                        setError('Google sign-in failed: missing id token');
                        return;
                    }

                    //give supabase the token and ask for a signin
                    const { data, error: idTokenError } = await supabase.auth.signInWithIdToken({
                        provider: 'google',
                        token: idToken,
                    });

                    // if supabase google token auth throws something, print that error:
                    if (idTokenError) {
                        setError(idTokenError.message);
                        return;
                    }

                    // BANG WERE IN :)
                    if (data.session) {
                        onAuthenticated(data.session);
                    }

                }
            }
        )
    }



    const title = useMemo(() => {
        if (mode === 'Sign-in') {
            return 'Sign in to Boilertrack'
        } else if (mode === 'Sign-up') {
            return 'Create Boilertrack Account'
        } else {
            return '';
        }
    }, [mode],);

    //Define button text
    const submitLabel = useMemo(() => {
        if (submitting) {
            if (mode === 'Sign-in') {
                return 'Signing in....';
            } else if (mode === 'Sign-up') {
                return 'signing up ....';

            } else {
                return '';
            }

        } else {
            if (mode === 'Sign-in') {
                return 'Sign in';
            } else if (mode === 'Sign-up') {
                return 'Sign up';
            } else {
                return '';
            }
        }
    }, [mode, submitting],);

    //prompt to toggle between modes
    //(sign in or sign up)
    const togglePrompt = useMemo(() => {
            if (mode === 'Sign-in') {
                return 'No account?';
            } else if (mode === 'Sign-up') {
                return 'Already have an account?';
            } else {
                return '';
            }

        },
        [mode],);

    const toggleLabel = useMemo(() => {
        if (mode === 'Sign-in') {
            return 'Create one';
        } else if (mode === 'Sign-up') {
            return 'Sign in';
        } else {
            return '';
        }

    }, [mode],);

    //in case of an error and a retry to authenticate, clear errors and messages
    const resetStatus = useCallback(() => {
        setError(null);
        setMessage(null);
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        //this runs on a submit button press. sending info to supabase
        event.preventDefault();
        //clear errors
        resetStatus();
        setSubmitting(true);

        if (mode === 'Sign-in') {
            //if we are trying to sign in and the button is pressed, send a request to supabase
            const {data, error: signInError} = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            setSubmitting(false);
            //if an error comes back:
            if (signInError) {
                setError(signInError.message);
                return;
            }

            if (data.session) {
                onAuthenticated(data.session);

            } else {
                setMessage("Sign-in worked, but error loading active session");

            }
            return;
        }

        //if it was sign up instead:
        else if (mode === 'Sign-up') {
            const {data, error: signUpError} = await supabase.auth.signUp({
                email,
                password,

                //TODO: Here we will add a OTP email authentication.

            });
            setSubmitting(false);
            if (signUpError) {
                setError(signUpError.message);
                return;
            }
            if (data.session) {
                onAuthenticated(data.session);
            } else {
                setMessage('Check your email for confirmation code');
                setMode('Sign-in');
            }
        }
        ;


    };

    const handleToggleMode = () => {
        setMode((previousMode) => (previousMode === 'Sign-in' ? 'Sign-up' : 'Sign-in'));
        resetStatus();
    };


    return (
        <div className="LoginPage">
            {/* Train Icon */}
            <svg
                className="app-logo"
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

            <h1>{title}</h1>

            {/* Google Sign In Button - No action */}
            <button
                className="google-button"
                type="button"
                disabled={submitting}
                onClick={googleLogin}
            >
                <svg className="google-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"/>
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"/>
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"/>
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"/>
                </svg>
                Continue with Google
            </button>

            <form className="login-form" onSubmit={handleSubmit}>
                <label className="login-label">
                    Email

                    <input
                        autoComplete="email"
                        className="login-input"
                        disabled={submitting}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="username@domain.com"
                        type="email"
                        value={email}
                        required
                    />
                </label>

                <label className="login-label">
                    Password
                    <input
                        autoComplete={mode === 'Sign-in' ? 'current-password' : 'new-password'}
                        className="login-input"
                        disabled={submitting}
                        minLength={6}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        required
                    />

                </label>

                {error ? <p className="login-error">{error}</p> : null}
                {message ? <p className="login-message">{message}</p> : null}

                <button className="login-submit" disabled={submitting} type="submit">
                    {submitLabel}
                </button>

            </form>
            <p className="login-toggle">
                {togglePrompt}{' '}
                <button className="login-toggle-button" onClick={handleToggleMode} type="button">
                    {toggleLabel}
                </button>
            </p>
        </div>
    );
};

export default AuthPage;
