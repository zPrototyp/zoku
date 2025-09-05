import { useEffect, useState, useMemo } from "react";
import LoginForm from "../Components/LoginForm";
import { useAtom, useSetAtom } from "jotai";
import { adminAtom } from "../Atoms/AdminAtom";
import { API_logout, API_seeding, 
    API_userSafeFetchJson, API_seedingCheck, API_seedingCancel, 
    API_adminAddBrand, API_adminBrandUpdate, 
    API_adminFetchUsers, API_adminFetchUserInteractions, 
    API_adminCurrentSessions,
    API_adminSettingsAutolike,
    API_adminSettingsSetAutolike,
    API_adminFetchUserShares} from "../Services/API";
import { authTokenAtom } from "../Atoms/AuthAtom";
import { feedListAtom } from "../Atoms/FeedListAtom";
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";
import "../assets/css/Admin.css";
import BrandCard from "../Components/AdminBrandCard";
import CelebrityDashboard from "../Components/AdminCelebrities";
import CelebrityUploader from "../Components/AdminCelebrityUploader";
import { NavLink } from "react-router";
import AddBrandForm from "../Components/AdminBrandAdd";
import AdminUserCard, { UserInteractionCard } from "../Components/AdminUserCard";
import { NumberForm } from "../Components/AdminSettings";

function AdminPage(){
    const [admin, setAdmin] = useAtom(adminAtom);
    const [token, setToken] = useAtom(authTokenAtom);
    const setFeedList = useSetAtom(feedListAtom);
    const setValueProfile = useSetAtom(valueProfileAtom);
    const [result, setResult] = useState(null);
    const [brands, setBrands] = useState(null);
    const [celebs, setCelebs] = useState(null);
    const [users, setUsers] = useState(null);
    const [fullUser, setFullUser] = useState(null);
    const [userShares, setUserShares] = useState(null);
    const [fullbrand, setFullbrand] = useState(null);
    const [uiState, setUiState]= useState({
        activeSessions: 0,
        autolikes: 0,
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
        showCelebs: false,
        showBrandAdd: false,
        showBrandEdit: false,
        showUsers: false,
        userCount: 0,
        showFullUser: false,
        showSettings: false,
        })
    
  
    useEffect(() => {
        token && updateActiveSessions(); 
        token && getAutoLikes();
        token && API_adminFetchUsers(token, (users) => 
            { setUsers(users.filter(user => user.email !== "admin@zoku.se"))});
    }, [token]);

    // update userCount whenever users changes
useEffect(() => {
  if (users) {
    setUiState((p) => ({
      ...p,
      userCount: users.length
    }));
  }
}, [users]);

    const getAutoLikes = () => {
        API_adminSettingsAutolike(token, (data)=>{setUiState(p => ({...p, autolikes: data.count}))})
    }

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
            updates.celebLength = memoizedLengths.celebLength;
        }
        
        // Only update state if there are actual changes
        if (Object.keys(updates).length > 0) {
            setUiState(p => ({ ...p, ...updates }));
        }
    }, [memoizedLengths.brandLength, memoizedLengths.celebLength, brands, celebs]);

    useEffect(() => {
    if (uiState.showUsers) {
        // Fetch users!
     API_adminFetchUsers(token, (users) => {
      setUsers(users.filter(user => user.email !== "admin@zoku.se"))});
    }
    },[uiState.showUsers])

    const updateActiveSessions = () => {
        API_adminCurrentSessions(token, (data) => {
            setUiState(p=>({...p, activeSessions: data.data.length}))
        })
    }
    const handleAutolikeSetting = async (count)=> {
        const confirmed = window.confirm(
        "Are you sure you want to change the autolikes setting? " +
        "This is how many brands a user automatically gets on their Brand Wardrobe."
        );

        if (!confirmed) return; // user clicked cancel

        try {
        await API_adminSettingsSetAutolike(token, count, (data) => {
            setUiState((p) => ({ ...p, autolikes: data.count }));
        });

        } catch (err) {
        console.error("Failed to update autolikes:", err);
        }
    }
    
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

    const handleAddBrand = (formData) => {
        API_adminAddBrand(token, formData, (data)=>{console.log(data)})
        fetchAnalytics('brands');
    }

    const handleEdit = (brand) => {
        
        console.log(brand)
        
        setFullbrand(null);
        setUiState(p =>({...p,  showBrandEdit: true }))
        setFullbrand(brand);
        
    }
    const handleEditSubmit = (formData) => {
        setUiState(p =>({...p,  showBrandEdit: false }))
        API_adminBrandUpdate(token, fullbrand.id, formData,(data)=>{
            setBrands(p=> (p.id == data.id ? data : p))
            console.log(data)
        } )
        setFullbrand(null);
    }
    const fetchUser = (userId) => {
        // console.log(userId);
        API_adminFetchUserInteractions(token, userId, setFullUser);
        API_adminFetchUserShares(token, userId, setUserShares);
        
        setUiState(p => ({...p, showFullUser: true}))
    }

    if (!admin) {
        return (
            <div className="page-content admin"
            style={{
                maxWidth: "1000px",
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
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "20px",
            fontFamily: "var(--fontNav)"
        }}>
      
    <div className="admin-page-buttons">
        <button  onClick={()=>handleLogout()}> 🛑 Log out  </button>

        <button onClick={()=>updateActiveSessions()}>
              {uiState.activeSessions} Active sessions ↻ Update
        </button>  

        <button onClick={()=>fetchSeedingSrc()} className={uiState.showSeedOps? 'active':''}>
        {uiState.showSeedOps ? 'Hide seeding options': '⇕ Show seeding options'}
        </button>

        <button onClick={()=>fetchAnalytics('brands')} className={uiState.showBrands? 'active':''}>
            {uiState.showBrands ? 'Hide Brand Analytics': '📈 Show Brand Analytics'}
        </button>
        
        <button onClick={()=>fetchAnalytics('celebrities')} className={uiState.showCelebs? 'active':''}>
            {uiState.showCelebs ? 'Hide Celeb Analytics': '📈 Show Celeb Analytics'}
        </button>

        <button onClick={() => setUiState(p => ({...p, showUsers: !p.showUsers}))} className={uiState.showUsers? 'active':''}>
            {uiState.showUsers ? `Hide ${uiState.userCount} Users`: `👤 Show ${uiState.userCount} Users`}
        </button>
        <button onClick={() => setUiState(p => ({...p, showSettings: !p.showSettings}))} className={uiState.showSettings? 'active':''}>
            {uiState.showSettings ? 'Hide settings': '⚙ Show Setings'}
        </button>
    </div>


    {uiState.showSettings &&    <div>
        <h2>Settings</h2>
        {/* <p>Autolikes: {uiState.autolikes} </p> */}
        <NumberForm likes={uiState.autolikes} limit="40" onSubmit={handleAutolikeSetting} />
    </div>}

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

        <button onClick={()=>setUiState(p => ({...p, showBrandAdd: !p.showBrandAdd}))}>
            {!uiState.showBrandAdd ? 'Add new brand': 'Hide add form'}
        </button>
        {fullbrand && <button onClick={()=>{
            uiState.showBrandEdit && setFullbrand(null);
            setUiState(p => ({...p, showBrandEdit: !p.showBrandEdit}))}
            }>
            {!uiState.showBrandEdit? 'Show Edit brand form': 'Clear edit form'}
        </button>}
        {uiState.showBrandAdd && <AddBrandForm onSubmit={handleAddBrand} />}
        {uiState.showBrandEdit && fullbrand && <AddBrandForm onSubmit={handleEditSubmit} formState={fullbrand} />}

        {!uiState.showBrandEdit && <div className="admin-brand-panel">
   
            {brands?.map((b) => <BrandCard key={b.id} brand={b} handleEdit={handleEdit} />)}
        </div>}
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

    {uiState.showUsers && (
        <div>
        <h2>Users in the system</h2>
        {fullUser && <button onClick={()=>{
            setFullUser(null);
            setUiState(p => ({...p, showFullUser: false}))
            }}>
            Clear user details & show all users
        </button>}
        {fullUser && <UserInteractionCard user={fullUser} userShares={userShares}/>}
        {!uiState.showFullUser && users && users.map(u => <AdminUserCard key={u.id} user={u} fetchUser={fetchUser} />)}

        </div>
    )

    }

        {!token && <NavLink to="/"><button onClick={()=>handleLogout()}>Back to Zoku</button></NavLink>}
        </div>)
    }

}

export default AdminPage;