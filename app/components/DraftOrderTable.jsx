import {
    IndexTable,
    LegacyCard,
    Text,
    Badge,
    Button,
    Link,
  } from '@shopify/polaris';
  import React from 'react';
  import {
    ViewIcon
  } from '@shopify/polaris-icons';
  export default function DraftOrderTable({data}) {
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
          <IndexTable.Cell>{ new Date(node.createdAt).toISOString().slice(0, 10).split('-').reverse().join('-')}</IndexTable.Cell>
          <IndexTable.Cell>{node.email}</IndexTable.Cell>
          <IndexTable.Cell>
            
            <Badge progress="incomplete">Open</Badge> 
            
          </IndexTable.Cell>
       
          <IndexTable.Cell>{node.totalPriceSet.presentmentMoney.amount} {node.totalPriceSet.presentmentMoney.currencyCode} </IndexTable.Cell>
          <IndexTable.Cell>
            <IndexTable.Cell><Button icon={ViewIcon} url={'/app/draft/'+node.id.match(/\d+/)[0]}></Button></IndexTable.Cell>
          </IndexTable.Cell>

        </IndexTable.Row>
      ),
    );
  
    return (
      <LegacyCard>
        <IndexTable
        selectable={false}
          resourceName={resourceName}
          itemCount={data.length}
          headings={[
            {title: 'Draft order'},
            {title: 'Date'},
            {title: 'Customer'},
            {title: 'Status'},
            {title: 'Total'},
            {title: 'View'},
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </LegacyCard>
    );
  }


  