import { useLoaderData, useSubmit } from "@remix-run/react";
import {ExternalIcon} from '@shopify/polaris-icons';
import {
  Page,
  Spinner,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import CustomerTable from "../components/CustomerTable";

//load the basic data before ready the page

export async function loader({ request, params }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const response = await admin.graphql(
      `#graphql
    query {
      customers(first: 10) {
        edges {
          node {
            id
            email
            phone
            displayName
            tags
            verifiedEmail
            defaultAddress{
              address1 address2 city   country countryCodeV2
            }
            metafield(key:"kfo.customer_type"){
              value
            }
          }
        }
      }
    }`,
    );

    const data = await response.json();
    return {
      status: "success",
      data: data.data.customers.edges,
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
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    if (loader_data.status == "success") {
      setCustomers(loader_data.data);
    } else {
      shopify.toast.show("Something Error");
      console.log(loader_data);
    }
  }, []);

  const submit = useSubmit();
  return (
    <Page
      title="Manage Customer"
     
      secondaryActions={[
        {
          content: 'Add Customer',
          external: true,
          icon: ExternalIcon,
          url: 'shopify:admin/customers/new',
        },
      ]}

    >
      {customers.length > 0 ? (
        <CustomerTable data={customers} />
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
