export const ROUTES = {
  authLogin: '/web/index.php/auth/login',
  dashboard: '/web/index.php/dashboard/index',
  pimEmployeeList: '/web/index.php/pim/viewEmployeeList',
} as const;

export const ROUTE_PATTERNS = {
  authLogin: /auth\/login/,
  dashboard: /dashboard/,
} as const;
