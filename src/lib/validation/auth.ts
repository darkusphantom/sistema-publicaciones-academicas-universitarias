

export function validateUsername(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Escribe tu usuario.";
  if (trimmed.length > 50) return "Escribe tu usuario.";
  return null;
}

export function validateName(value: string, isSurname: boolean = false): string | null {
  const trimmed = value.trim();
  const label = isSurname ? "apellido" : "nombre";
  if (!trimmed) return `Escribe tu ${label}.`;
  if (trimmed.length < 2 || trimmed.length > 60) return `El ${label} debe tener entre 2 y 60 caracteres.`;
  // Letras con acentos, espacio, '-' y '\''
  if (!/^[\p{L}\s\-']+$/u.test(trimmed)) return `El ${label} debe tener entre 2 y 60 caracteres.`;
  return null;
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Escribe tu correo.";
  if (trimmed.length > 254) return "Escribe un correo válido, por ejemplo nombre@correo.com.";
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return "Escribe un correo válido, por ejemplo nombre@correo.com.";
  
  return null;
}

export function validatePassword(value: string, isLogin: boolean = false): string | null {
  if (!value) return "Escribe tu contraseña.";
  if (isLogin) {
    if (value.length > 128) return "Escribe tu contraseña.";
    return null;
  }
  // Register rules
  if (value.length < 8 || value.length > 128) return "La contraseña debe tener al menos 8 caracteres.";
  return null;
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return "Escribe la contraseña otra vez.";
  if (password !== confirm) return "Las contraseñas no coinciden.";
  return null;
}

export function validateLogin(data: FormData): { success: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  const username = data.get("username")?.toString() || "";
  const password = data.get("password")?.toString() || "";

  const usernameError = validateUsername(username);
  if (usernameError) errors.username = usernameError;

  const passwordError = validatePassword(password, true);
  if (passwordError) errors.password = passwordError;

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRegister(data: FormData): { success: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  const givenName = data.get("given-name")?.toString() || "";
  const familyName = data.get("family-name")?.toString() || "";
  const email = data.get("email")?.toString() || "";
  const newPassword = data.get("new-password")?.toString() || "";
  const confirmPassword = data.get("confirm-password")?.toString() || ""; // Usually we name it confirm-password in UI

  const givenNameError = validateName(givenName, false);
  if (givenNameError) errors["given-name"] = givenNameError;

  const familyNameError = validateName(familyName, true);
  if (familyNameError) errors["family-name"] = familyNameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(newPassword, false);
  if (passwordError) errors["new-password"] = passwordError;

  const confirmError = validateConfirmPassword(newPassword, confirmPassword);
  if (confirmError) errors["confirm-password"] = confirmError;

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}
