// Mock global state for audition submissions
let DUMMY_SUBMISSIONS = [];

/**
 * Add a new submission to the store
 * @param {Object} opportunity - The opportunity object
 */
export const addSubmission = (opportunity) => {
  const submission = {
    id: Date.now(), // Simple unique ID
    title: opportunity.title,
    company: opportunity.company,
    location: opportunity.location,
    type: opportunity.type,
    rate: opportunity.rate,
    status: "Pending Review",
    submittedAt: new Date().toISOString(),
  };
  
  DUMMY_SUBMISSIONS.push(submission);
  console.log("Submission added:", submission);
  return submission;
};

/**
 * Get all submissions
 * @returns {Array} Array of submissions
 */
export const getSubmissions = () => {
  return DUMMY_SUBMISSIONS;
};

/**
 * Clear all submissions (useful for testing)
 */
export const clearSubmissions = () => {
  DUMMY_SUBMISSIONS = [];
};
