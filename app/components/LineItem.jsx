import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";
import { ChatIcon } from "@shopify/polaris-icons";
import {
  BlockStack,
  CalloutCard,
  Thumbnail,
  Select,
  FormLayout,
  TextField,
  Card,
  InlineGrid,
  Text,
  InlineStack,
  Collapsible,
  Button,
} from "@shopify/polaris";
import { EditIcon } from "@shopify/polaris-icons";
import MessageBox from "./MessageBox";

export default function LineItem({ data }) {
  const shopify = useAppBridge();
  const [input, setInput] = useState({
    inventoryType: "",
    status: "",
    spd: "",
    ris: "",
    srd: "",
  });
  const [open, setOpen] = useState(true);

  const handleToggle = useCallback(() => setOpen((open) => !open), []);
  const handleInputChange = (field) => (value) => {
    setInput((prevInput) => ({
      ...prevInput,
      [field]: value,
    }));
  };

  const getStatusOptions = (inventoryType) => {
    switch (inventoryType) {
      case "Buy-In Item":
        return [
          { label: "To Be Ordered", value: "To Be Ordered" },
          { label: "On Order", value: "On Order" },
          {
            label: "Stock Received from Supplier",
            value: "Stock Received from Supplier",
          },
          { label: "Not Available", value: "Not Available" },
          { label: "In Stock", value: "In Stock" },
        ];
      case "Buy-In Service":
        return [
          { label: "Awaiting Fabrication", value: "Awaiting Fabrication" },
          { label: "Sent to Supplier", value: "Sent to Supplier" },
          { label: "Received from Supplier", value: "Received from Supplier" },
        ];
      case "Factory Service":
        return [
          { label: "Awaiting Materials", value: "Awaiting Materials" },
          { label: "In Progress", value: "In Progress" },
        ];
      default:
        return [];
    }
  };

  return (
    <div style={{ margin: "1%" }}>
      <Card roundedAbove="sm">
        <InlineGrid columns={"2"} gap={"800"}>
          <Card>
            <Thumbnail
              source={
                data.variant.image
                  ? data.variant.image.url
                  : data.product.featuredImage?data.product.featuredImage.url:""
              }
            />
            <Text>
              {data.product.title} {data.variant.title}
            </Text>
            <Text>
              {data.quantity} X ${" "}
              {data.originalUnitPriceSet.presentmentMoney.amount} =${" "}
              {data.originalTotalSet.presentmentMoney.amount}
            </Text>
          </Card>
          <div>
            <CalloutCard
              primaryAction={{
                icon: EditIcon,
                onAction: () => {
                  shopify.modal.show("m" + data.id.substr(23));
                },
              }}
            >
              <InlineStack align="space-between" gap={"800"} direction="row">
                <Text tone="critical" variant="bodySm" fontWeight="bold">
                  Item Inventory Type
                </Text>
                <Text tone="success" variant="bodySm" fontWeight="bold">
                  {input.inventoryType}
                </Text>
              </InlineStack>
              <InlineStack align="space-between" gap={"800"} direction="row">
                <Text tone="critical" variant="bodySm" fontWeight="bold">
                  Item Status
                </Text>
                <Text tone="success" variant="bodySm" fontWeight="bold">
                  {input.status}
                </Text>
              </InlineStack>

              <InlineStack align="space-between" gap={"800"} direction="row">
                <Text tone="critical" variant="bodySm" fontWeight="bold">
                  Supplier Promise Date
                </Text>
                <Text tone="success" variant="bodySm" fontWeight="bold">
                  {input.spd}
                </Text>
              </InlineStack>

              <InlineStack align="space-between" gap={"800"} direction="row">
                <Text tone="critical" variant="bodySm" fontWeight="bold">
                  Recived In Stock
                </Text>
                <Text tone="success" variant="bodySm" fontWeight="bold">
                  {input.ris}
                </Text>
              </InlineStack>
              <InlineStack align="space-between" gap={"800"} direction="row">
                <Text tone="critical" variant="bodySm" fontWeight="bold">
                  Scheduled Ready Date
                </Text>
                <Text tone="success" variant="bodySm" fontWeight="bold">
                  {input.srd}
                </Text>
              </InlineStack>
            </CalloutCard>
          </div>
        </InlineGrid>
        <div style={{ marginTop: "1%" }}>
          <Button onClick={handleToggle} icon={ChatIcon} variant="secondary">
            Items Comments
          </Button>
          <Collapsible
            open={open}
            id="basic-collapsible"
            transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
            expandOnPrint
          >
            <MessageBox />
          </Collapsible>
        </div>
      </Card>
      <Modal id={"m" + data.id.substr(23)} variant="base">
        <div style={{ padding: "3%" }}>
          <FormLayout>
            <FormLayout.Group>
              <Select
                label="Item Inventory Type"
                options={[
                  { label: "Buy-In Item", value: "Buy-In Item" },
                  { label: "Buy-In Service", value: "Buy-In Service" },
                  { label: "Factory Service", value: "Factory Service" },
                ]}
                value={input.inventoryType}
                onChange={handleInputChange("inventoryType")}
              />
              <Select
                label="Item Status"
                options={getStatusOptions(input.inventoryType)}
                value={input.status}
                onChange={handleInputChange("status")}
              />

              <TextField
                label="Supplier Promise Date"
                type="date"
                value={input.spd}
                onChange={handleInputChange("spd")}
              />
            </FormLayout.Group>
            <FormLayout.Group>
              <TextField
                label="Recived In Stock"
                value={input.ris}
                onChange={handleInputChange("ris")}
                autoComplete="off"
              />
              <TextField
                type="date"
                label="Scheduled Ready Date"
                value={input.srd}
                onChange={handleInputChange("srd")}
                autoComplete="off"
              />
            </FormLayout.Group>
          </FormLayout>
        </div>

        <TitleBar title={"Line Item " + data.id.substr(23)}>
          <button variant="primary" onClick={() => console.log(input)}>
            Save
          </button>
        </TitleBar>
      </Modal>
    </div>
  );
}
