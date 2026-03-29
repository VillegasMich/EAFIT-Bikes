import axios from "axios";

const reservationsClient = axios.create({
  baseURL: import.meta.env.VITE_RESERVATIONS_API_URL || "",
});

export default reservationsClient;
