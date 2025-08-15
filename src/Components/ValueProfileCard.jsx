export default function ValueProfileCard({ profile, onClick }) {
  return (
        <div className={`aboutProfile-${profile.primaryPersonality.name}`} onClick={onClick}>
            <h2>Ditt Namn Här</h2>
            <p>{profile.primaryPersonality.matchPercentage}% {profile.primaryPersonality.name}</p>
            <p>{profile.secondaryPersonality.matchPercentage}% {profile.secondaryPersonality.name}</p>
            <p>{profile.thirdPersonality.matchPercentage}% {profile.thirdPersonality.name}</p>
        </div>
  );
}

// Usage example:
// <ValueProfileCard profile={result} onClick={() => console.log('click')} />