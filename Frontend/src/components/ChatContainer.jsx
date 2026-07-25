import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();

  // ✅ Fetch messages when currentChat changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!currentChat) return;

        // Note: no "from" is sent — the backend identifies the sender
        // from the login token, and rejects this if the two of you
        // aren't actually connected.
        const response = await axios.post(recieveMessageRoute, {
          to: currentChat._id,
        });

        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Couldn't load messages for this chat.", {
          position: "bottom-right",
          autoClose: 4000,
          theme: "dark",
        });
      }
    };

    fetchMessages();
  }, [currentChat]);

  // ✅ Handle sending messages
  const handleSendMsg = async (msg) => {
    try {
      if (!currentChat) return;

      socket?.current?.emit("send-msg", {
        to: currentChat._id,
        msg,
      });

      await axios.post(sendMessageRoute, {
        to: currentChat._id,
        message: msg,
      });

      setMessages((prev) => [...prev, { fromSelf: true, message: msg }]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Message failed to send.", {
        position: "bottom-right",
        autoClose: 4000,
        theme: "dark",
      });
    }
  };

  // ✅ Listen for incoming messages
  useEffect(() => {
    if (!socket?.current) return;

    socket.current.on("msg-receive", (msg) => {
      setArrivalMessage({ fromSelf: false, message: msg });
    });

    return () => {
      socket.current.off("msg-receive");
    };
  }, [socket]);

  // ✅ Append new messages to state
  useEffect(() => {
    if (arrivalMessage) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  // ✅ Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${
                currentChat?.username || "random"
              }`}
              alt="User Avatar"
            />
          </div>
          <div className="username">
            <h3>{currentChat?.username || "Unknown User"}</h3>
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-messages">No messages yet. Start a conversation!</p>
        )}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;

      .avatar {
        img {
          height: 3rem;
          border-radius: 50%;
          border: 2px solid white;
        }
      }

      .username {
        h3 {
          color: white;
        }
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 0.2rem;

      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: center;

      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;

        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }

    .sended {
      justify-content: flex-end;

      .content {
        background-color: #4f04ff21;
      }
    }

    .recieved {
      justify-content: flex-start;

      .content {
        background-color: #9900ff20;
      }
    }

    .no-messages {
      text-align: center;
      font-style: italic;
      color: #bbb;
    }
  }
`;

