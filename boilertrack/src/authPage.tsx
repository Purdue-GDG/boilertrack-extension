//The main auth page, what the user sees when he first opens the extension for the first time
import { useCallback, useMemo, useState, type FormEvent} from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

//Type AuthMode is essentially an Enum
type AuthMode = 'Sign-in' | 'Sign-up';

interface loginParms {
    supabase: SupabaseClient;
    onAuthenticated: (session: Session) => void;
}

const authPage = ({ supabase, onAuthenticated }: loginParms) => {

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



    const title = useMemo(() => {
        if (mode === 'Sign-in') {
            return 'Sign in to Boilertrack'
        } else if(mode === 'Sign-up') {
            return 'Create Boilertrack Acc'
        }
        else {
            return '';
        }
},[mode],);

    //Define button text
    const submitLabel = useMemo(() => {
        if(submitting){
            if(mode === 'Sign-in') {
                return 'Signing in....';
            }
            else if (mode === 'Sign-up') {
                return 'signing up ....';

            }
            else {
                return '';
            }

        }
        else {
            if (mode === 'Sign-in') {
                return 'Sign in';
            }
            else if (mode === 'Sign-up') {
                return 'Sign up';
            }
            else {
                return '';
            }
        }
    },[mode,submitting],);

    //prompt to toggle between modes
    //(sign in or sign up)
    const togglePrompt = useMemo(() => {
        if (mode === 'Sign-in') {
            return 'No account?';
        }
        else if (mode === 'Sign-up') {
            return 'Already have an account?';
        }
        else {
            return '';
        }

    },
     [mode],);

     const toggleLabel = useMemo(() => {
        if (mode === 'Sign-in') {
            return 'Create one';
        }
        else if (mode === 'Sign-up') {
            return 'Sign in';
        }
        else {
            return '';
        }

     }, [mode], );

     //in case of an error and a retry to authenticate, clear errors and messages
     const resetStatus = useCallback(() => {
        setError(null);
        setMessage(null);
     }, []);

     const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        //this runs on a submit button press. sending info to supabase
        event.preventDefault;
        //clear errors
        resetStatus();
        setSubmitting(true);

        if (mode === 'Sign-in') {
            //if we are trying to sign in and the button is pressed, send a request to supabase
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            setSubmitting(false);
            //if an error comes back:
            if (signInError) {
                setError(signInError.message);
                return; 
            }

            if(data.session) {
                onAuthenticated(data.session);

            } else {
                setMessage("Sign-in worked, but error loading active session");

            }
            return;
        }

        //if it was sign up instead:
        else if (mode === 'Sign-up') {
            const { data, error: signUpError } = await supabase.auth.signUp({
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
            }
            else {
                setMessage('Check your email for confirmation code');
                setMode('Sign-in');
            }
        };


        


     };

     const handleToggleMode = () => {
        setMode((previousMode) => (previousMode === 'Sign-in' ? 'Sign-up' : 'Sign-in'));
        resetStatus();
      };
    
     
     return (
        <div className="LoginPage">
            <h1>{title}</h1>
            <form className="login-form" onSubmit={handleSubmit}>
                <label className="login-label">
                    Email
                
                <input
                    autoComplete="email"
                    className="login-input"
                    disabled={submitting}
                    onChange={(event)=>setEmail(event.target.value)}
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

                <button className = "login-submit" disabled={submitting} type="submit">
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

export default authPage;
