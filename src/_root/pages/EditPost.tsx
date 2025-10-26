import { useParams, useNavigate } from "react-router-dom";
import { Loader } from "@/components/shared";
import PostForm from "@/components/forms/PostForm";
import { useGetPostById } from "@/lib/react-query/queries";
import { IPost } from "@/types";
import { Button } from "@/components/ui/button";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = useGetPostById(id as string);

  if (isLoading)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  if (isError || !post)
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4">Post not found</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit post"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2>
        </div>

        <PostForm action="Update" post={post as IPost} />
      </div>
    </div>
  );
};

export default EditPost;
