import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
publicRoutes: ['/', '/profile', '/register','/api/get-user'],
ignoredRoutes: ["/((?!api|trpc))(_next.*|.+\.[\w]+$)", "/api/get-user"]
});

export const config = {
matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};