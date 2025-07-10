import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),

  ...prefix("dashboard", [
    layout("routes/dashboard/layout.tsx", [
      index("routes/dashboard/index.tsx"),

      ...prefix("oauth2", [
        layout("routes/dashboard/oauth2/layout.tsx", [
          index("routes/dashboard/oauth2/index.tsx"),
          route("register", "routes/dashboard/oauth2/register.tsx"),
          route("manage/:clientId", "routes/dashboard/oauth2/manage.tsx"),
        ])
      ]),

      ...prefix("users", [
        layout("routes/dashboard/users/layout.tsx", [
          index("routes/dashboard/users/index.tsx"),
        ])
      ])
    ])
  ]),
] satisfies RouteConfig;
