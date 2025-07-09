/**
 * @file Permission management for the application
 * @see {@link https://www.better-auth.com/docs/plugins/admin}
 */
import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  oauth: ["create", "read", "update", "delete", "delete-self"],
  profile: ["create", "read", "update"],
} as const;

export const ac = createAccessControl(statement)

export const admin = ac.newRole({
  oauth: ["create", "update", "delete", "delete"],
  profile: ["read", "update"],
  ...adminAc.statements,
})

export const user = ac.newRole({
  oauth: ["read"]
});

export const impersonator = ac.newRole({
  user: ["impersonate", "list"]
})

export const developer = ac.newRole({
  oauth: ["read", "create", "read", "update"]
})

export const officer = ac.newRole({
  oauth: ["read", "update"],
  profile: ["read", "update"],
})

export const student = ac.newRole({
  oauth: ["read"],
})

export const staff = ac.newRole({
  oauth: ["read"],
  profile: ["read", "update"],
})

export const roles = {
  admin,
  user,
  impersonator,
  developer,
  officer,
  student,
  staff,
} as const;
