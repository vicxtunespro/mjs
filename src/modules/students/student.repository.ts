// student.repository.ts

import { SERVER_API_URL } from "@/app.config";


// Retrive the access token for the browser
function getAuthHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response: Response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result.data;
}


export const createStudent = async (
  payload: any
) => {

  const response =
    await fetch(
      `${SERVER_API_URL}/students`,
      {
        method: "POST",

        headers: getAuthHeaders(),

        body: JSON.stringify(
          payload
        ),
      }
    );


  return handleResponse(response);
};

export const fetchStudents = async () => {
  const response = await fetch(`${SERVER_API_URL}/students`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const fetchStudent = async (id: string) => {
  const response = await fetch(`${SERVER_API_URL}/students/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const deleteStudent = async (id: string): Promise<void> => {
  const response = await fetch(`${SERVER_API_URL}/students/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleResponse(response);
};