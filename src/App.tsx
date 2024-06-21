import React, { useEffect, useState } from 'react';
import protegerIcon from './assets/proteger.png';
import cancelarIcon from './assets/cancelar.png';
import './App.css';
import LogoIcon from './assets/Logo fondo.png';
import ReviewTextView from './ReviewTextView';
import Chat from './Chat.tsx';

const App: React.FC = () => {
  const [icon, setIcon] = useState(protegerIcon);
  const [logoIcon] = useState(LogoIcon);
  const [currentView, setCurrentView] = useState('home');
  const [isSourceViable, setIsSourceViable] = useState<boolean | null>(null);
  const [author, setAuthor] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [sources, setSources] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>('');

  // Listas de URLs y TLDs confiables y no confiables
  const trustedUrlPrefixes = [
    'https://www.elfinanciero.com.mx',
    'https://mexico.as.com',
    'https://scielo.org',
    'https://cnnespanol.cnn.com/',
  ] as const;

  const untrustedUrlPrefixes = [
    'https://example.com/untrusted1',
    'https://example.com/untrusted2',
  ];

  const trustedTLDs = ['.org', '.edu', '.gob'];

  const urlMetadata: { [key in typeof trustedUrlPrefixes[number]]: { author: string; sources: string; date: string } } = {
    'https://www.elfinanciero.com.mx': {
      author: 'Grupo Multimedia Lauman',
      sources: 'El Financiero',
      date: "18 / 06 / 2024"
    },
    'https://mexico.as.com': {
      author: 'AS México Staff',
      sources: 'AS México',
      date: "05 / 03 / 2023"
    },
    'https://scielo.org': {
      author: 'SciELO',
      sources: 'Scientific Electronic Library Online',
      date: "30 / 05 / 2024"
    },
    'https://cnnespanol.cnn.com/': {
      author: 'Cable News Network',
      sources: 'CNN en Español',
      date: "16 / 12 / 2023"
    }
  };

  useEffect(() => {
    if (chrome.tabs && chrome.tabs.query) {
      const queryOptions = { active: true, lastFocusedWindow: true };
      chrome.tabs.query(queryOptions, (tabs) => {
        const [activeTab] = tabs;
        if (activeTab.url) {
          setCurrentUrl(activeTab.url); // Set the current URL
          verifySource(activeTab.url);
        } else {
          setIsSourceViable(false);
          setIcon(cancelarIcon);
        }
      });
    }
  }, []);

  const verifySource = (url: string) => {
    const trustedPrefix = trustedUrlPrefixes.find(prefix => url.startsWith(prefix));
    const untrustedPrefix = untrustedUrlPrefixes.find(prefix => url.startsWith(prefix));
    const trustedTLD = trustedTLDs.find(tld => url.includes(tld));

    if (trustedPrefix) {
      // URL confiable por prefijo
      setIsSourceViable(true);
      setIcon(protegerIcon);
      const metadata = urlMetadata[trustedPrefix];
      setAuthor(metadata.author);
      setSources(metadata.sources);
      setDate(metadata.date);
    } else if (untrustedPrefix) {
      // URL no confiable por prefijo
      setIsSourceViable(false);
      setIcon(cancelarIcon);
      setAuthor('');
      setSources('');
      setDate('');
    } else if (trustedTLD) {
      // URL confiable por TLD
      setIsSourceViable(true);
      setIcon(protegerIcon);
      setAuthor('Dominio confiable');
      setSources('Fuente confiable basada en TLD');
      setDate('Fecha desconocida');
    } else {
      // Fuente desconocida
      setIsSourceViable(null);
      setIcon(cancelarIcon);
      setAuthor('');
      setSources('');
      setDate('');
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <div className='header'>
              <div className="logo-icon">
                <img src={logoIcon} alt="Logo icon" />
              </div>
              <div className='circle'></div>
              <div className='circle2'></div>
              <div className='circle3'></div>
              <h1>TrustyWeb</h1>
            </div>
            <div className="card">
              <div className="shield">
                <div className="shield-icon">
                  <img src={icon} alt="Icon" />
                </div>
                <h2>Fuente {isSourceViable === null ? 'Desconocida' : isSourceViable ? 'Verificada' : 'No Verificada'}</h2>
                <div className="info-box">
                  <p>Autor: {author}</p>
                  <p>Fuente: {sources}</p>
                  <p>Fecha: {date}</p>
                </div>
              </div>
              <button className="review-button" onClick={() => setCurrentView('review')}>
                Revisar el texto
              </button>
              <button className="review-button" onClick={() => setCurrentView('chat')}>
                Consultar un resumen
              </button>
            </div>
          </>
        );
      case 'review':
        return <ReviewTextView navigateToHome={() => setCurrentView('home')} />;
      case 'chat':
        return <Chat currentUrl={currentUrl} navigateToHome={() => setCurrentView('home')} />;
      default:
        return <div>View not found</div>;
    }
  };

  return <div className="App">{renderView()}</div>;
};

export default App;
