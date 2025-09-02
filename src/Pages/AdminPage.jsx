import { useEffect, useState } from "react";
import LoginForm from "../Components/LoginForm";
import { useAtomValue } from "jotai";

function AdminPage(){
    const [admin, setAdmin] = useState(false);
    
    

    if (!admin) {
        return (
            <div className="page-content">
                Log in as administrator
                <p>Fyll i dina uppgifter för att logga in.</p>
                <LoginForm admin={true} setAdmin={setAdmin} />
            </div>
    )}
    else {
        return('Yay admin')
    }

}

export default AdminPage;