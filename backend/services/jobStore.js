const jobs = {};

// create job
const createJob = (id) => {
    jobs[id] = {
        status: "processing",
        result: null,
        createdAt: new Date().toISOString()
    };
};

// update job
const updateJob = (id, data) => {
    if (jobs[id]) {
        jobs[id] = {
            ...jobs[id],
            ...data
        };
    }
};

// get job
const getJob = (id) => jobs[id];

module.exports = {
    createJob,
    updateJob,
    getJob
};

