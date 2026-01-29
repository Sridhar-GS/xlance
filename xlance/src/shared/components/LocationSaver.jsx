import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LocationSaver = () => {
    const location = useLocation();

    useEffect(() => {
        // Save current path to localStorage, but ignore auth pages to avoid redirect loops
        if (
            location.pathname !== '/auth/signin' &&
            location.pathname !== '/auth/signup' &&
            location.pathname !== '/'
        ) {
            localStorage.setItem('xlance_last_path', location.pathname + location.search);
        }
    }, [location]);

    return null;
};

export default LocationSaver;
