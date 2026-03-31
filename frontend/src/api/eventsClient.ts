import axios from "axios";

const eventsClient = axios.create({
  baseURL: import.meta.env.VITE_EVENTS_API_URL || "",
});

export default eventsClient;
