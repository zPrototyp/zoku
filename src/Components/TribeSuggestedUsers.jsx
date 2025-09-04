// /user/discovery/compatible?minCompatibility=0.6&count=2

import { useState, useEffect } from "react";
import { API_findSuggestedUsers } from "../Services/API"
import UserCard from "./UserCard";

const SuggestedUsers = ({token, user, setUiState = null}) =>{
const [suggestions, setSuggestions] = useState([])
    useEffect(() => {
        try {
            API_findSuggestedUsers(token, 2, setSuggestions);
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
        <h3>Föreslagna användare</h3>
        {suggestions.length > 0 ? (
            suggestions.map(item => 
            <UserCard key={item.userId} user={item} viewer={user} />
            )
        ) : (
            <p>
            Inga förslag hittades just nu – prova igen senare.
            </p>
        )}
        </>
    )

}
export default SuggestedUsers;