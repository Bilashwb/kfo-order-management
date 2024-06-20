import {ViewIcon} from '@shopify/polaris-icons';
import {
    IndexTable,
    Card,
    Text,
    Button,
    TextField,
} from '@shopify/polaris';
import React, {useState} from 'react';

export default function({data}) {
    const [searchQuery, setSearchQuery] = useState('');

    const resourceName = {
        singular: 'customer',
        plural: 'customers',
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
    };

    const filteredData = data.filter(({node}) =>
        node.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.phone && node.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (node.defaultAddress && node.defaultAddress.city && node.defaultAddress.city.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const rowMarkup = filteredData.map(
        ({node, id}, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {node.displayName}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{node.email}</IndexTable.Cell>
                <IndexTable.Cell>{node.phone}</IndexTable.Cell>
                <IndexTable.Cell>{node.verifiedEmail ? "Yes" : "No"}</IndexTable.Cell>
                <IndexTable.Cell>{node.metafield ? node.metafield.value : ""}</IndexTable.Cell>
                <IndexTable.Cell>{node.defaultAddress ? node.defaultAddress.city : ""}</IndexTable.Cell>
                <IndexTable.Cell><Button icon={ViewIcon}></Button></IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (
        <Card>
            <div style={{padding:'1%'}}>
            <TextField
                placeholder="Search customers"
                value={searchQuery}
                onChange={handleSearchChange}
                clearButton
                onClearButtonClick={() => setSearchQuery('')}
            />
            </div>
            <IndexTable
                resourceName={resourceName}
                itemCount={filteredData.length}
                selectable={false}
                headings={[
                    {title: 'Name'},
                    {title: 'Email'},
                    {title: 'Phone'},
                    {title: 'Email Verified'},
                    {title: 'Customer Type'},
                    {title: 'Address'},
                    {title: 'View'},
                ]}
            >
                {rowMarkup}
            </IndexTable>
        </Card>
    );
}
