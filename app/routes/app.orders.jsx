import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { Page, Spinner } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import OrderTable from "../components/OrderTable";
import OrderInput from "../components/OrderInput";

// Load the basic data before rendering the page
export async function loader({ request, params }) {
  try {
    const { admin, session } = await authenticate.admin(request);
  

    const response = await admin.graphql(`#graphql
      query {
        orders(first: 100, sortKey: ORDER_NUMBER, query: "status:open") {
          edges {
            node {
              id
              name
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              confirmed
              closed
              displayFulfillmentStatus
              createdAt
              fullyPaid
              email
              lineItems(first: 100) {
                nodes {
                  id
                  variant {
                    id
                    title
                    sku
                  }
                  product {
                    featuredImage {
                      url
                    }
                  }
                }
              }
              customer {
                displayName
              }
            }
          }
        }
      }
    `);

    const data = await response.json();
    return {
      status: "success",
      data: data.data.orders.edges,
    };
  } catch (error) {
    console.error("Failed to load data:", error);
    return {
      status: "failed",
      error,
    };
  }
}

export default function PageComponent() {
  const loaderData = useLoaderData();
  const act_data = useActionData();

  // State variables for loading and error
  const [orders, setOrders] = useState([]);
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false); // For spinner
  const [error, setError] = useState(null); // For error

  const showInput = useCallback((data) => {
    setJsonData(data);
  }, []);

  useEffect(() => {
    if (loaderData.status === "success") {
      setOrders(loaderData.data);
    } else {
      console.error("Error loading data:", loaderData.error);
      shopify.toast.show("Something went wrong while loading orders.");
    }
  }, [loaderData]);

  useEffect(() => {
    if (act_data && act_data.data && act_data.data.draftOrderCreate && act_data.data.draftOrderCreate.draftOrder) {
      shopify.toast.show("Draft Order Created");
      setLoading(false); // Stop spinner on success
    }
  }, [act_data]);

  const submit = useSubmit();

  const handleSaveOrder = () => {
    setLoading(true); // Start spinner
    setError(null); // Reset error
    const dt = JSON.stringify(jsonData);
    submit({ dt, type: "newcustomer" }, { method: "post" }).catch((err) => {
      setLoading(false); // Stop spinner on error
      setError("Failed to create draft order.");
      shopify.toast.show("Error creating order: " + err.message);
    });
  };

  return (
    <Page
      title="Manage Order"
      primaryAction={{
        content: "Import Order",
        onAction: () => {
          shopify.modal.show("addcsv");
        },
      }}
    >
      {/* Show spinner while loading */}
      {loading ? (
        <Spinner accessibilityLabel="Loading..." size="large" />
      ) : (
        <OrderTable data={orders} />
      )}

      <Modal id="addcsv" variant="base">
        <div style={{ padding: "3%" }}>
          <OrderInput handle={showInput} />
        </div>

        <TitleBar title="Upload">
          <button
            variant="primary"
            onClick={() => {
              shopify.modal.hide("addcsv");
              handleSaveOrder(); // Trigger save order function
            }}
          >
            Save
          </button>
        </TitleBar>
      </Modal>

      {/* Display error toast if an error occurs */}
      {error && <div>{shopify.toast.show(error)}</div>}
    </Page>
  );
}


export async function action({ request }) {

  function getDiscount(data,collectionName,type) {
    const item = data.find(obj => obj.collection === collectionName);
    return item && item[type] ? item[type] : 0;
  }

  


  try {
    const { admin, session } = await authenticate.admin(request);
    const dt = { ...Object.fromEntries(await request.formData()) };
    const items = JSON.parse(dt.dt);
    const note = items[0].Job_Number;
    let customer=null;
    const customer_email=items[0].Customer_Email;
    let customer_type="";
    if(customer_email){
      const response = await admin.graphql(`#graphql
       query GetCustomerByEmail($email: String!) {
  customers(first: 1, query: $email) {
    edges {
      node {
        id
        tags
        email
      }
    }
  }
}
      `,
        {
          variables: {
            email: customer_email,
          },
        },
      );

      const data = await response.json();
      if(data.data.customers.edges.length){
        customer=data.data.customers.edges[0];
      }
      if(data.data.customers.edges.length>0 && data.data.customers.edges[0].node.tags.length>0){
        customer_type=data.data.customers.edges[0].node.tags[0];
      }
    }
   

    let discounts = await fetch("https://www.kitchenfactoryonline.com.au/shopifyapp/api/discount");
    discounts = await discounts.json();
    //console.log(discounts.data,customer_type)
    




    const fetchProductVariants = async (sku) => {

      try {
        const response = await admin.graphql(
          `#graphql
          query query($sku: String!) {
            productVariants(first: 1, query: $sku) {
              nodes {
                id
                product{
                tags }
              }
            }
          }
        `,
          {
            variables: {
              sku: `sku:${sku}`,
            },
          },
        );

        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`Error fetching product variants for SKU ${sku}:`, error);
        return null;
      }
    };

    const results = await Promise.all(
      items.map((item) => fetchProductVariants(item.Mat_id)),
    );

    let temp = [];
    results.forEach((item, index) => {
  
      let qt = parseInt(items[index].Qty);
      if (qt < 1) qt = 999;

      if (item.data.productVariants.nodes.length > 0) {
        let discountamount=getDiscount(discounts.data,item.data.productVariants.nodes[0].product.tags[0],customer_type);
       if(discountamount>0){
        temp.push({
          variantId: item.data.productVariants.nodes[0].id,
          quantity: qt,
          customAttributes: {
            key: "Description",
            value: items[index].Description,
          },
          appliedDiscount:{value:  20,valueType: "PERCENTAGE"}
        });
       }
       else{
        temp.push({
          variantId: item.data.productVariants.nodes[0].id,
          quantity: qt,
          customAttributes: {
            key: "Description",
            value: items[index].Description,
          }
        });
       }
        
      } else {
        if (items[index].Mat_id) {
          temp.push({
            title: items[index].KFO_Item_SKU,
            originalUnitPrice: parseFloat(
              items[index].Unit.match(/[\d,]+(\.\d+)?/)
                ? items[index].Unit.match(/[\d,]+(\.\d+)?/)[0]
                : 0,
            ),
            quantity: qt,
            customAttributes: {
              key: "Description",
              value: items[index].Description,
            },
          });
        }
      }
    });

   // console.log(temp)
    const createOrder = async () => {
      try {
        const response = await admin.graphql(
          `#graphql
          mutation draftOrderCreate($input: DraftOrderInput!) {
            draftOrderCreate(input: $input) {
              draftOrder {
                id
              }
            }
          }
        `,
          {
            variables: {
              input: {
                note: note,
                customerId: customer.id,
                email: customer.email,
                lineItems: temp,
              },
            },
          },
        );

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error Creating", error);
        return error;
      }
    };

    let re = await createOrder();
   return re;
   //return null;
  } catch (error) {
    console.error("Error in action function:", error);
    return {
      status: "failed",
      error,
    };
  }
}
