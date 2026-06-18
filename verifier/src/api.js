import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5001/api"
});

export const uploadCSV = (formData) =>
    API.post("/upload", formData);

export const getJobStatus = (jobId) =>
    API.get(`/job/${jobId}`);

export const downloadFile = (filename) =>
    API.get(`/download/${filename}`);