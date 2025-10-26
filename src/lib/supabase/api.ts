import { INewPost, IUpdatePost, INewUser, IUpdateUser } from "@/types";
import { supabase, supabaseConfig } from "./config";

//  AUTH
export async function createUserAccount(user: INewUser) {
  const { data, error } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        name: user.name,
        username: user.username,
      },
    },
  });

  if (error) throw error;

  const newUser = await saveUserToDB({
    accountid: data.user!.id,
    email: user.email,
    name: user.name,
    username: user.username,
    bio: "",
    imageurl: `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`
  });

  return newUser;
}

export async function saveUserToDB(user: any) {
  const { data, error } = await supabase
    .from(supabaseConfig.userTable)
    .insert(user)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function signInAccount(user: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword(user);
  if (error) throw error;
  return data;
}

export async function getAccount() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

//  GET CURRENT USER (Posts + Saved)
export async function getCurrentUser() {
  const account = await getAccount();
  if (!account) return null;

  const { data, error } = await supabase
    .from(supabaseConfig.userTable)
    .select(`
      *,
      posts:posts(*),
      saved:saves(id, post:posts(*))
    `)
    .eq("accountid", account.id)
    .single();

  if (error) return null;
  return data;
}

export async function signOutAccount() {
  await supabase.auth.signOut();
}


//  STORAGE
export async function uploadFile(file: File) {
  const filePath = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from(supabaseConfig.storageBucket)
    .upload(filePath, file);
  if (error) throw error;
  return filePath;
}

export function getFilePreview(filePath: string) {
  return supabase.storage.from(supabaseConfig.storageBucket)
    .getPublicUrl(filePath).data.publicUrl;
}

export async function deleteFile(filePath: string) {
  await supabase.storage.from(supabaseConfig.storageBucket).remove([filePath]);
}


// POSTS
export async function createPost(post: INewPost) {
  const filePath = await uploadFile(post.file[0]);
  const imageurl = getFilePreview(filePath);

  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .insert({
      creator: post.userId,
      caption: post.caption,
      location: post.location,
      tags: post.tags?.split(",") || [],
      imageurl,
      imagepath: filePath,
      updatedAt: new Date(),
    })
    .select(`
      *,
      creatorData:users(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function getInfinitePosts({ pageParam = 0 }: any) {
  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .select(`
      *,
      creatorData:users(*)
    `)
    .order("createdAt", { ascending: false })
    .range(pageParam, pageParam + 9);

  if (error) throw error;
  return data;
}

export async function searchPosts(searchTerm: string) {
  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .select(`
      *,
      creatorData:users(*)
    `)
    .ilike("caption", `%${searchTerm}%`);

  if (error) throw error;
  return data;
}

export async function getPostById(id: string) {
  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .select(`
      *,
      creatorData:users(*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getRecentPosts() {
  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .select(`
      *,
      creatorData:users(*)
    `)
    .order("createdAt", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

export async function getUserPosts(userId: string) {
  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .select(`
      *,
      creatorData:users(*)
    `)
    .eq("creator", userId)
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updatePost(post: IUpdatePost) {
  let imagepath = post.imageId;
  let imageurl = post.imageUrl;

  if (post.file.length > 0) {
    imagepath = await uploadFile(post.file[0]);
    imageurl = getFilePreview(imagepath);
  }

  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .update({
      caption: post.caption,
      location: post.location,
      tags: post.tags?.split(",") || [],
      imageurl,
      imagepath,
      updatedAt: new Date(),
    })
    .eq("id", post.postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(postId: string, imagepath?: string) {
  const { error } = await supabase
    .from(supabaseConfig.postTable)
    .delete()
    .eq("id", postId);

  if (imagepath) await deleteFile(imagepath);
  if (error) throw error;
}

export async function likePost(postId: string, likesArray: string[]) {
  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .update({ likes: likesArray, updatedAt: new Date() })
    .eq("id", postId)
    .select()
    .single();
  if (error) throw error;
  return data;
}


//  SAVES
export async function savePost(userId: string, postId: string) {
  const { error } = await supabase
    .from(supabaseConfig.savesTable)
    .insert({ user: userId, post: postId });
  if (error) throw error;
}

export async function deleteSavedPost(id: string) {
  await supabase.from(supabaseConfig.savesTable).delete().eq("id", id);
}


//  USERS
export async function getUsers(limit?: number) {
  let query = supabase.from(supabaseConfig.userTable)
    .select("*")
    .order("createdAt", { ascending: false });

  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from(supabaseConfig.userTable)
    .select(`
      *,
      posts:posts(*)
    `)
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUser(user: IUpdateUser) {
  let imagepath = user.imageId;
  let imageurl = user.imageUrl;

  if (user.file.length > 0) {
    imagepath = await uploadFile(user.file[0]);
    imageurl = getFilePreview(imagepath);
  }

  const { data, error } = await supabase
    .from(supabaseConfig.userTable)
    .update({
      name: user.name,
      bio: user.bio,
      imageurl,
      imageid: imagepath,
      updatedAt: new Date(),
    })
    .eq("id", user.userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
