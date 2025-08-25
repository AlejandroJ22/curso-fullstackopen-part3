import { useEffect, useState } from 'react'
import personService from './services/persons'

const Notification = ({ message, notificationState }) => {
  const notificationStyle = {
    color: notificationState === 'error' ? 'red' : 'green',
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px'
  }

  if (message === null) {
    return null
  }

  return (
    <div style={notificationStyle}>
      {message}
    </div>
  )
}

const Filter = ({ filter, setFilter }) => {
  return (
    <div>
      filter shown with <input value={filter} onChange={(e) => setFilter(e.target.value)} />
    </div>
  )
}

const PersonForm = ({ newName, setNewName, newNumber, setNewNumber, addPerson }) => {
  return (
    <form onSubmit={addPerson}>
      <div>
        name: <input value={newName} onChange={(e) => setNewName(e.target.value)} />
      </div>
      <div>
        number: <input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Person = ({ person, onDelete }) => {
  return (
    <li>
      {person.name} {person.number} <button onClick={() => onDelete(person.id)}>delete</button>
    </li>
  )
}

const PersonsList = ({ persons, onDelete }) => {
  return (
    <ul>
      {persons.map((person) => (
        <Person key={person.name} person={person} onDelete={onDelete} />
      ))}
    </ul>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationState, setNotificationState] = useState(null) // true for error, false for success

  useEffect(() => {
    console.log('effect')
    personService.getAll().then(initialPersons => {
      console.log('promise fulfilled')
      setPersons(initialPersons)
    }).catch(error => {
      console.error('Error getting persons:', error)
      alert('Error getting persons from server')
    })
  }, [])
  console.log('render', persons.length, 'persons')

  const addPerson = (event) => {
    event.preventDefault()

    if (newName === '' || newNumber === '') {
      setNotificationMessage('Name or number cannot be empty')
      setNotificationState('error')
      setTimeout(() => {
        setNotificationState(null)
      }, 5000)
      return
    }

    if (persons.some((person) => person.name.toLowerCase() === newName.toLowerCase())) {
      const existingPerson = persons.find((person) => person.name.toLowerCase() === newName.toLowerCase())
      if (existingPerson.number === newNumber) {
        setNotificationMessage(`${newName} is already added to phonebook with the same number`)
        setNotificationState('error')
        setTimeout(() => {
          setNotificationState(null)
        }, 5000)
        return
      }
      const confirmUpdate = window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)
      if (confirmUpdate) {
        personService.update(existingPerson.id, { ...existingPerson, number: newNumber })
          .then(updatedPerson => {
            setPersons(persons.map(person => person.id === updatedPerson.id ? updatedPerson : person))
            setNewName('')
            setNewNumber('')
            setNotificationMessage(`Updated ${updatedPerson.name}'s number`)
            setNotificationState('success')
            setTimeout(() => {
              setNotificationState(null)
            }, 5000)
          }).catch(error => {
            console.error('Error updating person:', error)
            setNotificationMessage(`The person ${existingPerson.name} was already deleted from server`)
            setNotificationState('error')
            setTimeout(() => {
              setNotificationState(null)
            }, 5000)
            setPersons(persons.filter(person => person.id !== existingPerson.id))
          })
      }
    } else if (persons.some((person) => person.number === newNumber)) {
      setNotificationMessage(`${newNumber} is already added to phonebook and belongs to ${persons.find((person) => person.number === newNumber).name}`)
      setNotificationState('error')
      setTimeout(() => {
        setNotificationState(null)
      }, 5000)
    } else {
      const personObject = {
        name: newName,
        number: newNumber
      }
      personService.create(personObject).then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        setNotificationMessage(`Added ${returnedPerson.name}`)
        setNotificationState('success')
        setTimeout(() => {
          setNotificationState(null)
        }, 5000)
      }).catch(error => {
        console.error('Error creating person:', error)
        setNotificationMessage('Error creating person')
        setNotificationState('error')
        setTimeout(() => {
          setNotificationState(null)
        }, 5000)
      })
    }
  }

  const deletePerson = (id) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      personService.remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setNotificationMessage('Person deleted')
          setNotificationState('success')
          setTimeout(() => {
            setNotificationState(null)
          }, 5000)
        }).catch(error => {
          console.error('Error deleting person:', error)
          setNotificationMessage('Error deleting person')
          setNotificationState('error')
          setTimeout(() => {
            setNotificationState(null)
          }, 5000)
        })
    }
  }

  const filteredPersons = filter
    ? persons.filter((person) =>
        person.name.toLowerCase().includes(filter.toLowerCase())
      )
    : persons

  return (
    <div>
      <h2>Phonebook</h2>
      {/* No mostrar notificación si estado es null */}
      {notificationState && <Notification message={notificationMessage} notificationState={notificationState} />}
      <Filter filter={filter} setFilter={setFilter} />
      <h3>Add a new</h3>
      <PersonForm
        newName={newName}
        setNewName={setNewName}
        newNumber={newNumber}
        setNewNumber={setNewNumber}
        addPerson={addPerson}
      />
      <h3>Numbers</h3>
      <PersonsList persons={filteredPersons} onDelete={deletePerson} />
    </div>
  )
}

export default App
