// Helper to calculate personality type based on the two axes
export function calculatePersonalityType(changeVsTradition, compassionVsAmbition) {

}

// Helper to calculate match percentage between two personalities
export function calculateMatchPercentage(personalityOne, personalityTwo)
{
    var distance = Math.sqrt(
        Math.pow(personalityOne.changeVsTradition - personalityTwo.changeVsTradition, 2) +
        Math.pow(personalityOne.compassionVsAmbition - personalityTwo.compassionVsAmbition, 2)
    );
    return Math.round(Math.max(100 - distance));
}
