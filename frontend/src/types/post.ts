export interface Post {
    id: number;
    title: string;
    content: string;
    author: {
      id: number;
      username: string;
    };
    institution: string;
    created_at: string;
    updated_at: string;
    likes: number;
    dislikes: number;
    comments_count: number;
    is_notice: boolean;
  }
  
  export interface Comment {
    id: number;
    content: string;
    author: {
      id: number;
      username: string;
    };
    created_at: string;
    updated_at: string;
    likes: number;
    dislikes: number;
    parent_id?: number;
  }
  
  export interface PostCreateInput {
    title: string;
    content: string;
    institution_id: number;
  }