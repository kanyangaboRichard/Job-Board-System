import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { store,  } from "./store/store";
//import Navbar from "./components/Navbar";
import AppRouter from "./routes/AppRouter";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      
     
        <BrowserRouter>
          {/* <Navbar /> */}
          <main>
            <AppRouter />
          </main>
        </BrowserRouter>
      {/* </PersistGate> */}
    </Provider>
  );
};

export default App;
