import React, { useEffect, useState } from 'react';
import { getDatabase, onValue, ref, push, set, remove, update, off } from "firebase/database";
import { app } from '../Firebase';

const database = getDatabase(app);

export default function FirebaseDatabase() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        username: "",
        email: ""
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        const usersRef = ref(database, 'users/aryan');

        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const userList = Object.entries(data).map(([id, value]) => ({
                    id,
                    ...value
                }));
                setUsers(userList);
            } else {
                setUsers([]);
            }
        });

        
        return () => off(usersRef);
    }, []);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    function sendData() {
        
        if (!form.username || !form.email) {
            alert("Please fill all fields");
            return;
        }

        if (editId) {
            const userRef = ref(database, `users/aryan/${editId}`);

            update(userRef, {
                username: form.username,
                email: form.email,
            })
                .then(() => {
                    console.log("User updated successfully!");
                    setForm({ username: "", email: "" });
                    setEditId(null);
                })
                .catch((error) => {
                    console.log(error);
                });

        } else {
            const usersRef = ref(database, 'users/aryan');
            const newUserRef = push(usersRef);

            set(newUserRef, {
                username: form.username,
                email: form.email,
            })
                .then(() => {
                    console.log("User added successfully!");
                    setForm({ username: "", email: "" });
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    function deleteUser(id) {
        const userRef = ref(database, `users/aryan/${id}`);

        remove(userRef)
            .then(() => {
                console.log("User deleted successfully!");
            })
            .catch((error) => {
                console.log(error);
            });
    }

    function editUser(user) {
        setForm({
            username: user.username,
            email: user.email
        });
        setEditId(user.id);
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Firebase Realtime Database</h1>

            <h3>{editId ? "Edit User" : "Add User"}</h3>

            <input
                type="text"
                name="username"
                placeholder="Enter Username"
                value={form.username}
                onChange={handleChange}
            />
            <br /><br />

            <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={form.email}
                onChange={handleChange}
            />
            <br /><br />

            <button onClick={sendData}>
                {editId ? "Update User" : "Add User"}
            </button>

            <hr />

            <h2>All Users:</h2>

            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.username} - {user.email} &nbsp;

                        <button onClick={() => editUser(user)}>Edit</button>
                        <button onClick={() => deleteUser(user.id)}>Delete</button>

                        <hr />
                    </li>
                ))}
            </ul>
        </div>
    );
}
