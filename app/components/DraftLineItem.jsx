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
            <Text tone="magic">${item.originalUnitPriceSet.presentmentMoney.amount}</Text>
            {item.customAttributes.length > 0 && (
              <>
                <Text fontWeight="bold">{item.customAttributes[0].key}:</Text>
                <Text>{item.customAttributes[0].value}</Text>
              </>
            )}
            {item.appliedDiscount && (
              <div style={{ marginTop: '10px' }}>
                <Text>
                  <Tag disabled>{item.appliedDiscount.title || 'Custom Discount'}</Tag>
                  {item.appliedDiscount.description && `${item.appliedDiscount.description}: `}
                  {item.appliedDiscount.value}% (- $ {item.appliedDiscount.amountSet.presentmentMoney.amount})
                </Text>
              </div>
            )}
          </div>

          <div>
            <InlineGrid columns={3} gap={"600"}>
              <TextField
                label="Quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
              />
              <div>
                <Text>Total Price</Text>
                <Text>${item.originalTotalSet.presentmentMoney.amount}</Text>
              </div>
              <div style={{ padding: '4%', marginTop: '10%' }}>
                <InlineGrid columns={2} gap={"500"}>
                  <Button size="micro" variant="primary" onClick={()=>{onUpdateQuantity(item.id, quantity)}}>Save</Button>
                  <Button size="micro" icon={DeleteIcon} onClick={() => onDelete(item.id)} destructive></Button>
                </InlineGrid>
              </div>
            </InlineGrid>
          </div>
        </InlineGrid>
      </Card>
    </div>
  );
};

export default DraftLineItem;
