import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const App = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (user) fetchHabits();
  }, [user]);

  const fetchHabits = async () => {
    const res = await axios.get('/api/habits');
    setHabits(res.data);
  };

  const handleLogin = async () => {
    const res = await axios.post('/api/login', { email, password });
    if (res.data.user) setUser(res.data.user);
  };

  const addHabit = async () => {
    await axios.post('/api/habits', { name: newHabit });
    setNewHabit("");
    fetchHabits();
  };

  const toggleHabit = async (id) => {
    await axios.post(`/api/habits/${id}/toggle`);
    fetchHabits();
  };

  if (!user) {
    return (
      <div className="container">
        <h2>Login</h2>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Welcome, {user.email}</h2>
      <input value={newHabit} onChange={(e) => setNewHabit(e.target.value)} placeholder="New Habit" />
      <button onClick={addHabit}>Add Habit</button>
      {habits.map(habit => (
        <div key={habit.id} className="habit-item">
          <span>{habit.name}</span>
          <button onClick={() => toggleHabit(habit.id)}>{habit.completed_today ? "✅" : "⬜"}</button>
        </div>
      ))}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
