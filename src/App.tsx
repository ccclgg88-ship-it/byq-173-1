import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ThemeSelect from "@/pages/ThemeSelect";
import Quiz from "@/pages/Quiz";
import Result from "@/pages/Result";
import Profile from "@/pages/Profile";
import ShareLanding from "@/pages/ShareLanding";
import PairJoin from "@/pages/PairJoin";
import PairResult from "@/pages/PairResult";
import PairInvite from "@/pages/PairInvite";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/themes" element={<ThemeSelect />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/share/:sharerId/:assessmentId" element={<ShareLanding />} />
          <Route path="/pair/invite/:taskId" element={<PairInvite />} />
          <Route path="/pair/join/:taskId" element={<PairJoin />} />
          <Route path="/pair/result/:taskId" element={<PairResult />} />
        </Routes>
      </div>
    </Router>
  );
}
