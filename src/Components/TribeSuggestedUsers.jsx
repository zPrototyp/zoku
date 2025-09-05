// /user/discovery/compatible?minCompatibility=0.6&count=2

import { useState, useEffect } from "react";
import { API_fetchSuggestions, API_findSuggestedUsers } from "../Services/API"
import UserCard from "./UserCard";

const SuggestedUsers = ({token = null, sessionToken = null, user, setUiState = null}) =>{
const [suggestions, setSuggestions] = useState([])
    useEffect(() => {
        try {
            token && API_findSuggestedUsers(token, 2, setSuggestions);
            sessionToken && API_fetchSuggestions(sessionToken, 2, user?.perimaryPersonality?.name ?? null, (data)=>{
                const updated = data.map(item => item.personality);
                setSuggestions(updated)
            })

        }
        catch (error) {
            console.error("Error fetching feed list:", error);
        }
        finally {
            // console.log(suggestions);
            setUiState && setUiState((p)=>({...p, showSuggestedUsers:true}))
        }

    }, [])

    return (
        <>
        <h3>Andra användare</h3>
        {token && suggestions.length > 0 ? (
            suggestions.map(item => 
            <UserCard key={item.userId} user={item} viewer={user} />
            )
       ) : sessionToken && suggestions.length > 0 ? (
            suggestions.map(item => {
                return <UserCard key={item.userId} user={item} viewer={user} />;
            })
            ) : (
            <p>
                Inga gäst förslag hittades just nu – prova igen senare.
            </p>
            )}
        
        </>
    )

}
export default SuggestedUsers;