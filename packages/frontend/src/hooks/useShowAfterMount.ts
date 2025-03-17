import { useEffect, useState } from 'react';

const useShowAfterMount = () => {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(true), []);

  return show;
};

export default useShowAfterMount;
