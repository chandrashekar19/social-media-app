import { useParams, Link, useNavigate } from "react-router-dom";
import { Loader, GridPostList, PostStats } from "@/components/shared";
import { Button } from "@/components/ui/button";

import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { IPost } from "@/types";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const { data: post, isLoading, isError } = useGetPostById(id as string);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator?.id
  );
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts: IPost[] =
    userPosts?.filter((p: IPost) => p.id !== post?.id) || [];

  const handleDeletePost = () => {
    deletePost({ postId: id as string, imageId: post?.imagePath || "" });
    navigate(-1);
  };

  if (isLoading)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  if (isError || !post)
    return (
      <div className="flex-center w-full h-full">
        <p>Post not found</p>
      </div>
    );

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost"
        >
          <img src="/assets/icons/back.svg" alt="back" width={24} height={24} />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      <div className="post_details-card">
        <img
          src={post.imageUrl}
          alt="post"
          className="post_details-img"
        />

        <div className="post_details-info">
          <div className="flex-between w-full">
            <Link
              to={`/profile/${post.creator.id}`}
              className="flex items-center gap-3"
            >
              <img
                src={post.creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt={post.creator.name}
                className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
              />
              <div className="flex gap-1 flex-col">
                <p className="base-medium lg:body-bold text-light-1">
                  {post.creator.name}
                </p>
                <div className="flex-center gap-2 text-light-3">
                  <p className="subtle-semibold lg:small-regular">
                    {multiFormatDateString(post.createdAt!)}
                  </p>
                  •
                  <p className="subtle-semibold lg:small-regular">
                    {post.location}
                  </p>
                </div>
              </div>
            </Link>

            {user.id === post.creator.id && (
              <div className="flex-center gap-4">
                <Link to={`/update-post/${post.id}`}>
                  <img src="/assets/icons/edit.svg" alt="edit" width={24} height={24} />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className="post_details-delete_btn"
                >
                  <img
                    src="/assets/icons/delete.svg"
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            )}
          </div>

          <hr className="border w-full border-dark-4/80" />

          <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
            <p>{post.caption}</p>
            <ul className="flex gap-1 mt-2">
              {(post.tags || []).map((tag: string, index: number) => (
                <li key={`${tag}-${index}`} className="text-light-3 small-regular">
                  #{tag}
                </li>
              ))}
            </ul>
          </div>

          <PostStats post={post} userId={user.id} />
        </div>
      </div>

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">More Related Posts</h3>

        {isUserPostLoading ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;
