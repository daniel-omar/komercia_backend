import { User } from "../entities/user.entity";

export interface LoginResponse {
    usuario: User;
    token: string;
    refreshToken?: string;
}