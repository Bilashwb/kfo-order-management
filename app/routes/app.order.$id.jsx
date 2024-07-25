import { useLoaderData, useSubmit, useActionData } from "@remix-run/react";
import { Card, Page, Spinner } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import LineItem from "../components/LineItem";

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
    lineItems(first:100){
      nodes{
        id
        title
        sku 
        quantity
        originalTotalSet{presentmentMoney{amount}}
        originalUnitPriceSet{presentmentMoney{amount}}
    
        variant{
          id
          title
          image{url}
        }
        product{
            title
          featuredImage{url}
        }
      }
    }
    customer{
      displayName
      email
      phone
      id
    }
    shippingAddress{
      id 
      address1 address2 city country province zip provinceCode
    }
    billingAddress{
       id 
      address1 address2 city country province zip provinceCode
 
    }
        }
      }`,
      { variables: { orderId: `gid://shopify/Order/${params.id}` } },
    );


    const data = await response.json();
    console.log(data. data.order);
    let comments  = await fetch("https://www.kitchenfactoryonline.com.au/shopifyapp/api/comment?orderId=" + params.id);
    comments = await comments.json();
    console.log(comments)
    let infos  = await fetch("https://www.kitchenfactoryonline.com.au/shopifyapp/api/lineitem?orderId=" + params.id);
    infos = await infos.json();
    if(comments && comments.status=="success")
      comments=comments.data;
    else
    comments=[];
    if(infos && infos.status=="success")
      infos=infos.data;
    else
    infos=[];

    return {
      status: "success",
      data: data.data.order,
      comments,
      infos
    };
  } catch (error) {
    console.log(error)
    return {
      status: "failed",
      error,
    };
  }
}

export default function OrderPage() {
  const order = useLoaderData();
  useEffect(() => {
    console.log("order Hello", order);
  }, []);
  return (
    <Page title={`Order ${order.data?.name}`}>
      <Card>
        <>
          {order.data ? (
            <>
              {order.data.lineItems.nodes.map((item, index) => {
                return (
                  <LineItem
                    data={item}
                    key={index}
                    orderId={order.data.id.substring(20)}
                    comments={order.comments}
                    infos={order.infos}
                  />
                );
              })}
            </>
          ) : (
            <>
              <Spinner size="large" />
            </>
          )}
        </>
      </Card>
    </Page>
  );
}

// Handle all the requests
export async function action({ request }) {
  const formData = Object.fromEntries(await request.formData());
  return { ...formData };
}
