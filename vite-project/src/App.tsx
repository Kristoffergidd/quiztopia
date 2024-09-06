// import CreateAccount from './componenets/CreateAccount'
// import LoginForm from './componenets/LoginForm'
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import QuizzesPage from './componenets/QuizzesPage';


// export default function App() {
//   return (
//     <Router>
//     <Routes>
//         <Route path="/" element={<Navigate to="/signup" replace />} />
//         <Route path="/signup" element={<CreateAccount />} />
//         <Route path="/login" element={<LoginForm />} />
//         <Route path="/quizzes" element={<QuizzesPage />} />
//     </Routes>
//    </Router>
//   )
// }

import CreateAccount from './componenets/CreateAccount'
import LoginForm from './componenets/LoginForm'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import QuizzesPage from './componenets/QuizzesPage';


function isAuthenticated() {
  return !!sessionStorage.getItem('token');
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect to /signup if no token is present */}
        <Route path="/" element={<Navigate to={isAuthenticated() ? '/quizzes' : '/signup'} replace />} />
        
        {/* Sign Up Route */}
        <Route path="/signup" element={<CreateAccount />} />
        
        {/* Login Route */}
        <Route path="/login" element={isAuthenticated() ? <Navigate to="/quizzes" replace /> : <LoginForm />} />
        
        {/* Quizzes Route */}
        <Route path="/quizzes" element={<QuizzesPage />} />
      </Routes>
    </Router>
  );
}