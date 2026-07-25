export const host = import.meta.env.VITE_BACKEND_URL;

export const loginRoute = `${host}/api/auth/login`;
export const registerRoute = `${host}/api/auth/register`;
export const logoutRoute = `${host}/api/auth/logout`;
export const setAvatarRoute = `${host}/api/auth/setavatar`;

// Directory of everyone on the platform (annotated with relation status)
export const allUsersRoute = `${host}/api/auth/allusers`;
// Only your accepted contacts — used for the chat sidebar
export const contactsRoute = `${host}/api/auth/contacts`;
// Requests other people have sent you, awaiting accept/reject
export const incomingRequestsRoute = `${host}/api/auth/requests`;
// POST to send a request to a user id
export const sendRequestRoute = `${host}/api/auth/requests`;
// POST to accept/reject a request by its id, e.g. `${respondRequestRoute}/<requestId>/respond`
export const respondRequestRoute = `${host}/api/auth/requests`;

export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getmsg`;
