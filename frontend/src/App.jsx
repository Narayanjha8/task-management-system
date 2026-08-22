import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

const API = 'https://task-management-backend-7x3q.onrender.com'
function App() {
  const [page, setPage] = useState('login')
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [tasks, setTasks] = useState([])
  const [analytics, setAnalytics] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionPercentage: 0
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Todo')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (token) {
      setPage('dashboard')
      fetchTasks()
      fetchAnalytics()
    }
  }, [token])

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  const signup = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await axios.post(`${API}/api/auth/signup`, {
        name,
        email,
        password
      })

      setName('')
      setEmail('')
      setPassword('')
      setPage('login')
      alert('Account created successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    }
  }

  const login = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password
      })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      setToken(res.data.token)
      setUser(res.data.user)
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setTasks([])
    setPage('login')
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()

      if (search) params.append('search', search)
      if (filterStatus) params.append('status', filterStatus)
      if (filterPriority) params.append('priority', filterPriority)

      const res = await axios.get(
        `${API}/api/tasks?${params.toString()}`,
        authConfig
      )

      setTasks(res.data)
    } catch (err) {
      setError('Unable to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(
        `${API}/api/tasks/analytics`,
        authConfig
      )

      setAnalytics(res.data)
    } catch {
      setError('Unable to load analytics')
    }
  }

  const saveTask = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const taskData = {
        title,
        description,
        status,
        priority,
        dueDate
      }

      if (editingId) {
        await axios.put(
          `${API}/api/tasks/${editingId}`,
          taskData,
          authConfig
        )
      } else {
        await axios.post(
          `${API}/api/tasks`,
          taskData,
          authConfig
        )
      }

      clearForm()
      fetchTasks()
      fetchAnalytics()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save task')
    }
  }

  const editTask = (task) => {
    setEditingId(task._id)
    setTitle(task.title)
    setDescription(task.description || '')
    setStatus(task.status)
    setPriority(task.priority)
    setDueDate(task.dueDate || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/api/tasks/${id}`, authConfig)
      fetchTasks()
      fetchAnalytics()
    } catch {
      setError('Unable to delete task')
    }
  }

  const completeTask = async (id) => {
    try {
      await axios.patch(
        `${API}/api/tasks/${id}/complete`,
        {},
        authConfig
      )

      fetchTasks()
      fetchAnalytics()
    } catch {
      setError('Unable to complete task')
    }
  }

  const clearForm = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setStatus('Todo')
    setPriority('Medium')
    setDueDate('')
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  useEffect(() => {
    if (token && page === 'dashboard') {
      const timer = setTimeout(() => {
        fetchTasks()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [search, filterStatus, filterPriority])

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-box">
          <h1>TaskFlow</h1>
          <p>Simple Task Management System</p>

          {error && <div className="error">{error}</div>}

          {page === 'login' ? (
            <form onSubmit={login}>
              <h2>Welcome Back</h2>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit">Login</button>

              <p>
                Don't have an account?
                <span onClick={() => setPage('signup')}>
                  Sign Up
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={signup}>
              <h2>Create Account</h2>

              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit">Create Account</button>

              <p>
                Already have an account?
                <span onClick={() => setPage('login')}>
                  Login
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <header>
        <div>
          <h1>TaskFlow</h1>
          <p>Welcome, {user?.name}</p>
        </div>

        <div className="header-actions">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main>
        {error && <div className="error">{error}</div>}

        <section className="stats">
          <div className="stat">
            <h3>Total Tasks</h3>
            <strong>{analytics.total}</strong>
          </div>

          <div className="stat">
            <h3>Completed</h3>
            <strong>{analytics.completed}</strong>
          </div>

          <div className="stat">
            <h3>Pending</h3>
            <strong>{analytics.pending}</strong>
          </div>

          <div className="stat">
            <h3>Completion</h3>
            <strong>{analytics.completionPercentage}%</strong>
          </div>
        </section>

        <section className="task-form">
          <h2>{editingId ? 'Edit Task' : 'Create New Task'}</h2>

          <form onSubmit={saveTask}>
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="form-row">
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>

              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-buttons">
              <button type="submit">
                {editingId ? 'Update Task' : 'Add Task'}
              </button>

              {editingId && (
                <button type="button" onClick={clearForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="task-section">
          <div className="filters">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={handleSearch}
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <h2>Your Tasks</h2>

          {loading ? (
            <p className="message">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="message">No tasks found.</p>
          ) : (
            <div className="tasks">
              {tasks.map((task) => (
                <div className="task-card" key={task._id}>
                  <div className="task-top">
                    <h3>{task.title}</h3>
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>

                  <p>{task.description}</p>

                  <div className="task-info">
                    <span>{task.status}</span>
                    <span>Due: {task.dueDate || 'No date'}</span>
                  </div>

                  <div className="task-actions">
                    {task.status !== 'Done' && (
                      <button onClick={() => completeTask(task._id)}>
                        Complete
                      </button>
                    )}

                    <button onClick={() => editTask(task)}>
                      Edit
                    </button>

                    <button onClick={() => deleteTask(task._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App