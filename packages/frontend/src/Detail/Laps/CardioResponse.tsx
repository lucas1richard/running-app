import { useAppSelector } from '@/hooks/redux';
import { selectStreamTypeData } from '@/reducers/activities';
import calculateCardioResponse, { RunningPoint } from '@/utils/calculateCardioResponse';
import { Transition } from '@/utils/findTransitions';
import useCalculatedGrade from '../HeartZonesChart/useCalculatedGrade';
import calculateRecoveryTau from '@/utils/calculateRecoveryTau';

const CardioResponse = (props: {
  lap: Transition,
  activityId: number;
}) => {
  const { lap, activityId } = props;
  const heartRateStream = useAppSelector(
    (state) => selectStreamTypeData(state, activityId, 'heartrate')
  ).slice(lap.start_index);
  const velocityStream = useAppSelector(
    (state) => selectStreamTypeData(state, activityId, 'velocity_smooth')
  ).slice(lap.start_index);
  const altitudeStream = useAppSelector(
    (state) => selectStreamTypeData(state, activityId, 'altitude')
  ).slice(lap.start_index);
  const distanceStream = useAppSelector(
    (state) => selectStreamTypeData(state, activityId, 'distance')
  ).slice(lap.start_index);
  const gradientStream = useCalculatedGrade(altitudeStream, distanceStream);

  const points = heartRateStream.map<RunningPoint>((h, ix) => {
    return {
      time: ix,
      gradePercent: gradientStream[ix],
      heartRate: h,
      velocityMPerMin: velocityStream[ix] * 60,
    };
  });

  if (points.length < 60) return null;

  const cardioResponse = calculateCardioResponse(points);
  if (cardioResponse.hrRise60s < 0) {
    const tau = calculateRecoveryTau(points.filter((p) => p.time < (lap.end_index - lap.start_index)), points[0].heartRate, 90);
    return (
      <div>
        {`Recovery τ = ${tau.toFixed(1)} seconds`}
      </div>
    );
  }

  return (
    <>
      <div>
        <div>Avg Workload: {cardioResponse.averageWorkload.toFixed(3)}</div>
        <div>Num Heartbeats 60s: {cardioResponse.hrAuc60s}</div>
        <div>HR Rise 30s: {cardioResponse.hrRise30s}</div>
        <div>HR Rise 60s: {cardioResponse.hrRise60s}</div>
        <div>Efficiency: {cardioResponse.efficiency.toFixed(3)}</div>
      </div>
    </>
  );
};

export default CardioResponse;
