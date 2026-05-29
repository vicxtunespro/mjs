import {
  createGuardian,
} from "./guardian.repository";

export const admitGuardian = async (
  payload: any
) => {
  return createGuardian(payload);
};