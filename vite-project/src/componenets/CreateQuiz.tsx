import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateQuiz: React.FC = () => {
  const [quizName, setQuizName] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [location, setLocation] = useState<Location>({ longitude: '', latitude: '' });
  const [token, setToken] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null); 

  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token'); 
    if (storedToken) {
      setToken(storedToken);
    } else {
      setErrorMessage('You must be logged in to create a quiz.');
      navigate('/login');
    }
  }, [navigate]);

  const handleAddQuestion = () => {
    if (!newQuestion || !newAnswer || !location.latitude || !location.longitude) {
      setErrorMessage('Please fill out all question fields.');
      return;
    }

    setQuestions([...questions, { question: newQuestion, answer: newAnswer, location }]);
    
    setNewQuestion('');
    setNewAnswer('');
    setLocation({ longitude: '', latitude: '' });
    setErrorMessage(null); 
  };

  const handleCreateQuiz = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!quizName) {
      setErrorMessage('Please enter a quiz name.');
      return;
    }

    if (questions.length === 0) {
      setErrorMessage('Please add at least one question to the quiz.');
      return;
    }

    try {
     
      const response = await fetch('https://fk7zu3f4gj.execute-api.eu-north-1.amazonaws.com/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: quizName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setQuizId(data.quizId); 
        setSuccessMessage(`Quiz created successfully with ID: ${data.quizId}`);
        setQuizName(''); 

        for (const question of questions) {
          try {
            const payload = {
              name: data.quizId,
              question: question.question,
              answer: question.answer,
              location: {
                longitude: question.location.longitude,
                latitude: question.location.latitude,
              },
            };

            const response = await fetch('https://fk7zu3f4gj.execute-api.eu-north-1.amazonaws.com/quiz/question', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, 
              },
              body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.error || 'Failed to add question');
            }
          } catch (err: unknown) {
            if (err instanceof Error) {
              console.error('Error adding question:', err.message);
            } else {
              console.error('An unknown error occurred');
            }
          }
        }

        setQuestions([]); 
      } else {
        throw new Error(data.error || 'Failed to create quiz');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    }
  };

  return (
    <div>
      <h1>Create a New Quiz</h1>
      <form onSubmit={handleCreateQuiz}>
        <div>
          <label>
            Quiz Name:
            <input
              type="text"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <h2>Add Questions</h2>
          <div>
            <label>
              Question:
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Answer:
              <input
                type="text"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
            </label>
          </div>

          <LeafletMap setLocation={setLocation} />
          <p>Selected Location: Latitude {location.latitude}, Longitude {location.longitude}</p>

          <button type="button" onClick={handleAddQuestion}>
            Add Question
          </button>
        </div>
        <button type="submit">Create Quiz</button>
      </form>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <h2>Questions:</h2>
      <ul>
        {questions.map((q, index) => (
          <li key={index}>
            <p>Question: {q.question}</p>
            <p>Answer: {q.answer}</p>
            <p>Location: {q.location.latitude}, {q.location.longitude}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CreateQuiz;