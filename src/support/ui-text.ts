/**
 * Texto visível da UI (rótulos e placeholders) centralizado para facilitar
 * manutenção e futura localização (i18n).
 */
const common = {
  username: 'Username',
  password: 'Password',
  firstName: 'First Name',
  lastName: 'Last Name',
  search: 'Search',
} as const;

export const UiText = {
  labels: {
    addButton: 'Add',
    searchButton: common.search,
    confirmDelete: 'Yes, Delete',
    editButton: 'Edit',
    deleteButton: 'Delete',
    logoutMenuItem: 'Logout',
    employeeNameLabel: 'Employee Name',
    username: common.username,
    password: common.password,
    firstName: common.firstName,
    lastName: common.lastName,
    confirmPassword: 'Confirm Password',
    createLoginDetails: 'Create Login Details',
  },
  placeholders: {
    employeeSearch: 'Type for hints...',
    menuSearch: common.search,
    username: common.username,
    password: common.password,
    firstName: common.firstName,
    lastName: common.lastName,
  },
} as const;
