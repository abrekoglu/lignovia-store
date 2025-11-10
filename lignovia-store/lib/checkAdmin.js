/**
 * Helper function to check admin access in getServerSideProps
 * @param {Object} context - Next.js context from getServerSideProps
 * @returns {Object} - Returns { session } if access is granted, or redirect object
 */
export async function checkAdmin(context) {
  // Import getServerSession (server-side equivalent of getSession)
  const { getServerSession } = await import("next-auth/next");
  const { authOptions } = await import("@/pages/api/auth/[...nextauth]");

  // Get session using getServerSession
  const session = await getServerSession(context.req, context.res, authOptions);

  // 1. If user is not logged in, redirect to /login
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // 2. Allowed admin email list
  const allowedAdminEmails = ["abrekoglu@gmail.com"];

  // 3. If user is logged in but email is not in allowed list, redirect to home
  if (!allowedAdminEmails.includes(session.user.email)) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // 4. Access granted - return session
  return { session };
}


