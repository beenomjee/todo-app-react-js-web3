import React, { useEffect } from 'react'
import { useUserContext } from '../../hooks';
import { useNavigate } from 'react-router-dom';
// import styles from './ProtectedRoute.module.scss';

const ProtectedRoute = ({ element: Element }) => {
    const { user } = useUserContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.provider)
            navigate('/connect', { replace: true });
    }, [navigate, user.provider]);

    return (
        user.isLoading ? "loading..." : <Element />
    )
}

export default ProtectedRoute;