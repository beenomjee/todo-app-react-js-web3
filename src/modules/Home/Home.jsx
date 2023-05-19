import React, { useCallback, useEffect, useRef, useState } from 'react'
import { IconButton, Loader, Modal } from '../../components'
import { IoEllipsisHorizontalSharp } from 'react-icons/io5';
import { TbCircleCheckFilled } from 'react-icons/tb';
import { FiCircle, FiXCircle, FiPlusCircle, FiEdit2 } from 'react-icons/fi';
import styles from './Home.module.scss'
import { useClickOutside, useStateWithCallback, useUserContext } from '../../hooks';
import { ethers } from 'ethers';
import { TodoListContract } from '../../contracts'
import { toast } from 'react-toastify';

const Item = ({ data, onUpdateClick, onDeleteClick, onEditClick }) => {
    const { isCompleted, isDeleted } = data;
    return (
        <div className={`${styles.item} ${isDeleted ? styles.deleted : ''}`}>
            <p onClick={isDeleted ? null : onUpdateClick}>
                <span className={`${styles.circle} ${isCompleted ? styles.completed : ''}`}>{isCompleted ? <TbCircleCheckFilled /> : <FiCircle />}</span>
                <span>{data.text ?? 'There is not text to show!'}</span>
            </p>
            {!isDeleted && (
                <>
                    <IconButton onClick={onEditClick}><FiEdit2 /></IconButton>
                    <IconButton onClick={onDeleteClick}><FiXCircle /></IconButton>
                </>
            )}
        </div>
    )
}

const Home = () => {
    const rightRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState('Progress')
    const { user } = useUserContext();
    const contract = useRef(new ethers.Contract(TodoListContract.address, TodoListContract.abi, user.signer));
    const [isLoading, setIsLoading] = useStateWithCallback(true);
    const [completedTodos, setCompletedTodos] = useState([]);
    const [pendingTodos, setPendingTodos] = useState([])
    const [deletedTodos, setDeletedTodos] = useState([])
    const [currentSelectedTodos, setCurrentSelectedTodos] = useState([]);
    const [text, setText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState('');


    const onFormSubmit = async () => {
        toast.info('Please confirm your transaction!');
        try {
            let trx;
            if (editId)
                trx = await contract.current.updateDescription(text, editId);
            else
                trx = await contract.current.createTask(text);
            await trx.wait();
            setIsLoading(false);
            setText('');
            setEditId('');
            loadTodos();
        } catch (err) {
            console.log(err);
            if (err.code === 'ACTION_REJECTED')
                toast.error("This transaction is required to fulfill this step!");
            else
                toast.error("Something went wrong. Please try again!");
            setIsLoading(false);
        }
    }

    useClickOutside(rightRef, () => {
        setIsMenuOpen(false);
    });

    const onMenuButtonClick = e => {
        setSelectedMenu(e.target.id);
        setIsMenuOpen(false);
    }

    const onUpdateClick = async (id) => {
        setIsLoading(true);
        toast.info('Please confirm your transaction!');
        try {
            const trx = await contract.current.updateCompleted(selectedMenu !== 'Completed', id);
            await trx.wait();
            setIsLoading(false);
            setText('');
            loadTodos();
        } catch (err) {
            console.log(err);
            if (err.code === 'ACTION_REJECTED')
                toast.error("This transaction is required to fulfill this step!");
            else
                toast.error("Something went wrong. Please try again!");
            setIsLoading(false);
        }
    }

    const onDeleteClick = async (id) => {
        setIsLoading(true);
        toast.info('Please confirm your transaction!');
        try {
            const trx = await contract.current.deleteTask(id);
            await trx.wait();
            setIsLoading(false);
            loadTodos();
        } catch (err) {
            console.log(err);
            if (err.code === 'ACTION_REJECTED')
                toast.error("This transaction is required to fulfill this step!");
            else
                toast.error("Something went wrong. Please try again!");
            setIsLoading(false);
        }
    }

    const onEditClick = (id, text) => {
        setEditId(`${id}`);
        setText(text);
        setIsModalOpen(true);
    }

    const loadTodos = useCallback(async () => {
        setIsLoading(true);
        try {
            const todos = await contract.current.readAllTasks();
            // resetting to all
            setDeletedTodos([]);
            setCompletedTodos([]);
            setPendingTodos([]);
            for (const [id, todo] of Array.from(todos).entries()) {
                const task = {
                    text: todo.text,
                    isCompleted: todo.isCompleted,
                    isDeleted: todo.isDeleted,
                    createdAt: todo.createdAt,
                    id
                };

                if (task.isDeleted) {
                    setDeletedTodos(p => [...p, task])
                } else if (task.isCompleted) {
                    setCompletedTodos(p => [...p, task])
                } else {
                    setPendingTodos(p => [...p, task])
                }
            }

            setIsLoading(false);
        } catch (err) {
            toast.error("Something went wrong. Please reload the page!");
            setIsLoading(false);
        }
    }, [setIsLoading]);


    useEffect(() => {
        loadTodos();
    }, [loadTodos, user.currentAddress]);

    useEffect(() => {
        if (selectedMenu === 'Completed')
            setCurrentSelectedTodos([...completedTodos])
        else if (selectedMenu === 'Progress')
            setCurrentSelectedTodos([...pendingTodos])
        else
            setCurrentSelectedTodos([...deletedTodos])


    }, [completedTodos, deletedTodos, pendingTodos, selectedMenu]);

    return (
        <div className={styles.center}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <h1 className={styles.left}>Todos</h1>
                    <div className={`${styles.right} ${isMenuOpen ? styles.open : ''}`} ref={rightRef}>
                        <IconButton onClick={e => setIsMenuOpen(p => !p)}><IoEllipsisHorizontalSharp /></IconButton>
                        <div className={styles.menu}>
                            <button onClick={onMenuButtonClick} id='Completed' className={selectedMenu === 'Completed' ? styles.selected : ''}>Completed</button>
                            <button onClick={onMenuButtonClick} id='Progress' className={selectedMenu === 'Progress' ? styles.selected : ''}>In Progress</button>
                            <button onClick={onMenuButtonClick} id='Removed' className={selectedMenu === 'Removed' ? styles.selected : ''}>Removed</button>
                        </div>
                    </div>
                </div>
                <div className={styles.bottom}>
                    {
                        currentSelectedTodos.length > 0 ?
                            currentSelectedTodos.map((data, i) => (
                                <Item key={i} data={data} onUpdateClick={() => onUpdateClick(data.id)} onDeleteClick={() => onDeleteClick(data.id)} onEditClick={() => onEditClick(data.id, data.text)} />
                            )) : <p>There is not any task!</p>
                    }
                    <div onClick={e => setIsModalOpen(true)} className={styles.addNew}>
                        <span className={styles.circle}><FiPlusCircle /></span>
                        <p>Create New Item</p>
                    </div>
                </div>
                {isLoading &&
                    (
                        <div className={styles.lodingWrapper}>
                            <Loader />
                        </div>
                    )
                }
            </div>
            {isModalOpen && <Modal setIsLoading={setIsLoading} btnText={editId ? "Edit Task" : "Add Task"} text={text} setText={setText} setIsModalOpen={setIsModalOpen} onFormSubmit={onFormSubmit} setEditId={setEditId} />}
        </div>
    )
}

export default Home