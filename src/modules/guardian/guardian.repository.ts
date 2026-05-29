import { SERVER_API_URL } from "@/app.config";


const getHeaders = () => {

  const token =
    localStorage.getItem(
      "accessToken"
    );


  return {
    "Content-Type":
      "application/json",

    Authorization:
      `Bearer ${token}`,
  };
};



export const createGuardian =
  async (
    payload:any
  ) => {


  const response =
    await fetch(
      `${SERVER_API_URL}/guardians`,
      {
        method:"POST",

        headers:
          getHeaders(),

        body:
          JSON.stringify(
            payload
          ),
      }
    );


  const result =
    await response.json();


  if(!response.ok){

    throw new Error(
      result.message ||
      "Failed to create guardian"
    );

  }


  return result.data;

};