import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Estende a interface Session para incluir o id do usuário
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  /**
   * Estende a interface User para garantir que tenha id
   */
  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Estende a interface JWT para incluir o id
   */
  interface JWT {
    id: string;
  }
}
