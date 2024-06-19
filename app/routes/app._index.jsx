// app/routes/index.jsx
import React, { useState } from 'react';
import { Page, Layout, Card, Button } from '@shopify/polaris';
import FileUpload from '../components/FileUpload';
import { useActionData, useSubmit } from '@remix-run/react';
import { authenticate } from "../shopify.server";
const Index = () => {
  let tt=useActionData();
  console.log(tt)
  const submit = useSubmit();
  const [orders, setOrders] = useState([]);
  const handleFileUpload = async (data) => {
    setOrders(data);
  };

  const handleCreateOrders = async () => {
    let tmp=[]
   orders.forEach((item)=>{
    if(item.MatID){
    tmp.push(item)
    }
   })
  
submit({data:JSON.stringify(tmp),},{method:"post"})
    alert('Orders created successfully!');
  };

  return (
    <Page title="Upload Orders">
      <Layout>
        <Layout.Section>
          <FileUpload onFileUpload={handleFileUpload} />
          <Card sectioned>
            <Button onClick={handleCreateOrders} primary>
              Create Orders
            </Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Index;


export async function action({ request }) {
try {
  const { admin, session } = await authenticate.admin(request);
  const order = new admin.rest.resources.Order({session: session});

 let dt=  { ...Object.fromEntries(await request.formData()) };


let inp=JSON.parse(dt.data);
let temp=[];
inp.forEach((item)=>{
 // console.log(item)
 //.replace(/[^0-9.]/g, '')
temp.push( {
  "title": item.KFOItemSKU,
  "price":parseFloat(item.Unit),
  "quantity": parseInt(item.Qty),
})
})

//console.log(temp)
order.line_items=temp;
await order.save();
 console.log(order)

} catch (error) {
  console.log(error)
}


    return null;
  }


