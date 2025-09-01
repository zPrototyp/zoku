// Helper to calculate personality type based on the two axes
export function calculatePersonalityType(changeVsTradition, compassionVsAmbition) {

}

// Helper to calculate match percentage between two personalities
export function calculateMatchPercentage(personalityOne, personalityTwo)
{
   if (
    !personalityOne || 
    !personalityTwo ||
    typeof personalityOne.changeVsTradition !== "number" ||
    typeof personalityOne.compassionVsAmbition !== "number" ||
    typeof personalityTwo.changeVsTradition !== "number" ||
    typeof personalityTwo.compassionVsAmbition !== "number"
  ) {
    return 0;
  }
    var distance = Math.sqrt(
        Math.pow(personalityOne.changeVsTradition - personalityTwo.changeVsTradition, 2) +
        Math.pow(personalityOne.compassionVsAmbition - personalityTwo.compassionVsAmbition, 2)
    );
    return Math.round(Math.max(100 - distance));
}
