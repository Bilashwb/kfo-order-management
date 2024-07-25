import React, { useEffect, useState } from 'react';
import { Card, List, Spinner, TextField, Button, InlineStack, FormLayout } from '@shopify/polaris';

export default function (props) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMessages(props.data)
  //  fetchMessages();
  }, []);

  

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);

    try {
      // Replace with your API endpoint to send messages
      const response = await fetch('https://www.kitchenfactoryonline.com.au/shopifyapp/api/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          lineItemId:props.lineItemId,
          orderId:props.orderId,
          admin: "1", 
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Fetch messages again to include the new message
      } else {
        console.error('Error sending message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card   roundedAbove=''>
      {loading ? (
        <Spinner  size="large" />
      ) : (
        <>
          <List type="bullet">
            {messages.map(message => (
              <List.Item key={message.id}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>{message.admin === "1" ? 'Admin' : 'User'}:</strong> {message.message}
                </div>
                <div style={{ fontSize: '12px', color: 'gray' }}>
                  {new Date(message.createdAt).toLocaleString()}
                </div>
              </List.Item>
            ))}
          </List>
          <div style={{ marginTop: '20px' }}>
         
             
              <FormLayout>
              <TextField

label="New Message"
value={newMessage}
onChange={(value) => setNewMessage(value)}
autoComplete="off"
multiline={3}
/>


<Button onClick={handleSendMessage} loading={sending} variant='primary'>Send</Button>

              </FormLayout>
          </div>
        </>
      )}
    </Card>
  );
};


