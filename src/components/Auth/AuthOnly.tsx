import useAuth from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface IProps {
    children: React.ReactNode;
    redirectTo?: string;
}

const AuthOnly: React.FC<IProps> = ({ children, redirectTo = '/login' }) => {
    const { signedInUser } = useAuth();

    return signedInUser ? <>{children}</> : <Navigate to={redirectTo} />;
};

export default AuthOnly;
