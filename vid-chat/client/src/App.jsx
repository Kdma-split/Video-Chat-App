import { Routes, Route } from 'react-router-dom';
import VideoChat from './pages/VideoChat.page.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={ <VideoChat /> }/>
    </Routes>
  )
}

export default App;
