import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)', // Required for Trigger.dev & external services
  '/api/trigger(.*)'   // Required for Trigger.dev background jobs
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. If the route is NOT public, force the user to sign in
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always match API routes
    '/(api|trpc)(.*)',
  ],
};
