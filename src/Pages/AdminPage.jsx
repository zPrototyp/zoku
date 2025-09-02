import { useEffect, useState } from "react";
import LoginForm from "../Components/LoginForm";
import { useAtom, useSetAtom } from "jotai";
import { adminAtom } from "../Atoms/AdminAtom";
import { API_logout, API_seeding, API_userSafeFetchJson, API_seedingCheck, API_seedingCancel } from "../Services/API";
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
        showSeedOps: false,
        seedingSources: null,
        seedResult: null,
        seedExecuteType: "",
        seedExecuteOperation: "",
        pendingSeeds: {},
        history: {},
        loading: false
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
        if (uiState.showSeedOps) {
            setUiState(p => ({
            ...p,
            showSeedOps: false
        }))
        } else {
        setUiState(p => ({
            ...p,
            showSeedOps: true
        }))
        API_userSafeFetchJson(token, 'admin/seeding/sources', setResult)
        fetchSeedingHistory();
    }
    }

    const setSeedResult = (data) => {
        setUiState((prev) => ({...prev, seedResult: data}));
    }
    const setSeedExecuted = (data) => {
        if (data.status === 'completed') return;
        setUiState(prev => ({ 
            ...prev, 
            pendingSeeds: {
                 ...prev.pendingSeeds,
                  [data.operationId]: data // will overwrite if it already exists
         } }));
        // console.log(data);
    }
    const setSeedHistory = (data) => {
        data.operations.map(item=>setSeedExecuted(item));
    }

    const performSeed = (type, operation, url) =>
    {
        let onSuccess;
        setUiState((p)=>
        ({...p, seedExecuteType: type, seedExecuteOperation: operation}))
        if (url=='preview')
            onSuccess = setSeedResult;
        else 
            onSuccess = setSeedExecuted;
        
        API_seeding(`admin/seeding/${url}`, token, type, operation, onSuccess)
    }
    const checkSeed = (seedId) => {
        API_seedingCheck(`admin/seeding/status/${seedId}`, token, setSeedExecuted)
    }
    const cancelSeed = (seedId) => {
        const result = API_seedingCancel(seedId, token);
        result && fetchSeedingHistory();
    }

    const fetchSeedingHistory = () => {
        setUiState(p => ({...p, loading: true}))
        API_seedingCheck(`admin/seeding/history?page=1&pageSize=20`, token, setSeedHistory)
        setUiState(p => ({...p, loading: false}))
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
        {uiState.showSeedOps ? 'Hide seeding options': 'Show seeding options'}
        </button>

        {uiState.showSeedOps && result && (
            <>
            <h2>Seeding operations</h2>
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

            <div>
                <h3>pending seedings</h3>
                <button className="active" onClick={()=>fetchSeedingHistory()}>
                    Update Seeding History
                </button>
                {Object.values(uiState.pendingSeeds).map(item => (
                <p key={item.operationId}>
                    {item.operationId} - {item.sourceName} {item.operationType} <strong>{item.status}</strong>
                    {(item.status != 'cancelled' ) &&
                    <>
                    <button className="active btn-small"
                        onClick={()=>checkSeed(item.operationId)}>
                        Check 
                    </button>
                     <button className="active btn-small"
                        onClick={()=>cancelSeed(item.operationId)}>
                        Cancel 
                    </button>
                    </>}
                </p>
                ))}
            
            </div>

            </>
        )}
        
        </div>)
    }

}

export default AdminPage;