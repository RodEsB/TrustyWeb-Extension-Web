import { useState, useEffect } from 'react';
import axios from 'axios';
import './Chat.css';

interface ChatProps {
    currentUrl: string;
    navigateToHome: () => void;
    
}

const Chat: React.FC<ChatProps> = ({ navigateToHome, currentUrl }) => {
    const [messages, setMessages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessageToGPT = async (message: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4o",
                messages: [{ role: "user", content: message }]
            }, {
                headers: {
                    'Authorization': `Bearer sk-proj-jIXCoSxTBL8elthYMyw4T3BlbkFJqK01mC9hsf7K23U2q3pc`
                }
            });
            const botMessage = response.data.choices[0].message.content;
            setMessages([`Resumen: ${botMessage}`]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, 'Error: Unable to fetch response from ChatGPT']);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUrl) {
            sendMessageToGPT(`Dame un resumen en base al titulo de la URL ${currentUrl}`);
        }
    }, [currentUrl]);

    const handleCopyToClipboard = () => {
        const textChat = document.querySelector('.text-chat') as HTMLElement;
        if (textChat) {
            navigator.clipboard.writeText(textChat.innerText)
                .then(() => alert('Texto copiado al portapapeles'))
                .catch(err => console.error('Error al copiar texto:', err));
        }
    };

    return (
        <div>
            <div className="text-chat" onClick={handleCopyToClipboard}>
                <div className="header">Este es el resumen</div>
                {isLoading && <p className="loading">Cargando...</p>}
                <div>
                    {messages.map((msg, index) => (
                        <p key={index} className="message">{msg}</p>
                    ))}
                </div>
            </div>
            <button onClick={navigateToHome}>Volver a la página principal</button>
        </div>
    );
};

export default Chat;
