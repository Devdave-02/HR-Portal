import User from "../model/User.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find({}, "-password"); // get all users except password

  if (!users || users.length === 0) {
  return res.status(200).json([]);  
}

  res.status(200).json(users); // send list of users if found
};
