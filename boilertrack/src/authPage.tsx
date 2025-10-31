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

     

}
