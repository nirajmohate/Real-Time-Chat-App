import React, { useState } from "react";
import styled from "styled-components";
import Logo from "../assets/chat.png";

const avatarUrl = (seed) =>
  `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;

export default function Contacts({
  currentUser,
  contacts,
  allUsers,
  requests,
  currentChat,
  changeChat,
  onSendRequest,
  onRespondRequest,
}) {
  const [tab, setTab] = useState("chats"); // 'chats' | 'people' | 'requests'

  if (!currentUser) return null;

  return (
    <Container>
      <div className="brand">
        <img src={Logo} alt="logo" />
        <h3>ChatterSphere</h3>
      </div>

      <div className="tabs">
        <button
          className={tab === "chats" ? "active" : ""}
          onClick={() => setTab("chats")}
        >
          Chats
        </button>
        <button
          className={tab === "people" ? "active" : ""}
          onClick={() => setTab("people")}
        >
          People
        </button>
        <button
          className={tab === "requests" ? "active" : ""}
          onClick={() => setTab("requests")}
        >
          Requests
          {requests.length > 0 && <span className="badge">{requests.length}</span>}
        </button>
      </div>

      <div className="list">
        {tab === "chats" && (
          <>
            {contacts.length === 0 && (
              <p className="empty">
                No chats yet. Go to "People" and send a chat request.
              </p>
            )}
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className={`row ${
                  currentChat?._id === contact._id ? "selected" : ""
                }`}
                onClick={() => changeChat(contact)}
              >
                <img className="avatar" src={avatarUrl(contact.avatarImage)} alt="" />
                <div className="name">{contact.username}</div>
              </div>
            ))}
          </>
        )}

        {tab === "people" && (
          <>
            {allUsers.length === 0 && (
              <p className="empty">No other users have joined yet.</p>
            )}
            {allUsers.map((user) => (
              <div key={user._id} className="row">
                <img className="avatar" src={avatarUrl(user.avatarImage)} alt="" />
                <div className="name">{user.username}</div>
                {user.relation === "friends" && (
                  <button className="pill chat" onClick={() => changeChat(user)}>
                    Chat
                  </button>
                )}
                {user.relation === "none" && (
                  <button
                    className="pill send"
                    onClick={() => onSendRequest(user._id)}
                  >
                    Send Request
                  </button>
                )}
                {user.relation === "pending_sent" && (
                  <button className="pill pending" disabled>
                    Pending
                  </button>
                )}
                {user.relation === "pending_received" && (
                  <div className="actions">
                    <button
                      className="pill accept"
                      onClick={() => onRespondRequest(user.requestId, true)}
                    >
                      Accept
                    </button>
                    <button
                      className="pill reject"
                      onClick={() => onRespondRequest(user.requestId, false)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {tab === "requests" && (
          <>
            {requests.length === 0 && (
              <p className="empty">No pending chat requests.</p>
            )}
            {requests.map((req) => (
              <div key={req._id} className="row">
                <img
                  className="avatar"
                  src={avatarUrl(req.sender?.avatarImage)}
                  alt=""
                />
                <div className="name">{req.sender?.username}</div>
                <div className="actions">
                  <button
                    className="pill accept"
                    onClick={() => onRespondRequest(req._id, true)}
                  >
                    Accept
                  </button>
                  <button
                    className="pill reject"
                    onClick={() => onRespondRequest(req._id, false)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="current-user">
        <img className="avatar" src={avatarUrl(currentUser.avatarImage)} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  overflow: hidden;
  background-color: #080420;

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    padding: 1rem 0 0.5rem;
    img {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }

  .tabs {
    display: flex;
    gap: 0.3rem;
    padding: 0.5rem 0.6rem;
    button {
      flex: 1;
      position: relative;
      background-color: #ffffff10;
      color: #d1d1d1;
      border: none;
      border-radius: 0.4rem;
      padding: 0.5rem 0.3rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      cursor: pointer;
      &.active {
        background-color: #9a86f3;
        color: white;
      }
      .badge {
        position: absolute;
        top: -0.4rem;
        right: -0.4rem;
        background-color: #ff5555;
        color: white;
        border-radius: 50%;
        font-size: 0.65rem;
        min-width: 1.1rem;
        height: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .list {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.3rem 0.6rem;

    &::-webkit-scrollbar {
      width: 0.2rem;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #ffffff39;
      border-radius: 1rem;
    }

    .empty {
      color: #bbb;
      font-style: italic;
      text-align: center;
      padding: 1rem 0.5rem;
      font-size: 0.85rem;
    }

    .row {
      background-color: #ffffff14;
      min-height: 3.6rem;
      border-radius: 0.4rem;
      padding: 0.5rem 0.6rem;
      display: flex;
      align-items: center;
      gap: 0.7rem;
      transition: 0.3s ease-in-out;

      .avatar {
        height: 2.4rem;
        border-radius: 50%;
      }

      .name {
        color: white;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .pill {
        border: none;
        border-radius: 0.4rem;
        padding: 0.4rem 0.6rem;
        font-size: 0.7rem;
        text-transform: uppercase;
        cursor: pointer;
        color: white;
        white-space: nowrap;
        &.chat {
          background-color: #4e0eff;
        }
        &.send {
          background-color: #2f7d3c;
        }
        &.pending {
          background-color: #555;
          cursor: not-allowed;
        }
        &.accept {
          background-color: #2f7d3c;
        }
        &.reject {
          background-color: #7d2f2f;
        }
      }

      .actions {
        display: flex;
        gap: 0.4rem;
      }
    }

    .row.selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 0;

    .avatar {
      height: 3rem;
      border-radius: 50%;
    }

    h2 {
      color: white;
      font-size: 1rem;
    }
  }
`;
