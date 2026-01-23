import { SERVER_API_URL } from '@/app.config';
import { fetchStudents, deleteStudent } from './student.repository';

export const getStudents = async () => {
  return fetchStudents();
};

export const getStudent = async (id: string) => {
  return fetchStudents();
};

export const deleteStudentRow = async(id: string)=>{
    await deleteStudent(id); 
}
