import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTitle = (title) => {
    const location = useLocation();

    useEffect(() => {
        const prevTitle = document.title;
        document.title = `${title} | Xlance`;

        return () => {
            // Optional: restore title on unmount, but often not needed for SPAs
            // document.title = prevTitle; 
        };
    }, [title, location]);
};

export default usePageTitle;
