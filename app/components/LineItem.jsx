import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useState, useEffect, useCallback } from "react";
import { ChatIcon } from "@shopify/polaris-icons";
import {
  CalloutCard,
  Select,
  FormLayout,
  TextField,
  Card,
  InlineGrid,
  Text,
  InlineStack,
  Collapsible,
  Button,
  Spinner,
} from "@shopify/polaris";
import { EditIcon } from "@shopify/polaris-icons";
import MessageBox from "./MessageBox";

export default function LineItem(props) {
  const shopify = useAppBridge();
  const [input, setInput] = useState({
    inventoryType: "",
    status: "",
    spd: "",
    ris: "",
    srd: "",
    id:null,
  });




  const [comments, setComments] = useState([]);
  const [info, setInfo] = useState(null)
  const [data, setData] = useState(null)


  useEffect(() => {
    setComments(props.comments.filter(item => item.lineItemId === props.data.id.substring(23)));
    setInfo(props.infos.filter(item => item.lineItemId === props.data.id.substring(23)));
    setData(props.data);
    let tmp=props.infos.filter(item => item.lineItemId === props.data.id.substring(23));
     if(tmp.length){
      setInput({
       inventoryType: tmp[0].inventoryType,
       status: tmp[0].status,
       spd:tmp[0].promiseDate    ,
       ris: tmp[0].reciveStock,
       srd: tmp[0].readyDate,    
       id:tmp[0].id,
      }) 
     }
  
  }, [])
  


  
  const updateStatus = useCallback(() => {
    console.log("Update Calll")
    let reqdata = JSON.stringify({
      lineItemId: data.id.substring(23),
      inventoryType: input.inventoryType,
      orderId: props.orderId,
      status: input.status,
      promiseDate: input.spd,
      reciveStock: input.ris,
      readyDate: input.srd,
      id:input.id
    });

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: reqdata,
    };
    fetch("(https://www.kitchenfactoryonline.com.au/shopifyapp/api/lineitem", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result)
        shopify.modal.hide("m" + data.id.substr(23))
        shopify.toast.show("Data Updated");
      })
      .catch((error) => console.error(error));
  });



  const saveStatus = useCallback(() => {

    let reqdata = JSON.stringify({
      lineItemId: data.id.substring(23),
      inventoryType: input.inventoryType,
      orderId: props.orderId,
      status: input.status,
      promiseDate: input.spd,
      reciveStock: input.ris,
      readyDate: input.srd,
    });

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: reqdata,
    };
    fetch("https://www.kitchenfactoryonline.com.au/shopifyapp/api/lineitem", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        shopify.modal.hide("m" + data.id.substr(23))
        shopify.toast.show("Status Updated");
      })
      .catch((error) => console.error(error));
  });

  const [open, setOpen] = useState(false);

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
     {
      data?<>
       <Card roundedAbove="sm">
        <InlineGrid columns={"2"} gap={"800"}>
          <Card>
            <Text>{data.title}</Text>
            <Text>{data.variant ? data.variant.sku : ""}</Text>
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
            Items Comments {comments.length?<span style={{color:"blue"}}>( {comments.length} )</span>:""}
          </Button>
          <Collapsible
            open={open}
            id="basic-collapsible"
            transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
            expandOnPrint
          >
            <MessageBox data={comments} lineItemId={props.data.id.substring(23)}  orderId={props.orderId}/>
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
          {
            input.id?<button variant="primary" onClick={()=>{
              console.log("btnnn")
              updateStatus()}}>
            Update
          </button>:<button variant="primary" onClick={()=>{saveStatus()}}>
            Save
          </button>
          }
        </TitleBar>
      </Modal>
      </>:<Spinner/>
     }
    </div>
  );
}
