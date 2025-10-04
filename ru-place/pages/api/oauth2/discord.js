import axios from 'axios';

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:8080/api/oauth2/callback';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const authorizationUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email`;

        return res.redirect(authorizationUrl);
    }

    if (req.method === 'POST') {
        const { code } = req.body;

        try {
            const tokenResponse = await axios.post(
                'https://discord.com/api/oauth2/token',
                new URLSearchParams({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: REDIRECT_URI,
                    scope: 'identify email',
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const { access_token } = tokenResponse.data;

            const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            return res.status(200).json(userResponse.data);
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error during authentication');
        }
    }

    return res.status(405).send('Method Not Allowed');
}
