import React from 'react';
import QuizList from './QuizList';
import CreateQuiz from './CreateQuiz';

const QuizzesPage: React.FC = () => {
    return (
        <div>
            <h1>Quizzes</h1>
            <CreateQuiz />
            <QuizList />
        </div>
    );
};

export default QuizzesPage;