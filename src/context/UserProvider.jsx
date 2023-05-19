import { createContext } from "react";
import { useStateWithCallback } from '../hooks'

const initialState = {
    isLoading: true,
    provider: null,
    signer: null,
    currentAddress: null,
    currentBalance: null,
}
export const UserContext = createContext(null);

const UserProvider = ({ children }) => {
    const [user, setUser] = useStateWithCallback(initialState)
    return (
        <>
            <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
        </>
    )
}

export default UserProvider