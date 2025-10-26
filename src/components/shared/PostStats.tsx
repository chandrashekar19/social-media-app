import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { checkIsLiked } from "@/lib/utils";
import {
  useLikePost,
  useSavePost,
  useDeleteSavedPost,
  useGetCurrentUser,
} from "@/lib/react-query/queries";
import { IPost } from "@/types";

type PostStatsProps = {
  post: IPost;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const location = useLocation();

  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavedPost } = useDeleteSavedPost();
  const { data: currentUser } = useGetCurrentUser();

  // Check saved status
  const savedRecord = currentUser?.saves?.find(
    (item: any) => item.post?.id === post.id
  );

  useEffect(() => {
    setIsSaved(!!savedRecord);
  }, [currentUser, post.id]);

  const handleLike = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();

    let updatedLikes = [...likes];

    if (updatedLikes.includes(userId)) {
      updatedLikes = updatedLikes.filter((id) => id !== userId);
    } else {
      updatedLikes.push(userId);
    }

    setLikes(updatedLikes);

    likePost({
      postId: post.id,
      likesArray: updatedLikes,
    });
  };

  const handleSave = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();

    if (savedRecord) {
      setIsSaved(false);
      return deleteSavedPost(savedRecord.id);
    }

    savePost({ userId, postId: post.id });
    setIsSaved(true);
  };

  const containerStyles = location.pathname.includes("/profile")
    ? "w-full"
    : "";

  return (
    <div className={`flex justify-between items-center z-20 ${containerStyles}`}>
      {/* LIKE */}
      <div className="flex gap-2 mr-5">
        <img
          src={
            checkIsLiked(likes, userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }
          alt="like"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={handleLike}
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      {/* SAVE */}
      <div className="flex gap-2">
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="save post"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={handleSave}
        />
      </div>
    </div>
  );
};

export default PostStats;
