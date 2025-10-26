import { Loader, PostCard, UserCard } from "@/components/shared";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queries";
import { IPost, IUser } from "@/types";

const Home = () => {
  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();

  const {
    data: creators,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

  if (isErrorPosts || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      {/* POSTS FEED */}
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>

          {isPostLoading ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {posts && posts.length > 0 ? (
                posts.map((post: IPost) => (
                  <li key={post.id} className="flex justify-center w-full">
                    <PostCard post={post} />
                  </li>
                ))
              ) : (
                <p className="text-light-3 text-center mt-10">No posts yet</p>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* TOP CREATORS */}
      <div className="home-creators">
        <h3 className="h3-bold text-light-1">Top Creators</h3>

        {isUserLoading ? (
          <Loader />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {creators && creators.length > 0 ? (
              creators.map((creator: IUser) => (
                <li key={creator.id}>
                  <UserCard user={creator} />
                </li>
              ))
            ) : (
              <p className="text-light-3 mt-10 text-center w-full">
                No creators found
              </p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
