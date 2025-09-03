import { useEffect, useState, useMemo } from "react";
import LoginForm from "../Components/LoginForm";
import { useAtom, useSetAtom } from "jotai";
import { adminAtom } from "../Atoms/AdminAtom";
import { API_logout, API_seeding, API_userSafeFetchJson, API_seedingCheck, API_seedingCancel } from "../Services/API";
import { authTokenAtom } from "../Atoms/AuthAtom";
import { feedListAtom } from "../Atoms/FeedListAtom";
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";
import "../assets/css/Admin.css";
import BrandCard from "../Components/AdminBrandCard";
import CelebrityDashboard from "../Components/AdminCelebrities";
import CelebrityUploader from "../Components/AdminCelebrityUploader";
import { NavLink } from "react-router";

function AdminPage(){
    const [admin, setAdmin] = useAtom(adminAtom);
    const [token, setToken] = useAtom(authTokenAtom);
    const setFeedList = useSetAtom(feedListAtom);
    const setValueProfile = useSetAtom(valueProfileAtom);
    const [result, setResult] = useState(null);
    const [brands, setBrands] = useState(null)
    const [celebs, setCelebs] = useState(null)
    const [uiState, setUiState]= useState({
        showSeedOps: false,
        seedingSources: null,
        seedResult: null,
        seedExecuteType: "",
        seedExecuteOperation: "",
        pendingSeeds: {},
        history: {},
        loading: false,
        updateDate: new Date,
        brandLength: 0,
        celebLength: celebs?.totalCelebrities || 0,
        showBrands: false,
        showCelebs: false
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

const memoizedLengths = useMemo(() => ({
  brandLength: brands?.length || 0,
  celebLength: celebs?.totalCelebrities || 0
}), [brands?.length, celebs?.totalCelebrities]);

useEffect(() => {
  const updates = {};
  if (memoizedLengths.brandLength > 0) {
    updates.brandLength = memoizedLengths.brandLength;
  }
  
  if (memoizedLengths.celebLength > 0) {
    console.log(celebs);
    updates.celebLength = memoizedLengths.celebLength;
  }
  
  // Only update state if there are actual changes
  if (Object.keys(updates).length > 0) {
    setUiState(p => ({ ...p, ...updates }));
  }
}, [memoizedLengths.brandLength, memoizedLengths.celebLength, brands, celebs]);

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
    const fetchAnalytics = (type) => {
        if (type ==='brands'){
            if (!uiState.showBrands) {
                API_userSafeFetchJson(token, `admin/analytics/${type}`, setBrands)
                setUiState((prev) => ({...prev, showBrands: true}))
            } else {
                setUiState((prev) => ({...prev, showBrands: false}))
            }
        }
        else {
            if (!uiState.showCelebs){
                API_userSafeFetchJson(token, `admin/analytics/${type}`, setCelebs);
                setUiState((prev) => ({...prev, showCelebs: true}))
            } else {
                setUiState((prev) => ({...prev, showCelebs: false}))
            }
        }
    }

    const setSeedResult = (data) => {
        setUiState((prev) => ({...prev, seedResult: data}));
    }
    const setSeedExecuted = (data) => {
        // if (data.status === 'completed') return;
        let now  = new Date;
        setUiState(prev => ({ 
            ...prev, 
            updateDate: now,
            pendingSeeds: {
                [data.operationId]: data, // will overwrite if it already exists
                ...prev.pendingSeeds,
         } }));
        // console.log(data);
    }
    const setSeedHistory = (data) => {
        setUiState(p => ({...p, pendingSeeds: {}}))
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
        API_seedingCheck(`admin/seeding/history?page=1&pageSize=20`, token, setSeedHistory)
    }

    if (!admin) {
        return (
            <div className="page-content admin"
            style={{
                maxWidth: "700px",
                margin: "0 auto",
                padding: "20px",
                fontFamily: "var(--fontNav)"
            }}>
                Log in as administrator
                <p>Fyll i dina uppgifter för att logga in.</p>
                <LoginForm admin={true} setAdmin={setAdmin} />
                
                
                <NavLink to="/"><button>Back to Zoku</button></NavLink>

            </div>
    )}
    else {
        return(
        <div className="page-content admin"
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

        
        <button
            onClick={()=>fetchAnalytics('brands')}
        >
            {uiState.showBrands ? 'Hide Brand Analytics': 'Show Brand Analytics'}
        </button>
        <button
            onClick={()=>fetchAnalytics('celebrities')}
        >
            {uiState.showCelebs ? 'Hide Celeb Analytics': 'Show Celeb Analytics'}
            
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
                <h3>Pending seedings</h3>
                <button className="active" onClick={()=>fetchSeedingHistory()}>
                    Update Seeding History ({uiState.updateDate.toLocaleTimeString()})
                </button>
                {Object.values(uiState.pendingSeeds).map(item => (
                <p key={item.operationId} 
                    style={{ fontSize: item.status === "pending" ? "unset": "10px" }}>
                    {item.operationId} - {item.sourceName} {item.operationType} <strong>{item.status}</strong>
                    {(item.status == 'pending' ) &&
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

    {uiState.showBrands && (
        <><p>Brands:  {uiState.brandLength} items</p>
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)"
        }}>
            {brands?.map((b) => <BrandCard key={b.id} brand={b} />)}
        </div>
        </>
        )
    }
    {uiState.showCelebs && (
        <div>
            {celebs && <CelebrityDashboard data={celebs} />}
            <h2>Add new file of celebrities</h2>
            <CelebrityUploader bearer={token} />

        </div>)
    }
        <NavLink to="/"><button onClick={()=>handleLogout()}>Back to Zoku</button></NavLink>
        </div>)
    }

}

export default AdminPage;