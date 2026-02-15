import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      githubUsername?: string;
      dbId?: number;
    };
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubId?: string;
    accessToken?: string;
  }
}
