import { useLoaderData, useSubmit, useActionData } from "@remix-run/react";
import { Button, Card, Layout, Page, Listbox, Spinner, Grid } from "@shopify/polaris";
import { useState, useCallback, useEffect } from 'react';
import { authenticate } from "../shopify.server";
import db from "../db.server";
import LineItem from "../components/LineItem";
// Load the basic data before rendering the page
export async function loader({ request, params }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const lineItem=await db.lineItem.findMany({where:{orderId:params.id}});
    const comments=await db.comments.findMany({where:{orderId:params.id}});



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
      { variables: { orderId: `gid://shopify/Order/${params.id}` } }
    );

    const data = await response.json();
    return {
        status: "success",
        data:data.data.order,
        lineItem:lineItem,
        comments:comments
      }


  } catch (error) {
      return {
      status: "failed",
      error,
    };
  }
}

export default function OrderPage() {
  const order = useLoaderData();

  const [lineItems, setLineItems] = useState([]);
  const [comments, setComments] = useState([])
  useEffect(() => {
    
    setLineItems(order.lineItem);
    setComments(order.comments);



    console.log(order);
  }, []);

  const submit = useSubmit();

  return (
    <Page title={`Order ${order.data?.name}`}>
    <Card >
    < >
    {
        order.data?<>
        {
            order.data.lineItems.nodes.map((item,index)=>{
                return (<LineItem  data={item}/>)
            })
        }
        
        
        </>:<><Spinner size="large"/></>
    }
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
