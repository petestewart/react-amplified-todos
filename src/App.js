/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'

import { withAuthenticator } from '@aws-amplify/ui-react'

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [editMode, setEditMode] = useState(false)
  const [todos, setTodos] = useState([])

  useEffect(() => {
    fetchTodos()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function saveTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      if (editMode) {
        setEditMode(false)
        setFormState(initialState)
        await API.graphql(graphqlOperation(updateTodo, {input: {...todo}}))
        fetchTodos()
      } else {
        setTodos([...todos, todo])
        setFormState(initialState)
        await API.graphql(graphqlOperation(createTodo, {input: todo}))
      }
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  async function removeTodo(todoId) {
    try {
      await API.graphql(graphqlOperation(deleteTodo, {input: {id: todoId}}))
      fetchTodos()
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

 function editTodo(todo) {
   const todoInfo = {id: todo.id, name: todo.name, description: todo.description}
      setFormState({...todoInfo})
      setEditMode(true)
  }

  return (
    <div style={styles.container}>
      <h2>Amplify Todos</h2>
      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={saveTodo}>{ editMode ? 'Edit Todo' : 'Create Todo'}</button>
      {
        todos.map((todo, index) => (
          <div key={todo.id ? todo.id : index} style={styles.todo}>
            <p style={styles.todoName}>{todo.name}</p>
            <p style={styles.todoDescription}>{todo.description}</p>
          <button style={styles.button} onClick={() => {editTodo(todo)}}>Edit</button>
          <button style={styles.button} onClick={() => {removeTodo(todo.id)}}>Done</button>

          </div>
        ))
      }
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default withAuthenticator(App)