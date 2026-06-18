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

export const downloadFileByPath = (filePath) =>
    API.get("/download-file", { params: { filePath } });

export const listOutputFiles = () =>
    API.get("/files");

// Helper function to trigger download in browser
export const triggerDownload = async (filePath, filename) => {
    try {
        const response = await axios.get(
            `http://localhost:5001/api/download-file`,
            {
                params: { filePath },
                responseType: 'blob'
            }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || 'download.csv');
        document.body.appendChild(link);
        link.click();
        link.parentElement.removeChild(link);
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
};
