import QueryProvider from './QueryProvider';
import AuthProvider from './AuthProvider';

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
};

export default Provider;
