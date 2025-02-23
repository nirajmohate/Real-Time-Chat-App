// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { io } from "socket.io-client";
// import styled from "styled-components";
// import { allUsersRoute, host } from "../utils/APIRoutes";
// import ChatContainer from "../components/ChatContainer";
// import Contacts from "../components/Contacts";
// import Welcome from "../components/Welcome";

// export default function Chat() {
//   const navigate = useNavigate();
//   const socket = useRef();
//   const [contacts, setContacts] = useState([]);
//   const [currentChat, setCurrentChat] = useState(undefined);
//   const [currentUser, setCurrentUser] = useState(undefined);
//   useEffect(async () => {
//     if (!localStorage.getItem("chat-app-user")) {
//       navigate("/login");
//     } else {
//       setCurrentUser(
//         await JSON.parse(
//           localStorage.getItem("chat-app-user")
//         )
//       );
//     }
//   }, []);
//   useEffect(() => {
//     if (currentUser) {
//       socket.current = io(host);
//       socket.current.emit("add-user", currentUser._id);
//     }
//   }, [currentUser]);

//   useEffect(async () => {
//     if (currentUser) {
//       if (currentUser.isAvatarImageSet) {
//         const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
//         setContacts(data.data);
//       } else {
//         navigate("/setAvatar");
//       }
//     }
//   }, [currentUser]);
//   const handleChatChange = (chat) => {
//     setCurrentChat(chat);
//   };
//   return (
//     <>
//       <Container>
//         <div className="container">
//           <Contacts contacts={contacts} changeChat={handleChatChange} />
//           {currentChat === undefined ? (
//             <Welcome />

//           ) : (
//             <ChatContainer currentChat={currentChat} socket={socket} />
//           )}
//         </div>
//       </Container>
//     </>
//   );
// }

// const Container = styled.div`
//   height: 100vh;
//   width: 100vw;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   gap: 1rem;
//   align-items: center;
//   background-color: #131324;
//   .container {
//     height: 85vh;
//     width: 85vw;
//     background-color: #00000076;
//     display: grid;
//     grid-template-columns: 25% 75%;
//     @media screen and (min-width: 720px) and (max-width: 1080px) {
//       grid-template-columns: 35% 65%;
//     }
//   }
// `;

// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { io } from "socket.io-client";
// import styled from "styled-components";
// import { allUsersRoute, host } from "../utils/APIRoutes";
// import ChatContainer from "../components/ChatContainer";
// import Contacts from "../components/Contacts";
// import Welcome from "../components/Welcome";

// export default function Chat() {
//   const navigate = useNavigate();
//   const socket = useRef();
//   const [contacts, setContacts] = useState([]);
//   const [currentChat, setCurrentChat] = useState(undefined);
//   const [currentUser, setCurrentUser] = useState(undefined);

//   // 1st useEffect: Check for logged-in user
//   useEffect(() => {
//     const fetchUser = async () => {
//       const storedUser = localStorage.getItem("chat-app-user");
//       if (!storedUser) {
//         navigate("/login");
//       } else {
//         setCurrentUser(JSON.parse(storedUser));
//       }
//     };
//     fetchUser();
//   }, [navigate]);

//   // 2nd useEffect: Initialize socket connection
//   useEffect(() => {
//     if (currentUser) {
//       socket.current = io(host);
//       socket.current.emit("add-user", currentUser._id);

//       return () => {
//         socket.current.disconnect(); // Cleanup function to prevent memory leaks
//       };
//     }
//   }, [currentUser]);

//   // 3rd useEffect: Fetch contacts when user is set
//   useEffect(() => {
//     const fetchContacts = async () => {
//       if (currentUser) {
//         if (currentUser.isAvatarImageSet) {
//           const { data } = await axios.get(`${allUsersRoute}/${currentUser._id}`);
//           setContacts(data);
//         } else {
//           navigate("/setAvatar");
//         }
//       }
//     };
//     fetchContacts();
//   }, [currentUser, navigate]);

//   const handleChatChange = (chat) => {
//     setCurrentChat(chat);
//   };

//   return (
//     <Container>
//       <div className="container">
//         <Contacts contacts={contacts} changeChat={handleChatChange} />
//         {currentChat === undefined ? (
//           <Welcome />
//         ) : (
//           <ChatContainer currentChat={currentChat} socket={socket} />
//         )}
//       </div>
//     </Container>
//   );
// }

// const Container = styled.div`
//   height: 100vh;
//   width: 100vw;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   gap: 1rem;
//   align-items: center;
//   background-color: #131324;
//   .container {
//     height: 85vh;
//     width: 85vw;
//     background-color: #00000076;
//     display: grid;
//     grid-template-columns: 25% 75%;
//     @media screen and (min-width: 720px) and (max-width: 1080px) {
//       grid-template-columns: 35% 65%;
//     }
//   }
// `;

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const fetchUser = async () => {
      if (!localStorage.getItem("chat-app-user")) {
        navigate("/login");
      } else {
        setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);

    fetch(`${import.meta.env.VITE_BACKEND_URL}/test`)
      .then((res) => res.json())
      .then((data) => console.log("Backend Response:", data))
      .catch((err) => console.error("Fetch Error:", err));
  }, []);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
      console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);
    }
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const { data } = await axios.get(
            `${allUsersRoute}/${currentUser._id}`
          );
          setContacts(data);
        } else { 
          navigate("/setAvatar");
        }
      }
    };
    fetchContacts();
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <Container>
      <div className="container">
        <Contacts contacts={contacts} changeChat={handleChatChange} />
        {currentChat === undefined ? (
          <Welcome />
        ) : (
          <ChatContainer currentChat={currentChat} socket={socket} />
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
