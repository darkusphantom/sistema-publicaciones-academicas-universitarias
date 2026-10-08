import { notFound } from "next/navigation";
import { StaticPostRepository } from "@/lib/repositories/post-repository.static";
import { PostFormModal } from "@/components/forms/post-form";

type EditPostPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

/**
 * Standalone route page for `/posts/[id]/edit`.
 *
 * Rendered when `/posts/[id]/edit` is accessed directly without parallel route interception.
 *
 * @param props - Component props containing route parameters.
 * @returns The PostFormModal view in edit mode or triggers 404.
 */
export default async function EditPostPage({ params }: EditPostPageProps) {
  const resolvedParams = await params;
  const repository = new StaticPostRepository();
  const post = await repository.findById(resolvedParams.id);

  if (!post) {
    notFound();
  }

  return <PostFormModal mode="edit" post={post} />;
}
