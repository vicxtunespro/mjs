// student.service.ts

import {
  fetchStudents,
  deleteStudent,
  fetchStudent,
} from "./student.repository";

export const getStudents = async () => {
  return fetchStudents();
};

export const getStudent = async (id: string) => {
  return fetchStudent(id);
};

export const deleteStudentRow = async (id: string) => {
  await deleteStudent(id);
};