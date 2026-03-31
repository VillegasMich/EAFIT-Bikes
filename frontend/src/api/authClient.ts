import axios from "axios";

const authClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_CLIENT_API_URL || "",
});

export default authClient;
