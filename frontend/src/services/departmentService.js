import api from "./api";

/**
 * Fetch all departments with statistics
 */
export const getAllDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};

/**
 * Fetch single department by ID
 */
export const getDepartmentById = async (id) => {
  const response = await api.get(`/departments/${id}`);
  return response.data;
};

/**
 * Create a new department
 */
export const createDepartment = async (departmentData) => {
  const response = await api.post("/departments", departmentData);
  return response.data;
};

/**
 * Update an existing department
 */
export const updateDepartment = async (id, departmentData) => {
  const response = await api.put(`/departments/${id}`, departmentData);
  return response.data;
};

/**
 * Delete a department
 */
export const deleteDepartment = async (id) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};

/**
 * Fetch full academic structure tree (Departments -> Years -> Sections)
 */
export const getAcademicStructure = async () => {
  const response = await api.get("/academic-structure");
  return response.data;
};

/**
 * Fetch academic years
 */
export const getYears = async (departmentId = null) => {
  const params = departmentId ? { departmentId } : {};
  const response = await api.get("/years", { params });
  return response.data;
};

/**
 * Create an academic year
 */
export const createYear = async ({ departmentId, name }) => {
  const response = await api.post("/years", { departmentId, name });
  return response.data;
};

/**
 * Update an academic year
 */
export const updateYear = async (id, { name }) => {
  const response = await api.put(`/years/${id}`, { name });
  return response.data;
};

/**
 * Delete an academic year
 */
export const deleteYear = async (id) => {
  const response = await api.delete(`/years/${id}`);
  return response.data;
};

/**
 * Fetch sections
 */
export const getSections = async (yearId = null, departmentId = null) => {
  const params = {};
  if (yearId) params.yearId = yearId;
  if (departmentId) params.departmentId = departmentId;
  const response = await api.get("/sections", { params });
  return response.data;
};

/**
 * Create a section
 */
export const createSection = async ({ yearId, name }) => {
  const response = await api.post("/sections", { yearId, name });
  return response.data;
};

/**
 * Update a section
 */
export const updateSection = async (id, { name }) => {
  const response = await api.put(`/sections/${id}`, { name });
  return response.data;
};

/**
 * Delete a section
 */
export const deleteSection = async (id) => {
  const response = await api.delete(`/sections/${id}`);
  return response.data;
};

export default {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAcademicStructure,
  getYears,
  createYear,
  updateYear,
  deleteYear,
  getSections,
  createSection,
  updateSection,
  deleteSection,
};
