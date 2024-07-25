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
  const act_data=useActionData();
  if(act_data && act_data.data &&  act_data.data.draftOrderCreate &&  act_data.data.draftOrderCreate.draftOrder ){
    shopify.toast.show("Draft Order Created")
  }
  const [orders, setOrders] = useState([]);
  const [jsonData, setJsonData] = useState(null);

  const showInput = useCallback((data) => {
    setJsonData(data);
  }, []);

  useEffect(() => {
    if (loaderData.status === "success") {
      setOrders(loaderData.data);
    } else {
      console.error("Error loading data:", loaderData.error);
      // Assuming `shopify.toast.show` is available globally
      shopify.toast.show("Something went wrong while loading orders.");
    }
  }, [loaderData]);

  const submit = useSubmit();
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
     
        <OrderTable data={orders} />
      

      <Modal id="addcsv" variant="base">
        <div style={{ padding: "3%" }}>
          <OrderInput handle={showInput} />
        </div>

        <TitleBar title="Upload">
          <button
            variant="primary"
            onClick={() => {
              shopify.modal.hide("addcsv");
              const dt = JSON.stringify(jsonData);
              submit({ dt, type: "newcustomer" }, { method: "post" });
            }}
          >
            Save
          </button>
        </TitleBar>
      </Modal>
    </Page>
  );
}

// Handle all the requests
export async function action({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const dt = { ...Object.fromEntries(await request.formData()) };
    const items = JSON.parse(dt.dt);

    const fetchProductVariants = async (sku) => {
      console.log(sku);
      try {
        const response = await admin.graphql(
          `#graphql
          query query($sku: String!) {
            productVariants(first: 1, query: $sku) {
              nodes {
                id
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
      let qt=parseInt(items[index].Qty);
      if(qt<1)
        qt=999;

      if (item.data.productVariants.nodes.length > 0) {
        temp.push({
          variantId: item.data.productVariants.nodes[0].id,
          quantity: qt,
        });
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
          });
        }
      }
    });
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
                customerId: "gid://shopify/Customer/7397559664809",
                email: "orders@kitchenfactoryonline.com.au",
                lineItems: temp,
              },
            },
          },
        );

        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`Error Creating`, error);
        return error;
      }
    };
   let re=await createOrder();
    return re;
  } catch (error) {
    console.error("Error in action function:", error);
    return {
      status: "failed",
      error,
    };
  }
}
