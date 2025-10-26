import { INewPost, IUpdatePost, INewUser, IUpdateUser } from "@/types";
import { supabase, supabaseConfig } from "./config";

// AUTH

// SIGN UP
export async function createUserAccount(user: INewUser) {
  const { data, error } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        name: user.name,
        username: user.username,
      }
    }
  });

  if (error) throw error;

  const newUser = await saveUserToDB({
    accountId: data.user?.id!,
    email: user.email,
    name: user.name,
    username: user.username,
    imageUrl: `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`
  });

  return newUser;
}

// SAVE USER TO DB
export async function saveUserToDB(user: any) {
  const { data, error } = await supabase
    .from(supabaseConfig.userTable)
    .insert([user])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword(user);
  if (error) throw error;
  return data;
}

// GET ACCOUNT (Auth user)
export async function getAccount() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// GET CURRENT USER FROM DB
export async function getCurrentUser() {
  const auth = await getAccount();
  if (!auth) return null;

  const { data, error } = await supabase
    .from(supabaseConfig.userTable)
    .select("*")
    .eq("accountId", auth.id)
    .single();

  if (error) return null;
  return data;
}

// SIGN OUT
export async function signOutAccount() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { status: "ok" };
}


// ============================================================
// STORAGE
// ============================================================

// UPLOAD FILE
export async function uploadFile(file: File) {
  const filePath = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from(supabaseConfig.storageBucket)
    .upload(filePath, file);

  if (error) throw error;
  return filePath;
}

// GET FILE URL
export function getFilePreview(filePath: string) {
  return supabase.storage.from(supabaseConfig.storageBucket).getPublicUrl(filePath).data.publicUrl;
}

// DELETE FILE
export async function deleteFile(filePath: string) {
  const { error } = await supabase.storage
    .from(supabaseConfig.storageBucket)
    .remove([filePath]);

  if (error) throw error;
  return { status: "ok" };
}


// ============================================================
// POSTS
// ============================================================

// CREATE POST
export async function createPost(post: INewPost) {
  const filePath = await uploadFile(post.file[0]);
  const fileUrl = getFilePreview(filePath);
  const tags = post.tags?.replace(/ /g, "").split(",") || [];

  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .insert([{
      creator: post.userId,
      caption: post.caption,
      imageUrl: fileUrl,
      imagePath: filePath,
      location: post.location,
      tags
    }])
    .select()
    .single();

  if (error) {
    await deleteFile(filePath);
    throw error;
  }

  return data;
}

// GET POSTS WITH SEARCH
export async function searchPosts(searchTerm: string) {
  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .select("*")
    .ilike("caption", `%${searchTerm}%`);

  if (error) throw error;
  return data;
}

// GET INFINITE POSTS
export async function getInfinitePosts({ pageParam = 0 }: { pageParam?: number }) {
  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .select("*")
    .order("updated_at", { ascending: false })
    .range(pageParam, pageParam + 9);

  if (error) throw error;
  return data;
}

// GET POST BY ID
export async function getPostById(postId: string) {
  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .select("*")
    .eq("id", postId)
    .single();

  if (error) throw error;
  return data;
}

// UPDATE POST
export async function updatePost(post: IUpdatePost) {
  let imagePath = post.imageId;
  let imageUrl = post.imageUrl;

  if (post.file.length > 0) {
    const newFilePath = await uploadFile(post.file[0]);
    imagePath = newFilePath;
    imageUrl = getFilePreview(newFilePath);

    if (post.imageId) {
      await deleteFile(post.imageId);
    }
  }

  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .update({
      caption: post.caption,
      imageUrl,
      imagePath,
      location: post.location,
      tags: post.tags?.replace(/ /g, "").split(",") || []
    })
    .eq("id", post.postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// DELETE POST
export async function deletePost(postId: string, imagePath: string) {
  await supabase.from(supabaseConfig.postTable).delete().eq("id", postId);
  if (imagePath) await deleteFile(imagePath);
  return { status: "ok" };
}


// LIKE POST
export async function likePost(postId: string, likes: string[]) {
  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .update({ likes })
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}


// SAVE POST
export async function savePost(userId: string, postId: string) {
  const { data, error } = await supabase
    .from(supabaseConfig.savesTable)
    .insert([{
      user: userId,
      post: postId
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// DELETE SAVED POST
export async function deleteSavedPost(savedId: string) {
  await supabase.from(supabaseConfig.savesTable).delete().eq("id", savedId);
  return { status: "ok" };
}


// GET USER POSTS
export async function getUserPosts(userId: string) {
  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .select("*")
    .eq("creator", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}


// GET RECENT POSTS
export async function getRecentPosts() {
  const { data, error } = await supabase
    .from(supabaseConfig.postTable)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}


// ============================================================
// USERS
// ============================================================

// GET USERS LIST
export async function getUsers(limit?: number) {
  let query = supabase.from(supabaseConfig.userTable).select("*").order("createdAt", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// GET USER BY ID
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from(supabaseConfig.userTable)
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

// UPDATE USER
export async function updateUser(user: IUpdateUser) {
  let imageId = user.imageId;
  let imageUrl = user.imageUrl;

  if (user.file.length > 0) {
    const uploadedPath = await uploadFile(user.file[0]);
    imageId = uploadedPath;
    imageUrl = getFilePreview(uploadedPath);

    if (user.imageId) {
      await deleteFile(user.imageId);
    }
  }

  const { data, error } = await supabase
    .from(supabaseConfig.userTable)
    .update({
      name: user.name,
      bio: user.bio,
      imageUrl,
      imageId,
    })
    .eq("id", user.userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
