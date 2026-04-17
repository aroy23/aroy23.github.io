document.addEventListener("DOMContentLoaded", () => {
    const spotifyCard = document.getElementById("spotify-card");
    const spotifyCover = document.getElementById("spotify-cover");
    const spotifyStatus = document.getElementById("spotify-status");
    const spotifyTrack = document.getElementById("spotify-track");
    const spotifyArtist = document.getElementById("spotify-artist");

    if (!spotifyCard || !spotifyCover || !spotifyStatus || !spotifyTrack || !spotifyArtist) {
        return;
    }

    const defaultHref = "https://open.spotify.com/";
    const nowPlayingUrl = "data/spotify-now-playing.json";

    const applyState = ({
        state,
        href = defaultHref,
        status,
        track,
        artist,
        coverUrl = ""
    }) => {
        spotifyCard.classList.remove("spotify-card--playing", "spotify-card--idle", "spotify-card--error");
        spotifyCard.classList.add(state);
        spotifyCard.href = href;
        spotifyStatus.textContent = status;
        spotifyTrack.textContent = track;
        spotifyArtist.textContent = artist;

        if (coverUrl) {
            spotifyCover.src = coverUrl;
            spotifyCover.alt = `Album cover for ${track}`;
            spotifyCover.hidden = false;
        } else {
            spotifyCover.hidden = true;
            spotifyCover.alt = "";
            spotifyCover.removeAttribute("src");
        }
    };

    const loadNowPlaying = async () => {
        try {
            const response = await fetch(`${nowPlayingUrl}?t=${Date.now()}`, { cache: "no-store" });

            if (!response.ok) {
                throw new Error(`Spotify now playing fetch failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.isPlaying && data.title && data.artist) {
                applyState({
                    state: "spotify-card--playing",
                    href: data.songUrl || defaultHref,
                    status: "Currently listening",
                    track: data.title,
                    artist: data.artist,
                    coverUrl: data.albumImageUrl || ""
                });
                return;
            }

            applyState({
                state: "spotify-card--idle",
                href: defaultHref,
                status: "Spotify idle",
                track: "Nothing playing right now",
                artist: ""
            });
        } catch (error) {
            console.error(error);
            applyState({
                state: "spotify-card--error",
                href: defaultHref,
                status: "Spotify unavailable",
                track: "Current track unavailable",
                artist: "Set the Spotify secrets to enable this."
            });
        }
    };

    loadNowPlaying();
    window.setInterval(loadNowPlaying, 60000);
});
