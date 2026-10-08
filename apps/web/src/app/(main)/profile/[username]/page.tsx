import { UserProfileView } from "@/components/profile/user-profile-view";

type ProfilePageProps = {
  params: Promise<{ username: string }> | { username: string };
};

/**
 * User profile page component for route `/profile/[username]`.
 *
 * @param props - Component props containing route params.
 * @returns The user profile view.
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  return <UserProfileView targetUsername={resolvedParams.username} />;
}