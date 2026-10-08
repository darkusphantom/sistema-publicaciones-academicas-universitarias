import { notFound } from "next/navigation";
import { UserProfileView } from "@/components/profile/user-profile-view";
import { FeedView } from "@/components/feed/feed-view";
import { StaticUserRepository } from "@/lib/repositories/post-repository.static";
import { StaticAuthGateway } from "@/lib/auth/auth-gateway.static";
import type { PostFilters } from "@/lib/types";
import { DEFAULT_POST_FILTERS } from "@/lib/types";

const userRepo = new StaticUserRepository();
const authGateway = new StaticAuthGateway();

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  
  // Decodificamos el username para manejar caracteres especiales en la URL
  // y removemos el prefijo '@' por si el usuario lo tipeó manualmente en la barra de direcciones.
  const decodedUsername = decodeURIComponent(username).replace(/^@/, '');
  const user = await userRepo.findByUsername(decodedUsername);

  if (!user) {
    notFound();
  }

  const session = await authGateway.getSession();
  const isOwnProfile = session?.user.id === user.id;
  const authors = await userRepo.listAuthors();

  // Basic filters to just show the author's posts
  const filters: PostFilters = { ...DEFAULT_POST_FILTERS, authorId: user.id };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <UserProfileView user={user} isOwnProfile={isOwnProfile} />

      <section aria-label="Publicaciones del usuario">
        <h2 className="font-display text-h3 text-text mb-4 border-b border-border pb-2">
          Publicaciones
        </h2>
        <FeedView key={JSON.stringify(filters)} filters={filters} authors={authors} />
      </section>
    </div>
  );
}