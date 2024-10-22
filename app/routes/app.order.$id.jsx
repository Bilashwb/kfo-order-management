import { useLoaderData, useActionData,useSubmit } from "@remix-run/react";
import { Card, Page, Button, Collapsible, Layout, InlineGrid, ButtonGroup, Text, TextField, InlineStack } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import OrderLineItem from "../components/OrderLineItem";
import MessageBox from "../components/MessageBox";

const categorizeLineItem = (lineItem) => {
  const productType = lineItem.product?.productType;

  switch (productType) {
    case 'Group A-Board':
      return 'Group A-Board';
    case 'Group C-Hardware':
      return 'Group C-Hardware';
    case 'Group D-Accessories':
      return 'Group D-Accessories';
    case 'Group E-Factory Charges':
      return 'Group E-Factory Charges';
    default:
      return 'Other';
  }
};
export async function loader({ request, params }) {
  try {
    const { admin } = await authenticate.admin(request);
    const response = await admin.graphql(
      `#graphql
      query GetOrder($orderId: ID!) {
        order(id: $orderId) {
        id
        note
    name
    customer{
      id
      firstName
       lastName
      tags
      email
      
     
    }
    lineItems(first:100){
      nodes{
        id
        title
        variant{
            id
          }
        customAttributes{
          key,
          value
        }
        quantity
        originalUnitPriceSet{presentmentMoney{amount currencyCode}}
        originalTotalSet{presentmentMoney{amount currencyCode}}
        totalDiscountSet{presentmentMoney{amount currencyCode}}
        product{
          title
          productType
        }
      }
    }
        }
      }`,
      { variables: { orderId: `gid://shopify/Order/${params.id}` } },
    );

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors.map(error => error.message).join(", "));
    }
    let comments  = await fetch("https://www.kitchenfactoryonline.com.au/shopifyapp/api/comment?orderId=" + params.id);
    comments = await comments.json();
    if(comments && comments.status=="success")
      comments=comments.data;
    else
    comments=[];


    return {
      status: "success",
      data: data.data,
      comments
    };
  } catch (error) {
    console.error(error);
    return {
      status: "failed",
      error: error.message || "An error occurred while fetching the order.",
    };
  }
}

export default function OrderPage() {
  const { status, data, error,comments } = useLoaderData();
  const [order, setorder] = useState();
  const [expandedCategories, setExpandedCategories] = useState({});
  useEffect(() => {
    if (status === "success") {
      setorder(data.order);
      console.log(comments)
      //console.log("Order Data:", data);
    } else if (status === "failed") {
      console.error("Error:", error);
    }
  }, [status, data, error]);

  if (status === "failed") {
    return (
      <Page title="Error" >
        <Card>
          <p>{error}</p>
        </Card>
      </Page>
    );
  }

  const lineItems = data?.order?.lineItems?.nodes || [];

  const groupedLineItems = lineItems.reduce((acc, item) => {
    const category = categorizeLineItem(item);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});


  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };


  return (
    <Page title={`Order ${data?.order?.name}`}>
    <Card>

    <Layout  >
<Layout.Section variant="fullWidth">
  <Card>
    <Text><b>Job Number :</b>{data?.order?.note} </Text> 
    <Text><b>Customer Email : </b> {data?.order?.customer?.email}</Text>
    <Text><b>Customer Type : </b> {data?.order?.customer?.tags}</Text>
   </Card>
</Layout.Section>
<Layout.Section variant="fullWidth">
  {Object.entries(groupedLineItems).map(([category, items]) => (
    <div key={category} style={{ marginTop: '1%' }}>
      <Button onClick={() => toggleCategory(category)}
        fullWidth
        disclosure>
        {category}
      </Button>
      <Collapsible open={expandedCategories[category]}>
      <div style={{paddingTop:'2%'}}>
      <MessageBox category={category}  lineItemId="1" orderId="5592610111642" data={[]} />
      </div>


        {items.map((item) => (
          
          <OrderLineItem
            key={item.id}
            item={item}
          />
        ))}
       
      </Collapsible>
    </div>
  ))}
</Layout.Section>
</Layout>
    </Card>
    </Page>
  );
}

