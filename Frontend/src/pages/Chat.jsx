import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { toast } from "react-toastify";
import {
  allUsersRoute,
  contactsRoute,
  incomingRequestsRoute,
  sendRequestRoute,
  respondRequestRoute,
  host,
} from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

const toastOptions = {
  position: "bottom-right",
  autoClose: 4000,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]); // accepted contacts only — chattable
  const [allUsers, setAllUsers] = useState([]); // everyone, with relation status
  const [requests, setRequests] = useState([]); // incoming pending requests
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const token = localStorage.getItem("chat-app-token");
    const userStr = localStorage.getItem("chat-app-user");
    if (!token || !userStr) {
      navigate("/login");
    } else {
      setCurrentUser(JSON.parse(userStr));
    }
  }, [navigate]);

  // Connect the socket using the same login token — the server verifies
  // it and figures out who we are; we can no longer just claim an id.
  useEffect(() => {
    if (currentUser) {
      const token = localStorage.getItem("chat-app-token");
      socket.current = io(host, { auth: { token } });
    }
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [currentUser]);

  const refreshLists = useCallback(async () => {
    if (!currentUser) return;
    const [{ data: users }, { data: friendContacts }, { data: incoming }] =
      await Promise.all([
        axios.get(allUsersRoute),
        axios.get(contactsRoute),
        axios.get(incomingRequestsRoute),
      ]);
    setAllUsers(users);
    setContacts(friendContacts);
    setRequests(incoming);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.isAvatarImageSet) {
        refreshLists();
      } else {
        navigate("/setAvatar");
      }
    }
  }, [currentUser, navigate, refreshLists]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  const handleSendRequest = async (userId) => {
    try {
      const { data } = await axios.post(`${sendRequestRoute}/${userId}`);
      if (data.status) {
        toast.success(data.msg, toastOptions);
      } else {
        toast.info(data.msg, toastOptions);
      }
      refreshLists();
    } catch (err) {
      toast.error("Couldn't send the request. Try again.", toastOptions);
    }
  };

  const handleRespondRequest = async (requestId, accept) => {
    try {
      const { data } = await axios.post(
        `${respondRequestRoute}/${requestId}/respond`,
        { accept }
      );
      toast.info(data.msg, toastOptions);
      refreshLists();
    } catch (err) {
      toast.error("Something went wrong. Try again.", toastOptions);
    }
  };

  return (
    <Container>
      <div className="container">
        <Contacts
          currentUser={currentUser}
          contacts={contacts}
          allUsers={allUsers}
          requests={requests}
          currentChat={currentChat}
          changeChat={handleChatChange}
          onSendRequest={handleSendRequest}
          onRespondRequest={handleRespondRequest}
        />
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
