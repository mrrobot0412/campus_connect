const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const loginStudent = (email, password) =>
  fetch(`${API_BASE_URL}/api/v1/loginRoutes/studentLogin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

export const loginTeacher = (email, password) =>
  fetch(`${API_BASE_URL}/api/v1/loginRoutes/teacherLogin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

export const getStudentProfile = (token) =>
  fetch(`${API_BASE_URL}/api/v1/loginRoutes/student/profile`, {
    headers: { "auth-token": token },
  });

export const getTeachers = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetch(`${API_BASE_URL}/api/v1/teachersRoutes/getTeachers${query ? `?${query}` : ""}`);
};

export const getTeacherById = (id) =>
  fetch(`${API_BASE_URL}/api/v1/teachersRoutes/getTeacher/${id}`);

export const searchBySpecialization = (q, department) => {
  const query = new URLSearchParams({ q, ...(department && { department }) }).toString();
  return fetch(`${API_BASE_URL}/api/v1/teachersRoutes/searchBySpecialization?${query}`);
};

export const searchByPaper = (q, department) => {
  const query = new URLSearchParams({ q, ...(department && { department }) }).toString();
  return fetch(`${API_BASE_URL}/api/v1/teachersRoutes/searchByPaper?${query}`);
};

export const searchByAvailability = (date, department) => {
  const query = new URLSearchParams({ date, ...(department && { department }) }).toString();
  return fetch(`${API_BASE_URL}/api/v1/teachersRoutes/searchByAvailability?${query}`);
};

export const getTeachersByDept = (department) =>
  fetch(`${API_BASE_URL}/api/v1/teachersRoutes/getTeachersByDept?department=${department}`);

export const getTeacherProfile = (token) =>
  fetch(`${API_BASE_URL}/api/v1/teachersRoutes/profile`, {
    headers: { "auth-token": token },
  });

export const bookSlot = (token, teacherId, slotId, studentId) =>
  fetch(`${API_BASE_URL}/api/v1/slots/bookSlots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token,
    },
    body: JSON.stringify({ teacherId, slotId, studentId }),
  });

export const getBookedSlots = (token) =>
  fetch(`${API_BASE_URL}/api/v1/slots/retriveSlots`, {
    headers: { "auth-token": token },
  });

export const cancelSlot = (token, teacherId, slotId) =>
  fetch(`${API_BASE_URL}/api/v1/slots/cancelSlot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token,
    },
    body: JSON.stringify({ teacherId, slotId }),
  });

export const addSlot = (token, time) =>
  fetch(`${API_BASE_URL}/api/v1/slots/addSlot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token,
    },
    body: JSON.stringify({ time }),
  });

export const updateSlot = (token, slotId, time) =>
  fetch(`${API_BASE_URL}/api/v1/slots/updateSlot/${slotId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token,
    },
    body: JSON.stringify({ time }),
  });

export const deleteSlot = (token, slotId) =>
  fetch(`${API_BASE_URL}/api/v1/slots/deleteSlot/${slotId}`, {
    method: "DELETE",
    headers: { "auth-token": token },
  });

export const addResearchPaper = (token, title, journal) =>
  fetch(`${API_BASE_URL}/api/v1/teachersRoutes/addResearchPaper`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token,
    },
    body: JSON.stringify({ title, journal }),
  });

export const updateTeacherContact = (token, contact, roomNumber, email) =>
  fetch(`${API_BASE_URL}/api/v1/teachersRoutes/updateContact`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token,
    },
    body: JSON.stringify({ contact, roomNumber, email }),
  });

export const addSpecialization = (token, specialization) =>
  fetch(`${API_BASE_URL}/api/v1/teachersRoutes/addSpecialization`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token,
    },
    body: JSON.stringify({ specialization }),
  });

export const generateOTP = (email) =>
  fetch(`${API_BASE_URL}/api/v1/otp/generateOTP`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

export const verifyOTP = (token, otp) =>
  fetch(`${API_BASE_URL}/api/v1/otp/verifyotp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token,
    },
    body: JSON.stringify({ otp }),
  });

export const registerStudent = (token, firstName, lastName, roll, password) =>
  fetch(`${API_BASE_URL}/api/v1/loginRoutes/registerStudent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token,
    },
    body: JSON.stringify({ firstName, lastName, roll, password }),
  });

export const forgotPassword = (email) =>
  fetch(`${API_BASE_URL}/api/v1/loginRoutes/forgotPassword`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

export const resetPassword = (token, password) =>
  fetch(`${API_BASE_URL}/api/v1/loginRoutes/resetPassword`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });