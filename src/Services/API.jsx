const AZURE_API = import.meta.env.VITE_AZURE_API;

// Function to send share interaction to API can be used by guest or authenticated users
export const API_shareProfile = async (platform, bearer, entity, entityId) => {
console.log("Sharing to ", platform, entity, entityId);
    if (!bearer || !platform) return;
    try {
        const res = await fetch(`${AZURE_API}/share`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${bearer}`,
            },
            body: JSON.stringify({
                entityType: entity,
                platform: platform,
                entityId: entityId || 0,
                method: "Link",
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

// Test Page - get guest token
export const API_getGuestToken = async (onSuccess) => {
 const res = await fetch(`${AZURE_API}/guest/start-session`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
      })
  if (!res.ok) throw new Error('Failed to get session token')
  const data = await res.json()
  if (data.success) {
      onSuccess(data.data.sessionToken)
      return data.data.sessionToken
  }

}

// Update Personality for logged in users
export const API_updatePersonality = async (change, compassion, bearer) => {
 const res = await fetch(`${AZURE_API}/user/personality`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`
      },
      body: JSON.stringify({
        changeVsTradition: change,
        compassionVsAmbition: compassion
      })
    })
    if (!res.ok) throw new Error('Failed to update personality')
    const data = await res.json()
    if (data.success) {
      return data.data
    }
    throw new Error('Failed to update personality')

}


// Below: copied from Backend_Peter
// const API_BASE_URL = '/api/v1';

class ApiService {
  constructor() {
    this.baseURL = AZURE_API;
  }

  // Helper method to get auth headers
  getAuthHeaders(token = null) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Helper method to get guest session headers
  getGuestHeaders(sessionToken = null) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (sessionToken) {
      headers['X-Session-Id'] = sessionToken;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      });

      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data?.message || `HTTP error! status: ${response.status}`);
      }

      return { success: true, data, status: response.status };
    } catch (error) {
      console.error('API Request failed:', error);
      return { success: false, error: error.message, status: null };
    }
  }

  // GET request
  async get(endpoint, token = null) {
    return this.request(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
  }

  // POST request
  async post(endpoint, data = null, token = null) {
    return this.request(endpoint, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: data ? JSON.stringify(data) : null,
    });
  }

  // PUT request
  async put(endpoint, data = null, token = null) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: data ? JSON.stringify(data) : null,
    });
  }

  // DELETE request
  async delete(endpoint, token = null) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  // PATCH request
  async patch(endpoint, data = null, token = null) {
    return this.request(endpoint, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: data ? JSON.stringify(data) : null,
    });
  }

  // Guest session requests
  async guestPost(endpoint, data = null, sessionToken = null) {
    return this.request(endpoint, {
      method: 'POST',
      headers: this.getGuestHeaders(sessionToken),
      body: data ? JSON.stringify(data) : null,
    });
  }

  async guestGet(endpoint, sessionToken = null) {
    return this.request(endpoint, {
      method: 'GET',
      headers: this.getGuestHeaders(sessionToken),
    });
  }

  // === AUTH ENDPOINTS ===
  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  async logout(token) {
    return this.post('/auth/logout', null, token);
  }

  // === GUEST ENDPOINTS ===
  async startGuestSession() {
    return this.post('/guest/start-session');
  }

  async getGuestPersonalityResult(data, sessionToken) {
    return this.guestPost('/guest/personality-result', data, sessionToken);
  }

  async getGuestBrandMatches(data, sessionToken) {
    return this.guestPost('/guest/brand-matches', data, sessionToken);
  }

  async registerGuestUser(data, sessionToken) {
    return this.guestPost('/guest/register', data, sessionToken);
  }

  // === USER PERSONALITY ENDPOINTS ===
  async getUserPersonality(token) {
    return this.get('/user/personality', token);
  }

  async updateUserPersonality(data, token) {
    return this.patch('/user/personality', data, token);
  }

  async getUserPersonalityHistory(token) {
    return this.get('/user/personality/history', token);
  }

  // === USER BRANDS ENDPOINTS ===
  async getBrandRecommendations(params, token) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/user/brands/recommendations?${queryString}`, token);
  }

  async getBrandMatches(data, token) {
    return this.post('/user/brands/matches', data, token);
  }

  async trackBrandInteraction(data, token) {
    return this.post('/user/brands/interactions', data, token);
  }

  async getBrandCollection(params, token) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/user/brands/collection?${queryString}`, token);
  }

  // === USER CELEBRITIES ENDPOINTS ===
  async getCelebrityMatches(count, token) {
    return this.get(`/user/celebrities/matches?count=${count}`, token);
  }

  async trackCelebrityInteraction(data, token) {
    return this.post('/user/celebrities/interactions', data, token);
  }

  async likeCelebrity(celebrityId, token) {
    return this.post(`/user/celebrities/liked/${celebrityId}`, null, token);
  }

  async unlikeCelebrity(celebrityId, token) {
    return this.delete(`/user/celebrities/liked/${celebrityId}`, token);
  }

  async getLikedCelebrities(token) {
    return this.get('/user/celebrities/liked', token);
  }

  // === PUBLIC BRANDS ENDPOINTS ===
  async getBrands(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/brands${queryString ? '?' + queryString : ''}`);
  }

  async getBrand(id) {
    return this.get(`/brands/${id}`);
  }

  // === PUBLIC CELEBRITIES ENDPOINTS ===
  async getCelebrities(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/celebrities${queryString ? '?' + queryString : ''}`);
  }

  async getCelebrity(id) {
    return this.get(`/celebrities/${id}`);
  }

  async getPopularCelebrities(count = 10) {
    return this.get(`/celebrities/popular?count=${count}`);
  }

  // === USER PROFILE ENDPOINTS ===
  async updateProfileName(data, token) {
    return this.patch('/user/name', data, token);
  }

  async changePassword(data, token) {
    return this.patch('/user/password', data, token);
  }

  // === SHARE ENDPOINTS ===
  async createShare(data, token) {
    return this.post('/share', data, token);
  }

  async trackShare(data, token) {
    return this.post('/share/track', data, token);
  }

  async getShareHistory(limit = 50, token) {
    return this.get(`/share/history?limit=${limit}`, token);
  }

  async getShareStats(token) {
    return this.get('/share/stats', token);
  }

  async updateShareCount(data, token) {
    return this.patch('/share/count', data, token);
  }

  // === USER DISCOVERY ENDPOINTS (NEW FEATURES) ===
  async searchUsers(params, token) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/user/discovery/search?${queryString}`, token);
  }

  // === USER RELATIONSHIPS ENDPOINTS (NEW FEATURES) ===
  async sendFriendRequest(data, token) {
    return this.post('/user/relationships/friend-request', data, token);
  }

  async getFriendRequests(token) {
    return this.get('/user/relationships/friend-requests', token);
  }

  async respondToFriendRequest(requestId, data, token) {
    return this.put(`/user/relationships/friend-requests/${requestId}`, data, token);
  }

  // === PRIVACY ENDPOINTS (NEW FEATURES) ===
  async getPrivacySettings(token) {
    return this.get('/user/privacy/settings', token);
  }

  async updatePrivacySettings(data, token) {
    return this.put('/user/privacy/settings', data, token);
  }
}

// // Export singleton instance
// const apiService = new ApiService();
// export default apiService;

// Also export the class for testing purposes
export { ApiService };

//Get celebrities with optional filters via public controller.
export const API_getCelebrities = async ({ name = null, personality = null, page = 1, pageSize = 20 } = {}) => {
  const qs = new URLSearchParams();
  if (name) qs.set('name', name);
  if (personality) qs.set('personality', personality);
  if (page) qs.set('page', String(page));
  if (pageSize) qs.set('pageSize', String(pageSize));

  const res = await fetch(`${AZURE_API}/celebrities${qs.toString() ? `?${qs}` : ''}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to fetch celebrities: ${res.status}`);
  const data = await res.json();
  // Controller returns ApiResponse 
  return Array.isArray(data) ? data : (data?.data ?? []);
};

// Get popular celebrities via public controller.
export const API_getPopularCelebrities = async (count = 10) => {
  const res = await fetch(`${AZURE_API}/celebrities/popular?count=${count}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to fetch popular celebrities: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data?.data ?? []);
};
