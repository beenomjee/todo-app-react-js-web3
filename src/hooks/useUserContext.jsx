import { useContext } from 'react';
import { UserContext } from '../context'

const useUserContext = () => {
    return useContext(UserContext);
}

export default useUserContext