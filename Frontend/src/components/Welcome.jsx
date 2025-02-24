// import React, { useState, useEffect } from "react";
// import styled from "styled-components";
// import Robot from "../assets/robot.gif";
// export default function Welcome() {
//   const [userName, setUserName] = useState("");
//   useEffect(async () => {
//     setUserName(
//       await JSON.parse(
//         localStorage.getItem("chat-app-user")
//       ).username
//     );
//   }, []);
//   return (
//     <Container>
//       <img src={Robot} alt="" />
//       <h1>
//         Welcome, <span>{userName}!</span>
//       </h1>
//       <h3>Please select a chat to Start messaging.</h3>
//     </Container>
//   );
// }

// const Container = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   color: white;
//   flex-direction: column;
//   img {
//     height: 20rem;
//   }
//   span {
//     color: #4e0eff;
//   }
// `;


import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";

export default function Welcome() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem("chat-app-user");
      if (storedUser) {
        setUserName(JSON.parse(storedUser).username);
      }
    };
    fetchUser();
  }, []);

  return (
    <Container>
      <img src={Robot} alt="Welcome" />
      <h1>
        Welcome, <span>{userName || "Guest"}!</span>
      </h1>
      <h3>Please select a chat to start messaging.</h3>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  img {
    height: 20rem;
  }
  span {
    color: #4e0eff;
  }
`;
