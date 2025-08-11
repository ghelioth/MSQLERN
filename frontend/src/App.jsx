import React, { useEffect, useState } from 'react';
import Routes from './components/Routes'
import { UidContext } from './components/AppContext';
import axios from 'axios';


const App = () => {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      await axios({
        methode: "get",
        url: `${import.meta.env.VITE_API_URL}jwtid`,
        withCredentials: true,
      })
      .then((res) => {
        console.log(res)
        setUid(res.data)})
      .catch((err) => console.log(err));
    }
    fetchToken();
  }, [uid])

  
  return (
    <UidContext.Provider value={uid}>
      <Routes />
    </UidContext.Provider>

  );
};

export default App; 