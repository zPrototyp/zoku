import React, {useEffect, useState} from "react";
import { useAtom } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom";
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";
import { testValuesAtom } from "../Atoms/TestValuesAtom";
import { guestTokenAtom } from "../Atoms/GuestTokenAtom";
import { feedListAtom } from "../Atoms/FeedListAtom";

const AZURE_API = import.meta.env.VITE_AZURE_API;

export const API_ShareProfile = (platform) => {
    const [token,] = useAtom(authTokenAtom);
    const [sessionToken, ] = useAtom(guestTokenAtom);

    const bearer = token? token : sessionToken;

    bearer && fetch(`${AZURE_API}/user/share-interactions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${bearer}`
        },
        body: JSON.stringify({
            entityType: "personality",
            platform: {platform},
            entityId: 0,
            method: "link"
            })
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to record interaction')
        return res.json();
    })
    .then(data => {
        return data.data;
    })
    .catch(error => {
        console.error('Error recording sharing:', error)
});
    
}