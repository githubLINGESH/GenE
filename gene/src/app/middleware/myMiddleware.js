    // src/app/middleware/myMiddleware.js
    import { authMiddleware } from '@clerk/nextjs';

    export default authMiddleware({
    publicRoutes: ['/', '/profile', '/register','/home/api/get-user'],
    ignoredRoutes: ["/((?!api|trpc))(_next.*|.+\.[\w]+$)","/home/api/get-user"]
    });

    export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
    };
