/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(drawer)` | `/(drawer)/` | `/(drawer)/analytics` | `/(drawer)/attendance` | `/(drawer)/batches` | `/(drawer)/content` | `/(drawer)/learning` | `/(drawer)/notifications` | `/(drawer)/profile` | `/(drawer)/schedule` | `/(drawer)/settings` | `/(drawer)/students` | `/(drawer)/users` | `/(drawer)/yoyo-test` | `/_sitemap` | `/analytics` | `/attendance` | `/auth` | `/auth/` | `/auth/change-password` | `/batches` | `/content` | `/learning` | `/notifications` | `/profile` | `/schedule` | `/settings` | `/students` | `/users` | `/yoyo-test`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
