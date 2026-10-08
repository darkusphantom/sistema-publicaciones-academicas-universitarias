"use server";

import { revalidatePath } from "next/cache";
import { StaticAuthGateway } from "@/lib/auth/auth-gateway.static";
import { StaticPostRepository } from "@/lib/repositories/post-repository.static";
import { validatePostForm } from "@/lib/validation/post";
import type { CreatePostInput, UpdatePostInput } from "@/lib/repositories/post-repository";
import type { PostType, PostCategory, ResearchArea } from "@/lib/types";

const repository = new StaticPostRepository();
const authGateway = new StaticAuthGateway();

export async function createPostAction(formData: FormData, intent: "publicar" | "guardar-borrador") {
  const session = await authGateway.getSession();
  if (!session) {
    return { success: false, error: "Debes iniciar sesión para publicar.", fieldErrors: {} };
  }

  const validation = validatePostForm(formData, intent);
  if (!validation.success) {
    return { success: false, error: "Revisa los campos del formulario.", fieldErrors: validation.errors };
  }

  try {
    const input: CreatePostInput = {
      title: formData.get("title")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      imageUrl: formData.get("imageUrl")?.toString() || null,
      type: formData.get("type") as PostType,
      category: formData.get("category") as PostCategory,
      researchArea: formData.get("researchArea") as ResearchArea,
      visibility: intent === "publicar" ? "publicado" : "borrador",
    };

    await repository.create(input, session);
    revalidatePath("/feed");
    revalidatePath("/profile/[username]", "page");
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo guardar la publicación. Inténtalo de nuevo.", fieldErrors: {} };
  }
}

export async function updatePostAction(id: string, formData: FormData, intent: "publicar" | "guardar-borrador") {
  const session = await authGateway.getSession();
  if (!session) {
    return { success: false, error: "Debes iniciar sesión para editar.", fieldErrors: {} };
  }

  const validation = validatePostForm(formData, intent);
  if (!validation.success) {
    return { success: false, error: "Revisa los campos del formulario.", fieldErrors: validation.errors };
  }

  try {
    const input: UpdatePostInput = {
      title: formData.get("title")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      imageUrl: formData.get("imageUrl")?.toString() || null,
      type: formData.get("type") as PostType,
      category: formData.get("category") as PostCategory,
      researchArea: formData.get("researchArea") as ResearchArea,
    };

    await repository.update(id, input, session);

    if (intent === "publicar") {
      await repository.setVisibility(id, "publicado", session);
    }

    revalidatePath("/feed");
    revalidatePath(`/posts/${id}`);
    revalidatePath("/profile/[username]", "page");
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo guardar la publicación. Inténtalo de nuevo.", fieldErrors: {} };
  }
}

export async function deletePostAction(id: string) {
  const session = await authGateway.getSession();
  if (!session) {
    return { success: false, error: "Debes iniciar sesión para eliminar." };
  }

  try {
    await repository.remove(id, session);
    revalidatePath("/feed");
    revalidatePath("/profile/[username]", "page");
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo eliminar la publicación. Inténtalo de nuevo." };
  }
}

export async function setVisibilityAction(id: string, visibility: import("@/lib/types").PostVisibility) {
  const session = await authGateway.getSession();
  if (!session || session.user.role !== "admin") {
    throw new Error("No tienes permiso para cambiar la visibilidad.");
  }

  const updated = await repository.setVisibility(id, visibility, session);
  revalidatePath("/feed");
  revalidatePath(`/posts/${id}`);
  revalidatePath("/profile/[username]", "page");
  return updated;
}


