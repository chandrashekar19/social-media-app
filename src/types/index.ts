export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type IUser = {
  id: string;         // users.id (PK)
  accountId?: string; // supabase.auth.user.id
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio?: string;
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IPost = {
  id: string;
  creator: IUser | string; // Joined result or ID only
  caption: string;
  imageUrl: string;
  imagePath: string;
  location?: string;
  tags?: string[];
  likes?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio?: string;
  imageId?: string;
  imageUrl?: string;
  file: File[];
};
