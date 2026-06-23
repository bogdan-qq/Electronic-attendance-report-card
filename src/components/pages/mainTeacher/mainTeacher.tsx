import { getUser } from '../../../utils/auth';

export const MainTeacher = () => {
  const user = getUser();

  return <h1>Добро пожаловать, {user?.fullName}!</h1>;
};