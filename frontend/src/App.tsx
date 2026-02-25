import { useState } from 'react';
import './App.css'
import UserRegistrationForm from './components/UserRegistrationForm'
import TranslationUI from './components/TranslationUI';
import LoginForm from './components/loginForm';

function App() {

  const COOKIE_USER_ID = 'lingo_user_id';

  function setLoggedInUserIdAndPersist(userId: number | null){
    //TODO use cookies
    if(!userId) localStorage.removeItem(COOKIE_USER_ID);
    else localStorage.setItem(COOKIE_USER_ID, String(userId));
    setLoggedInUserId(userId);
  }

  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(() => {
    const savedId = localStorage.getItem(COOKIE_USER_ID);  //TODO use cookies
    return savedId ? Number(savedId) : null;
  });

  return (
    <main>
      {loggedInUserId ? (
        <>
          <button type='button' onClick={() => setLoggedInUserIdAndPersist(null)}>Logout</button>
          <TranslationUI userId = { loggedInUserId } />
        </>
      ) : (
        <>
          <UserRegistrationForm setLoggedInUserId = { setLoggedInUserIdAndPersist }/>
          <LoginForm setLoggedInUserId = { setLoggedInUserIdAndPersist }/>
        </>
      )}
    </main>
  )
}

export default App
