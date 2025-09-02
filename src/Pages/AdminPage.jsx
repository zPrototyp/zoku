import { useEffect, useState } from "react";
import LoginForm from "../Components/LoginForm";
import { useAtom, useSetAtom } from "jotai";
import { adminAtom } from "../Atoms/AdminAtom";
import { API_logout, API_seeding, API_userSafeFetchJson } from "../Services/API";
import { authTokenAtom } from "../Atoms/AuthAtom";
import { feedListAtom } from "../Atoms/FeedListAtom";
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";

function AdminPage(){
    const [admin, setAdmin] = useAtom(adminAtom);
    const [token, setToken] = useAtom(authTokenAtom);
    const setFeedList = useSetAtom(feedListAtom);
    const setValueProfile = useSetAtom(valueProfileAtom);
    const [result, setResult] = useState(null);
    const [uiState, setUiState]= useState({
            seedingSources: null,
            seedResult: null,
            seedExecuteType: "",
            seedExecuteOperation: "",
            pendingSeeds: {}
        })

  const handleLogout = () => {
    const loggedOut = API_logout(token);
    if (loggedOut) {
      console.log("User logged out successfully");
    }
    setToken(null);
    setFeedList(null);
    setValueProfile(null);
    setAdmin(false);
    window.location.href = "/zoku/"; // Redirect to home page
  };

    const fetchSeedingSrc = () => {
        API_userSafeFetchJson(token, 'admin/seeding/sources', setResult)
    }

    const setSeedResult = (data) => {
        setUiState((prev) => ({...prev, seedResult: data}));
    }
    const setSeedExecuted = (data) => {
        setUiState(prev => ({
        ...prev,
        pendingSeeds: {
            ...prev.pendingSeeds,
            [data.operationId]: data   // will overwrite if it already exists
        }
        }));
        console.log(data);
    }
    const performSeed = (type, operation, url) =>
    {
        let onSuccess;
        console.log("type:", type)
        console.log("operation:", operation)
        setUiState((p)=>
        ({...p, seedExecuteType: type, seedExecuteOperation: operation}))
        if (url=='preview')
            onSuccess = setSeedResult;
        else 
            onSuccess = setSeedExecuted;
        
        API_seeding(`admin/seeding/${url}`, token, type, operation, onSuccess)
    }

    if (!admin) {
        return (
            <div className="page-content"
            style={{
                maxWidth: "700px",
                margin: "0 auto",
                padding: "20px",
                fontFamily: "var(--fontNav)"
            }}>
                Log in as administrator
                <p>Fyll i dina uppgifter för att logga in.</p>
                <LoginForm admin={true} setAdmin={setAdmin} />
            </div>
    )}
    else {
        return(
        <div className="page-content"
        style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "20px",
            fontFamily: "var(--fontNav)"
        }}>
        <button
        onClick={()=>handleLogout()}
        >Log out</button>

        <button
        onClick={()=>fetchSeedingSrc()}>
        fetch seeding options
        </button>

        {result && (
            <>
            {result.map((type) => (
                <span key={type.name}>
                <h2>{type.name} - {type.displayName}</h2>
                <p>{type.description}</p>
                <p>Estimated items: {type.estimatedItemCount}</p>
                <ul>
                    {type.supportedOperations.map((op)=>
                    <li key={`${type}${op}`}  style={{display:"inline-block"}}>
                        <button
                        onClick={()=>performSeed(type.name, op, 'preview')}
                        > {op} </button>
                    </li>)}
                </ul>
                </span>
            ))}
            <button className="active"
                onClick={()=>performSeed(uiState.seedExecuteType, uiState.seedExecuteOperation, 'execute')}
            >
                {uiState.seedExecuteType} 
                - {uiState.seedExecuteOperation} 
                - {uiState.seedResult ? uiState.seedResult.totalAvailableItems: ''}
            </button>

            <div style={{border: "1px solid red"}}
            >{uiState.pendingSeeds?.length}</div>

            </>
        )}
            
        </div>)
    }

}

export default AdminPage;