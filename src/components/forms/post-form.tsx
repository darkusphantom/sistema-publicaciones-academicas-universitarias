"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select-field";
import { buttonStyles } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Dialog } from "@/components/ui/dialog";
import { extractKeywords, formatDate } from "@/lib/format";
import { createPostAction, updatePostAction } from "@/app/(main)/@modal/posts/actions";
import type { Post } from "@/lib/types";

export type PostFormProps = {
  mode: "create" | "edit";
  post?: Post;
};

const CATEGORIES = [
  { value: "matematicas", label: "Matemáticas" },
  { value: "biologia", label: "Biología" },
  { value: "quimica", label: "Química" },
  { value: "fisica", label: "Física" },
  { value: "computacion", label: "Computación" },
];

const RESEARCH_AREAS: Record<string, { value: string; label: string }[]> = {
  matematicas: [
    { value: "general", label: "General" },
    { value: "estadistica", label: "Estadística" },
    { value: "probabilidad", label: "Probabilidad" },
    { value: "optimizacion", label: "Optimización" },
    { value: "matematicas-aplicadas", label: "Matemáticas Aplicadas" },
    { value: "modelado-matematico", label: "Modelado Matemático" },
  ],
  biologia: [
    { value: "general", label: "General" },
    { value: "biotecnologia", label: "Biotecnología" },
    { value: "bioquimica", label: "Bioquímica" },
    { value: "genetica", label: "Genética" },
    { value: "microbiologia", label: "Microbiología" },
    { value: "ecologia", label: "Ecología" },
    { value: "bioinformatica", label: "Bioinformática" },
  ],
  quimica: [
    { value: "general", label: "General" },
    { value: "quimica-analitica", label: "Química Analítica" },
    { value: "quimica-organica", label: "Química Orgánica" },
    { value: "quimica-inorganica", label: "Química Inorgánica" },
    { value: "fisicoquimica", label: "Fisicoquímica" },
    { value: "quimica-medioambiental", label: "Química Medioambiental" },
  ],
  fisica: [
    { value: "general", label: "General" },
    { value: "fisica-computacional", label: "Física Computacional" },
    { value: "fisica-de-materiales", label: "Física de Materiales" },
    { value: "astronomia", label: "Astronomía" },
    { value: "fisica-nuclear", label: "Física Nuclear" },
    { value: "mecanica-de-fluidos", label: "Mecánica de Fluidos" },
  ],
  computacion: [
    { value: "general", label: "General" },
    { value: "inteligencia-artificial", label: "Inteligencia Artificial" },
    { value: "aprendizaje-automatico", label: "Aprendizaje Automático" },
    { value: "ciencia-de-datos", label: "Ciencia de Datos" },
    { value: "desarrollo-web", label: "Desarrollo Web" },
    { value: "ingenieria-software", label: "Ingeniería de Software" },
    { value: "redes-telecomunicaciones", label: "Redes y Telecomunicaciones" },
    { value: "seguridad-informatica", label: "Seguridad Informática" },
    { value: "sistemas-distribuidos", label: "Sistemas Distribuidos" },
    { value: "bases-de-datos", label: "Bases de Datos" },
    { value: "computacion-grafica", label: "Computación Gráfica" },
    { value: "robotica", label: "Robótica" },
    { value: "arquitectura-computadores", label: "Arquitectura de Computadores" },
  ],
  "crecimiento-profesional": [
    { value: "general", label: "General" },
    { value: "gestion-proyectos", label: "Gestión de Proyectos" },
    { value: "liderazgo", label: "Liderazgo y Gestión de Equipos" },
    { value: "emprendimiento", label: "Emprendimiento" },
    { value: "comunicacion-profesional", label: "Comunicación Profesional" },
    { value: "etica-profesional", label: "Ética Profesional" },
  ],
};

export function PostFormModal({ mode, post }: PostFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | undefined>();
  const [submitIntent, setSubmitIntent] = useState<"publicar" | "guardar-borrador" | null>(null);

  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || "");

  const keywords = extractKeywords(content);

  const isDraft = post?.visibility === "borrador";

  const handleFormSubmit = (intent: "publicar" | "guardar-borrador") => {
    if (isPending || !formRef.current) return;

    setSubmitIntent(intent);

    const formData = new FormData(formRef.current);

    startTransition(async () => {
      setErrors({});
      setGlobalError(undefined);

      let result;
      if (mode === "create") {
        result = await createPostAction(formData, intent);
      } else {
        result = await updatePostAction(post!.id, formData, intent);
      }

      if (result.success) {
        router.back();
      } else {
        setGlobalError(result.error);
        setErrors(result.fieldErrors || {});
      }
    });
  };

  const title = mode === "create" ? "Crear publicación" : "Editar publicación";
  const subtitle = mode === "create" ? "Los campos obligatorios están marcados con *." : "Modifica los campos que necesites.";

  return (
    <Dialog
      open={true}
      onClose={() => router.back()}
      labelledBy="post-form-title"
      width="xl"
      footer={
        <>
          {mode === "create" && (
            <>
              <button
                type="button"
                className={buttonStyles({ variant: "secondary" })}
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={buttonStyles({ variant: "primary" })}
                onClick={() => handleFormSubmit("publicar")}
                disabled={isPending}
              >
                {isPending && submitIntent === "publicar" ? "Publicando…" : "Publicar"}
              </button>
            </>
          )}
          {mode === "edit" && !isDraft && (
            <>
              <button
                type="button"
                className={buttonStyles({ variant: "secondary" })}
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={buttonStyles({ variant: "primary" })}
                onClick={() => handleFormSubmit("publicar")}
                disabled={isPending}
              >
                {isPending && submitIntent === "publicar" ? "Guardando…" : "Guardar cambios"}
              </button>
            </>
          )}
          {mode === "edit" && isDraft && (
            <>
              <button
                type="button"
                className={buttonStyles({ variant: "ghost" })}
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={buttonStyles({ variant: "secondary" })}
                onClick={() => handleFormSubmit("guardar-borrador")}
                disabled={isPending}
              >
                {isPending && submitIntent === "guardar-borrador" ? "Guardando…" : "Guardar borrador"}
              </button>
              <button
                type="button"
                className={buttonStyles({ variant: "primary" })}
                onClick={() => handleFormSubmit("publicar")}
                disabled={isPending}
              >
                {isPending && submitIntent === "publicar" ? "Publicando…" : "Publicar"}
              </button>
            </>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-1 mb-4">
        <h2 id="post-form-title" className="text-2xl font-semibold text-text">{title}</h2>
        {mode === "edit" && post ? (
          <p className="text-sm text-text-muted">
            Editando publicación del {formatDate(post.publishedAt)}
          </p>
        ) : (
          <p className="text-sm text-text-muted">{subtitle}</p>
        )}
      </div>

      <FormAlert errors={errors} globalError={globalError} />

      <form ref={formRef} className="flex flex-col gap-6" noValidate>
        <Field
          label="Título *"
          name="title"
          defaultValue={post?.title}
          placeholder="Ej. Defensa de tesis — María Rivas"
          maxLength={120}
          error={errors.title}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <Textarea
            label="Descripción *"
            name="content"
            defaultValue={post?.content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            maxLength={4000}
            helpText="Incluye un #palabraclave para que tus publicaciones se encuentren en el buscador."
            error={errors.content}
            showCount
            characterCount={content.length}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-base font-medium text-text">Palabras clave</label>
          {keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-sm font-medium text-text">
                  #{kw}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-text-muted italic">Ninguna palabra clave detectada.</span>
          )}
          <p className="text-sm text-text-muted">Las palabras clave se toman automáticamente de los # de la descripción.</p>
        </div>

        {mode === "edit" && post?.publishedAt && !isDraft && (
          <Field
            label="Fecha de publicación"
            name="publishedAt"
            value={formatDate(post.publishedAt)}
            disabled
            readOnly
            helpText="No se puede cambiar después de publicar."
          />
        )}

        <Field
          label="Imagen (opcional)"
          name="imageUrl"
          defaultValue={post?.imageUrl || ""}
          placeholder="https://…"
          maxLength={500}
          helpText="Por ahora la imagen se referencia con una dirección web. La subida de archivos llegará con el almacenamiento."
          error={errors.imageUrl}
        />

        <SelectField
          label="Tipo de publicación *"
          name="type"
          defaultValue={post?.type || ""}
          error={errors.type}
        >
          <option value="" disabled>Elige un tipo…</option>
          <option value="noticias">Noticias</option>
          <option value="eventos">Eventos</option>
          <option value="defensas">Defensas</option>
          <option value="investigacion">Investigación</option>
          <option value="convocatorias">Convocatorias</option>
        </SelectField>

        <SelectField
          label="Categoría *"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          hint="Las cinco primeras son disciplinas de la facultad. La última agrupa habilidades blandas."
          error={errors.category}
        >
          <option value="" disabled>Elige una categoría…</option>
          <optgroup label="Disciplinas">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </optgroup>
          <optgroup label="Desarrollo profesional">
            <option value="crecimiento-profesional">Desarrollo profesional</option>
          </optgroup>
        </SelectField>

        <SelectField
          label="Área de investigación *"
          name="researchArea"
          defaultValue={post?.researchArea || ""}
          disabled={!category}
          hint={!category ? "Elige primero una categoría." : "El área se ajusta a la categoría elegida."}
          error={errors.researchArea}
        >
          <option value="" disabled>Elige primero una categoría…</option>
          {category && RESEARCH_AREAS[category]?.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </SelectField>
      </form>
    </Dialog>
  );
}
