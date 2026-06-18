const jobs = {};

// create job
const createJob = (id) => {
    jobs[id] = {
        status: "processing",
        result: null
    };
};

// update job
const updateJob = (id, data) => {
    jobs[id] = {
        status: "done",
        result: data
    };
};

// get job
const getJob = (id) => jobs[id];

module.exports = {
    createJob,
    updateJob,
    getJob
};
