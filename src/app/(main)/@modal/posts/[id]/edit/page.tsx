import { notFound } from "next/navigation";
import { StaticPostRepository } from "@/lib/repositories/post-repository.static";
import { PostFormModal } from "@/components/forms/post-form";

export default async function EditPostModalPage({ params }: { params: { id: string } }) {
  const repository = new StaticPostRepository();
  const post = await repository.findById(params.id);

  if (!post) {
    notFound();
  }

  return <PostFormModal mode="edit" post={post} />;
}
