export interface User {
    id: number;
    username: string;
    email: string;
    nickname?: string;
    is_admin: boolean;
    created_at: string;
  }
  
  export interface LoginInput {
    username: string;
    password: string;
  }
  
  export interface RegisterInput {
    username: string;
    email: string;
    password: string;
    nickname?: string;
  }
  
  export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
  }