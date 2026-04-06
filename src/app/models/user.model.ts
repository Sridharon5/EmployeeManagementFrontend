export interface User {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}
