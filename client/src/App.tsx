import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./screens/Login"
import Game from "./screens/Game"
import GameList from "./screens/GameList"
import ViewGame from "./screens/ViewGame"
import { GameReviewScreen } from "./screens/GameReview"
import Landing from "./screens/Landing"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/game" element={<Game/>}/>
        <Route path="/mygames" element={<GameList/>}/>
        <Route path="/game/:id" element={<ViewGame/>}/>
        <Route path="/gamereview/:id" element={<GameReviewScreen/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App