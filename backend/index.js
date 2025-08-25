const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

var morgan = require('morgan')
// app.use(morgan('tiny'))

// Crea un nuevo token para mostrar los datos enviados en las solicitudes http post
morgan.token('data', (req) => JSON.stringify(req.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

let phonebook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (req, res) => {
  res.json(phonebook)
})

app.get('/info', (req, res) => {
    const info = `
        <br/>Phonebook has info for ${phonebook.length} people<br/>
        <br/>${new Date()}<br/>
    `
    res.send(info)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = phonebook.find(p => p.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).send({ error: 'Person not found' })
    }
})

const generateId = () => {
  // Usando Math.random
  return Math.floor(Math.random() * 1000000)
}

app.post('/api/persons', (req, res) => {
    const { name, number } = req.body
    if (!name || !number) {
        return res.status(400).send({ error: 'Name and number are required' })
    }
    const existingPerson = phonebook.find(p => p.name === name)
    if (existingPerson) {
        return res.status(400).send({ error: 'Name must be unique' })
    }
    const newPerson = {
        id: generateId(),
        name,
        number
    }
    phonebook.push(newPerson)
    res.status(201).json(newPerson)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    phonebook = phonebook.filter(p => p.id !== id)
    res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
