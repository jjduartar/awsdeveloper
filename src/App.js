import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listTodos } from './graphql/queries';
import { createTodo, deleteTodo } from './graphql/mutations';

function App() {
  const initialFormState = { name: "", description: "", image: "" };

  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  // componentMount();
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const graphQL = await API.graphql({ query: listTodos }); // Fetch data from graphql
    const noteItems = graphQL.data.listTodos.items;
    await Promise.all(noteItems.map(async element => {
      if (element.image) {
        const image = await Storage.get(element.image);
        element.image = image;
      }
      return element;
    }));
    setNotes(noteItems)

  };

  const createNote = async () => {
    await API.graphql({ query: createTodo, variables: { input: formData } })
    setNotes([...notes, formData]); //array.push(formData)
    setFormData(initialFormState)
  }

  const deleteNote = async ({ element }) => {
    await API.graphql({ query: deleteTodo, variables: { input: element.id } })
    const newNotesArray = notes.filter(note => note.id !== element.id);
    setFormData(initialFormState)
    setNotes(newNotesArray)
  }

  const onFileChanged = async (event) => {
    const file = event.target.files[0];
    setFormData({ ...formData, image: file.name })
    await Storage.put(file.name, file);
    fetchData();
  }
  return (
    <div className="App">
      <h1>Mis notas</h1>

      <input
        onChange={event => setFormData({ ...formData, name: event.target.value })}
        placeholder={"Nombre de la nota"}
        value={formData.name}
      />

      <input
        onChange={event => setFormData({ ...formData, description: event.target.value })}
        placeholder={"Descripcion de la nota"}
        value={formData.description}
      />

      <input
        onChange={onFileChanged}
        type="file"
      />

      <div style={{ marginBottom: 30 }}>
        {notes.map((element) => {
          return (<div style={{ border: '1px solid black' }}>
            <h2>{element.name}</h2>
            <h3>{element.name}</h3>
            <img src={element.image} width="200px"></img>
            <button onClick={() => deleteNote(element)}>Borrar nota</button>
          </div>)
        })}
      </div>
      <button onClick={createNote}>Crear nota</button>
      <AmplifySignOut />
    </div >
  );
}

export default withAuthenticator(App);