import { SERVER_API_URL } from '@/app.config';
import { fetchGuardians, fetchGuardian, deleteGuardian } from './guardian.repository';

export const getGuardians = async () => {
  return fetchGuardians();
};

export const getGuardian = async (id: string) => {
  return fetchGuardian(id);
};

export const deleteStudentRow = async(id: string)=>{
    await deleteGuardian(id);
}