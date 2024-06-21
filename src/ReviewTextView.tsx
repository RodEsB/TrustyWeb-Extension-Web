import React, { useState } from 'react';
import './ReviewTextView.css';
import axios from 'axios';

interface ReviewTextViewProps {
  navigateToHome: () => void;
  initialText?: string;
}

const splitterB = ({ gptResponse = ""}) => {
  const response = gptResponse.split('1. '); // hh || 1. a 2. b 3. c || 1. d 2. f 3. g
  const res1 = response[1].split('2. '); // hh || 1. a || 2. b 3. c || 1. d 2. f 3. g
  const res2 = res1[1].split('3. '); // hh || 1. a || 2. b || 3. c || 1. d 2. f 3. g
  const res3 = response[2].split('2. '); // hh || 1. a 2. b 3. c || 1. d || 2. f 3. g
  const res4 = res3[1].split('3. '); // hh || 1. a 2. b 3. c || 1. d || 2. f || 3. g

  const res = ["Fuentes que coinciden",res1[0], res2[0], res2[1],"Fuentes que no coinciden", res3[0], res4[0], res4[1]];

  return res;
}

const GPTResponseComponent = ({ gptResponse = "" }) => {
  // Verificamos si el mensaje es igual al mensaje de error específico
  const errorMessage = "Error: no fue posible conectarse con ChatGPT";

  return (
    <div className="gpt-response">
      {gptResponse === errorMessage ? (
        // Si es el mensaje de error, mostramos el mensaje directamente
        <p>{gptResponse}</p>
      ) : (

        // Si no, dividimos el texto en partes usando un delimitador y mostramos cada parte en un párrafo separado
        splitterB({ gptResponse }).map((part, index) => (
          <p
            key={index}
            style={index === 0 || index === 4
            ? { fontWeight: 'bold', fontSize: '1.5em', textAlign: 'left' }  // Negrita y tamaño grande
            : { textAlign: 'justify' }}                                     // Justificado para otros índices
            >
          {part}
           </p>
        ))
      )}
    </div>
  );
};

const ReviewTextView: React.FC<ReviewTextViewProps> = ({ navigateToHome, initialText = '' }) => {
  const [textBoxContent, setTextBoxContent] = useState(initialText);
  const [gptResponse, setGptResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextBoxContent(e.target.value);
  };

  const sendMessageToGPT = async () => {
    if (!textBoxContent.trim()) {
      setGptResponse('Inserta texto primero');
      return;
    }

    const predefinedText = "porfavor proporciona solamente 3 ligas a fuentes reales en la web que hablen de este texto y 3 ligas que digan informacion diferente a este texto . quiero que sigas el siguiente formato, titulo en el idioma original, dominio de donde viene y la liga de la noticia en especifico, no la de la pagina de inicio (Porfavor, no hagas un hipervinculo, pon el URL completo) : ";
    const fullText = predefinedText + textBoxContent; // Combine the predefined text with user input

    setLoading(true);
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4",  // Make sure this is the correct model name
        messages: [{ role: "user", content: fullText }] // Send the combined content of the text box
      }, {
        headers: {
          'Authorization': 'Bearer sk-proj-jIXCoSxTBL8elthYMyw4T3BlbkFJqK01mC9hsf7K23U2q3pc' // Replace YOUR_API_KEY with your actual OpenAI API key
        }
      });

      const botMessage = response.data.choices[0].message.content;
      setGptResponse(botMessage);
    } catch (error) {
      console.error('Error al enviar el mensaje:');
      setGptResponse('Error: no fue posible conectarse con ChatGPT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-container">
      <div className="header">
        <h3>Copia tu texto debajo, nosotros encontraremos otras fuentes.</h3>
      </div>
      <textarea
        className="text-box"
        value={textBoxContent}
        onChange={handleTextChange}
        rows={5}
      />
      <button onClick={sendMessageToGPT} disabled={loading}>
        {loading ? 'Buscando...' : 'Iniciar búsqueda'}
      </button>
      {gptResponse && (
        <div className="gpt-response">
          <GPTResponseComponent gptResponse={gptResponse} />
        </div>
      )}
      <button onClick={navigateToHome}>Volver a la página principal</button>
    </div>
  );
};

export default ReviewTextView;
