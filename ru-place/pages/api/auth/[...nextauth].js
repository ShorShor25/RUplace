import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export default NextAuth({
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: "identify email"
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            session.user.id = token.sub;
            return session;
        }
    }
});
