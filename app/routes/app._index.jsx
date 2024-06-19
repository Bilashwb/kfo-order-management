import { useLoaderData, useSubmit, useActionData } from "@remix-run/react";
import { Button, Card, Layout, Page, Text } from "@shopify/polaris";
import { useState, useCallback,useEffect } from 'react';


//load the basic data before ready the page

export async function loader({ request, params }) {
  return null;
}

export default function page() {
  const loader_data = useLoaderData();

  useEffect(() => {
    console.log("Use Effect Call Advance Shipping Notice");
  }, [])

  const submit = useSubmit();
  return (
    <Page>
      Testing Page
    </Page>
  );
}


//handle all the request
export async function action({ request }) {
await { ...Object.fromEntries(await request.formData()) };
  return null;
}