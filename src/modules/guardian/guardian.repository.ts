import { SERVER_API_URL } from "@/app.config";

export const fetchGuardians = async () => {
    const response = await fetch(`${SERVER_API_URL}/guardians`);

    if(!response.ok){
        throw new Error(`Couldn't fetch guardians' data from server`)
    }

    const guardiansData = await response.json();

    return guardiansData.data;
}

export const fetchGuardian = async (guardianID: string) => {
    const response = await fetch(`${SERVER_API_URL}/guardians/view/${guardianID}`);

    if(!response.ok){
        throw new Error(`Couldn't fetch guardian from server`)
    }

    const guardianData = await response.json();

    return guardianData.data;
}

export const deleteGuardian = async (id: string) => {
    console.log("TODO: Delete parent for the database")
}