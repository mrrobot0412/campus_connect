// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1 className='text-yellow-300'>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


// import React from "react";
// import { Link } from "react-router-dom";

// export default function App() {
//   return (
//     <div className="flex flex-col items-center justify-center h-screen space-y-4">
//       <h1 className="text-3xl font-bold">Welcome</h1>
//       <div className="space-x-4">
//         <Link to="/login" className="px-4 py-2 bg-green-400 text-white rounded-md">Login</Link>
//         <Link to="/signup" className="px-4 py-2 bg-green-400 text-white rounded-md">Sign Up</Link>
//       </div>
//     </div>
//   );
// }
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./components/Sign";
import Login from "./components/Login";
import Hero from "./components/Hero";
import DashTeacher from "./components/DashTeacher";
export default function App() {
  return (
  //   <div className="App">
  //   <Hero />
  // </div>
  <div>
    <Hero />
  </div>
    
    // <BrowserRouter>
    //   <Routes>
    //     {/* Directly render Signup component at root path */}
    //     <Route path="/dash" element={<Hero />} />
    //     <Route path="/signup" element={<Sign />} />
    //     <Route path="/login" element={<Login />} />
    //   </Routes>
    // </BrowserRouter>
  );
}

