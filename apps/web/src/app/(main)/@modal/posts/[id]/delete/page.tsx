import { notFound } from "next/navigation";
import { StaticPostRepository } from "@/lib/repositories/post-repository.static";
import { DeletePostModal } from "@/components/forms/delete-post-modal";

export default async function DeletePostModalPage({ params }: { params: { id: string } }) {
  const repository = new StaticPostRepository();
  const post = await repository.findById(params.id);

  if (!post) {
    notFound();
  }

  return <DeletePostModal postId={post.id} postTitle={post.title} />;
}
