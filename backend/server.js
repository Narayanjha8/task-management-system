const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const User = require('./User')
const Task = require('./Task')

const app = express()

app.use(cors())
app.use(express.json())

const authenticate = (req, res, next) => {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Task Management API is running' })
})

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/tasks', authenticate, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Title is required' })
    }

    const task = await Task.create({
      userId: req.userId,
      title,
      description,
      status,
      priority,
      dueDate
    })

    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/tasks', authenticate, async (req, res) => {
  try {
    const { search, status, priority } = req.query

    const filter = {
      userId: req.userId
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' }
    }

    if (status) {
      filter.status = status
    }

    if (priority) {
      filter.priority = priority
    }

    const tasks = await Task.find(filter).sort({ _id: -1 })

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.put('/api/tasks/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      req.body,
      { new: true }
    )

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.patch('/api/tasks/:id/complete', authenticate, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      { status: 'Done' },
      { new: true }
    )

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/tasks/analytics', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId })

    const total = tasks.length
    const completed = tasks.filter(task => task.status === 'Done').length
    const pending = total - completed
    const completionPercentage = total === 0
      ? 0
      : Math.round((completed / total) * 100)

    res.json({
      total,
      completed,
      pending,
      completionPercentage
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

const PORT = process.env.PORT || 5001

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch(error => {
    console.log('MongoDB connection failed')
    console.log(error.message)
  })