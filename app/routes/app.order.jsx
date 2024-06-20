import { useLoaderData, useSubmit } from "@remix-run/react";

import {
  Page,
  Spinner,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import OrderTable from "../components/OrderTable";

//load the basic data before ready the page

export async function loader({ request, params }) {
  try {
    const { admin, session } = await authenticate.admin(request);
 

    const response = await admin.graphql(
      `#graphql
  query{
  orders(first:100,sortKey:ORDER_NUMBER,query:"status:open"){
    edges{
      node{
        id
        name
        totalPriceSet{shopMoney{amount,currencyCode}}
        confirmed
        closed
        displayFulfillmentStatus
        createdAt
        fullyPaid
        confirmed
        email
        lineItems(first:100){
          nodes{
            id
            variant{id title sku
           
            }
            product{
          featuredImage{url}
        }
          }
        }
        customer{displayName}
      }
    }
  }
}`,
    );

    const data = await response.json();
    return {
      status: "success",
      data: data.data.orders.edges,
  
    };
  } catch (error) {
    return {
      status: "failed",
      error,
    };
  }
}

export default function page() {
  const loader_data = useLoaderData();
  const [orders, setorders] = useState([]);

  useEffect(() => {
    if (loader_data.status == "success") {
      console.log(loader_data)
      setorders(loader_data.data);
    } else {
      shopify.toast.show("Something Error");
      console.log(loader_data);
    }
  }, []);

  const submit = useSubmit();
  return (
    <Page
      title="Manage Order"
      primaryAction={{content: 'Import Order', }}

    >
      {orders.length > 0 ? (
        <OrderTable data={orders} />
      ) : (
        <Spinner size="large" />
      )}
    </Page>
  );
}

//handle all the request
export async function action({ request }) {
  await { ...Object.fromEntries(await request.formData()) };
  return null;
}
