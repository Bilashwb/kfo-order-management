import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { Page, Spinner } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import OrderTable from "../components/OrderTable";

// Load the basic data before rendering the page
export async function loader({ request, params }) {
  try {
    const { admin, session } = await authenticate.admin(request);
  

    const response = await admin.graphql(`#graphql
      query {
        orders(first: 250, reverse:true, query: "status:open") {
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

  console.log(loaderData)

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false); // For spinner
  const [error, setError] = useState(null); // For error


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



  return (
    <Page
      title="Manage Order"
    >
      {loading ? (
        <Spinner accessibilityLabel="Loading..." size="large" />
      ) :<><OrderTable data={orders}/></>}
      {error && <div>{shopify.toast.show(error)}</div>}
    </Page>
  );
}


