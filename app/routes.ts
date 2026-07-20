import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/subscriptions.index.tsx"),
  route("subscriptions/new", "routes/subscriptions.new.tsx"),
  route("subscriptions/:id/edit", "routes/subscriptions.edit.tsx"),
  route("subscriptions/:id/delete", "routes/subscriptions.delete.tsx"),
] satisfies RouteConfig;
