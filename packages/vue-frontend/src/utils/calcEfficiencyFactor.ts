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
  if (!speed || !heartRate) return 0;
  return (convertMetricSpeedToMPH(speed) * YARDS_PER_MILE / 60) / heartRate;
};

export default calcEfficiencyFactor;
