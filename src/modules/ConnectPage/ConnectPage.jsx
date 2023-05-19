import React, { useEffect } from 'react'
import { Connect } from '../../components';
import { useUserContext } from '../../hooks';
import detectEthereumProvider from '@metamask/detect-provider';
import { toast } from 'react-toastify';
import { ethers, formatEther } from 'ethers';
import { useNavigate } from 'react-router-dom';

const ConnectPage = () => {
    const { user, setUser } = useUserContext();
    const navigate = useNavigate();

    const onAccountChange = async (currentAddress, provider) => {
        const currentBalance = formatEther(await provider.getBalance(currentAddress));
        setUser(
            p => (
                { signer: null, currentBalance, currentAddress, isLoading: false, provider: null }
            ),
            newState => toast.error("Again connect the wallet!")
        )
    }

    const onLoadingStart = async (newState) => {
        const ethereumProvider = await detectEthereumProvider()

        if (!ethereumProvider) {
            toast.error("Please install metamask first!");
            setUser(p => ({ ...p, isLoading: false }))
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(ethereumProvider)
            const signer = await provider.getSigner();

            // setting when account changed
            ethereumProvider.on('accountsChanged', accounts => onAccountChange(accounts[0], provider));
            // setting first time account
            const currentAddress = await signer.getAddress();
            const currentBalance = formatEther(await provider.getBalance(currentAddress));
            setUser(
                p => (
                    { ...p, currentBalance, currentAddress, isLoading: false, signer, provider }
                ),
                newState => {
                    toast.success("Logged In!");
                    navigate('/', { replace: true });
                }
            )
        } catch (err) {
            console.log(err);
            if (err.code === 'ACTION_REJECTED')
                toast.error("This permission is required to use this app!");
            else
                toast.error("Something went wrong. Please try again!");
            setUser(p => ({ ...p, isLoading: false }));
        }
    }

    const onClickConnect = e => {
        setUser(p => ({ ...p, isLoading: true }), onLoadingStart)
    }

    useEffect(() => {
        setUser(p => ({ ...p, isLoading: false }));
    }, [setUser])


    return (
        <Connect onClickConnect={onClickConnect} isLoading={user.isLoading} />
    )
}

export default ConnectPage