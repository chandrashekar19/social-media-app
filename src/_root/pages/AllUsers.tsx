import { useToast } from "@/components/ui/use-toast";
import { Loader, UserCard } from "@/components/shared";
import { useGetUsers } from "@/lib/react-query/queries";
import { IUser } from "@/types";

const AllUsers = () => {
  const { toast } = useToast();

  const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers();

  if (isErrorCreators) {
    toast({ title: "Something went wrong." });
    return (
      <p className="text-red-500 text-center mt-10">Failed to load users</p>
    );
  }

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>

        {isLoading ? (
          <Loader />
        ) : (
          <ul className="user-grid">
            {creators && creators.length > 0 ? (
              creators.map((creator: IUser) => (
                <li
                  key={creator.id}
                  className="flex-1 min-w-[200px] w-full"
                >
                  <UserCard user={creator} />
                </li>
              ))
            ) : (
              <p className="text-light-4 mt-10 text-center w-full">
                No users found
              </p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
