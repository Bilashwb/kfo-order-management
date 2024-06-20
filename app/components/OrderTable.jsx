import {
    ViewIcon
  } from '@shopify/polaris-icons';
import {
    IndexTable,
    Card,
    Text,
    Badge,
    Button,
  } from '@shopify/polaris';
  import React from 'react';
  
  export default function OrderTable({data}) {
    const orders = [
      {
        id: '1020',
        order: '#1020',
        date: 'Jul 20 at 4:34pm',
        customer: 'Jaydon Stanton',
        total: '$969.44',
        paymentStatus: <Badge progress="complete">Paid</Badge>,
        fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
      },
      {
        id: '1019',
        order: '#1019',
        date: 'Jul 20 at 3:46pm',
        customer: 'Ruben Westerfelt',
        total: '$701.19',
        paymentStatus: <Badge progress="partiallyComplete">Partially paid</Badge>,
        fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
      },
      {
        id: '1018',
        order: '#1018',
        date: 'Jul 20 at 3.44pm',
        customer: 'Leo Carder',
        total: '$798.24',
        paymentStatus: <Badge progress="complete">Paid</Badge>,
        fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
      },
    ];
    const resourceName = {
      singular: 'order',
      plural: 'orders',
    };
  

  
    const rowMarkup = data.map(
      (
        {node},
        index,
      ) => (
        <IndexTable.Row
          id={node.id}
          key={node.id}
          position={index}
        >
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {node.name}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{node.createdAt.replace(/[TZ]/g, " ")}</IndexTable.Cell>
          <IndexTable.Cell>{node.customer?node.customer.displayName:"No Customer"}</IndexTable.Cell>
          <IndexTable.Cell>
            <Text >
            $ {node.totalPriceSet.shopMoney.amount}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{node.lineItems.nodes.length}</IndexTable.Cell>
          <IndexTable.Cell>{node.displayFulfillmentStatus}</IndexTable.Cell>
          <IndexTable.Cell><Button icon={ViewIcon} url={'/app/order/'+node.id.match(/\d+/)[0]}></Button></IndexTable.Cell>
        </IndexTable.Row>
      ),
    );
  
    return (
      <Card>
        <IndexTable
          resourceName={resourceName}
          itemCount={data.length}
      
          selectable={false}
          headings={[
            {title: 'Order'},
            {title: 'Date'},
            {title: 'Customer'},
            {title: 'Total'},
            {title: 'Items Count'},
            {title: 'Fulfillment status'},
            {title: 'View'}
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
    );
  }