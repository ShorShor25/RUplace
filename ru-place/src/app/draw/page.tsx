
import { getServerSession } from "next-auth";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import Draw from './draw';

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/");
    }




    return (
        <main style={{ height: '100vh', width: '100%', position: 'relative' }}>
            <Draw />
        </main>
    );
}
