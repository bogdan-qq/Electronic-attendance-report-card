import { getUser } from '../../../utils/auth';

export const MainStudent = () => {
  const user = getUser();

  return <h1>Добро пожаловать, {user?.fullName}!</h1>;
};