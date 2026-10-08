import { PostFormModal } from "@/components/forms/post-form";

/**
 * Standalone route page for `/posts/new`.
 *
 * Rendered when `/posts/new` is accessed directly (URL entry, refresh, shared link)
 * without parallel route interception.
 *
 * @returns The PostFormModal view for creating a post.
 */
export default function NewPostPage() {
  return <PostFormModal mode="create" />;
}
