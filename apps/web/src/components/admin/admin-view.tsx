"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session/session-provider";
import { mockUsers } from "@/data/users";
import { mockPosts } from "@/data/posts";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { SelectField } from "@/components/ui/select-field";
import { Field } from "@/components/ui/field";
import { ShieldIcon } from "@/components/ui/icons";
import { buttonStyles } from "@/components/ui/button";
import type { User, UserRole, Post, PostVisibility } from "@/lib/types";

/**
 * Admin Dashboard view component for role assignment and content moderation.
 *
 * Design spec (`docs/design/wireframes.md` §3.4):
 * - Restricted to `admin` role; redirects non-admin users to `/feed`.
 * - Interactive user management table with role assignment (estudiante, profesor, admin).
 * - Publication moderation table with visibility toggling (publicado, borrador, oculto).
 *
 * @returns The admin section dashboard view.
 */
export function AdminView() {
  const router = useRouter();
  const { session, status } = useSession();

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const isAdmin = session?.user.role === "admin";

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/feed");
    }
  }, [status, isAdmin, router]);

  if (status === "loading" || !session) {
    return (
      <div
        aria-busy="true"
        className="min-h-96 flex items-center justify-center"
        aria-label="Cargando panel de administración"
      />
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via effect
  }

  // Filter users by search query
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      `${u.givenName} ${u.familyName}`.toLowerCase().includes(query)
    );
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
    const targetUser = users.find((u) => u.id === userId);
    setNotice(
      `Rol de @${targetUser?.username ?? userId} actualizado a "${newRole}".`,
    );
  };

  const handlePostVisibilityChange = (postId: string, newVisibility: PostVisibility) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, visibility: newVisibility } : p)),
    );
    const targetPost = posts.find((p) => p.id === postId);
    setNotice(
      `Estado de "${targetPost?.title}" actualizado a "${newVisibility}".`,
    );
  };

  return (
    <div className="flex flex-col gap-8 py-4 max-w-6xl mx-auto">
      {/* ── Admin Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-surface-muted border border-border text-primary">
            <ShieldIcon className="size-6" />
          </div>
          <div>
            <h1 className="font-display text-h2 text-text">
              Panel de Administración
            </h1>
            <p className="text-text-muted text-sm">
              Gestión de usuarios, asignación de roles y moderación de contenido.
            </p>
          </div>
        </div>

        {notice && (
          <div
            role="status"
            className="bg-accent-teal/10 border border-accent-teal/30 text-accent-teal text-sm px-4 py-2 rounded-md"
          >
            {notice}
          </div>
        )}
      </div>

      {/* ── User Role Management Section ── */}
      <section aria-labelledby="user-mgmt-heading" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 id="user-mgmt-heading" className="font-display text-h3 text-text">
              Gestión de usuarios ({filteredUsers.length})
            </h2>
            <p className="text-xs text-text-muted">
              Asigna roles a los miembros registrados en la plataforma.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <Field
              label=""
              name="searchUsers"
              placeholder="Buscar por usuario, nombre o correo…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto border border-border rounded-lg bg-surface shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-surface-muted text-text-muted font-medium border-b border-border">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Usuario
                </th>
                <th scope="col" className="px-4 py-3">
                  Correo
                </th>
                <th scope="col" className="px-4 py-3">
                  Rol actual
                </th>
                <th scope="col" className="px-4 py-3">
                  Registro
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Cambiar rol
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-text">
                    <div className="flex flex-col">
                      <span>
                        {user.givenName} {user.familyName}
                      </span>
                      <span className="text-xs text-text-muted font-normal">
                        @{user.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        user.role === "admin"
                          ? "warning"
                          : user.role === "profesor"
                            ? "category"
                            : "neutral"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <SelectField
                      label=""
                      name={`role-${user.id}`}
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as UserRole)
                      }
                      className="inline-block w-36 text-xs"
                    >
                      <option value="estudiante">estudiante</option>
                      <option value="profesor">profesor</option>
                      <option value="admin">admin</option>
                    </SelectField>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Content Moderation Section ── */}
      <section aria-labelledby="post-mgmt-heading" className="flex flex-col gap-4 mt-4">
        <div>
          <h2 id="post-mgmt-heading" className="font-display text-h3 text-text">
            Moderación de publicaciones ({posts.length})
          </h2>
          <p className="text-xs text-text-muted">
            Administra la visibilidad pública de las publicaciones del sistema.
          </p>
        </div>

        <div className="overflow-x-auto border border-border rounded-lg bg-surface shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-surface-muted text-text-muted font-medium border-b border-border">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Título
                </th>
                <th scope="col" className="px-4 py-3">
                  Categoría
                </th>
                <th scope="col" className="px-4 py-3">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Acción de visibilidad
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-text max-w-xs truncate">
                    {post.title}
                  </td>
                  <td className="px-4 py-3 text-text-muted capitalize">
                    {post.category}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        post.visibility === "oculto"
                          ? "warning"
                          : post.visibility === "borrador"
                            ? "muted"
                            : "category"
                      }
                    >
                      {post.visibility}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        handlePostVisibilityChange(
                          post.id,
                          post.visibility === "publicado" ? "oculto" : "publicado",
                        )
                      }
                      className={buttonStyles({ variant: "secondary", size: "sm" })}
                    >
                      {post.visibility === "publicado" ? "Ocultar" : "Mostrar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
