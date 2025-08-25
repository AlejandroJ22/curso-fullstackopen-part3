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

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
      if (person) {
          res.json(person)
      } else {
          res.status(404).send({ error: 'Person not found' })
      }
  }).catch(error => next(error))
})

// const generateId = () => {
//   // Usando Math.random
//   return Math.floor(Math.random() * 1000000)
// }

app.post('/api/persons', (req, res, next) => {
  const person = new Person(req.body)
  person.save().then(savedPerson => {
    res.status(201).json(savedPerson)
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const person = req.body
  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        res.json(updatedPerson)
      } else {
        res.status(404).send({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id).then(result => {
    if (result) {
      res.status(204).end()
    } else {
      res.status(404).send({ error: 'Person not found' })
    }
  }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// controlador de solicitudes con endpoint desconocido
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
