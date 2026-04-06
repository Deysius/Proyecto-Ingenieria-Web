import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [users, setUsers] = useState([]);
  useEffect(()=>{
    fetch('http://127.0.0.1:5000/api/users')
    .then((res)=> res.json())
    .then((data)=> setUsers(data.users))
  })
  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1></h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
  
      </section>
      <div className='cart'>
        <h2>Users</h2>
        <ul>
          {users.map((user)=>(
            <li key={user.id}>
              {user.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
