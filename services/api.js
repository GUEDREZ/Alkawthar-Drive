import axios from "axios";

const API_URL = "https://vtcidf-backend-1.onrender.com";

export default axios.create({
  baseURL: API_URL,
});
