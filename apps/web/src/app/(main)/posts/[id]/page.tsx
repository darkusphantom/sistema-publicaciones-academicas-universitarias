import { notFound } from "next/navigation";
import { StaticPostRepository, StaticUserRepository } from "@/lib/repositories/post-repository.static";
import { PostDetail } from "@/components/feed/post-detail";

type PostDetailPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

/**
 * Server Component page for `/posts/[id]`.
 *
 * Looks up the post by ID and resolves its author. If the post does not
 * exist in the repository, calls `notFound()` to trigger Next.js 404 response.
 *
 * @param props - Component props containing route parameters.
 * @returns The PostDetail component or triggers 404.
 */
export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const resolvedParams = await params;
  const postRepo = new StaticPostRepository();
  const userRepo = new StaticUserRepository();

  const post = await postRepo.findById(resolvedParams.id);
  if (!post) {
    notFound();
  }

  const authors = await userRepo.listAuthors();
  const author = authors.find((a) => a.id === post.authorId) ?? null;

  return <PostDetail post={post} author={author} />;
}
