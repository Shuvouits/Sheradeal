export function getDashboardByRole(user) {
  const rawRole =
    typeof user?.role === "object"
      ? user.role?.name
      : user?.role;

  const role = String(rawRole || "").toLowerCase();

  if (
    user?.is_admin === true ||
    ["admin", "super_admin", "super-admin"].includes(role)
  ) {
    return "/admin/dashboard";
  }

  if (["customer", "user"].includes(role)) {
    return "/user/dashboard";
  }

  return null;
}