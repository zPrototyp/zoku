
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

export const API_guestGetPersonality = async (bearer, testValues, onSuccess) => {
    if (!bearer) return;
    const res = await fetch(`${AZURE_API}/guest/personality-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            changeVsTradition: testValues.changeVsTradition,
            compassionVsAmbition: testValues.compassionVsAmbition,
            sessionToken: bearer
        })
    })
    
    if (!res.ok) throw new Error('Request failed')
        
    const data = await res.json();
    
    if (!data.success) throw new Error('Failed to fetch profile data');
    
    onSuccess(data.data);

    return data.data;
}

export const API_guestGetBrandMatches = async (bearer, testValues, onSuccess, category, variations) => {
    if (!bearer) return;
    console.log("Fetching brand matches ");
    const res = await fetch(`${AZURE_API}/guest/brand-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        changeVsTradition: testValues.changeVsTradition,
        compassionVsAmbition: testValues.compassionVsAmbition,
        sessionToken: bearer,
        category: category || 'all',
        variations: variations || 3
      })
    });
    if (!res.ok) throw new Error('Brand matches request failed');
    
    const data = await res.json();

    onSuccess(data.data);
        
    return data.data;

}