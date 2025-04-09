import { Routes, Route } from 'react-router-dom';
import VideoChat from './pages/VideoChat.page.jsx';

function App() {
  return (
    <Routes>
      <Route path="/video-chat" element={ <VideoChat /> }/>
    </Routes>
  )
}

export default App;
