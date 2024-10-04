import { useLoaderData } from "@remix-run/react";
import { EditIcon, DeleteIcon } from "@shopify/polaris-icons";
import {
  IndexTable,
  LegacyCard,
  Button,
  Text,
  FormLayout,
  TextField,
  Page,
  ButtonGroup,
} from "@shopify/polaris";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { useState, useEffect } from "react";

export async function loader({ request, params }) {
  try {
    let discounts = await fetch("https://www.kitchenfactoryonline.com.au/shopifyapp/api/discount");
    discounts = await discounts.json();
    return {
      status: "success",
      data: discounts.data ? discounts.data : [],
    };
  } catch (error) {
    return {
      status: "failed",
      error,
      data: [],
    };
  }
}

export default function PageComponent() {
  const ldata = useLoaderData();
  const [orders, setOrders] = useState(ldata.data);
  const [collection, setCollection] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    cabinetmaker: 0,
    trade: 0,
    showroom: 0,
    retail: 0,
  });

  const resourceName = {
    singular: "discount",
    plural: "discounts",
  };

  // Handle form field change
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch the latest discounts data from the server
  const fetchData = async () => {
    try {
      const response = await fetch("https://www.kitchenfactoryonline.com.au/shopifyapp/api/discount");
      const data = await response.json();
      if (data.status === "success") {
        setOrders(data.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  // Add a new discount
  const handleAddClick = async () => {
    const selected = await shopify.resourcePicker({ type: 'collection', multiple: false });
    
    const selectedCollectionTitle = selected[0].title;

    const existingDiscount = orders.find((order) => order.collection === selectedCollectionTitle);
    
    if (existingDiscount) {
      shopify.toast.show(`Discount for the collection "${selectedCollectionTitle}" already exists.`);
      return; 
    }

    
    setCollection(selected[0].title);
    setIsEditing(false);
    setFormData({
      cabinetmaker: 0,
      trade: 0,
      showroom: 0,
      retail: 0,
    });
    shopify.modal.show('my-modal');
  };


  const handleEditClick = (order) => {
    setIsEditing(true);
    setEditingRow(order.id);
    setFormData({
      collection: collection || order.collection,
      cabinetmaker: order.cabinetmaker,
      trade: order.trade,
      showroom: order.showroom,
      retail: order.retail,
    });
    shopify.modal.show('my-modal');
  };

 
  const handleSave = async () => {
    const method = isEditing ? 'PUT' : 'POST';
    const apiUrl = isEditing
      ? `https://www.kitchenfactoryonline.com.au/shopifyapp/api/discount`
      : `https://www.kitchenfactoryonline.com.au/shopifyapp/api/discount`;

    const req_data = method === "PUT" ? {
      id: editingRow,
      collection: formData.collection,
      cabinetmaker: formData.cabinetmaker,
      trade: formData.trade,
      showroom: formData.showroom,
      retail: formData.retail,
    } : {
      collection: collection,
      cabinetmaker: formData.cabinetmaker,
      trade: formData.trade,
      showroom: formData.showroom,
      retail: formData.retail,
    };

    try {
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req_data),
      });

      const result = await response.json();
      if (response.ok) {
        await fetchData(); // Fetch data again after saving a discount
      } else {
        console.error(result.error || 'Failed to save');
      }
    } catch (error) {
      console.error("Error saving discount:", error);
    }

    shopify.modal.hide('my-modal');
  };


  const handleDeleteClick = async (id) => {
    const apiUrl = `https://www.kitchenfactoryonline.com.au/shopifyapp/api/discount?id=${id}`;
    try {
      let response = await fetch(apiUrl, {
        method: 'DELETE',
      });
      response = await response.json();
      if (response.status == "success") {
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
        shopify.toast.show("Discount deleted successfully");
      } else {
        shopify.toast.show("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting discount:", error);
      shopify.toast.show("An error occurred while deleting the discount");
    }
  };
  

  console.log(orders)
  const rowMarkup = orders.map(
    ({ id, collection, cabinetmaker, trade, showroom, retail }, index) => (
      <IndexTable.Row id={id} key={id} position={index}>
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {collection}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{cabinetmaker}</IndexTable.Cell>
        <IndexTable.Cell>{trade}</IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" numeric>
            {showroom}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{retail}</IndexTable.Cell>
        <IndexTable.Cell>
          <ButtonGroup>
            <Button icon={EditIcon} onClick={() => handleEditClick({ id, collection, cabinetmaker, trade, showroom, retail })} />
            <Button icon={DeleteIcon} onClick={() => handleDeleteClick(id)} tone="critical" />
          </ButtonGroup>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <Page
      title="Manage Discounts"
      primaryAction={
        <Button
          variant="primary"
          onClick={handleAddClick}
        >
          Add Discount
        </Button>
      }
    >
      <LegacyCard>
        <IndexTable
          resourceName={resourceName}
          itemCount={orders.length}
          selectable={false}
          headings={[
            { title: "Collection" },
            { title: "Cabinetmaker" },
            { title: "Trade" },
            { title: "Showroom" },
            { title: "Retail/Guest" },
            { title: "Actions" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </LegacyCard>

      <Modal id="my-modal">
        <div style={{ padding: "4%" }}>
          <FormLayout>
            <FormLayout.Group>
              <TextField
                type="number"
                label="Cabinet Maker"
                value={formData.cabinetmaker}
                onChange={(value) => handleFormChange("cabinetmaker", value)}
                autoComplete="off"
              />
              <TextField
                type="number"
                label="Trade"
                value={formData.trade}
                onChange={(value) => handleFormChange("trade", value)}
                autoComplete="off"
              />
            </FormLayout.Group>
            <FormLayout.Group>
              <TextField
                type="number"
                label="Showroom"
                value={formData.showroom}
                onChange={(value) => handleFormChange("showroom", value)}
                autoComplete="off"
              />
              <TextField
                type="number"
                label="Retail/Guest"
                value={formData.retail}
                onChange={(value) => handleFormChange("retail", value)}
                autoComplete="off"
              />
            </FormLayout.Group>
          </FormLayout>
        </div>
        <TitleBar title={isEditing ? `Edit Discount` : `Add Discount on ${collection}`}>
          <button variant="primary" onClick={handleSave}>
            Save
          </button>
          <button onClick={() => shopify.modal.show('my-modal')}>Cancel</button>
        </TitleBar>
      </Modal>
    </Page>
  );
}
