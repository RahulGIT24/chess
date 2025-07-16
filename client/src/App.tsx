import { BrowserRouter, Route, Routes } from "react-router-dom"
import Landing from "./screens/Landing"
import Game from "./screens/Game"
import GameList from "./screens/GameList"
import ViewGame from "./screens/ViewGame"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/game" element={<Game/>}/>
        <Route path="/mygames" element={<GameList/>}/>
        <Route path="/game/:id" element={<ViewGame/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App