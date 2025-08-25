require('dotenv').config()
const express = require('express')
const cors = require('cors')

const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

var morgan = require('morgan')
// app.use(morgan('tiny'))

// Crea un nuevo token para mostrar los datos enviados en las solicitudes http post
morgan.token('data', (req) => JSON.stringify(req.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/info', (req, res) => {
    Person.countDocuments().then(count => {
        const info = `
            <br/>Phonebook has info for ${count} people<br/>
        <br/>${new Date()}<br/>
    `
    res.send(info)
  })
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    Person.findById(id).then(person => {
        if (person) {
            res.json(person)
        } else {
            res.status(404).send({ error: 'Person not found' })
        }
    }).catch(error => {
      console.log(error)
      res.status(500).end()
    })
})

// const generateId = () => {
//   // Usando Math.random
//   return Math.floor(Math.random() * 1000000)
// }

app.post('/api/persons', (req, res) => {
  const person = new Person(req.body)
  person.save().then(savedPerson => {
    res.status(201).json(savedPerson)
  }).catch(error => {
    console.error(error)
    res.status(400).send({ error: 'Invalid data' })
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  Person.findByIdAndRemove(id).then(result => {
    if (result) {
      res.status(204).end()
    } else {
      res.status(404).send({ error: 'Person not found' })
    }
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
