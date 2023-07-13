import { toWei } from "./helper";

/**
 * Validates the given start and end timestamps.
 * @param {number} startTimestamp - The Unix timestamp (in seconds) for the start time.
 * @param {number} endTimestamp - The Unix timestamp (in seconds) for the end time.
 * @throws {Error} Will throw an error if the start timestamp is after or equal to the end timestamp, or if the end timestamp does not correspond to a Thursday at 12 AM UTC.
 */
function validateTimestamps(startTimestamp: number, endTimestamp: number) {
    if (startTimestamp >= endTimestamp) throw Error('Start timestamp must be before end timestamp');
    const endDate = new Date(endTimestamp * 1000); // convert Unix timestamp to JavaScript Date
    const isValidEndDate =
        endDate.getUTCDay() === 4 &&
        endDate.getUTCHours() === 0 &&
        endDate.getUTCMinutes() === 0 &&
        endDate.getUTCSeconds() === 0;
    if (!isValidEndDate) throw Error('Maturity must be at Thursday 12 AM');
}

/**
 * Calculates the parameters scalarRoot and rateAnchor.
 * @param {number} rateMin - The minimum rate (e.g. 1% APY = 0.01).
 * @param {number} rateMax - The maximum rate (e.g. 5% APY = 0.05).
 * @param {number} startTimestamp - The Unix timestamp (in seconds) for the start time.
 * @param {number} endTimestamp - The Unix timestamp (in seconds) for the end time.
 * @return {Object} An object containing the scalarRoot and rateAnchor values.
 * @throws {Error} Will throw an error if the start timestamp is after or equal to the end timestamp, or if the end timestamp does not correspond to a Thursday at 12 AM UTC.
 */
export function calculateParameters(
    rateMin: number,
    rateMax: number,
    startTimestamp: number,
    endTimestamp: number
): { scalarRoot: BN; initialRateAnchor: BN } {
    validateTimestamps(startTimestamp, endTimestamp);
    const yearsToExpiry = (endTimestamp - startTimestamp) / 31536000;
    const rateMinScaled = Math.pow(rateMin + 1, yearsToExpiry);
    const rateMaxScaled = Math.pow(rateMax + 1, yearsToExpiry);
    const initialRateAnchor = (rateMinScaled + rateMaxScaled) / 2;
    const rateDiff = Math.max(Math.abs(rateMaxScaled - initialRateAnchor), Math.abs(initialRateAnchor - rateMinScaled));
    const scalarRoot = (Math.log(9) * yearsToExpiry) / rateDiff;
    return { scalarRoot: toWei(scalarRoot), initialRateAnchor: toWei(initialRateAnchor) };
}
