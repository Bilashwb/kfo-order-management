import React, { useState, useEffect } from 'react';
import { Button, Card, InlineGrid, Text, TextField, Tag, Link } from "@shopify/polaris";
import { DeleteIcon } from '@shopify/polaris-icons';

const DraftLineItem = ({ item, onUpdateQuantity, onDelete }) => {
  // Initialize state for quantity
  const [quantity, setQuantity] = useState(item.quantity);

  // Update quantity state if the item quantity changes
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  return (
    <div style={{ marginTop: '2%' }}>
      <Card>
        <InlineGrid columns={2}>
          <div>
            {item.product ? (
              <Link url="">{item.title}</Link>
            ) : (
              <Text>{item.title}</Text>
            )}
            <Text tone="magic">${item.originalUnitPriceSet.presentmentMoney.amount} X {quantity} = ${item.originalTotalSet.presentmentMoney.amount}</Text>
        
          </div>
        
          <div>
          {item.customAttributes.length > 0 && (
              <>
                <Text fontWeight="bold">{item.customAttributes[0].key}:</Text>
                <Text>{item.customAttributes[0].value}</Text>
              </>
            )}
          </div>
        </InlineGrid>
      </Card>
    </div>
  );
};

export default DraftLineItem;
