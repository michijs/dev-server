import { getIPAddress } from "../config/getIPAddress.js";

export const getHostURL = (port: number) => {
  return `http://${getIPAddress()}:${port}`;
};
