import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/index.scss'
import { Provider } from 'react-redux';



createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
