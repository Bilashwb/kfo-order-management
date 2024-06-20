import { useState } from "react";
import {
  Card,
  TextField,
  Button,
  TextContainer,
  Avatar,
  Text,
} from "@shopify/polaris";

export default function MessageBox() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMessages = [
      ...messages,
      { sender: "user", text: newMessage.trim() },
    ];
    setMessages(newMessages);
    setNewMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(newMessage);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: botResponse },
      ]);
    }, 1000);
  };

  const generateBotResponse = (userMessage) => {
    return "Hello I am Admin. You said: " + userMessage;
  };

  return (
    <Card sectioned>
      <TextContainer>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
        </div>
      </TextContainer>
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <TextField
          value={newMessage}
          onChange={(value) => setNewMessage(value)}
          placeholder="Type a message"
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <Button primary onClick={handleSendMessage}>
          Send
        </Button>
      </div>
    </Card>
  );
}

function Message({ message }) {
  const isUser = message.sender === "user";
  const alignment = isUser ? "flex-end" : "flex-start";

  return (
    <div style={{ display: "flex", justifyContent: alignment, marginBottom: "10px" }}>
      {!isUser && <Avatar customer size="sm" />}
   
        <Text variant="bodyMd">{message.text}</Text>
     
      {isUser && <Avatar source="https://avatars.githubusercontent.com/u/57936" customer size="sm" />}
    </div>
  );
}
