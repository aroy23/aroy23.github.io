import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(repoRoot, "data", "spotify-now-playing.json");

const requiredEnvVars = [
    "SPOTIFY_CLIENT_ID",
    "SPOTIFY_CLIENT_SECRET",
    "SPOTIFY_REFRESH_TOKEN"
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const writePayload = async (payload) => {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
};

const refreshAccessToken = async () => {
    const credentials = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
        })
    });

    if (!response.ok) {
        throw new Error(`Spotify token refresh failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.access_token) {
        throw new Error("Spotify token refresh did not return an access token");
    }

    return data.access_token;
};

const fetchCurrentlyPlaying = async (accessToken) => {
    const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (response.status === 204) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Spotify currently playing request failed with status ${response.status}`);
    }

    return response.json();
};

const main = async () => {
    const accessToken = await refreshAccessToken();
    const currentTrack = await fetchCurrentlyPlaying(accessToken);

    if (
        !currentTrack ||
        currentTrack.currently_playing_type !== "track" ||
        !currentTrack.is_playing ||
        !currentTrack.item
    ) {
        await writePayload({
            isPlaying: false,
            title: "",
            artist: "",
            album: "",
            songUrl: "",
            albumImageUrl: "",
            updatedAt: new Date().toISOString()
        });
        console.log("Spotify is idle.");
        return;
    }

    const song = currentTrack.item;
    const artists = Array.isArray(song.artists)
        ? song.artists.map((artist) => artist.name).join(", ")
        : "";
    const images = song.album?.images || [];
    const albumImage = images[1]?.url || images[0]?.url || "";

    await writePayload({
        isPlaying: true,
        title: song.name || "",
        artist: artists,
        album: song.album?.name || "",
        songUrl: song.external_urls?.spotify || "",
        albumImageUrl: albumImage,
        updatedAt: new Date().toISOString()
    });

    console.log(`Spotify is playing: ${song.name} - ${artists}`);
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
