export const CreateComparisonDials = ({ friendValues, friendProfile, profile }) => {
  // determine if friend values are valid
  const hasFriend =
    typeof friendValues?.compassionVsAmbition === "number" &&
    typeof friendValues?.changeVsTradition === "number" &&
    (friendValues.compassionVsAmbition > 0 || friendValues.changeVsTradition > 0);

  if (!hasFriend) {
    return { dialA: null, dialB: null, hasFriend: false };
  }

  // user dial
  const dialA = {
    name: "Du",
    compassionVsAmbition: profile?.compassionVsAmbition,
    changeVsTradition: profile?.changeVsTradition,
    primaryPersonality: profile?.primaryPersonality,
  };

  // friend dial (prefer profile, fallback to values)
  const dialB = friendProfile
    ? { name: "Vän", ...friendProfile }
    : {
        name: "Vän",
        compassionVsAmbition: friendValues?.compassionVsAmbition ?? 0,
        changeVsTradition: friendValues?.changeVsTradition ?? 0,
      };

  return { dialA, dialB, hasFriend: true };
};
