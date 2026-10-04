"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deletePostAction } from "@/app/(main)/@modal/posts/actions";

export type DeletePostModalProps = {
  postId: string;
  postTitle: string;
};

export function DeletePostModal({ postId, postTitle }: DeletePostModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await deletePostAction(postId);
      if (result.success) {
        router.back();
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <ConfirmDialog
      open={true}
      onClose={() => router.back()}
      onConfirm={handleConfirm}
      title="¿Eliminar esta publicación?"
      body={
        <>
          La publicación <strong>{postTitle}</strong> se eliminará de forma permanente y no podrás recuperarla.
        </>
      }
      confirmLabel="Eliminar publicación"
      isPending={isPending}
    />
  );
}
