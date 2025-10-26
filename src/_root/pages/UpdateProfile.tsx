import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Textarea, Input, Button } from "@/components/ui";
import { ProfileUploader, Loader } from "@/components/shared";

import { ProfileValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useUpdateUser } from "@/lib/react-query/queries";

const UpdateProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, setUser } = useUserContext();

  const { data: currentUser, isLoading } = useGetUserById(id as string);
  const { mutateAsync: updateUser, isLoading: isLoadingUpdate } = useUpdateUser();

  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [],
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio || "",
    },
  });

  if (!currentUser || isLoading)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const handleUpdate = async (values: z.infer<typeof ProfileValidation>) => {
    try {
      const updated = await updateUser({
        userId: currentUser.id,
        name: values.name,
        bio: values.bio,
        file: values.file,
        imageUrl: currentUser.imageUrl,
        imageId: currentUser.imageId, // storage file path
      });

      if (!updated) {
        toast({ title: "Update user failed. Please try again." });
        return;
      }

      setUser({
        ...user,
        name: updated.name,
        bio: updated.bio,
        imageUrl: updated.imageUrl,
      });

      toast({ title: "Profile updated ✅" });
      navigate(`/profile/${currentUser.id}`);
    } catch (error) {
      toast({ title: "Something went wrong!" });
    }
  };

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
          >
            {/* IMAGE UPLOAD */}
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormControl>
                    <ProfileUploader
                      fieldChange={field.onChange}
                      mediaUrl={currentUser.imageUrl ?? ""}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            {/* NAME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} className="shad-input" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* USERNAME */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Username</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} disabled className="shad-input" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* EMAIL */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} disabled className="shad-input" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* BIO */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Bio</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="shad-textarea custom-scrollbar" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* ACTIONS */}
            <div className="flex gap-4 justify-end">
              <Button type="button" onClick={() => navigate(-1)} className="shad-button_dark_4">
                Cancel
              </Button>
              <Button
                type="submit"
                className="shad-button_primary whitespace-nowrap"
                disabled={isLoadingUpdate}
              >
                {isLoadingUpdate && <Loader />} Update Profile
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateProfile;
