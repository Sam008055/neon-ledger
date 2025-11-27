/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as budget from "../budget.js";
import type * as challenges from "../challenges.js";
import type * as http from "../http.js";
import type * as lessons from "../lessons.js";
import type * as moodTracking from "../moodTracking.js";
import type * as savingsJars from "../savingsJars.js";
import type * as selfCare from "../selfCare.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  budget: typeof budget;
  challenges: typeof challenges;
  http: typeof http;
  lessons: typeof lessons;
  moodTracking: typeof moodTracking;
  savingsJars: typeof savingsJars;
  selfCare: typeof selfCare;
  subscriptions: typeof subscriptions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
