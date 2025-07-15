import { BrowserRouter, Route, Routes } from "react-router-dom"
import Landing from "./screens/Landing"
import Game from "./screens/Game"
import GameList from "./screens/GameList"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/game" element={<Game/>}/>
        <Route path="/mygames" element={<GameList/>}/>
        <Route path="/game/:id" element={<Game/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App