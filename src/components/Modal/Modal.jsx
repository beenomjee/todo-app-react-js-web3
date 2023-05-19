import React, { useEffect, useRef } from 'react'
import styles from './Modal.module.scss';

const Modal = ({ btnText, setIsLoading, text, setText, setIsModalOpen, onFormSubmit, setEditId }) => {
    const inputRef = useRef(null);
    const onBgWrapperClick = () => {
        setIsModalOpen(false);
        setText('');
        setEditId('');
    }

    const onClick = e => {
        setIsLoading(true);
        setIsModalOpen(false);
        onFormSubmit();
    }

    useEffect(() => {
        if (inputRef.current)
            inputRef.current.focus();
    }, [inputRef])

    return (
        <>
            <div onClick={onBgWrapperClick} className={styles.bgWrapper}></div>
            <div className={styles.center}>
                <div className={styles.container}>
                    <input ref={inputRef} type="text" placeholder='Description' value={text} onChange={e => setText(e.target.value)} />
                    <button onClick={onClick}>{btnText}</button>
                </div>
            </div>
        </>
    )
}

export default Modal