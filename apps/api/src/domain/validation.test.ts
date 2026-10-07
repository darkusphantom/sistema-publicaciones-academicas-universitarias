import { describe, expect, it } from "vitest";
import {
  AdminSetVisibilitySchema,
  AdminUpdatePostSchema,
  FeedQuerySchema,
  LoginSchema,
  PostDraftSchema,
  RegisterSchema,
  SetUserRoleSchema,
  UpdatePostSchema,
  emailSchema,
  idSchema,
  nameSchema,
  passwordLoginSchema,
  passwordRegisterSchema,
  postCategorySchema,
  postTypeSchema,
  postVisibilitySchema,
  usernameSchema,
} from "./validation";

describe("validation schemas", () => {
  describe("emailSchema", () => {
    it("accepts a valid email and normalizes to lowercase and trims", () => {
      const result = emailSchema.safeParse("  ANA@Correo.com  ");
      expect(result.success).toBe(true);
      expect(result.data).toBe("ana@correo.com");
    });

    it("rejects a malformed email", () => {
      expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    });

    it("rejects an email longer than 254 chars", () => {
      const long = `${"a".repeat(250)}@correo.com`;
      expect(emailSchema.safeParse(long).success).toBe(false);
    });
  });

  describe("password schemas", () => {
    it("register requires 8 to 128 chars without trimming spaces", () => {
      expect(passwordRegisterSchema.safeParse("abcdefgh").success).toBe(true);
      expect(passwordRegisterSchema.safeParse("  12345678  ").success).toBe(true);
      expect(passwordRegisterSchema.safeParse("1234567").success).toBe(false);
    });

    it("login requires 1 to 128 chars (no min-8 leak)", () => {
      expect(passwordLoginSchema.safeParse("a").success).toBe(true);
      expect(passwordLoginSchema.safeParse("").success).toBe(false);
      expect(passwordLoginSchema.safeParse("a".repeat(129)).success).toBe(false);
    });
  });

  describe("nameSchema", () => {
    it("accepts names with accents, spaces, hyphens and apostrophes", () => {
      expect(nameSchema.safeParse("María").success).toBe(true);
      expect(nameSchema.safeParse("José Luis").success).toBe(true);
      expect(nameSchema.safeParse("Anne-Marie O'Brien").success).toBe(true);
    });

    it("trims and enforces 2-60 length", () => {
      expect(nameSchema.safeParse("  Ana  ").data).toBe("Ana");
      expect(nameSchema.safeParse("A").success).toBe(false);
      expect(nameSchema.safeParse("a".repeat(61)).success).toBe(false);
    });

    it("rejects names with digits or symbols", () => {
      expect(nameSchema.safeParse("Ana123").success).toBe(false);
      expect(nameSchema.safeParse("Ana!").success).toBe(false);
      expect(nameSchema.safeParse("Ana#").success).toBe(false);
    });
  });

  describe("usernameSchema", () => {
    it("accepts lowercase alphanumeric, dot, underscore and hyphen", () => {
      expect(usernameSchema.safeParse("j.rivas").success).toBe(true);
      expect(usernameSchema.safeParse("maria_2").success).toBe(true);
      expect(usernameSchema.safeParse("luis-3").success).toBe(true);
    });

    it("rejects uppercase, accents and other symbols", () => {
      expect(usernameSchema.safeParse("J.Rivas").success).toBe(false);
      expect(usernameSchema.safeParse("maría").success).toBe(false);
      expect(usernameSchema.safeParse("j rivas").success).toBe(false);
    });
  });

  describe("idSchema", () => {
    it("accepts an id of 1-64 chars", () => {
      expect(idSchema.safeParse("u-123").success).toBe(true);
      expect(idSchema.safeParse("").success).toBe(false);
      expect(idSchema.safeParse("a".repeat(65)).success).toBe(false);
    });
  });

  describe("domain enums", () => {
    it("postCategorySchema accepts the five categories", () => {
      expect(postCategorySchema.safeParse("matematicas").success).toBe(true);
      expect(postCategorySchema.safeParse("computacion").success).toBe(true);
      expect(postCategorySchema.safeParse("fisica").success).toBe(true);
      expect(postCategorySchema.safeParse("quimica").success).toBe(true);
      expect(postCategorySchema.safeParse("biologia").success).toBe(true);
      expect(postCategorySchema.safeParse("otro").success).toBe(false);
    });

    it("postTypeSchema accepts the three types", () => {
      expect(postTypeSchema.safeParse("post").success).toBe(true);
      expect(postTypeSchema.safeParse("articulo").success).toBe(true);
      expect(postTypeSchema.safeParse("ensenanza").success).toBe(true);
    });

    it("postVisibilitySchema accepts publicado/borrador/oculto", () => {
      expect(postVisibilitySchema.safeParse("publicado").success).toBe(true);
      expect(postVisibilitySchema.safeParse("borrador").success).toBe(true);
      expect(postVisibilitySchema.safeParse("oculto").success).toBe(true);
    });
  });

  describe("PostDraftSchema", () => {
    it("accepts a valid draft and defaults imageUrl to null", () => {
      const result = PostDraftSchema.safeParse({
        title: " Título ",
        content: "Contenido",
        category: "matematicas",
        type: "post",
        researchArea: "general",
        visibility: "publicado",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Título");
        expect(result.data.imageUrl).toBeNull();
      }
    });

    it("rejects invalid category, empty title or too-long content", () => {
      expect(
        PostDraftSchema.safeParse({
          title: "x",
          content: "y",
          category: "nope",
          type: "post",
          researchArea: "general",
          visibility: "publicado",
        }).success,
      ).toBe(false);
      expect(
        PostDraftSchema.safeParse({
          title: "",
          content: "y",
          category: "matematicas",
          type: "post",
          researchArea: "general",
          visibility: "publicado",
        }).success,
      ).toBe(false);
      expect(
        PostDraftSchema.safeParse({
          title: "x",
          content: "y".repeat(10001),
          category: "matematicas",
          type: "post",
          researchArea: "general",
          visibility: "publicado",
        }).success,
      ).toBe(false);
    });

    it("rejects oculto for author drafts", () => {
      expect(
        PostDraftSchema.safeParse({
          title: "x",
          content: "y",
          category: "matematicas",
          type: "post",
          researchArea: "general",
          visibility: "oculto",
        }).success,
      ).toBe(false);
    });
  });

  describe("UpdatePostSchema", () => {
    it("accepts a partial patch", () => {
      expect(
        UpdatePostSchema.safeParse({ title: "Nuevo título" }).success,
      ).toBe(true);
    });

    it("rejects an empty patch", () => {
      const result = UpdatePostSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("empty_patch");
      }
    });
  });

  describe("AdminUpdatePostSchema", () => {
    it("allows admin to set oculto", () => {
      expect(
        AdminUpdatePostSchema.safeParse({ visibility: "oculto" }).success,
      ).toBe(true);
    });
  });

  describe("AdminSetVisibilitySchema", () => {
    it("accepts publicado or oculto only", () => {
      expect(
        AdminSetVisibilitySchema.safeParse({ visibility: "publicado" }).success,
      ).toBe(true);
      expect(
        AdminSetVisibilitySchema.safeParse({ visibility: "oculto" }).success,
      ).toBe(true);
      expect(
        AdminSetVisibilitySchema.safeParse({ visibility: "borrador" }).success,
      ).toBe(false);
    });
  });

  describe("SetUserRoleSchema", () => {
    it("accepts the three roles and rejects others", () => {
      expect(SetUserRoleSchema.safeParse({ role: "estudiante" }).success).toBe(
        true,
      );
      expect(SetUserRoleSchema.safeParse({ role: "profesor" }).success).toBe(
        true,
      );
      expect(SetUserRoleSchema.safeParse({ role: "admin" }).success).toBe(true);
      expect(SetUserRoleSchema.safeParse({ role: "superuser" }).success).toBe(
        false,
      );
    });
  });

  describe("FeedQuerySchema", () => {
    it("applies defaults for an empty query", () => {
      const result = FeedQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.q).toBe("");
        expect(result.data.categoria).toBe("todas");
        expect(result.data.tipo).toBe("todos");
        expect(result.data.autor).toBe("todos");
        expect(result.data.estado).toBe("todos");
        expect(result.data.desde).toBeNull();
        expect(result.data.hasta).toBeNull();
        expect(result.data.limit).toBe(6);
        expect(result.data.offset).toBe(0);
      }
    });

    it("coerces numeric limit and offset", () => {
      const result = FeedQuerySchema.safeParse({
        limit: "12",
        offset: "3",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(12);
        expect(result.data.offset).toBe(3);
      }
    });

    it("rejects invalid category, malformed date and out-of-range limit", () => {
      expect(FeedQuerySchema.safeParse({ categoria: "otra" }).success).toBe(
        false,
      );
      expect(FeedQuerySchema.safeParse({ desde: "2026/03/12" }).success).toBe(
        false,
      );
      expect(FeedQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
      expect(FeedQuerySchema.safeParse({ limit: "0" }).success).toBe(false);
    });
  });

  describe("RegisterSchema and LoginSchema", () => {
    it("accepts a valid register payload", () => {
      const result = RegisterSchema.safeParse({
        givenName: "María",
        familyName: "Rivas",
        email: " MARIA@Correo.com ",
        password: "secreto123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("maria@correo.com");
      }
    });

    it("rejects an invalid register payload with field details", () => {
      const result = RegisterSchema.safeParse({
        givenName: "A",
        familyName: "",
        email: "bad",
        password: "short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((issue) => issue.path[0]);
        expect(paths).toContain("givenName");
        expect(paths).toContain("familyName");
        expect(paths).toContain("email");
        expect(paths).toContain("password");
      }
    });

    it("login uses the relaxed password schema", () => {
      expect(
        LoginSchema.safeParse({ username: "j.rivas", password: "a" }).success,
      ).toBe(true);
    });
  });
});