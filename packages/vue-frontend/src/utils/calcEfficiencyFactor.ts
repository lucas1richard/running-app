import { YARDS_PER_MILE } from '../constants';
import { convertMetricSpeedToMPH } from '../utils';

interface CalcEfficiencyFactor {
  /**
   * @param speed kilometers per hour
   * @param heartRate beats per minute
   */
  (speed: number, heartRate: number): number;
}

const calcEfficiencyFactor: CalcEfficiencyFactor = (speed, heartRate) => {
  return (convertMetricSpeedToMPH(speed) * YARDS_PER_MILE / 60) / heartRate;
};

export default calcEfficiencyFactor;
