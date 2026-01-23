import { SERVER_API_URL } from "@/app.config";

export const fetchStudents = async () => {
  const response = await fetch(`${SERVER_API_URL}/students`);

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }

  const result = await response.json();
  return result.data;
};

export const fetchStudent = async (id: string) => {
  const response = await fetch(`${SERVER_API_URL}/students/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch student');
  }

  const result = await response.json();
  return result.data;
};

export const deleteStudent = async (id: string): Promise<void> => {
  const response = await fetch(`${SERVER_API_URL}/students/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete student (status: ${response.status})`);
  }
};

