// import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import SetAvatar from "./components/SetAvatar";
// import Chat from "./pages/Chat";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// export default function App() {
//   return (
//     <>
//     <BrowserRouter>
//       <Routes>
//         <Route path="/register" element={<Register />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/setAvatar" element={<SetAvatar />} />
//         <Route path="/" element={<Chat/>} />
//       </Routes>
//     </BrowserRouter>
//     </>
//   );
// }

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import SetAvatar from "./components/SetAvatar";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setAvatar" element={<SetAvatar />} />
        <Route path="/" element= {<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

// // Protect Chat Route (Only accessible when logged in)
// const ProtectedRoute = ({ Component }) => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const user = localStorage.getItem("chat-user");
//     if (!user) {
//       navigate("/login");
//     }
//   }, [navigate]);

//   return <Component />;
// };

