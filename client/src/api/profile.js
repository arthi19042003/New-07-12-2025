import api from "./axios";

export const fetchProfile = async () => {
  const res = await api.get("/profile");
  return res.data;
};

export const updateProfile = async (profileData) => {
  const res = await api.put("/profile", profileData);
  return res.data;
};

export const addExperience = async (expData) => {
  const res = await api.post("/profile/experience", expData);
  return res.data;
};

export const updateExperience = async (id, expData) => {
  const res = await api.put(`/profile/experience/${id}`, expData);
  return res.data;
};

export const deleteExperience = async (id) => {
  const res = await api.delete(`/profile/experience/${id}`);
  return res.data;
};

export const addEducation = async (eduData) => {
  const res = await api.post("/profile/education", eduData);
  return res.data;
};

export const updateEducation = async (id, eduData) => {
  const res = await api.put(`/profile/education/${id}`, eduData);
  return res.data;
};

export const deleteEducation = async (id) => {
  const res = await api.delete(`/profile/education/${id}`);
  return res.data;
};
