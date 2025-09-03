import React from "react";
import { useAtom, useAtomValue } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom";
import TribeCommunity from "../Components/TribeCommunity";
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";

function CommunityPage() {
  const [token] = useAtom(authTokenAtom);
  const user = useAtomValue(valueProfileAtom);

  return (
    <div className="page-content">
      <TribeCommunity token={token} user={user} title="Din Community" />
    </div>
  );
}

export default CommunityPage;