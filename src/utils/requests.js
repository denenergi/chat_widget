import axios from "./axios";

export const GET_WIDGET_DETAILS = async (token) => {
  const response = await axios.get(`api/widget/settings/${token}`);
  return response.data;
};
