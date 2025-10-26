import { GridPostList, Loader } from "@/components/shared";
import { useGetLikedPosts, useGetCurrentUser } from "@/lib/react-query/queries";

const LikedPosts = () => {
  const { data: currentUser, isLoading: isUserLoading } = useGetCurrentUser();
  const userId = currentUser?.id;

  const { data: likedPosts, isLoading } = useGetLikedPosts(userId);

  if (isUserLoading || isLoading)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  if (!likedPosts || likedPosts.length === 0)
    return <p className="text-light-4">No liked posts</p>;

  return <GridPostList posts={likedPosts} showStats={false} />;
};

export default LikedPosts;
