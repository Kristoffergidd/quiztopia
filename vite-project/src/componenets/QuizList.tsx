import React, { useEffect, useState } from 'react';
import LeafletMap from './LeafletMap'; 

interface Location {
  longitude: string;
  latitude: string;
}

interface Question {
  question: string;
  answer: string;
  location: Location;
}

interface Quiz {
  quizId: string;
  userId: string;
  username: string;
  questions: Question[];
}

interface QuizApiResponse {
  quizzes: Quiz[];
  success: boolean;
}

const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null); 

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch('https://fk7zu3f4gj.execute-api.eu-north-1.amazonaws.com/quiz');
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const data: QuizApiResponse = await response.json();

        if (Array.isArray(data.quizzes)) {
          setQuizzes(data.quizzes);
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDeleteQuiz = async (quizId: string) => {
    try {
  
      const authToken = sessionStorage.getItem('token'); 


      console.log('Token used for delete:', authToken);

      if (!authToken) {
        throw new Error('User is not authenticated. No token found.');
      }

      const response = await fetch(
        `https://fk7zu3f4gj.execute-api.eu-north-1.amazonaws.com/quiz/${quizId}`, 
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`, 
            'Content-Type': 'application/json',
          },
        }
      );

     
      if (!response.ok) {
        const errorMsg = await response.text();
        console.log(`Error: ${response.status} - ${response.statusText}`, errorMsg);

        if (response.status === 401) {
          throw new Error('Unauthorized: Check your token and permissions');
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to delete this quiz');
        } else {
          throw new Error('Failed to delete quiz');
        }
      }

     
      setQuizzes(quizzes.filter((quiz) => quiz.quizId !== quizId));
      setSelectedQuiz(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while deleting the quiz');
      }
    }
  };

  if (loading) {
    return <p>Loading quizzes...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1>All Quizzes</h1>
      <ul>
        {quizzes.map((quiz) => (
          <li key={`${quiz.quizId}${quiz.userId}`}>
            <h2>Quiz ID: {quiz.quizId}</h2>
            <p>User ID: {quiz.userId}</p>
            <p>Username: {quiz.username}</p>
            <button onClick={() => setSelectedQuiz(quiz)}>
              Show More Information
            </button>
            {selectedQuiz && selectedQuiz.quizId === quiz.quizId && (
              <div>
                <LeafletMap questions={selectedQuiz.questions} />
                <button onClick={() => handleDeleteQuiz(quiz.quizId)}>
                  Delete Quiz
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;