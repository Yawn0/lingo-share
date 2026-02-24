import { useState } from 'react';
import './App.css'
import UserRegistrationForm from './components/UserRegistrationForm'
import TranslationUI from './components/TranslationUI';

function App() {

  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);

  return (
    <main>
      {loggedInUserId ? (
        <TranslationUI userId = { loggedInUserId } />
      ) : (
        <UserRegistrationForm setLoggedInUserId = { setLoggedInUserId }/>
      )}
    </main>
  )
}

export default App
