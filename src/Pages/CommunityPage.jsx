import React from "react";
import { useAtom } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom";
import TribeCommunity from "../Components/TribeCommunity";

function CommunityPage() {
  const [token] = useAtom(authTokenAtom);

  return (
    <div className="page-content">
      <TribeCommunity token={token} title="Din Community" />
    </div>
  );
}

export default CommunityPage;