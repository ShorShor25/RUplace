import Map from '@/components/map';
import LogoutButton from '@/components/logout-button';
import { sendTileUpdate } from '../../../websocket/wsocket';
import { Tile } from '../../../shared/tile'
import { getServerSession } from "next-auth";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation"; { }

export default async function Home() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/");
    }
    const tile: Tile = { "x": 1, "y": 2, "color": 6, "lat": 69.69, "long": 47.74 };
    sendTileUpdate(tile);

    return (
        <main style={{ height: '100vh', width: '100%', position: 'relative' }}>
            <LogoutButton />
            <Map />
        </main>
    );
}
