
const AZURE_API = import.meta.env.VITE_AZURE_API;

export const API_shareProfile = async (platform, bearer) => {

    if (!bearer || !platform) return;

    try {
        const res = await fetch(`${AZURE_API}/user/share-interactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${bearer}`,
            },
            body: JSON.stringify({
                entityType: "personality",
                platform: platform,
                entityId: 0,
                method: "link",
            }),
        });

        if (!res.ok) throw new Error("Failed to record interaction");

        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error("Error recording sharing:", error);
    }
};
