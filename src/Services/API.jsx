
const AZURE_API = import.meta.env.VITE_AZURE_API;

// Function to send share interaction to API can be used by guest or authenticated users
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

// Used to fetch personality for guests, and friend profiles.
export const API_guestGetPersonality = async (bearer, testValues, onSuccess) => {
    
    if (!bearer) return;
    const res = await fetch(`${AZURE_API}/guest/personality-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            changeVsTradition: testValues.changeVsTradition,
            compassionVsAmbition: testValues.compassionVsAmbition,
            sessionToken:  bearer
        })
    })
    
    if (!res.ok) throw new Error('Request failed')
        
    const data = await res.json();
    
    if (!data.success) throw new Error('Failed to fetch profile data');
    
    onSuccess(data.data);

    return data.data;
}
// RESULT PAGE  - matching brands for guest profile.
export const API_guestGetBrandMatches = async (bearer, testValues, onSuccess, category, variations) => {
    if (!bearer) return;
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

// PROFILE & FEED PAGE - api call used to fetch data
  export const API_userSafeFetchJson = async (token, url, onSuccess) => {
      const res = await fetch(`${AZURE_API}/${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Nätverksfel");

    const text = await res.text();
    if (!text) return;

    const data = JSON.parse(text);
    if (data.success) {
      onSuccess(data.data);
      return data.data;
    }
}
//   BRAND INTERACTION - used to send interaction to API
export const API_brandInteraction = async (userAction, brandId, token) => {
    if (!userAction || !brandId || !token) return;
  
    // Check if the user is authenticated
    token && fetch(`${AZURE_API}/user/brands/interactions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            brandId: brandId,  
            action: userAction
        })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Failed to record interaction: ${userAction}`, res.data);
        }
        return res.json();
    })
    .then(data => {return data.data})
    .catch(error => {
        console.error("Error updating interaction:", error);
    });
  }

//   Logout function to clear user session
export const API_logout = async (token) => {
    if (!token) return;
    try {
        const res = await fetch(`${AZURE_API}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) throw new Error("Logout failed");
        return true;
    } catch (error) {
        console.error("Error during logout:", error);
        return false;
    }
};