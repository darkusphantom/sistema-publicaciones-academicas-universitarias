import { notFound } from "next/navigation";
import { StaticPostRepository } from "@/lib/repositories/post-repository.static";
import { DeletePostModal } from "@/components/forms/delete-post-modal";

type DeletePostPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

/**
 * Standalone route page for `/posts/[id]/delete`.
 *
 * Rendered when `/posts/[id]/delete` is accessed directly without parallel route interception.
 *
 * @param props - Component props containing route parameters.
 * @returns The DeletePostModal view or triggers 404.
 */
export default async function DeletePostPage({ params }: DeletePostPageProps) {
  const resolvedParams = await params;
  const repository = new StaticPostRepository();
  const post = await repository.findById(resolvedParams.id);

  if (!post) {
    notFound();
  }

  return <DeletePostModal postId={post.id} postTitle={post.title} />;
}
