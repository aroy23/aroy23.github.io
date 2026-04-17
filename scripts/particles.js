document.addEventListener("DOMContentLoaded", async function() {
    await tsParticles.load("tsparticles", {
        fpsLimit: 240,
        fullScreen: {
            enable: true,
            zIndex: 0
        },
        background: {
            color: { value: "#fffcf7" },
        },
        particles: {
            number: {
                value: 140,
                density: { enable: true, area: 800 },
            },
            color: { value: "#8a817f" },
            shape: {
                type: "circle",
            },
            move: {
                enable: true,
                speed: 1.5,
                direction: "none",
                random: true,
                straight: false,
                outModes: {
                    default: "out"
                },
            },
            size: {
                value: { min: 1, max: 2.5 },
            },
            opacity: {
                value: { min: 0.15, max: 0.4 },
                animation: {
                    enable: true,
                    speed: 0.4,
                    minimumValue: 0.1,
                    sync: false
                }
            },
            links: {
                enable: false
            },
        },
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: "repulse"
                },
            },
            modes: {
                repulse: {
                    distance: 50,
                    duration: 0.2,
                }
            }
        },
        detectRetina: true,
    });
});
