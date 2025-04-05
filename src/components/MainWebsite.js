import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import QuizApp from './QuizApp'; // Your existing quiz component
// Import the logo
import boruskLogo from '../images/borsuk-logo.png'; // Adjust path as needed

const MainWebsite = () => {
  // State for selected question set
  const [selectedSet, setSelectedSet] = useState(null);
  const [stats, setStats] = useState({
    attempts: 0,
    completed: 0,
    failed: 0
  });
  // State to store exam history
  const [examHistory, setExamHistory] = useState([]);

  // Function to load stats and exam history from localStorage
  const loadDataFromStorage = () => {
    console.log("reading localStorage");
    const attempts = parseInt(localStorage.getItem('quizApp_attempts')) || 0;
    const completed = parseInt(localStorage.getItem('quizApp_completed')) || 0;
    setStats({ attempts, completed });
    
    // Load exam history from localStorage
    const storedHistory = localStorage.getItem('quizApp_examHistory');
    if (storedHistory) {
      setExamHistory(JSON.parse(storedHistory));
    }
  };

  // Load data on initial mount
  useEffect(() => {
    loadDataFromStorage();
  }, []);

  // Chart data configuration for line chart of exam history
  const chartData = {
    labels: examHistory.slice(-20).map((exam, index) => `${index + 1}`),
    datasets: [
      {
        label: 'Wynik',
        data: examHistory.slice(-20).map(exam => exam.scorePercentage),
        borderColor: '#334119',
        backgroundColor: 'rgba(83, 83, 53, 0.3)',
        tension: 0.3,
        fill: true,
        pointHoverRadius: 7
      }
    ]
  };

  // Chart options
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: false,
        min: 0,
        max: 100,
        title: {
          display: false,
          text: 'Wynik (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Egzaminy'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Score: ${context.parsed.y}%`;
          }
        }
      },
      legend: {
        display: false,
        position: 'top',
      },
      title: {
        display: false ,
        text: 'Wyniki ostatnich 10 egzaminów'
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };
  
  // Clear all data
  const clearData = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('quizApp_')) {
        localStorage.removeItem(key);
      }
    });
    setStats({ attempts: 0, completed: 0 });
    setExamHistory([]);
    alert('Dane zostały wyczyszczone!');
  };

  // Start quiz with selected question set
  const startQuiz = (questionCount) => {
    setSelectedSet(questionCount);
  };

  // Handle quiz completion or return to main website
  const handleQuizComplete = () => {
    // Important change here: We now reload data from localStorage
    // when returning from QuizApp
    loadDataFromStorage();
    setSelectedSet(null);
  };
  
  if (selectedSet) {
    return <QuizApp questionCount={selectedSet} onComplete={handleQuizComplete} />;
  }

  // Define styles for main content, header, and footer to ensure they're not affected by index.css
  const mainContentStyle = {
    backgroundColor: '#6b6b47', // bg-earth-300 equivalent
    backgroundImage: 'none', // Override any background image
  };

  const headerStyle = {
    backgroundColor: '#334119', // forest-500 equivalent
    backgroundImage: 'none',
  };

  const ctaStyle = {
    backgroundColor : '#334119',
    
  }

  const footerStyle = {
    backgroundColor: '#32440f', // forest-700 equivalent
    backgroundImage: 'none',
  };

  const buttonStyle = {
    backgroundColor : '#32440f',
    hover : '##003300'
  }

  const clearButtonStyle = {
    backgroundColor : '604020'
  }

  

  return (
    <div className="text-gray-800" style={mainContentStyle}>
      {/* Header */}
      <header className="text-white px-4 py-3 shadow-lg" style={headerStyle}>
        <div className="container mx-auto flex flex-col items-center">
            <div style={{display: "inline"}}>
                <img src={boruskLogo} alt="Logo Klubu Strzeleckiego" className="h-20 mr-5" />
            </div>
            <div className="mb-4 text-center" style={{display: "inline"}}>
                <h1 className="text-4xl font-bold tracking-wider">KSK BORSUK</h1>
            </div>
            <nav className="mb-4">
                <ul className="flex flex-wrap justify-center gap-4 md:gap-8">
                    <li><a href="/" className="text-2xl hover:text-yellow-300 transition-colors duration-300">O nas</a></li>
                    <li><a href="#" className="text-2xl hover:text-yellow-300 transition-colors duration-300">Dołącz</a></li>
                    <li><a href="#" className="text-2xl hover:text-yellow-300 transition-colors duration-300">Szkolenia</a></li>
                    <li><a href="/nauka/" className="text-2xl hover:text-yellow-300 transition-colors duration-300">Nauka</a></li>
                    <li><a href="#" className="text-2xl hover:text-yellow-300 transition-colors duration-300">Kalendarz</a></li>
                    <li><a href="#" className="text-2xl hover:text-yellow-300 transition-colors duration-300">Imprezy</a></li>
                </ul>
            </nav>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4" style={ctaStyle}>
                <a href="mailto:ksk.borsuk@gmail.com" className=" hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm transition-colors duration-300" style={ctaStyle}>
                    Napisz do nas
                </a>
                <a href="tel:+48506983203" className=" hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm transition-colors duration-300">
                    Zadźwoń do nas
                </a>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">KSK BORSUK WITA!</h2>
          <p className="mb-4">
            Egzamin w WPA Gdańsk na pozwolenie kolekcjonerskie składa się z 20 pytań.
            Żeby zdać egzamin należy odpowiedzieć na conajmniej 18 z nich poprawnie.
          </p>
          <p className="mb-4">
            Dlatego każdy egzamin w którym osiągniesz conajmniej 90% uznajemy za zdany,
            pozostałe niestety nie.
          </p>
          <p>
            Nasza aplikacja opiera się na upublicznionej bazie pytań ze strony WPA Gdańsk.
            Skutecznej nauki i powodzenia na egzaminie!
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Twoje dotychczasowe osiągnięcia</h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">PRÓBY</p>
                <p className="text-3xl">{stats.attempts}</p>
              </div>
              <div>
                <p className="font-semibold">ZDANE</p>
                <p className="text-3xl">{stats.completed}</p>
              </div>
              <div>
                <p className="font-semibold">ŚREDNI WYNIK</p>
                <p className="text-3xl">
                  {examHistory.length > 0 
                    ? `${(examHistory.reduce((sum, exam) => sum + exam.scorePercentage, 0) / examHistory.length).toFixed(1)}%` 
                    : '0.0%'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Wyniki ostatnich egzaminów</h3>
            <div style={{ height: '300px' }}>
              {examHistory.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-center">
                    Brak danych do wyświetlenia. Ukończ swój pierwszy egzamin, aby zobaczyć wykres.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Question Set Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 text-center">Wybierz zestaw testowy</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[20, 50, 100, 200].map((count) => (
            <button style={buttonStyle}
              key={count}
              onClick={() => startQuiz(count)}
              className="bg-forest-500 hover:#003300 text-white py-3 px-4 rounded-md transition-colors"
            >
              {count} pytań
            </button>
            ))}
          </div>
        </div>

        {/* Clear Data Button */}
        <div className="text-center mb-8">
          <button
            onClick={clearData}
            className="bg-red-600 hover:bg-amber-700 text-white py-2 px-6 rounded-full transition-colors"
            
          >
            WYCZYŚĆ DANE
          </button>
        </div>
        
       
        
        {/* Call to Action Section */}
        <section class="cta py-12 px-4 bg-forest-500 text-white" >
        <div class="container mx-auto text-center">
            <h2 class="text-3xl font-bold mb-6">Dołącz do nas</h2>
            <p class="max-w-2xl mx-auto mb-8 text-lg">Zostań członkiem KSK BORSUK i korzystaj z naszych obiektów, szkoleń i wydarzeń. Oferujemy różne pakiety członkowskie dopasowane do Twoich potrzeb.</p>
            <a href="#" class="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 rounded-full text-lg transition-colors duration-300">
                Dowiedz się więcej
            </a>
        </div>
    </section>
      </main>

      {/* Footer */}
      <footer className="text-white py-8 px-4" style={footerStyle}>
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <img src={boruskLogo} alt="Logo Klubu Strzeleckiego" className="h-20 mr-5" />
              <p>&copy; 2025 KSK Borsuk. Wszelkie prawa zastrzeżone.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <div>
                <h3 className="text-lg font-bold mb-2">Kontakt</h3>
                <p className="mb-1">Email: ksk.borsuk@gmail.com</p>
                <p>Tel: +48 506 983 203</p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-2">Śledź nas</h3>
                <div className="flex gap-4">
                  <a href="https://www.facebook.com/profile.php?id=61556571794422" className="text-white hover:text-yellow-300">Facebook</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainWebsite;