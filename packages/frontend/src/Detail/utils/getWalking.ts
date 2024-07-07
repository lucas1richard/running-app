const WALKING_PACE = 1.65; // meters / second

const getWalking = (velocityStream = [], timeStream = []) => {
  let secondsWalking = 0;
  const walkingTime = [];
  for (let i = 0; i < velocityStream.length; i++) {
    if (velocityStream[i] < WALKING_PACE) {
      secondsWalking++;
      walkingTime.push(timeStream[i]);
    }
  }

  return {
    secondsWalking,
    walkingTime,
  };
};

export default getWalking;
