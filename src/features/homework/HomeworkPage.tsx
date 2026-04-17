import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { fetchHomeworks, deleteHomework } from '../../api/homework.api';

type Homework = {
    id: number;
    title: string;
};

const HomeworkPage = () => {
    const [homeworks, setHomeworks] = useState<Homework[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchHomeworks();
                setHomeworks(data.data);
            } catch (error) {
                console.error('Failed to fetch homeworks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await deleteHomework(id);
            setHomeworks((prev) => prev.filter((hw) => hw.id !== id));
        } catch (error) {
            console.error('Failed to delete homework:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Homework Management</h1>
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-4 py-2">ID</th>
                        <th className="border border-gray-300 px-4 py-2">Title</th>
                        <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {homeworks.map((homework: Homework) => (
                        <tr key={homework.id}>
                            <td>{homework.id}</td>
                            <td>{homework.title}</td>
                            <td>
                                <button onClick={() => handleDelete(homework.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HomeworkPage;